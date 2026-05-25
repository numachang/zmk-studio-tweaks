import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYCODES, hidCodeOf } from "./keycodes";

export interface ParsedBinding {
  behavior: string;
  params: number[];
}

export interface ParsedLayer {
  name: string;
  bindings: ParsedBinding[];
}

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
// Lookups built from the canonical table (src/keycodes.ts)
// =============================================================================

const keycodeLookup: Map<string, number> = new Map();
const codeToZmkName: Map<number, string> = new Map();

for (const k of KEYCODES) {
  if (!k.name) continue;
  const code = hidCodeOf(k);
  if (!keycodeLookup.has(k.name)) keycodeLookup.set(k.name, code);
  if (!codeToZmkName.has(code)) codeToZmkName.set(code, k.name);
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
    }
  }
  // Picker-label aliases: anything we surface to the user as a label is also
  // accepted as a parser alias, so "Volume Up" or "AltGr" round-trips.
  for (const k of KEYCODES) {
    const code = hidCodeOf(k);
    for (const label of [k.short, k.med, k.long]) {
      if (label) hidNameToCode.set(label.toLowerCase(), code);
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
