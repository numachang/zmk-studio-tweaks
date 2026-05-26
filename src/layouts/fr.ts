// =============================================================================
// Français (French) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream french.py
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
  [hid(KBD, 53), { short: "²" }],  // GRAVE
  [hid(KBD, 30), { short: "& 1" }],  // N1
  [hid(KBD, 31), { short: "é 2" }],  // N2
  [hid(KBD, 32), { short: "\" 3" }],  // N3
  [hid(KBD, 33), { short: "' 4" }],  // N4
  [hid(KBD, 34), { short: "( 5" }],  // N5
  [hid(KBD, 35), { short: "- 6" }],  // N6
  [hid(KBD, 36), { short: "è 7" }],  // N7
  [hid(KBD, 37), { short: "_ 8" }],  // N8
  [hid(KBD, 38), { short: "ç 9" }],  // N9
  [hid(KBD, 39), { short: "à 0" }],  // N0
  [hid(KBD, 45), { short: ") °" }],  // MINUS
  [hid(KBD, 20), { short: "A" }],  // Q
  [hid(KBD, 26), { short: "Z" }],  // W
  [hid(KBD, 47), { short: "^ ¨" }],  // LBKT
  [hid(KBD, 48), { short: "$ £" }],  // RBKT
  [hid(KBD, 4), { short: "Q" }],  // A
  [hid(KBD, 51), { short: "M" }],  // SEMI
  [hid(KBD, 52), { short: "ù %" }],  // SQT
  [hid(KBD, 50), { short: "* µ" }],  // NUHS
  [hid(KBD, 100), { short: "< >" }],  // NUBS
  [hid(KBD, 29), { short: "W" }],  // Z
  [hid(KBD, 16), { short: ", ?" }],  // M
  [hid(KBD, 54), { short: "; ." }],  // COMMA
  [hid(KBD, 55), { short: ": /" }],  // DOT
  [hid(KBD, 56), { short: "! §" }],  // FSLH
];

export const FR_OVERRIDES: LayoutOverrideMap = new Map(entries);
