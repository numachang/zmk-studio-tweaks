// =============================================================================
// 한국어 (Korean) host-layout overrides
// =============================================================================
// Two things change for a Korean host:
//
//   1. Lang1 (HID 7:144) and Lang2 (HID 7:145) are physical keys near
//      Space on a real Korean keyboard (`한/영` toggles Hangul ↔ English,
//      `한자` converts the preceding Hangul). The picker labels them with
//      the printed glyphs.
//   2. Korean keycaps print both the QWERTY letter and the corresponding
//      Hangul jamo from the standard 두벌식 (Dubeolsik / 2-set) layout.
//      The HID code stays English — typing 'a' on the physical A key
//      produces `ㅁ` only after the OS IME translates it — but showing
//      both glyphs on the picker matches what users see on their
//      physical keycap and makes the picker readable from muscle memory.
//
// Hand-written (not generated): upstream layout sources don't carry a
// Korean entry.
// =============================================================================

import type { LayoutOverride, LayoutOverrideMap } from "./index";

const KBD = 0x07;
const hid = (page: number, usage: number) => (page << 16) | usage;

// Standard 두벌식 (Dubeolsik) Hangul mapping for the alphabet rows.
// Each tuple is [HID usage, English letter, Hangul jamo]. We render
// `short` as "<letter> <hangul>" so the picker's pair regex stacks
// them on the keycap the same way it does "1 !".
const HANGUL_MAP: ReadonlyArray<readonly [number, string, string]> = [
  [4,  "A", "ㅁ"],
  [5,  "B", "ㅠ"],
  [6,  "C", "ㅊ"],
  [7,  "D", "ㅇ"],
  [8,  "E", "ㄷ"],
  [9,  "F", "ㄹ"],
  [10, "G", "ㅎ"],
  [11, "H", "ㅗ"],
  [12, "I", "ㅑ"],
  [13, "J", "ㅓ"],
  [14, "K", "ㅏ"],
  [15, "L", "ㅣ"],
  [16, "M", "ㅡ"],
  [17, "N", "ㅜ"],
  [18, "O", "ㅐ"],
  [19, "P", "ㅔ"],
  [20, "Q", "ㅂ"],
  [21, "R", "ㄱ"],
  [22, "S", "ㄴ"],
  [23, "T", "ㅅ"],
  [24, "U", "ㅕ"],
  [25, "V", "ㅍ"],
  [26, "W", "ㅈ"],
  [27, "X", "ㅌ"],
  [28, "Y", "ㅛ"],
  [29, "Z", "ㅋ"],
];

const entries: [number, LayoutOverride][] = [
  ...HANGUL_MAP.map<[number, LayoutOverride]>(([usage, letter, jamo]) => [
    hid(KBD, usage),
    { short: `${letter} ${jamo}`, med: `${letter}  ·  ${jamo}`, long: `${letter} (${jamo})` },
  ]),
  [hid(KBD, 144), { short: "한/영", med: "Lang1 / 한영", long: "Lang1 (Hangul / English)" }],
  [hid(KBD, 145), { short: "한자",  med: "Lang2 / 한자", long: "Lang2 (Hanja)" }],
];

export const KO_OVERRIDES: LayoutOverrideMap = new Map(entries);
