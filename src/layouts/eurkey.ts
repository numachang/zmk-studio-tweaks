// =============================================================================
// EurKey host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream eurkey.py
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
  [hid(KBD, 53), { short: "` ` ~ ~" }],  // GRAVE
  [hid(KBD, 30), { short: "1 ¡ ! ¹" }],  // N1
  [hid(KBD, 31), { short: "2 ª @ ²" }],  // N2
  [hid(KBD, 32), { short: "3 º # ³" }],  // N3
  [hid(KBD, 33), { short: "4 £ $ ¥" }],  // N4
  [hid(KBD, 34), { short: "5 € % ¢" }],  // N5
  [hid(KBD, 35), { short: "6 ^ ^ ˇ" }],  // N6
  [hid(KBD, 36), { short: "7 ˚ & ¯" }],  // N7
  [hid(KBD, 37), { short: "8 „ * ‚" }],  // N8
  [hid(KBD, 38), { short: "9 “ ( ‘" }],  // N9
  [hid(KBD, 39), { short: "0 ” ) ’" }],  // N0
  [hid(KBD, 20), { short: "Q" }],  // Q
  [hid(KBD, 26), { short: "W" }],  // W
  [hid(KBD, 8), { short: "E" }],  // E
  [hid(KBD, 21), { short: "R" }],  // R
  [hid(KBD, 23), { short: "T" }],  // T
  [hid(KBD, 28), { short: "Y" }],  // Y
  [hid(KBD, 24), { short: "U" }],  // U
  [hid(KBD, 12), { short: "I" }],  // I
  [hid(KBD, 18), { short: "O" }],  // O
  [hid(KBD, 19), { short: "P" }],  // P
  [hid(KBD, 45), { short: "- © _ №" }],  // MINUS
  [hid(KBD, 46), { short: "= × + ÷" }],  // EQUAL
  [hid(KBD, 47), { short: "[ « { ‹" }],  // LBKT
  [hid(KBD, 48), { short: "] » } ›" }],  // RBKT
  [hid(KBD, 49), { short: "\\ ¬ | ¦" }],  // BSLH
  [hid(KBD, 4), { short: "A" }],  // A
  [hid(KBD, 22), { short: "S" }],  // S
  [hid(KBD, 7), { short: "D" }],  // D
  [hid(KBD, 9), { short: "F" }],  // F
  [hid(KBD, 10), { short: "G" }],  // G
  [hid(KBD, 11), { short: "H" }],  // H
  [hid(KBD, 13), { short: "J" }],  // J
  [hid(KBD, 14), { short: "K" }],  // K
  [hid(KBD, 15), { short: "L" }],  // L
  [hid(KBD, 51), { short: "; ° : ·" }],  // SEMI
  [hid(KBD, 52), { short: "' ´ \" ¨" }],  // SQT
  [hid(KBD, 100), { short: "\\ |" }],  // NUBS
  [hid(KBD, 29), { short: "Z" }],  // Z
  [hid(KBD, 27), { short: "X" }],  // X
  [hid(KBD, 6), { short: "C" }],  // C
  [hid(KBD, 25), { short: "V" }],  // V
  [hid(KBD, 5), { short: "B" }],  // B
  [hid(KBD, 17), { short: "N" }],  // N
  [hid(KBD, 16), { short: "M Ω √" }],  // M
  [hid(KBD, 54), { short: ", ò < Ò" }],  // COMMA
  [hid(KBD, 55), { short: ". ó > Ó" }],  // DOT
  [hid(KBD, 56), { short: "/ ¿ ? …" }],  // FSLH
];

export const EURKEY_OVERRIDES: LayoutOverrideMap = new Map(entries);
