// import { UsagePages } from "./HidUsageTables-1.5.json";
// Filtered with `cat src/HidUsageTables-1.5.json | jq '{ UsagePages: [.UsagePages[] | select([.Id] |inside([7, 12]))] }' > src/keyboard-and-consumer-usage-tables.json`
import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYCODE_BY_HID } from "./keycodes";

export interface UsageId {
  Id: number;
  Name: string;
}

export interface UsagePageInfo {
  Name: string;
  UsageIds: UsageId[];
}

export const hid_usage_from_page_and_id = (page: number, id: number) =>
  (page << 16) + id;

export const hid_usage_page_and_id_from_usage = (
  usage: number
): [number, number] => [(usage >> 16) & 0xffff, usage & 0xffff];

export const hid_usage_page_get_ids = (
  usage_page: number
): UsagePageInfo | undefined => UsagePages.find((p) => p.Id === usage_page);

export const hid_usage_get_label = (
  usage_page: number,
  usage_id: number
): string | undefined =>
  KEYCODE_BY_HID.get((usage_page << 16) | usage_id)?.short ||
  UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
    (u) => u.Id === usage_id
  )?.Name;

export const hid_usage_get_metadata = (
  usage_page: number,
  usage_id: number
): { short?: string; med?: string; long?: string; category?: string } => {
  // Single source of truth for editorial labels: src/keycodes.ts. When the
  // entry provides a `short` we hand back the curated triplet as-is (note
  // that `med` / `long` may legitimately be undefined — the picker
  // gracefully falls back). When it doesn't (no curated label, or no
  // entry at all), derive the labels from the HID spec table just like
  // upstream PR #159 did.
  const entry = KEYCODE_BY_HID.get((usage_page << 16) | usage_id);
  if (entry?.short) {
    // Spread skips undefined-valued keys, so callers see the same
    // "sparse" shape the JSON-driven implementation used to return.
    const out: { short?: string; med?: string; long?: string; category?: string } = {
      short: entry.short,
    };
    if (entry.med !== undefined) out.med = entry.med;
    if (entry.long !== undefined) out.long = entry.long;
    if (entry.category !== undefined) out.category = entry.category;
    return out;
  }
  const fullName = UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
    (u) => u.Id === usage_id
  )?.Name;
  return {
    short: fullName?.replace(/^Keyboard /, ""),
    med: fullName?.replace(/^Keyboard /, ""),
    long: fullName,
    category: entry?.category || "Other",
  };
};
