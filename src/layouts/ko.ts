// =============================================================================
// 한국어 (Korean) host-layout overrides
// =============================================================================
// Korean physical layouts are QWERTY-identical (the OS-side IME handles
// Hangul / Hanja input), so the only meaningful host-layout differences
// are the two language-toggle keys that appear next to space on a real
// Korean keyboard. Their HID identities are standard:
//
//   - Lang1 (HID 7:144) — 한/영, toggles Hangul ↔ English
//   - Lang2 (HID 7:145) — 한자,  converts the preceding Hangul to Hanja
//
// Hand-written (not generated): upstream layout sources don't carry a
// Korean entry.
// =============================================================================

import type { LayoutOverride, LayoutOverrideMap } from "./index";

const KBD = 0x07;
const hid = (page: number, usage: number) => (page << 16) | usage;

const entries: [number, LayoutOverride][] = [
  [hid(KBD, 144), { short: "한/영", med: "Lang1 / 한영", long: "Lang1 (Hangul / English)" }],
  [hid(KBD, 145), { short: "한자",  med: "Lang2 / 한자", long: "Lang2 (Hanja)" }],
];

export const KO_OVERRIDES: LayoutOverrideMap = new Map(entries);
