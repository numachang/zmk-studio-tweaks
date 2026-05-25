import { describe, expect, it } from "vitest";

import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYCODES } from "./keycodes";
import {
  hid_usage_get_label,
  hid_usage_get_metadata,
  hid_usage_page_get_ids,
} from "./hid-usages";

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
