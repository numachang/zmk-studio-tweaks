// =============================================================================
// Physical keyboard shapes for the picker's basic-tier tabs
// =============================================================================
// The picker has two "basic-tier" tabs that draw a keycap grid:
//
//   - `Basic`     — ANSI 60% shape. The default for US-style keyboards.
//   - `ISO/JIS`   — either an ISO 60% or JIS 60% shape, picked from the
//                   active host layout. JIS is Japan-only and ISO covers
//                   the rest of the non-ANSI world, so the active host
//                   layout uniquely identifies which physical shape the
//                   user is on in the common case. Both shapes are
//                   rendered as 5 rows with the layout-specific extras
//                   (NUHS/NUBS for ISO; ¥/`\_`/IME keys for JIS) in
//                   their real physical positions, not as a flat
//                   "extras" row.
//
// Naming note: ZMK already uses "physical layout" to mean the connected
// keyboard's actual key matrix (from RPC). Anything here is purely picker
// presentation — we call it a "basic-tier shape" to keep the two ideas
// distinct.
// =============================================================================

export interface BasicCell {
  /**
   * HID usage ID on page 0x07 (keyboard / keypad), or `-1` for a
   * transparent spacer cell used to make a row visually line up
   * (e.g. JIS row 2 needs a 1.5U spacer where the Enter key would
   * otherwise span down from above).
   */
  id: number;
  /** Width in keyboard units (1U = standard square). Defaults to 1. */
  w?: number;
}

/** Sentinel id for a transparent spacer cell. */
export const SPACER_ID = -1;

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
// JIS 60% — same five-row form factor as ISO but with Japanese-specific
// keys integrated in their real physical positions:
//   - Row 1 ends with ¥ (INT3) before a 1U BkSp.
//   - Row 2 has @ (LBKT) and [ (RBKT) where ANSI has [ and ].
//   - Row 3 has ] (NUHS) right of `:`.
//   - Row 4 has \_ (INT1) between `/` and a narrower RShft.
//   - Row 5 has 無変換 (INT5), 変換 (INT4), and かな (LANG1) flanking a
//     narrower Space.
// Flattened Enter on row 3 only (no row-spanning), same simplification
// as ISO.
// =============================================================================
export const JIS_ROWS: BasicCell[][] = [
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
    // Enter spans rows 2-3 on a real JIS keyboard. We render Enter
    // on row 3 only; this 1.5U spacer occupies the width that the
    // top of the Enter key would have taken so the row reads as
    // 15U like every other row.
    { id: SPACER_ID, w: 1.5 },
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
  // LCtrl LGUI LAlt 無変換 Space 変換 かな RAlt RGUI Menu RCtrl
  // (11 keys squeezed into the same 15U budget the other rows use, so
  // each non-thumb key is 1.25U and Space gets the leftover 2.5U —
  // shorter than ANSI's Space, matching real JIS bottom rows.)
  [
    { id: 224, w: 1.25 }, { id: 227, w: 1.25 }, { id: 226, w: 1.25 },
    { id: 139, w: 1.25 },        // INT5 = 無変換
    { id: 44, w: 2.5 },          // Space (smaller than ANSI's 6.25U)
    { id: 138, w: 1.25 },        // INT4 = 変換
    { id: 144, w: 1.25 },        // LANG1 = かな
    { id: 230, w: 1.25 }, { id: 231, w: 1.25 },
    { id: 101, w: 1.25 }, { id: 228, w: 1.25 },
  ],
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
  ...JIS_ROWS.flatMap((row) => row.map((cell) => cell.id)),
]);

/** HIDs unique to the JIS shape (not on ANSI or ISO). Used by auto-jump. */
export const JIS_ONLY_HID_IDS: ReadonlySet<number> = (() => {
  const ansi = new Set(ANSI_ROWS.flatMap((row) => row.map((cell) => cell.id)));
  const iso = new Set(ISO_ROWS.flatMap((row) => row.map((cell) => cell.id)));
  return new Set(
    JIS_ROWS.flatMap((row) => row.map((cell) => cell.id)).filter(
      (id) => !ansi.has(id) && !iso.has(id)
    )
  );
})();

/** HIDs unique to the ISO shape (not on ANSI). Used by auto-jump. */
export const ISO_ONLY_HID_IDS: ReadonlySet<number> = (() => {
  const ansi = new Set(ANSI_ROWS.flatMap((row) => row.map((cell) => cell.id)));
  return new Set(
    ISO_ROWS.flatMap((row) => row.map((cell) => cell.id)).filter(
      (id) => !ansi.has(id)
    )
  );
})();
