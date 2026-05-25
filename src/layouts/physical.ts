// =============================================================================
// Physical keyboard shape for the picker's Basic tab
// =============================================================================
// The Basic tab in HidUsagePicker draws keycaps in a real-keyboard layout
// so users can grab the key they want by sight. The shape of that grid
// (ANSI vs ISO vs JIS) is independent of the host OS keyboard layout —
// you can have a JIS physical keyboard talking to an ANSI host, or an
// ANSI 60% talking to a French OS, etc. So this is its own user pick.
//
// Naming note: ZMK already uses "physical layout" to mean the connected
// keyboard's actual key matrix (from RPC). To avoid collision, the term
// here is "shape" — purely the picker grid's visual organization.
// =============================================================================

export interface BasicCell {
  /** HID usage ID on page 0x07 (keyboard / keypad). */
  id: number;
  /** Width in keyboard units (1U = standard square). Defaults to 1. */
  w?: number;
}

export type ShapeId = "ansi" | "iso" | "jis";

export interface KeyboardShape {
  id: ShapeId;
  /** Display name for the picker dropdown. */
  name: string;
  /**
   * Grid rows for the Basic tab. Cells are rendered left-to-right;
   * we don't model row-spanning Enter keys (ISO / JIS Enter is drawn
   * as a normal-width Enter on row 3 only).
   */
  rows: BasicCell[][];
}

// =============================================================================
// ANSI 60%
// =============================================================================
const ANSI_ROWS: BasicCell[][] = [
  // ` 1234567890 - = BkSp(2U)
  [
    { id: 53 },
    { id: 30 }, { id: 31 }, { id: 32 }, { id: 33 }, { id: 34 },
    { id: 35 }, { id: 36 }, { id: 37 }, { id: 38 }, { id: 39 },
    { id: 45 }, { id: 46 }, { id: 42, w: 2 },
  ],
  // Tab(1.5U) Q-P [ ] \(1.5U)
  [
    { id: 43, w: 1.5 },
    { id: 20 }, { id: 26 }, { id: 8 }, { id: 21 }, { id: 23 },
    { id: 28 }, { id: 24 }, { id: 12 }, { id: 18 }, { id: 19 },
    { id: 47 }, { id: 48 }, { id: 49, w: 1.5 },
  ],
  // Caps(1.75U) A-L ; ' Ret(2.25U)
  [
    { id: 57, w: 1.75 },
    { id: 4 }, { id: 22 }, { id: 7 }, { id: 9 }, { id: 10 },
    { id: 11 }, { id: 13 }, { id: 14 }, { id: 15 },
    { id: 51 }, { id: 52 },
    { id: 40, w: 2.25 },
  ],
  // LShft(2.25U) Z-M , . / RShft(2.75U)
  [
    { id: 225, w: 2.25 },
    { id: 29 }, { id: 27 }, { id: 6 }, { id: 25 }, { id: 5 },
    { id: 17 }, { id: 16 }, { id: 54 }, { id: 55 }, { id: 56 },
    { id: 229, w: 2.75 },
  ],
  // LCtrl LGUI LAlt(1.25U each) Space(6.25U) RAlt RGUI Menu RCtrl(1.25U each)
  [
    { id: 224, w: 1.25 }, { id: 227, w: 1.25 }, { id: 226, w: 1.25 },
    { id: 44, w: 6.25 },
    { id: 230, w: 1.25 }, { id: 231, w: 1.25 },
    { id: 101, w: 1.25 }, { id: 228, w: 1.25 },
  ],
];

// =============================================================================
// ISO 60% — extra keys: NUHS (`# ~`, HID 50) right of `'`, NUBS (`\ |`,
// HID 100) between LShft and Z. Enter is conceptually 2-row tall; we
// flatten it to a single 1.25U cell on row 3 since row-spanning would
// complicate the grid model for marginal visual gain.
// =============================================================================
const ISO_ROWS: BasicCell[][] = [
  [
    { id: 53 },
    { id: 30 }, { id: 31 }, { id: 32 }, { id: 33 }, { id: 34 },
    { id: 35 }, { id: 36 }, { id: 37 }, { id: 38 }, { id: 39 },
    { id: 45 }, { id: 46 }, { id: 42, w: 2 },
  ],
  [
    { id: 43, w: 1.5 },
    { id: 20 }, { id: 26 }, { id: 8 }, { id: 21 }, { id: 23 },
    { id: 28 }, { id: 24 }, { id: 12 }, { id: 18 }, { id: 19 },
    { id: 47 }, { id: 48 },
  ],
  // Caps(1.75U) A-L ; ' NUHS Ret(1.25U)
  [
    { id: 57, w: 1.75 },
    { id: 4 }, { id: 22 }, { id: 7 }, { id: 9 }, { id: 10 },
    { id: 11 }, { id: 13 }, { id: 14 }, { id: 15 },
    { id: 51 }, { id: 52 },
    { id: 50 },                  // NUHS `# ~`
    { id: 40, w: 1.25 },
  ],
  // LShft(1.25U) NUBS Z-M , . / RShft(2.75U)
  [
    { id: 225, w: 1.25 },
    { id: 100 },                 // NUBS `\ |`
    { id: 29 }, { id: 27 }, { id: 6 }, { id: 25 }, { id: 5 },
    { id: 17 }, { id: 16 }, { id: 54 }, { id: 55 }, { id: 56 },
    { id: 229, w: 2.75 },
  ],
  [
    { id: 224, w: 1.25 }, { id: 227, w: 1.25 }, { id: 226, w: 1.25 },
    { id: 44, w: 6.25 },
    { id: 230, w: 1.25 }, { id: 231, w: 1.25 },
    { id: 101, w: 1.25 }, { id: 228, w: 1.25 },
  ],
];

