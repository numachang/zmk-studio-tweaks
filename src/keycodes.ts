// =============================================================================
// Keycode source of truth
// =============================================================================
// Single canonical table of every HID usage we care about editorially:
//
//   - ZMK keymap text name  (consumed by keymap-parser for import / export)
//   - picker UI labels      (short / med / long, consumed by hid-usages.ts)
//   - picker category       (Basic / Function + Nav / Numpad / ...)
//
// Background: these used to live in three independent places (the HID spec
// JSON, an inline `ZMK_KEYCODES` table in keymap-parser.ts, and
// hid-usage-metadata.json from upstream PR #159). They could drift apart —
// the picker would label HID 7:230 "AltGr" while the exporter wrote "&kp
// RALT" for the same code. See issue #2 for the full backstory.
//
// Rules:
//   - `name` is the canonical ZMK text name. Omit on label-only rows
//     (Lang1, International1, raw consumer brightness, ...) where ZMK has
//     no idiomatic short name today.
//   - The first row for a given (page, usage) wins on reverse lookups;
//     subsequent rows with the same code can register parse-only aliases
//     by adding entries via `PARSE_ONLY_ALIASES` below.
//   - Picker fallback: when `short` is absent the picker derives it from
//     the HID spec table (`keyboard-and-consumer-usage-tables.json`). This
//     keeps the editorial surface small for the long tail of usages.
// =============================================================================

export interface Keycode {
  /** HID usage page (0x07 = keyboard/keypad, 0x0c = consumer). */
  page: number;
  /** HID usage ID within the page. */
  usage: number;
  /**
   * ZMK keymap text name (e.g. "RALT"). When defined, this is the name
   * the keymap exporter emits and the importer accepts as canonical.
   * Omit for picker-label-only rows.
   */
  name?: string;
  /** Compact picker label (≤ ~5 chars). */
  short?: string;
  /** Medium picker label. */
  med?: string;
  /** Spelled-out picker label. */
  long?: string;
  /** Picker tab grouping. */
  category?: string;
}

const KBD = 0x07;
const CONSUMER = 0x0c;

const CAT_LETTERS = "Letters";
const CAT_NUMPUNC = "Numbers + Punctuation";
const CAT_FN_NAV = "Function + Navigation";
const CAT_NUMPAD = "Numpad";
const CAT_INTL = "International";
const CAT_MEDIA = "Apps/Media/Special";

