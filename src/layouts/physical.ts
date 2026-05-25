// =============================================================================
// Physical keyboard shapes for the picker's basic-tier tabs
// =============================================================================
// The picker has two "basic-tier" tabs that draw a keycap grid:
//
//   - `Basic`     — ANSI 60% shape. The default for US-style keyboards.
//   - `ISO/JIS`   — ISO 60% shape + a JIS-specific extras row (¥, `\_`,
//                   無変換, 変換, かな). One tab covers everyone who isn't
//                   ANSI: Europe / UK / ANZ uses ISO, Japan uses JIS, and
//                   the two are mutually exclusive in practice. JIS users
//                   see the IME / ¥ keys in the extras row rather than in
//                   their physical positions, matching the upstream
//                   convention in similar editors.
//
// Naming note: ZMK already uses "physical layout" to mean the connected
// keyboard's actual key matrix (from RPC). Anything here is purely picker
// presentation — we call it a "basic-tier shape" to keep the two ideas
// distinct.
// =============================================================================

export interface BasicCell {
  /** HID usage ID on page 0x07 (keyboard / keypad). */
  id: number;
  /** Width in keyboard units (1U = standard square). Defaults to 1. */
  w?: number;
}

// =============================================================================
// ANSI 60%
// =============================================================================
export const ANSI_ROWS: BasicCell[][] = [
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
// ISO 60% — extra typing keys: NUHS (`# ~`, HID 50) right of `'`, NUBS
// (`\ |`, HID 100) between LShft and Z. Enter is conceptually 2-row
// tall; flattened to a single 1.25U cell on row 3 since row-spanning
// would add complexity for marginal visual gain.
// =============================================================================
export const ISO_ROWS: BasicCell[][] = [
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
// JIS-only physical keys that don't appear on an ISO 60%. Rendered as a
// single extras row at the bottom of the ISO/JIS tab so Japanese users
// can pick ¥ / `\_` / IME keys without leaving the basic-tier tab.
// =============================================================================
export const JIS_EXTRAS: BasicCell[] = [
  { id: 137 }, // INT3 = ¥|
  { id: 135 }, // INT1 = \_
  { id: 139 }, // INT5 = 無変換
  { id: 138 }, // INT4 = 変換
  { id: 144 }, // LANG1 = かな
];

/**
 * Union of every HID page-7 usage that appears on any basic-tier tab.
 * Used by the picker to keep those keys from also surfacing in the
 * Function / Numpad / International / Other tabs (otherwise the same
 * HID code would be reachable from two tabs and the auto-jump would
 * sometimes prefer the stale duplicate).
 */
export const BASIC_TIER_HID_IDS: ReadonlySet<number> = new Set([
  ...ANSI_ROWS.flatMap((row) => row.map((cell) => cell.id)),
  ...ISO_ROWS.flatMap((row) => row.map((cell) => cell.id)),
  ...JIS_EXTRAS.map((cell) => cell.id),
]);

/** HIDs that live on the ISO/JIS tab (ISO grid + JIS extras). */
export const ISO_JIS_HID_IDS: ReadonlySet<number> = new Set([
  ...ISO_ROWS.flatMap((row) => row.map((cell) => cell.id)),
  ...JIS_EXTRAS.map((cell) => cell.id),
]);

/** HIDs that live on the ANSI tab. */
export const ANSI_HID_IDS: ReadonlySet<number> = new Set(
  ANSI_ROWS.flatMap((row) => row.map((cell) => cell.id))
);
