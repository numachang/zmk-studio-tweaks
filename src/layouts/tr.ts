// =============================================================================
// Türkçe (Turkish) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream turkish.py
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
  [hid(KBD, 53), { short: "\" é" }],  // GRAVE
  [hid(KBD, 30), { short: "1 !" }],  // N1
  [hid(KBD, 31), { short: "2 '" }],  // N2
  [hid(KBD, 32), { short: "3 ^" }],  // N3
  [hid(KBD, 33), { short: "4 +" }],  // N4
  [hid(KBD, 34), { short: "5 %" }],  // N5
  [hid(KBD, 35), { short: "6 &" }],  // N6
  [hid(KBD, 36), { short: "7 /" }],  // N7
  [hid(KBD, 37), { short: "8 (" }],  // N8
  [hid(KBD, 38), { short: "9 )" }],  // N9
  [hid(KBD, 39), { short: "0 =" }],  // N0
  [hid(KBD, 45), { short: "* ?" }],  // MINUS
  [hid(KBD, 46), { short: "- _" }],  // EQUAL
  [hid(KBD, 20), { short: "Q" }],  // Q
  [hid(KBD, 8), { short: "E" }],  // E
  [hid(KBD, 23), { short: "T" }],  // T
  [hid(KBD, 4), { short: "A" }],  // A
  [hid(KBD, 22), { short: "S" }],  // S
  [hid(KBD, 47), { short: "Ğ" }],  // LBKT
  [hid(KBD, 48), { short: "Ü" }],  // RBKT
  [hid(KBD, 51), { short: "Ş" }],  // SEMI
  [hid(KBD, 52), { short: "İ" }],  // SQT
  [hid(KBD, 54), { short: "Ö" }],  // COMMA
  [hid(KBD, 55), { short: "Ç" }],  // DOT
  [hid(KBD, 50), { short: ", ;" }],  // NUHS
  [hid(KBD, 100), { short: "< >" }],  // NUBS
  [hid(KBD, 56), { short: ". :" }],  // FSLH
];

export const TR_OVERRIDES: LayoutOverrideMap = new Map(entries);
