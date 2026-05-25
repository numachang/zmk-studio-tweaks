// =============================================================================
// Português (Brasileiro) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream brazilian.py
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
  [hid(KBD, 51), { short: "Ç" }],  // SEMI
  [hid(KBD, 56), { short: "; :" }],  // FSLH
  [hid(KBD, 53), { short: "' \"" }],  // GRAVE
  [hid(KBD, 52), { short: "~ ^" }],  // SQT
  [hid(KBD, 47), { short: "´ `" }],  // LBKT
  [hid(KBD, 48), { short: "[ {" }],  // RBKT
  [hid(KBD, 49), { short: "] }" }],  // BSLH
  [hid(KBD, 50), { short: "] }" }],  // NUHS
  [hid(KBD, 100), { short: "\\ |" }],  // NUBS
  [hid(KBD, 35), { short: "6 ¨" }],  // N6
];

export const PT_BR_OVERRIDES: LayoutOverrideMap = new Map(entries);
