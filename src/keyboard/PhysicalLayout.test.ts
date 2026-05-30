import { describe, it, expect } from "vitest";
import { scalePosition } from "./PhysicalLayout";

const oneU = 48;

describe("scalePosition rotation origin", () => {
  it("pivots around the layout origin when rx/ry are explicitly 0 (zmk-studio#97)", () => {
    // r != 0 with rx = ry = 0 means "rotate around the layout's (0,0)".
    // The old `rx || x` collapsed the legitimate 0 back to the key's own x,
    // pivoting each key around its own corner and scrambling rotated clusters.
    const style = scalePosition({ x: 3, y: 2, r: 15, rx: 0, ry: 0 }, oneU);

    // Origin expressed in the key's local space: (rx - x, ry - y) * oneU.
    expect(style.transformOrigin).toBe(`${(0 - 3) * oneU}px ${(0 - 2) * oneU}px`);
    expect(style.transform).toBe("rotate(15deg)");
  });

  it("honors a non-zero rotation origin unchanged", () => {
    const style = scalePosition({ x: 3, y: 2, r: 30, rx: 5, ry: 4 }, oneU);

    expect(style.transformOrigin).toBe(`${(5 - 3) * oneU}px ${(4 - 2) * oneU}px`);
    expect(style.transform).toBe("rotate(30deg)");
  });

  it("falls back to the key's own position when no origin is given", () => {
    // rx/ry omitted (undefined) → `?? x/y` keeps the key rotating about its
    // own top-left, which is the sensible default for unspecified origins.
    const style = scalePosition({ x: 3, y: 2, r: 15 }, oneU);

    expect(style.transformOrigin).toBe("0px 0px");
    expect(style.transform).toBe("rotate(15deg)");
  });

  it("applies no transform to unrotated keys", () => {
    const style = scalePosition({ x: 3, y: 2, r: 0 }, oneU);

    expect(style.transform).toBeUndefined();
    expect(style.transformOrigin).toBeUndefined();
    expect(style.top).toBe(2 * oneU);
    expect(style.left).toBe(3 * oneU);
  });
});