// =============================================================================
// JIS 60% — extra typing keys: ¥ (INT3, HID 137) between `=` and BkSp,
// NUHS (HID 50) right of `:`, `\_` (INT1, HID 135) between `/` and
// RShft, 無変換 (INT5, HID 139), 変換 (INT4, HID 138), カナ (LANG1,
// HID 144) flanking Space. BkSp shrinks to 1U to fit ¥; Space shrinks
// to make room for the three IME keys.
// =============================================================================
const JIS_ROWS: BasicCell[][] = [
  // 全/半 1234567890 - ^ ¥ BkSp(1U)
  [
    { id: 53 },                  // GRAVE = 全/半
    { id: 30 }, { id: 31 }, { id: 32 }, { id: 33 }, { id: 34 },
    { id: 35 }, { id: 36 }, { id: 37 }, { id: 38 }, { id: 39 },
    { id: 45 },                  // -
    { id: 46 },                  // ^
    { id: 137 },                 // INT3 = ¥
    { id: 42 },
  ],
  [
    { id: 43, w: 1.5 },
    { id: 20 }, { id: 26 }, { id: 8 }, { id: 21 }, { id: 23 },
    { id: 28 }, { id: 24 }, { id: 12 }, { id: 18 }, { id: 19 },
    { id: 47 },                  // LBKT = @
    { id: 48 },                  // RBKT = [
  ],
  // Caps(1.75U) A-L ; : ] Ret(1.25U)
  [
    { id: 57, w: 1.75 },
    { id: 4 }, { id: 22 }, { id: 7 }, { id: 9 }, { id: 10 },
    { id: 11 }, { id: 13 }, { id: 14 }, { id: 15 },
    { id: 51 },                  // SEMI = ;
    { id: 52 },                  // SQT = :
    { id: 50 },                  // NUHS = ]
    { id: 40, w: 1.25 },
  ],
  // LShft(2.25U) Z-M , . / \_ RShft(1.75U)
  [
    { id: 225, w: 2.25 },
    { id: 29 }, { id: 27 }, { id: 6 }, { id: 25 }, { id: 5 },
    { id: 17 }, { id: 16 }, { id: 54 }, { id: 55 }, { id: 56 },
    { id: 135 },                 // INT1 = \_
    { id: 229, w: 1.75 },
  ],
  // LCtrl LGUI LAlt 無変換 Space(4U) 変換 カナ RAlt RGUI Menu RCtrl
  [
    { id: 224, w: 1.25 }, { id: 227, w: 1.25 }, { id: 226, w: 1.25 },
    { id: 139, w: 1.25 },        // INT5 = 無変換
    { id: 44, w: 4 },
    { id: 138, w: 1.25 },        // INT4 = 変換
    { id: 144, w: 1.25 },        // LANG1 = カナ
    { id: 230, w: 1.25 }, { id: 231, w: 1.25 },
    { id: 101, w: 1.25 }, { id: 228, w: 1.25 },
  ],
];

export const KEYBOARD_SHAPES: ReadonlyArray<KeyboardShape> = [
  { id: "ansi", name: "ANSI",      rows: ANSI_ROWS },
  { id: "iso",  name: "ISO",       rows: ISO_ROWS  },
  { id: "jis",  name: "JIS (日本)", rows: JIS_ROWS  },
];

export const DEFAULT_SHAPE_ID: ShapeId = "ansi";

export function getShapeById(id: string | null | undefined): KeyboardShape {
  return KEYBOARD_SHAPES.find((s) => s.id === id) ?? KEYBOARD_SHAPES[0];
}

/**
 * Set of HID page-7 usages that appear anywhere on the given shape's
 * grid. Used by the picker to keep those keys from also surfacing in
 * the Function / International / Numpad tabs (otherwise auto-jump
 * would prefer the stale duplicate when the user picks a Basic key).
 */
export function shapeHidIds(shape: KeyboardShape): Set<number> {
  return new Set(shape.rows.flatMap((row) => row.map((cell) => cell.id)));
}
