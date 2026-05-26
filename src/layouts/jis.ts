// =============================================================================
// JIS (Japanese) host-layout overrides
// =============================================================================
// What changes vs US ANSI:
//   - Number row 2..9, minus, equals: shifted symbol differs
//   - [ ] \ : both unshifted and shifted differ (the JIS row above Enter
//     is `@ ` ` `, `[ {`, `] }`)
//   - ; ' : shifted differs
//   - International1 / 3 are JIS-specific physical keys (`\_` (ろ),
//     `¥|`); Lang1 / Lang2 are the conversion keys (`英数`, `かな`).
//     Label them with the printed glyphs so the picker is searchable
//     by what's actually on the keycap.
// =============================================================================

import type { LayoutOverride, LayoutOverrideMap } from "./index";

const KBD = 0x07;
const hid = (page: number, usage: number) => (page << 16) | usage;

const entries: [number, LayoutOverride][] = [
  // Number row
  [hid(KBD, 31), { short: '2 "' }],
  [hid(KBD, 35), { short: "6 &" }],
  [hid(KBD, 36), { short: "7 '" }],
  [hid(KBD, 37), { short: "8 (" }],
  [hid(KBD, 38), { short: "9 )" }],
  [hid(KBD, 39), { short: "0" }],

  // Punctuation: - = [ ] (the JIS row above Enter)
  [hid(KBD, 45), { short: "- =" }],
  [hid(KBD, 46), { short: "^ ~" }],
  [hid(KBD, 47), { short: "@ `" }],
  [hid(KBD, 48), { short: "[ {" }],
  // NUHS (HID 50, non-US hash) is the `] }` key on JIS — sits where
  // ANSI puts plain `]`. BSLH (HID 49) is unused on a standard JIS.
  [hid(KBD, 50), { short: "] }" }],

  // ; ' rows
  [hid(KBD, 51), { short: "; +" }],
  [hid(KBD, 52), { short: ": *" }],

  // GRAVE on JIS is the Hankaku/Zenkaku IME-toggle key, not backtick.
  [hid(KBD, 53), { short: "全/半", med: "Zen/Han", long: "Hankaku / Zenkaku" }],

  // JIS-specific physical keys. Show the printed glyphs first so a JIS
  // user can find them by typing the Japanese label into picker search.
  [hid(KBD, 135), { short: "\\_", med: "ろ (Intl1)", long: "International1 (ろ)" }],
  // INT2 is the kana key on legacy Microsoft JIS keyboards (the かな key
  // sends INT2 from the hardware itself). On Apple / modern Windows the
  // same role is taken by LANG1 (see further down). Label INT2 so search
  // finds it for users replicating a legacy-MS-JIS binding.
  [hid(KBD, 136), { short: "ひら", med: "ひら (Intl2)", long: "International2 (Hiragana/Katakana, legacy MS JIS)" }],
  [hid(KBD, 137), { short: "¥ |", med: "¥ (Intl3)", long: "International3 (¥)" }],
  // INT4 / INT5 are the conversion keys flanking the space bar on a
  // JIS keyboard. They're labelled 変換 / 無変換 in physical Japanese.
  [hid(KBD, 138), { short: "変換", med: "変換 (Intl4)", long: "International4 (Henkan)" }],
  [hid(KBD, 139), { short: "無変換", med: "無変換 (Intl5)", long: "International5 (Muhenkan)" }],
  // LANG1 / LANG2 are reused by Apple (and accepted by modern Windows)
  // for the JIS かな / 英数 IME-toggle pair. Different HID code from
  // INT2 above but the same human intent — both end up labelled かな so
  // either route is discoverable in picker search.
  [hid(KBD, 144), { short: "かな", med: "Lang1 / かな", long: "Lang1 (Hiragana/Katakana, Apple / modern Windows)" }],
  [hid(KBD, 145), { short: "英数", med: "Lang2 / 英数", long: "Lang2 (Eisuu)" }],
  [hid(KBD, 146), { short: "漢字", med: "Lang3 / 漢字", long: "Lang3 (Kanji)" }],
  [hid(KBD, 147), { short: "ひら", med: "Lang4 / ひらがな", long: "Lang4 (Hiragana)" }],
  [hid(KBD, 148), { short: "カナ", med: "Lang5 / カタカナ", long: "Lang5 (Katakana)" }],
];

export const JIS_OVERRIDES: LayoutOverrideMap = new Map(entries);
