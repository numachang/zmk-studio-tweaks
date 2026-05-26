// import { UsagePages } from "./HidUsageTables-1.5.json";
// Filtered with `cat src/HidUsageTables-1.5.json | jq '{ UsagePages: [.UsagePages[] | select([.Id] |inside([7, 12]))] }' > src/keyboard-and-consumer-usage-tables.json`
import { UsagePages } from "./keyboard-and-consumer-usage-tables.json";
import { KEYCODE_BY_HID } from "./keycodes";
import type { HostLayout } from "./layouts";

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
  usage_id: number,
  layout?: HostLayout
): string | undefined => {
  const code = (usage_page << 16) | usage_id;
  return (
    layout?.overrides.get(code)?.short ||
    KEYCODE_BY_HID.get(code)?.short ||
    UsagePages.find((p) => p.Id === usage_page)?.UsageIds?.find(
      (u) => u.Id === usage_id
    )?.Name
  );
};

export const hid_usage_get_metadata = (
  usage_page: number,
  usage_id: number,
  layout?: HostLayout
): { short?: string; med?: string; long?: string; category?: string } => {
  // Single source of truth for editorial labels: src/keycodes.ts. When the
  // entry provides a `short` we hand back the curated triplet as-is (note
  // that `med` / `long` may legitimately be undefined — the picker
  // gracefully falls back). When it doesn't (no curated label, or no
  // entry at all), derive the labels from the HID spec table just like
  // upstream PR #159 did.
  //
  // When `layout` is provided, per-HID overrides in `layout.overrides`
  // win over the base SSOT for whichever of short/med/long they define.
  // Category never changes per host layout (it's a picker-tab concern,
  // not a typing one).
  //
  // When an overlay provides `short` but not `med` / `long`, fall back
  // to the overlay's own `short` rather than to the base SSOT's
  // `med` / `long`. Otherwise a French user with overlay `{ short: "- =" }`
  // for the MINUS key would still see the un-localized base
  // `med = "Dash"` at medium widths — the picker would say "- =" but
  // the keymap view would say "Dash" for the same binding, which reads
  // as incoherent. The overlay owns the editorial label or it doesn't.
  const code = (usage_page << 16) | usage_id;
  const entry = KEYCODE_BY_HID.get(code);
  const overlay = layout?.overrides.get(code);
  const baseShort = overlay?.short ?? entry?.short;

  if (baseShort) {
    const out: { short?: string; med?: string; long?: string; category?: string } = {
      short: baseShort,
    };
    if (overlay?.short !== undefined) {
      // Overlay owns this row's labels.
      out.med = overlay.med ?? overlay.short;
      out.long = overlay.long ?? overlay.med ?? overlay.short;
    } else {
      if (entry?.med !== undefined) out.med = entry.med;
      if (entry?.long !== undefined) out.long = entry.long;
    }
    if (entry?.category !== undefined) out.category = entry.category;
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
