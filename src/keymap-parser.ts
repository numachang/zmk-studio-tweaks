import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import HidOverrides from "./hid-usage-name-overrides.json";

interface HidLabels {
  short?: string;
  med?: string;
  long?: string;
}

const overrides: Record<string, Record<string, HidLabels>> = HidOverrides;

export interface ParsedBinding {
  behavior: string;
  params: number[];
}

export interface ParsedLayer {
  name: string;
  bindings: ParsedBinding[];
}

// =============================================================================
// Canonical ZMK keycode table
// =============================================================================
// `[zmkName, hidPage, hidUsageId]`. Single source of truth used to build both
// the forward (name -> code) and reverse (code -> name) lookups, so we never
// give a code two different canonical names. Order matters only inside groups
// of synonyms; the first entry for a given code wins on the reverse side.
// =============================================================================

type Keycode = readonly [name: string, page: number, usage: number];

const LETTERS: Keycode[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  .split("")
  .map((l, i) => [l, 0x07, 4 + i] as const);

const KEYBOARD_KEYCODES: Keycode[] = [
  // Number row
  ["N1", 0x07, 30], ["N2", 0x07, 31], ["N3", 0x07, 32], ["N4", 0x07, 33],
  ["N5", 0x07, 34], ["N6", 0x07, 35], ["N7", 0x07, 36], ["N8", 0x07, 37],
  ["N9", 0x07, 38], ["N0", 0x07, 39],
  // Control / whitespace
  ["RET", 0x07, 40], ["ESC", 0x07, 41], ["BSPC", 0x07, 42],
  ["TAB", 0x07, 43], ["SPACE", 0x07, 44],
  // Punctuation
  ["MINUS", 0x07, 45], ["EQUAL", 0x07, 46], ["LBKT", 0x07, 47],
  ["RBKT", 0x07, 48], ["BSLH", 0x07, 49], ["NUHS", 0x07, 50],
  ["SEMI", 0x07, 51], ["SQT", 0x07, 52], ["GRAVE", 0x07, 53],
  ["COMMA", 0x07, 54], ["DOT", 0x07, 55], ["FSLH", 0x07, 56],
  ["CAPS", 0x07, 57],
  // F-row
  ["F1", 0x07, 58], ["F2", 0x07, 59], ["F3", 0x07, 60], ["F4", 0x07, 61],
  ["F5", 0x07, 62], ["F6", 0x07, 63], ["F7", 0x07, 64], ["F8", 0x07, 65],
  ["F9", 0x07, 66], ["F10", 0x07, 67], ["F11", 0x07, 68], ["F12", 0x07, 69],
  // System
  ["PRSC", 0x07, 70], ["SLCK", 0x07, 71], ["PAUSE", 0x07, 72],
  ["INS", 0x07, 73], ["HOME", 0x07, 74], ["PGUP", 0x07, 75],
  ["DEL", 0x07, 76], ["END", 0x07, 77], ["PGDN", 0x07, 78],
  // Arrows
  ["RIGHT", 0x07, 79], ["LEFT", 0x07, 80], ["DOWN", 0x07, 81], ["UP", 0x07, 82],
  // Keypad
  ["KP_NUM", 0x07, 83], ["KP_SLASH", 0x07, 84], ["KP_ASTERISK", 0x07, 85],
  ["KP_MINUS", 0x07, 86], ["KP_PLUS", 0x07, 87], ["KP_ENTER", 0x07, 88],
  ["KP_N1", 0x07, 89], ["KP_N2", 0x07, 90], ["KP_N3", 0x07, 91],
  ["KP_N4", 0x07, 92], ["KP_N5", 0x07, 93], ["KP_N6", 0x07, 94],
  ["KP_N7", 0x07, 95], ["KP_N8", 0x07, 96], ["KP_N9", 0x07, 97],
  ["KP_N0", 0x07, 98], ["KP_DOT", 0x07, 99],
  // Misc
  ["NUBS", 0x07, 100], ["K_APP", 0x07, 101], ["KP_EQUAL", 0x07, 103],
  ["F13", 0x07, 104], ["F14", 0x07, 105], ["F15", 0x07, 106],
  ["F16", 0x07, 107], ["F17", 0x07, 108], ["F18", 0x07, 109],
  ["F19", 0x07, 110], ["F20", 0x07, 111], ["F21", 0x07, 112],
  ["F22", 0x07, 113], ["F23", 0x07, 114], ["F24", 0x07, 115],
  // Modifiers
  ["LCTL", 0x07, 224], ["LSHFT", 0x07, 225], ["LALT", 0x07, 226], ["LGUI", 0x07, 227],
  ["RCTL", 0x07, 228], ["RSHFT", 0x07, 229], ["RALT", 0x07, 230], ["RGUI", 0x07, 231],
];

const CONSUMER_KEYCODES: Keycode[] = [
  ["C_PWR", 0x0c, 0x30], ["C_SLEEP", 0x0c, 0x32],
  ["C_BRI_UP", 0x0c, 0x6f], ["C_BRI_DN", 0x0c, 0x70],
  ["C_NEXT", 0x0c, 0xb5], ["C_PREV", 0x0c, 0xb6], ["C_STOP", 0x0c, 0xb7],
  ["C_EJECT", 0x0c, 0xb8], ["C_PP", 0x0c, 0xcd],
  ["C_MUTE", 0x0c, 0xe2], ["C_VOL_UP", 0x0c, 0xe9], ["C_VOL_DN", 0x0c, 0xea],
];

const ZMK_KEYCODES: Keycode[] = [...LETTERS, ...KEYBOARD_KEYCODES, ...CONSUMER_KEYCODES];

// =============================================================================
// ZMK implicit-modifier flags
// =============================================================================
// ZMK encodes "shifted" or otherwise pre-modified keys in the upper byte of the
// 32-bit binding parameter. e.g. LS(N1) = 0x02 << 24 | (0x07 << 16) | 30 = the
// HID 'shift+1' usage. We emit and parse `LS(N1)` / `LC(MINUS)` etc.
// =============================================================================

const MODIFIER_FLAGS: ReadonlyArray<readonly [bit: number, dtsName: string]> = [
  [0x01, "LC"],
  [0x02, "LS"],
  [0x04, "LA"],
  [0x08, "LG"],
  [0x10, "RC"],
  [0x20, "RS"],
  [0x40, "RA"],
  [0x80, "RG"],
];

const MOD_NAME_TO_BIT: Map<string, number> = new Map(
  MODIFIER_FLAGS.map(([bit, name]) => [name, bit])
);

// =============================================================================
// Lookups built from the canonical table
// =============================================================================

function keycodeFromTuple(t: Keycode): number {
  return (t[1] << 16) + t[2];
}

const keycodeLookup: Map<string, number> = new Map();
const codeToZmkName: Map<number, string> = new Map();

for (const t of ZMK_KEYCODES) {
  const code = keycodeFromTuple(t);
  const name = t[0];
  if (!keycodeLookup.has(name)) keycodeLookup.set(name, code);
  if (!codeToZmkName.has(code)) codeToZmkName.set(code, name);
}

// Parse-only HID-name fallback. The canonical table is authoritative; these
// entries only widen what the parser will accept (e.g. plain "Comma" or "1"
// strings that some hand-written files might use), and they never overwrite
// canonical ZMK names.
{
  const hidNameToCode = new Map<string, number>();
  for (const page of UsagePages) {
    for (const usage of page.UsageIds) {
      const code = (page.Id << 16) + usage.Id;
      hidNameToCode.set(usage.Name.toLowerCase(), code);
      const pageOverrides = overrides[page.Id.toString()]?.[usage.Id.toString()];
      if (pageOverrides) {
        if (pageOverrides.short) hidNameToCode.set(pageOverrides.short.toLowerCase(), code);
        if (pageOverrides.med) hidNameToCode.set(pageOverrides.med.toLowerCase(), code);
        if (pageOverrides.long) hidNameToCode.set(pageOverrides.long.toLowerCase(), code);
      }
    }
  }

  // Permissive aliases that point at the keyboard-page (not the keypad-page)
  // code so e.g. "1" resolves to N1 (kbd) rather than KP_N1 (keypad).
  const zmkAliases: Record<string, string[]> = {
    N1: ["1", "!"], N2: ["2", "@"], N3: ["3", "#"], N4: ["4", "$"], N5: ["5", "%"],
    N6: ["6", "^"], N7: ["7", "&"], N8: ["8", "*"], N9: ["9", "("], N0: ["0", ")"],
    MINUS: ["-"], EQUAL: ["="], LBKT: ["["], RBKT: ["]"], BSLH: ["\\"],
    SEMI: [";"], SQT: ["'"], GRAVE: ["`"], COMMA: [","], DOT: ["."], FSLH: ["/"],
  };
  for (const [zmkName, aliases] of Object.entries(zmkAliases)) {
    if (!keycodeLookup.has(zmkName)) continue; // skip if not in canonical table
    const canonicalCode = keycodeLookup.get(zmkName)!;
    for (const alias of aliases) {
      const upper = alias.toUpperCase();
      if (!keycodeLookup.has(upper)) keycodeLookup.set(upper, canonicalCode);
    }
  }
  // Wire the HID Name field as a last-resort alias for parsing (e.g. "Return")
  for (const [hidName, code] of hidNameToCode) {
    const upper = hidName.toUpperCase();
    if (!keycodeLookup.has(upper)) keycodeLookup.set(upper, code);
  }
}

// =============================================================================
// Behavior reference name table (RPC displayName <-> DTS reference)
// =============================================================================

const behaviorAliases: Record<string, string> = {
  kp: "Key Press",
  mo: "Momentary Layer",
  mt: "Mod-Tap",
  lt: "Layer-Tap",
  to: "To Layer",
  tog: "Toggle Layer",
  trans: "Transparent",
  none: "None",
  sk: "Sticky Key",
  sl: "Sticky Layer",
  mkp: "Mouse Key Press",
  mmv: "Mouse Move",
  msc: "Mouse Scroll",
  bt: "Bluetooth",
  out: "Output Selection",
  ext_power: "External Power",
  bl: "Backlight",
  rgb_ug: "RGB Underglow",
  bootloader: "Bootloader",
  reset: "Reset",
  soft_off: "Soft Off",
  caps_word: "Caps Word",
  key_repeat: "Key Repeat",
  gresc: "Grave Escape",
  studio_unlock: "Studio Unlock",
};

const displayNameToDtsRefMap: Map<string, string> = new Map(
  Object.entries(behaviorAliases).map(([ref, dn]) => [dn.toLowerCase(), ref])
);

/**
 * Translate the RPC behavior displayName (e.g. "Key Press") to its DTS
 * reference name (e.g. "kp"). User-defined behaviors whose displayName
 * already is the DTS node name (e.g. "homerow_mods_left") pass through
 * after stripping a leading "&".
 */
export function dtsRefForDisplayName(displayName: string): string {
  const stripped = displayName.replace(/^&/, "");
  const known = displayNameToDtsRefMap.get(stripped.toLowerCase());
  return known ?? stripped;
}

// =============================================================================
// Binding-parameter serialization
// =============================================================================

/**
 * Format a single binding parameter for inclusion in a .keymap file.
 *   - Values with HID page bits become ZMK keycode names, with implicit
 *     modifier bits unfolded into `LS(...)`, `LC(...)` etc.
 *   - Values without HID page bits (layer indices, BT profile numbers,
 *     small immediate integers) stay as decimal.
 */
export function formatBindingParam(code: number): string {
  const modBits = (code >>> 24) & 0xff;
  const base = code & 0x00ffffff;

  if (base < 0x010000) {
    return String(code);
  }

  const baseName = codeToZmkName.get(base);
  if (!baseName) {
    return String(code);
  }

  if (modBits === 0) return baseName;

  let result = baseName;
  for (const [bit, name] of MODIFIER_FLAGS) {
    if (modBits & bit) {
      result = `${name}(${result})`;
    }
  }
  return result;
}

/**
 * Parse a single ZMK binding parameter token (e.g. "EQUAL", "LS(N1)", "42")
 * into its 32-bit binding value. Returns `undefined` if the token can't be
 * resolved to a known keycode (and is not a bare integer).
 */
export function parseBindingParam(token: string): number | undefined {
  const numeric = parseInt(token, 10);
  if (!isNaN(numeric) && /^-?\d+$/.test(token)) return numeric;

  const wrap = token.match(/^([LR][CSAG])\((.+)\)$/);
  if (wrap) {
    const bit = MOD_NAME_TO_BIT.get(wrap[1]);
    if (bit === undefined) return undefined;
    const inner = parseBindingParam(wrap[2]);
    if (inner === undefined) return undefined;
    return inner | (bit << 24);
  }

  const code = keycodeLookup.get(token.toUpperCase());
  return code;
}

// =============================================================================
// .keymap file parser
// =============================================================================

export function parseKeymapFile(content: string): ParsedLayer[] {
  const layers: ParsedLayer[] = [];

  const keymapBlock = content
    .replace(/#include.*/g, "")
    .replace(/\/\/.*$/gm, "");

  // Layer node: `Name { [display-name = "..."; ] bindings = <...>; }`.
  // Constrain what's allowed between the opening brace and `bindings = <` so
  // we don't accidentally pair an outer node (e.g. `keymap { compatible =
  // "..."; Base { bindings = <...>; }; }`) with an inner layer's bindings
  // block — that bug caused the Base layer to be silently dropped on import.
  const layerBlockRegex =
    /(\w+)\s*\{\s*(?:display-name\s*=\s*"([^"]*)"\s*;\s*)?bindings\s*=\s*<([^>]*)>\s*;/g;

  let match: RegExpExecArray | null;
  while ((match = layerBlockRegex.exec(keymapBlock)) !== null) {
    const layerName = match[1];
    const displayName = match[2] ?? layerName;
    const bindingsStr = match[3];

    if (["compatible", "keymap", "behaviors"].includes(layerName)) continue;

    const bindings: ParsedBinding[] = [];
    // Behavior reference followed by zero-or-more whitespace-separated tokens.
    // Tokens may include `LS(N1)` etc., so we match them as `[^\s&]+`.
    const bindingRegex = /&(\w+)((?:\s+[^\s&>]+)*)/g;

    let bMatch: RegExpExecArray | null;
    while ((bMatch = bindingRegex.exec(bindingsStr)) !== null) {
      const behavior = bMatch[1];
      const paramStr = bMatch[2].trim();
      const tokens = paramStr.length === 0 ? [] : paramStr.split(/\s+/);
      const params: number[] = [];

      for (const tok of tokens) {
        const v = parseBindingParam(tok);
        params.push(v ?? 0);
      }

      bindings.push({ behavior, params });
    }

    if (bindings.length > 0) {
      layers.push({ name: displayName, bindings });
    }
  }

  return layers;
}

export { keycodeLookup, behaviorAliases, codeToZmkName };
