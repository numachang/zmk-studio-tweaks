// =============================================================================
// Español (Latinoamericano) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream latam.py
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
  [hid(KBD, 53), { short: "| ¬ °" }],  // GRAVE
  [hid(KBD, 31), { short: "2 \"" }],  // N2
  [hid(KBD, 35), { short: "6 &" }],  // N6
  [hid(KBD, 36), { short: "7 /" }],  // N7
  [hid(KBD, 37), { short: "8 (" }],  // N8
  [hid(KBD, 38), { short: "9 )" }],  // N9
  [hid(KBD, 39), { short: "0 =" }],  // N0
  [hid(KBD, 20), { short: "Q" }],  // Q
  [hid(KBD, 45), { short: "' \\ ?" }],  // MINUS
  [hid(KBD, 46), { short: "¿ ¡" }],  // EQUAL
  [hid(KBD, 47), { short: "´ ¨" }],  // LBKT
  [hid(KBD, 48), { short: "+ *" }],  // RBKT
  [hid(KBD, 51), { short: "Ñ" }],  // SEMI
  [hid(KBD, 52), { short: "{ [" }],  // SQT
  [hid(KBD, 100), { short: "< >" }],  // NUBS
  [hid(KBD, 49), { short: "] }" }],  // BSLH
  [hid(KBD, 54), { short: ", ;" }],  // COMMA
  [hid(KBD, 55), { short: ": ." }],  // DOT
  [hid(KBD, 56), { short: "- _" }],  // FSLH
];

export const ES_LATAM_OVERRIDES: LayoutOverrideMap = new Map(entries);
