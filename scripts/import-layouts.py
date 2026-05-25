#!/usr/bin/env python3
"""
Generate src/layouts/<lang>.ts overlays from upstream QMK keymap_<lang>.h
data (the same data the GUI ecosystem uses to render localized key
labels). Run once after editing LAYOUTS / KC_TO_HID; the generated
TypeScript is what's committed.

  python scripts/import-layouts.py

The script is offline-tolerant: it caches downloaded sources under
scripts/.layout-cache/ so re-runs are deterministic and don't require
network.
"""
from __future__ import annotations

import ast
import re
import sys
import urllib.request
from pathlib import Path

# Windows console defaults to cp932 (Shift_JIS) which can't print
# characters like ç / ñ that appear in display names.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except AttributeError:
    pass

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = REPO_ROOT / "src" / "layouts"
CACHE_DIR = Path(__file__).resolve().parent / ".layout-cache"
CACHE_DIR.mkdir(exist_ok=True)

# URL template for the upstream layout sources. These files mirror the
# data in QMK's quantum/keymap_extras/keymap_<lang>.h family.
SOURCE_URL = (
    "https://raw.githubusercontent.com/vial-kb/vial-gui/"
    "main/src/main/python/keymap/{file}"
)

# Each entry: (our layout ID, display name, upstream filename).
# Display names use the native script first, English in parens, so the
# dropdown is recognizable to native readers and visitors alike.
LAYOUTS = [
    ("en-uk",    "English (UK)",               "uk.py"),
    ("us-intl",  "English (US International)", "us_international.py"),
    ("en-ca",    "English (Canadian CSA)",     "canadian_csa.py"),
    ("de",       "Deutsch (German)",           "german.py"),
    ("fr",       "Français (French)",          "french.py"),
    ("es",       "Español (Spanish)",          "spanish.py"),
    ("es-latam", "Español (Latinoamericano)",  "latam.py"),
    ("it",       "Italiano (Italian)",         "italian.py"),
    ("pt",       "Português (Portuguese)",     "portuguese.py"),
    ("pt-br",    "Português (Brasileiro)",     "brazilian.py"),
    ("sv",       "Svenska (Swedish)",          "swedish.py"),
    ("no",       "Norsk (Norwegian)",          "norwegian.py"),
    ("da",       "Dansk (Danish)",             "danish.py"),
    ("ch",       "Schweiz / Suisse (Swiss)",   "swiss.py"),
    ("pl",       "Polski (Polish)",            "polish.py"),
    ("hu",       "Magyar (Hungarian)",         "hungarian.py"),
    ("sk",       "Slovenský (Slovak)",         "slovak.py"),
    ("hr",       "Hrvatski (Croatian)",        "croatian.py"),
    ("tr",       "Türkçe (Turkish)",           "turkish.py"),
    ("eurkey",   "EurKey",                     "eurkey.py"),
]

# Mapping from upstream KC_<name> to (HID page, HID usage, our SSOT
# ZMK name from src/keycodes.ts). The HID assignments come from QMK's
# quantum/keymap.h. Page 0x07 is the keyboard / keypad page.
KBD = 0x07
KC_TO_HID: dict[str, tuple[int, int, str]] = {
    # Letters
    **{f"KC_{chr(ord('A') + i)}": (KBD, 4 + i, chr(ord("A") + i)) for i in range(26)},
    # Number row
    "KC_1":    (KBD, 30, "N1"),
    "KC_2":    (KBD, 31, "N2"),
    "KC_3":    (KBD, 32, "N3"),
    "KC_4":    (KBD, 33, "N4"),
    "KC_5":    (KBD, 34, "N5"),
    "KC_6":    (KBD, 35, "N6"),
    "KC_7":    (KBD, 36, "N7"),
    "KC_8":    (KBD, 37, "N8"),
    "KC_9":    (KBD, 38, "N9"),
    "KC_0":    (KBD, 39, "N0"),
    # Punctuation / symbols
    "KC_MINUS":         (KBD, 45,  "MINUS"),
    "KC_EQUAL":         (KBD, 46,  "EQUAL"),
    "KC_LBRACKET":      (KBD, 47,  "LBKT"),
    "KC_RBRACKET":      (KBD, 48,  "RBKT"),
    "KC_BSLASH":        (KBD, 49,  "BSLH"),
    "KC_NONUS_HASH":    (KBD, 50,  "NUHS"),
    "KC_SCOLON":        (KBD, 51,  "SEMI"),
    "KC_QUOTE":         (KBD, 52,  "SQT"),
    "KC_GRAVE":         (KBD, 53,  "GRAVE"),
    "KC_COMMA":         (KBD, 54,  "COMMA"),
    "KC_DOT":           (KBD, 55,  "DOT"),
    "KC_SLASH":         (KBD, 56,  "FSLH"),
    "KC_NONUS_BSLASH":  (KBD, 100, "NUBS"),
}


