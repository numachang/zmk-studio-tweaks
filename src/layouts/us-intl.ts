// =============================================================================
// English (US International) host-layout overrides
// =============================================================================
// AUTO-GENERATED from upstream us_international.py
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
  [hid(KBD, 30), { short: "1  ¡ !  ¹" }],  // N1
  [hid(KBD, 31), { short: "@" }],  // N2
  [hid(KBD, 32), { short: "#" }],  // N3
  [hid(KBD, 33), { short: "4  ¤ $  £" }],  // N4
  [hid(KBD, 34), { short: "%" }],  // N5
  [hid(KBD, 35), { short: "^" }],  // N6
  [hid(KBD, 36), { short: "&" }],  // N7
  [hid(KBD, 37), { short: "*" }],  // N8
  [hid(KBD, 38), { short: "(" }],  // N9
  [hid(KBD, 39), { short: ")" }],  // N0
  [hid(KBD, 45), { short: "_" }],  // MINUS
  [hid(KBD, 46), { short: "=  × +  ÷" }],  // EQUAL
  [hid(KBD, 20), { short: "q  ä Q  Ä" }],  // Q
  [hid(KBD, 26), { short: "w  å W  Å" }],  // W
  [hid(KBD, 8), { short: "e  é E  É" }],  // E
  [hid(KBD, 21), { short: "R" }],  // R
  [hid(KBD, 23), { short: "t  þ T  Þ" }],  // T
  [hid(KBD, 28), { short: "y  ü Y  Ü" }],  // Y
  [hid(KBD, 24), { short: "u  ú U  Ú" }],  // U
  [hid(KBD, 12), { short: "i  í I  Í" }],  // I
  [hid(KBD, 18), { short: "o  ó O  Ó" }],  // O
  [hid(KBD, 19), { short: "p  ö P  Ö" }],  // P
  [hid(KBD, 47), { short: "{" }],  // LBKT
  [hid(KBD, 48), { short: "}" }],  // RBKT
  [hid(KBD, 4), { short: "a  á A  Á" }],  // A
  [hid(KBD, 22), { short: "s  ß S  §" }],  // S
  [hid(KBD, 7), { short: "d  ð D  Ð" }],  // D
  [hid(KBD, 9), { short: "F" }],  // F
  [hid(KBD, 10), { short: "G" }],  // G
  [hid(KBD, 11), { short: "H" }],  // H
  [hid(KBD, 13), { short: "J" }],  // J
  [hid(KBD, 14), { short: "K" }],  // K
  [hid(KBD, 15), { short: "l  ø L  Ø" }],  // L
  [hid(KBD, 51), { short: ";  ¶ :  °" }],  // SEMI
  [hid(KBD, 52), { short: "'  ´ \"  ¨" }],  // SQT
  [hid(KBD, 53), { short: "~" }],  // GRAVE
  [hid(KBD, 50), { short: "\\  ¬ |  ¦" }],  // NUHS
  [hid(KBD, 29), { short: "z  æ Z  Æ" }],  // Z
  [hid(KBD, 27), { short: "X" }],  // X
  [hid(KBD, 6), { short: "c  © C  ¢" }],  // C
  [hid(KBD, 25), { short: "V" }],  // V
  [hid(KBD, 5), { short: "B" }],  // B
  [hid(KBD, 17), { short: "n  ñ N  Ñ" }],  // N
  [hid(KBD, 16), { short: "M" }],  // M
  [hid(KBD, 54), { short: ",  ç <  Ç" }],  // COMMA
  [hid(KBD, 55), { short: ">" }],  // DOT
  [hid(KBD, 56), { short: "?" }],  // FSLH
  [hid(KBD, 100), { short: "|" }],  // NUBS
];

export const US_INTL_OVERRIDES: LayoutOverrideMap = new Map(entries);
