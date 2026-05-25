// =============================================================================
// Slovenský (Slovak) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream slovak.py
// (https://github.com/vial-kb/vial-gui — data follows the QMK
// keymap_<lang>.h convention from quantum/keymap_extras/).
//
// To regenerate after editing scripts/import-layouts.py:
//   python scripts/import-layouts.py
// =============================================================================

import type { LayoutOverride, LayoutOverrideMap } from "./index";

const KBD = 0x07;
const hid = (page: number, usage: number) => (page << 16) | usage;

const entries: [number, LayoutOverride][] = [
  [hid(KBD, 53), { short: "°  ~ ;" }],  // GRAVE
  [hid(KBD, 30), { short: "+  ^ 1" }],  // N1
  [hid(KBD, 31), { short: "ľ  ˘ 2" }],  // N2
  [hid(KBD, 32), { short: "š  ° 3" }],  // N3
  [hid(KBD, 33), { short: "č  ˛ 4" }],  // N4
  [hid(KBD, 34), { short: "ť  ` 5" }],  // N5
  [hid(KBD, 35), { short: "ž  ˙ 6" }],  // N6
  [hid(KBD, 36), { short: "ý  ˝ 7" }],  // N7
  [hid(KBD, 37), { short: "á  ¨ 8" }],  // N8
  [hid(KBD, 38), { short: "í  ¸ 9" }],  // N9
  [hid(KBD, 39), { short: "é 0" }],  // N0
  [hid(KBD, 20), { short: "Q" }],  // Q
  [hid(KBD, 26), { short: "W" }],  // W
  [hid(KBD, 8), { short: "E" }],  // E
  [hid(KBD, 19), { short: "P" }],  // P
  [hid(KBD, 45), { short: "= %" }],  // MINUS
  [hid(KBD, 46), { short: "´ ˇ" }],  // EQUAL
  [hid(KBD, 47), { short: "ú  ÷ /" }],  // LBKT
  [hid(KBD, 48), { short: "ä  × (" }],  // RBKT
  [hid(KBD, 49), { short: "ň )" }],  // BSLH
  [hid(KBD, 51), { short: "ô \"" }],  // SEMI
  [hid(KBD, 52), { short: "§ !" }],  // SQT
  [hid(KBD, 100), { short: "&  < *" }],  // NUBS
  [hid(KBD, 29), { short: "Z" }],  // Z
  [hid(KBD, 27), { short: "X" }],  // X
  [hid(KBD, 25), { short: "V" }],  // V
  [hid(KBD, 5), { short: "B" }],  // B
  [hid(KBD, 17), { short: "N" }],  // N
  [hid(KBD, 54), { short: ", ?" }],  // COMMA
  [hid(KBD, 55), { short: ". :" }],  // DOT
  [hid(KBD, 56), { short: "- _" }],  // FSLH
];

export const SK_OVERRIDES: LayoutOverrideMap = new Map(entries);