const LETTERS: Keycode[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map((l, i) => ({ name: l, page: KBD, usage: 4 + i, category: CAT_LETTERS }));

const NUMBER_ROW: Keycode[] = [
  { name: "N1", page: KBD, usage: 30, short: "1 !", category: CAT_NUMPUNC },
  { name: "N2", page: KBD, usage: 31, short: "2 @", category: CAT_NUMPUNC },
  { name: "N3", page: KBD, usage: 32, short: "3 #", category: CAT_NUMPUNC },
  { name: "N4", page: KBD, usage: 33, short: "4 $", category: CAT_NUMPUNC },
  { name: "N5", page: KBD, usage: 34, short: "5 %", category: CAT_NUMPUNC },
  { name: "N6", page: KBD, usage: 35, short: "6 ^", category: CAT_NUMPUNC },
  { name: "N7", page: KBD, usage: 36, short: "7 &", category: CAT_NUMPUNC },
  { name: "N8", page: KBD, usage: 37, short: "8 *", category: CAT_NUMPUNC },
  { name: "N9", page: KBD, usage: 38, short: "9 (", category: CAT_NUMPUNC },
  { name: "N0", page: KBD, usage: 39, short: "0 )", category: CAT_NUMPUNC },
];

const WHITESPACE_AND_CONTROL: Keycode[] = [
  { name: "RET", page: KBD, usage: 40, short: "Ret", med: "Return", category: CAT_FN_NAV },
  { name: "ESC", page: KBD, usage: 41, short: "Esc", long: "Escape", category: CAT_FN_NAV },
  { name: "BSPC", page: KBD, usage: 42, short: "BkSp", med: "BkSpc", long: "Backspace", category: CAT_FN_NAV },
  { name: "TAB", page: KBD, usage: 43, category: CAT_FN_NAV },
  { name: "SPACE", page: KBD, usage: 44, short: "␣", med: "Space", category: CAT_FN_NAV },
];

const PUNCTUATION: Keycode[] = [
  { name: "MINUS", page: KBD, usage: 45, short: "- _", med: "Dash", category: CAT_NUMPUNC },
  { name: "EQUAL", page: KBD, usage: 46, short: "= +", med: "Equals", category: CAT_NUMPUNC },
  { name: "LBKT", page: KBD, usage: 47, short: "[ {", category: CAT_NUMPUNC },
  { name: "RBKT", page: KBD, usage: 48, short: "] }", category: CAT_NUMPUNC },
  { name: "BSLH", page: KBD, usage: 49, short: "\\ |", category: CAT_NUMPUNC },
  { name: "NUHS", page: KBD, usage: 50, short: "NUHS", long: "NonUS Hash", category: CAT_INTL },
  { name: "SEMI", page: KBD, usage: 51, short: "; :", category: CAT_NUMPUNC },
  { name: "SQT", page: KBD, usage: 52, short: "' \"", category: CAT_NUMPUNC },
  { name: "GRAVE", page: KBD, usage: 53, short: "` ~", category: CAT_NUMPUNC },
  { name: "COMMA", page: KBD, usage: 54, short: ", <", category: CAT_NUMPUNC },
  { name: "DOT", page: KBD, usage: 55, short: ". >", category: CAT_NUMPUNC },
  { name: "FSLH", page: KBD, usage: 56, short: "/ ?", category: CAT_NUMPUNC },
  { name: "CAPS", page: KBD, usage: 57, short: "Cap", med: "CapsLk", long: "Caps Lock", category: CAT_FN_NAV },
];

const FUNCTION_ROW: Keycode[] = [
  { name: "F1", page: KBD, usage: 58, category: CAT_FN_NAV },
  { name: "F2", page: KBD, usage: 59, category: CAT_FN_NAV },
  { name: "F3", page: KBD, usage: 60, category: CAT_FN_NAV },
  { name: "F4", page: KBD, usage: 61, category: CAT_FN_NAV },
  { name: "F5", page: KBD, usage: 62, category: CAT_FN_NAV },
  { name: "F6", page: KBD, usage: 63, category: CAT_FN_NAV },
  { name: "F7", page: KBD, usage: 64, category: CAT_FN_NAV },
  { name: "F8", page: KBD, usage: 65, category: CAT_FN_NAV },
  { name: "F9", page: KBD, usage: 66, category: CAT_FN_NAV },
  { name: "F10", page: KBD, usage: 67, category: CAT_FN_NAV },
  { name: "F11", page: KBD, usage: 68, category: CAT_FN_NAV },
  { name: "F12", page: KBD, usage: 69, category: CAT_FN_NAV },
];

const SYSTEM_AND_NAV: Keycode[] = [
  { name: "PRSC", page: KBD, usage: 70, short: "PrSc", long: "Print Scr", category: CAT_FN_NAV },
  { name: "SLCK", page: KBD, usage: 71, short: "ScLk", long: "ScrollLock", category: CAT_FN_NAV },
  { name: "PAUSE", page: KBD, usage: 72, short: "Paus", med: "Pause", category: CAT_FN_NAV },
  { name: "INS", page: KBD, usage: 73, short: "Ins", med: "Insert", category: CAT_FN_NAV },
  { name: "HOME", page: KBD, usage: 74, category: CAT_FN_NAV },
  { name: "PGUP", page: KBD, usage: 75, short: "PgUp", med: "PageUp", long: "Page Up", category: CAT_FN_NAV },
  { name: "DEL", page: KBD, usage: 76, short: "Del", med: "Delete", category: CAT_FN_NAV },
  { name: "END", page: KBD, usage: 77, category: CAT_FN_NAV },
  { name: "PGDN", page: KBD, usage: 78, short: "PgDn", med: "PageDn", long: "Page Down", category: CAT_FN_NAV },
  { name: "RIGHT", page: KBD, usage: 79, short: "→", category: CAT_FN_NAV },
  { name: "LEFT", page: KBD, usage: 80, short: "←", category: CAT_FN_NAV },
  { name: "DOWN", page: KBD, usage: 81, short: "↓", category: CAT_FN_NAV },
  { name: "UP", page: KBD, usage: 82, short: "↑", category: CAT_FN_NAV },
];

const KEYPAD: Keycode[] = [
  { name: "KP_NUM", page: KBD, usage: 83, short: "Num", med: "NumLck", long: "Num Lock", category: CAT_NUMPAD },
  { name: "KP_SLASH", page: KBD, usage: 84, short: "/", category: CAT_NUMPAD },
  { name: "KP_ASTERISK", page: KBD, usage: 85, short: "*", category: CAT_NUMPAD },
  { name: "KP_MINUS", page: KBD, usage: 86, short: "-", category: CAT_NUMPAD },
  { name: "KP_PLUS", page: KBD, usage: 87, short: "+", category: CAT_NUMPAD },
  { name: "KP_ENTER", page: KBD, usage: 88, short: "Ent", med: "KP Ent", long: "KP Enter", category: CAT_NUMPAD },
  { name: "KP_N1", page: KBD, usage: 89, short: "1 En", med: "1 End", category: CAT_NUMPAD },
  { name: "KP_N2", page: KBD, usage: 90, short: "2 ↓", category: CAT_NUMPAD },
  { name: "KP_N3", page: KBD, usage: 91, short: "3 PD", med: "3 PgDn", category: CAT_NUMPAD },
  { name: "KP_N4", page: KBD, usage: 92, short: "4 ←", category: CAT_NUMPAD },
  { name: "KP_N5", page: KBD, usage: 93, short: "5", category: CAT_NUMPAD },
  { name: "KP_N6", page: KBD, usage: 94, short: "6 →", category: CAT_NUMPAD },
  { name: "KP_N7", page: KBD, usage: 95, short: "7 Hm", med: "7 Home", category: CAT_NUMPAD },
  { name: "KP_N8", page: KBD, usage: 96, short: "8 ↑", category: CAT_NUMPAD },
  { name: "KP_N9", page: KBD, usage: 97, short: "9 PU", med: "9 PgUp", category: CAT_NUMPAD },
  { name: "KP_N0", page: KBD, usage: 98, short: "0 In", med: "0 Ins", long: "0 Insert", category: CAT_NUMPAD },
  { name: "KP_DOT", page: KBD, usage: 99, short: ". Dl", med: ". Del", long: ". Delete", category: CAT_NUMPAD },
];

const MISC: Keycode[] = [
  { name: "NUBS", page: KBD, usage: 100, short: "NUBS", category: CAT_INTL },
  { name: "K_APP", page: KBD, usage: 101, short: "Menu", med: "Menu", long: "Applicat'n (Menu)", category: CAT_FN_NAV },
  // Power is a keyboard-page usage (HID 7:102) in addition to the consumer-page
  // C_PWR (HID 12:0x30). Label-only here; ZMK doesn't have a stock name for
  // the kbd-page version, so no `name`.
  { page: KBD, usage: 102, short: "Power", med: "Power", category: CAT_MEDIA },
  { name: "KP_EQUAL", page: KBD, usage: 103, short: "=", category: CAT_NUMPAD },
];

const FUNCTION_ROW_EXTENDED: Keycode[] = Array.from({ length: 12 }, (_, i) => ({
  name: `F${13 + i}`,
  page: KBD,
  usage: 104 + i,
  category: CAT_MEDIA,
}));

const INTERNATIONAL_AND_LANG: Keycode[] = [
  // International / Lang have no canonical ZMK short names today — leave
  // `name` unset so the exporter doesn't accidentally claim them.
  { page: KBD, usage: 118, category: CAT_MEDIA },
  { page: KBD, usage: 133, short: ",", category: CAT_NUMPAD },
  { page: KBD, usage: 135, short: "Intl1", category: CAT_INTL },
  { page: KBD, usage: 136, short: "Intl2", category: CAT_INTL },
  { page: KBD, usage: 137, short: "Intl3", category: CAT_INTL },
  { page: KBD, usage: 138, short: "Intl4", category: CAT_INTL },
  { page: KBD, usage: 139, short: "Intl5", category: CAT_INTL },
  { page: KBD, usage: 140, short: "Intl6", category: CAT_INTL },
  { page: KBD, usage: 141, short: "Intl7", category: CAT_INTL },
  { page: KBD, usage: 142, short: "Intl8", category: CAT_INTL },
  { page: KBD, usage: 143, short: "Intl9", category: CAT_INTL },
  { page: KBD, usage: 144, short: "Lang1", category: CAT_INTL },
  { page: KBD, usage: 145, short: "Lang2", category: CAT_INTL },
  { page: KBD, usage: 146, short: "Lang3", category: CAT_INTL },
  { page: KBD, usage: 147, short: "Lang4", category: CAT_INTL },
  { page: KBD, usage: 148, short: "Lang5", category: CAT_INTL },
  { page: KBD, usage: 149, short: "Lang6", category: CAT_INTL },
  { page: KBD, usage: 150, short: "Lang7", category: CAT_INTL },
  { page: KBD, usage: 151, short: "Lang8", category: CAT_INTL },
  { page: KBD, usage: 152, short: "Lang9", category: CAT_INTL },
  { page: KBD, usage: 176, short: "00", category: CAT_NUMPAD },
  { page: KBD, usage: 177, short: "000" },
];

const MODIFIERS: Keycode[] = [
  { name: "LCTL", page: KBD, usage: 224, short: "Ctrl", med: "L Ctrl", category: CAT_FN_NAV },
  { name: "LSHFT", page: KBD, usage: 225, short: "Shft", med: "L Shft", long: "L Shift", category: CAT_FN_NAV },
  { name: "LALT", page: KBD, usage: 226, short: "Alt", med: "L Alt", long: "Left Alt", category: CAT_FN_NAV },
  { name: "LGUI", page: KBD, usage: 227, short: "GUI", med: "L GUI", long: "Left GUI", category: CAT_FN_NAV },
  { name: "RCTL", page: KBD, usage: 228, short: "Ctrl", med: "R Ctrl", category: CAT_FN_NAV },
  { name: "RSHFT", page: KBD, usage: 229, short: "Shft", med: "R Shft", long: "R Shift", category: CAT_FN_NAV },
  { name: "RALT", page: KBD, usage: 230, short: "AltG", med: "AltGr", category: CAT_FN_NAV },
  { name: "RGUI", page: KBD, usage: 231, short: "GUI", med: "R GUI", long: "Right GUI", category: CAT_FN_NAV },
];

const CONSUMER_KEYCODES: Keycode[] = [
  { name: "C_PWR", page: CONSUMER, usage: 0x30 },
  { name: "C_SLEEP", page: CONSUMER, usage: 0x32 },
  { name: "C_BRI_UP", page: CONSUMER, usage: 0x6f, short: "🔆", category: CAT_MEDIA },
  { name: "C_BRI_DN", page: CONSUMER, usage: 0x70, short: "🔅", category: CAT_MEDIA },
  { name: "C_NEXT", page: CONSUMER, usage: 0xb5, short: "⇥", category: CAT_MEDIA },
  { name: "C_PREV", page: CONSUMER, usage: 0xb6, short: "⇤", category: CAT_MEDIA },
  { name: "C_STOP", page: CONSUMER, usage: 0xb7 },
  { name: "C_EJECT", page: CONSUMER, usage: 0xb8 },
  { name: "C_PP", page: CONSUMER, usage: 0xcd, short: "⏯️", category: CAT_MEDIA },
  { name: "C_MUTE", page: CONSUMER, usage: 0xe2, short: "🔇", category: CAT_MEDIA },
  { name: "C_VOL_UP", page: CONSUMER, usage: 0xe9, short: "🔊", category: CAT_MEDIA },
  { name: "C_VOL_DN", page: CONSUMER, usage: 0xea, short: "🔉", category: CAT_MEDIA },
];

export const KEYCODES: Keycode[] = [
  ...LETTERS,
  ...NUMBER_ROW,
  ...WHITESPACE_AND_CONTROL,
  ...PUNCTUATION,
  ...FUNCTION_ROW,
  ...SYSTEM_AND_NAV,
  ...KEYPAD,
  ...MISC,
  ...FUNCTION_ROW_EXTENDED,
  ...INTERNATIONAL_AND_LANG,
  ...MODIFIERS,
  ...CONSUMER_KEYCODES,
];

// =============================================================================
// Lookups
// =============================================================================

export function hidCodeOf(k: Pick<Keycode, "page" | "usage">): number {
  return (k.page << 16) | k.usage;
}

/**
 * Reverse lookup: HID code -> the first matching keycode entry. Used by
 * both the picker (for labels) and the exporter (for the ZMK text name).
 * "First wins" so put the canonical row before any alias rows for the
 * same code.
 */
export const KEYCODE_BY_HID: ReadonlyMap<number, Keycode> = (() => {
  const m = new Map<number, Keycode>();
  for (const k of KEYCODES) {
    const code = hidCodeOf(k);
    if (!m.has(code)) m.set(code, k);
  }
  return m;
})();

/**
 * Forward lookup: uppercase ZMK name -> HID code. Includes every row
 * that has a `name`; first row wins on collision.
 */
export const HID_BY_ZMK_NAME: ReadonlyMap<string, number> = (() => {
  const m = new Map<string, number>();
  for (const k of KEYCODES) {
    if (!k.name) continue;
    if (!m.has(k.name)) m.set(k.name, hidCodeOf(k));
  }
  return m;
})();
