// =============================================================================
// Deutsch (German) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream german.py
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
  [hid(KBD, 53), { short: "^ °" }],  // GRAVE
  [hid(KBD, 31), { short: "2 \"" }],  // N2
  [hid(KBD, 32), { short: "3 §" }],  // N3
  [hid(KBD, 35), { short: "6 &" }],  // N6
  [hid(KBD, 36), { short: "7 /" }],  // N7
  [hid(KBD, 37), { short: "8 (" }],  // N8
  [hid(KBD, 38), { short: "9 )" }],  // N9
  [hid(KBD, 39), { short: "0 =" }],  // N0
  [hid(KBD, 45), { short: "ß ?" }],  // MINUS
  [hid(KBD, 46), { short: "´ `" }],  // EQUAL
  [hid(KBD, 28), { short: "Z" }],  // Y
  [hid(KBD, 47), { short: "Ü" }],  // LBKT
  [hid(KBD, 48), { short: "+ *" }],  // RBKT
  [hid(KBD, 51), { short: "Ö" }],  // SEMI
  [hid(KBD, 52), { short: "Ä" }],  // SQT
  [hid(KBD, 50), { short: "# '" }],  // NUHS
  [hid(KBD, 100), { short: "< >" }],  // NUBS
  [hid(KBD, 29), { short: "Y" }],  // Z
  [hid(KBD, 54), { short: ", ;" }],  // COMMA
  [hid(KBD, 55), { short: ". :" }],  // DOT
  [hid(KBD, 56), { short: "- _" }],  // FSLH
];

export const DE_OVERRIDES: LayoutOverrideMap = new Map(entries);
