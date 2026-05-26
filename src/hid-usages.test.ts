import { describe, expect, it } from "vitest";

import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYCODES } from "./keycodes";
import {
  hid_usage_get_label,
  hid_usage_get_metadata,
  hid_usage_page_get_ids,
} from "./hid-usages";
import { JIS_LAYOUT, LAYOUTS, US_ANSI_LAYOUT } from "./layouts";

// Enumerate every (page, usage) pair that *could* surface a label in the UI:
// every entry in the HID spec table for pages we use, plus every entry in
// the curated keycode table. Sorted so the snapshot diff is stable.
const allPairs = (() => {
  const seen = new Set<string>();
  const out: Array<{ page: number; usage: number }> = [];
  for (const page of UsagePages) {
    for (const u of page.UsageIds) {
      const k = `${page.Id}:${u.Id}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push({ page: page.Id, usage: u.Id });
      }
    }
  }
  for (const k of KEYCODES) {
    const key = `${k.page}:${k.usage}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ page: k.page, usage: k.usage });
    }
  }
  out.sort((a, b) => a.page - b.page || a.usage - b.usage);
  return out;
})();

describe("hid_usage_get_metadata", () => {
  it("captures the full picker-label baseline (pre-SSOT snapshot)", () => {
    const snapshot = allPairs.map(({ page, usage }) => ({
      page,
      usage,
      ...hid_usage_get_metadata(page, usage),
    }));
    expect(snapshot).toMatchSnapshot();
  });
});

describe("hid_usage_get_label", () => {
  it("captures the compact-label baseline (pre-SSOT snapshot)", () => {
    const snapshot = allPairs.map(({ page, usage }) => ({
      page,
      usage,
      label: hid_usage_get_label(page, usage),
    }));
    expect(snapshot).toMatchSnapshot();
  });
});

describe("hid_usage_page_get_ids", () => {
  // Just the page IDs / sizes — the full usage lists are huge and already
  // covered by the snapshots above. This is here so a future refactor that
  // accidentally drops a page (e.g. consumer 0x0c) trips a loud test.
  it("returns the expected pages with stable usage counts", () => {
    const pages = UsagePages.map((p) => ({
      id: p.Id,
      usageCount: hid_usage_page_get_ids(p.Id)?.UsageIds.length ?? 0,
    }));
    expect(pages).toMatchSnapshot();
  });
});

describe("host layout overlays", () => {
  it("US ANSI overlay is the identity (matches the no-layout snapshot)", () => {
    // Belt-and-suspenders: us-ansi has an empty override map, so every
    // call should be byte-identical to the layout-less default. If anyone
    // ever puts an override in us-ansi.ts this will trip.
    for (const { page, usage } of allPairs) {
      expect(hid_usage_get_metadata(page, usage, US_ANSI_LAYOUT)).toEqual(
        hid_usage_get_metadata(page, usage)
      );
    }
  });

  // Each non-identity layout: only HIDs the overlay touches should differ
  // from the base SSOT. Catches the overlay leaking through for keys it
  // wasn't supposed to relabel.
  describe.each(
    LAYOUTS.filter((l) => l.overrides.size > 0).map((l) => [l.id, l])
  )("%s overlay isolation", (_id, layout) => {
    it("only changes HIDs it explicitly overrides", () => {
      for (const { page, usage } of allPairs) {
        const code = (page << 16) | usage;
        if (layout.overrides.has(code)) continue;
        const base = hid_usage_get_metadata(page, usage);
        const overlayed = hid_usage_get_metadata(page, usage, layout);
        expect(overlayed, `${layout.id} HID ${page}:${usage}`).toEqual(base);
      }
    });
  });

  // Per-layout label snapshot: just the HIDs each layout actually
  // overrides. Adding/removing entries via `python scripts/import-layouts.py`
  // or hand edit will trip the corresponding snapshot, making the diff
  // obvious in code review.
  describe.each(
    LAYOUTS.filter((l) => l.overrides.size > 0).map((l) => [l.id, l])
  )("%s overlay label snapshot", (_id, layout) => {
    it("captures the overlay label mapping", () => {
      const overridden = [...layout.overrides.keys()].sort((a, b) => a - b);
      const snapshot = overridden.map((code) => {
        const page = (code >> 16) & 0xffff;
        const usage = code & 0xffff;
        return {
          page,
          usage,
          base: hid_usage_get_metadata(page, usage),
          [layout.id]: hid_usage_get_metadata(page, usage, layout),
          label: hid_usage_get_label(page, usage, layout),
        };
      });
      expect(snapshot).toMatchSnapshot();
    });
  });

  it("LAYOUTS exposes us-ansi first as the default", () => {
    expect(LAYOUTS[0]).toBe(US_ANSI_LAYOUT);
    expect(LAYOUTS.find((l) => l.id === "jis")).toBe(JIS_LAYOUT);
  });

  it("every registered layout has a unique stable ID", () => {
    const ids = LAYOUTS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
