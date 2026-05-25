import { describe, expect, it } from "vitest";

import { KEYBOARD_SHAPES, getShapeById, shapeHidIds } from "./physical";

describe("KEYBOARD_SHAPES", () => {
  it("exposes ANSI / ISO / JIS with stable IDs and rows", () => {
    expect(KEYBOARD_SHAPES.map((s) => s.id)).toEqual(["ansi", "iso", "jis"]);
    for (const s of KEYBOARD_SHAPES) {
      expect(s.rows.length).toBeGreaterThan(0);
      expect(s.rows.every((r) => r.length > 0)).toBe(true);
    }
  });

  it("every cell has a positive HID usage ID on page 0x07", () => {
    for (const s of KEYBOARD_SHAPES) {
      for (const row of s.rows) {
        for (const cell of row) {
          expect(cell.id, `${s.id}`).toBeGreaterThan(0);
          expect(cell.id, `${s.id}`).toBeLessThan(256);
        }
      }
    }
  });

  it("ANSI 'extras' beyond ANSI appear only on ISO / JIS shapes", () => {
    const ansi = shapeHidIds(KEYBOARD_SHAPES[0]);
    const iso = shapeHidIds(KEYBOARD_SHAPES[1]);
    const jis = shapeHidIds(KEYBOARD_SHAPES[2]);
    // NUHS (50) and NUBS (100) are the ISO-only typing keys.
    expect(ansi.has(50)).toBe(false);
    expect(ansi.has(100)).toBe(false);
    expect(iso.has(50)).toBe(true);
    expect(iso.has(100)).toBe(true);
    // JIS-only: ¥ (137), \_ (135), 無変換 (139), 変換 (138), カナ (144).
    for (const intl of [135, 137, 138, 139, 144]) {
      expect(ansi.has(intl), `ANSI should not include HID ${intl}`).toBe(false);
      expect(iso.has(intl), `ISO should not include HID ${intl}`).toBe(false);
      expect(jis.has(intl), `JIS should include HID ${intl}`).toBe(true);
    }
  });

  it("getShapeById falls back to ANSI on unknown / null", () => {
    expect(getShapeById("ansi").id).toBe("ansi");
    expect(getShapeById("nonsense").id).toBe("ansi");
    expect(getShapeById(null).id).toBe("ansi");
    expect(getShapeById(undefined).id).toBe("ansi");
  });
});