def fetch_source(filename: str) -> str:
    cached = CACHE_DIR / filename
    if cached.exists():
        return cached.read_text(encoding="utf-8")
    url = SOURCE_URL.format(file=filename)
    print(f"  fetching {url}")
    with urllib.request.urlopen(url) as r:
        body = r.read().decode("utf-8")
    cached.write_text(body, encoding="utf-8")
    return body


def parse_keymap_dict(source: str) -> dict[str, str]:
    """Pull the `keymap = { ... }` dict out of a Python source file via
    AST so we never execute attacker-controlled code."""
    tree = ast.parse(source)
    for node in tree.body:
        if (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and node.targets[0].id == "keymap"
            and isinstance(node.value, ast.Dict)
        ):
            out: dict[str, str] = {}
            for k, v in zip(node.value.keys, node.value.values):
                if k is None:
                    continue
                key = ast.literal_eval(k)
                val = ast.literal_eval(v)
                if isinstance(key, str) and isinstance(val, str):
                    out[key] = val
            return out
    return {}


def convert_label(raw: str) -> str | None:
    """Convert one upstream label like '"\n2' / 'A' / '$\n4   €' into our
    `short` format: '<unshifted> <shifted>' (with shifted dropped if the
    label only has one half). Returns None if the entry is unusable.

    AltGr (separated by ≥3 spaces in the upstream format) is dropped —
    our schema only carries the unshifted/shifted pair today.
    """
    # Drop AltGr suffix
    body = re.sub(r"\s{3,}.*$", "", raw)
    parts = body.split("\n")
    if len(parts) == 1:
        # Letter swap or single-character entry (e.g. "A" or "²").
        s = parts[0].strip()
        return s or None
    if len(parts) == 2:
        shifted, unshifted = parts[0].strip(), parts[1].strip()
        if not unshifted and not shifted:
            return None
        if not unshifted:
            return shifted
        if not shifted:
            return unshifted
        return f"{unshifted} {shifted}"
    return None


def escape_ts(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def generate_layout_ts(
    layout_id: str, display: str, source_filename: str, kc_map: dict[str, str]
) -> str:
    rows: list[str] = []
    for kc, raw in kc_map.items():
        hid_info = KC_TO_HID.get(kc)
        if not hid_info:
            print(f"  warn: skipping unknown KC {kc} in {layout_id}", file=sys.stderr)
            continue
        _, usage, zmk_name = hid_info
        short = convert_label(raw)
        if short is None:
            continue
        rows.append(
            f'  [hid(KBD, {usage}), {{ short: "{escape_ts(short)}" }}],  // {zmk_name}'
        )

    var = layout_id.upper().replace("-", "_") + "_OVERRIDES"
    body = "\n".join(rows) if rows else "  // (no overrides)"
    return f"""// =============================================================================
// {display} host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream {source_filename}
// (https://github.com/vial-kb/vial-gui — data follows the QMK
// keymap_<lang>.h convention from quantum/keymap_extras/).
//
// To regenerate after editing scripts/import-layouts.py:
//   python scripts/import-layouts.py
// =============================================================================

import type {{ LayoutOverride, LayoutOverrideMap }} from "./index";

const KBD = 0x07;
const hid = (page: number, usage: number) => (page << 16) | usage;

const entries: [number, LayoutOverride][] = [
{body}
];

export const {var}: LayoutOverrideMap = new Map(entries);
"""


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for layout_id, display, source_filename in LAYOUTS:
        print(f"=== {layout_id} ({display})")
        try:
            src = fetch_source(source_filename)
        except Exception as exc:
            print(f"  ERROR fetching {source_filename}: {exc}", file=sys.stderr)
            return 1
        kc_map = parse_keymap_dict(src)
        if not kc_map:
            print(f"  ERROR no `keymap` dict found in {source_filename}", file=sys.stderr)
            return 1
        ts = generate_layout_ts(layout_id, display, source_filename, kc_map)
        out_file = OUT_DIR / f"{layout_id}.ts"
        out_file.write_text(ts, encoding="utf-8")
        print(f"  wrote {out_file.relative_to(REPO_ROOT)} ({len(kc_map)} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
