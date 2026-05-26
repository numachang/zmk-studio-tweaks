// =============================================================================
// English (UK) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream uk.py
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
  [hid(KBD, 31), { short: "2 \"" }],  // N2
  [hid(KBD, 32), { short: "3 £" }],  // N3
  [hid(KBD, 33), { short: "4 $" }],  // N4
  [hid(KBD, 52), { short: "' @" }],  // SQT
  [hid(KBD, 53), { short: "` ¬" }],  // GRAVE
  [hid(KBD, 50), { short: "# ~" }],  // NUHS
];

export const EN_UK_OVERRIDES: LayoutOverrideMap = new Map(entries);
