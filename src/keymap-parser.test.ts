import { describe, expect, it } from "vitest";

import {
  codeToZmkName,
  keycodeLookup,
  formatBindingParam,
  parseBindingParam,
} from "./keymap-parser";

describe("keymap-parser canonical table", () => {
  it("captures every canonical ZMK name <-> HID code mapping", () => {
    // Snapshot the full canonical name table so a future SSOT refactor
    // (e.g. moving names into src/keycodes.ts) trips loudly if any name
    // or code drifts. Sorted by code for stable diffs.
    const entries = [...codeToZmkName.entries()]
      .sort(([a], [b]) => a - b)
      .map(([code, name]) => ({
        code: `0x${code.toString(16).padStart(8, "0")}`,
        name,
      }));
    expect(entries).toMatchSnapshot();
  });

  it("round-trips every canonical name through formatBindingParam", () => {
    // For each canonical name in the table: name -> code -> formatted name
    // must equal the canonical name. Guards against forward/reverse drift.
    for (const [code, canonicalName] of codeToZmkName.entries()) {
      const formatted = formatBindingParam(code);
      expect(formatted, `code 0x${code.toString(16)}`).toBe(canonicalName);
    }
  });

  it("round-trips every canonical name through parseBindingParam", () => {
    for (const [code, canonicalName] of codeToZmkName.entries()) {
      const parsed = parseBindingParam(canonicalName);
      expect(parsed, `name ${canonicalName}`).toBe(code);
    }
  });

  it("treats LS()/LC()/... modifier wrappers as inverses of formatBindingParam", () => {
    // Pick a representative key (N1) and verify each modifier wrapper
    // round-trips. Catches accidental changes to the modifier bit layout.
    const n1 = keycodeLookup.get("N1");
    expect(n1).toBeDefined();
    for (const mod of ["LC", "LS", "LA", "LG", "RC", "RS", "RA", "RG"]) {
      const token = `${mod}(N1)`;
      const code = parseBindingParam(token);
      expect(code, token).toBeDefined();
      expect(formatBindingParam(code!), token).toBe(token);
    }
  });
});
