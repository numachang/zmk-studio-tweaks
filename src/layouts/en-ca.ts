// =============================================================================
// English (Canadian CSA) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream canadian_csa.py
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
  [hid(KBD, 53), { short: "/ \\" }],  // GRAVE
  [hid(KBD, 35), { short: "6 ?" }],  // N6
  [hid(KBD, 36), { short: "7 &" }],  // N7
  [hid(KBD, 37), { short: "8 *" }],  // N8
  [hid(KBD, 38), { short: "9 (" }],  // N9
  [hid(KBD, 39), { short: "0 )" }],  // N0
  [hid(KBD, 46), { short: "= +" }],  // EQUAL
  [hid(KBD, 56), { short: "É" }],  // FSLH
  [hid(KBD, 47), { short: "^ ¨" }],  // LBKT
  [hid(KBD, 48), { short: "Ç" }],  // RBKT
  [hid(KBD, 51), { short: "; :" }],  // SEMI
  [hid(KBD, 52), { short: "È" }],  // SQT
  [hid(KBD, 50), { short: "À" }],  // NUHS
  [hid(KBD, 100), { short: "Ù" }],  // NUBS
  [hid(KBD, 29), { short: "Z" }],  // Z
  [hid(KBD, 27), { short: "X" }],  // X
  [hid(KBD, 54), { short: ", '" }],  // COMMA
  [hid(KBD, 55), { short: ". \"" }],  // DOT
];

export const EN_CA_OVERRIDES: LayoutOverrideMap = new Map(entries);
