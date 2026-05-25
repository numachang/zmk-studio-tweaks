import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { hid_usage_page_get_ids, hid_usage_get_metadata } from "../hid-usages";
import { useHostLayout, useKeyboardShape } from "../layouts/LayoutContext";
import { type BasicCell, shapeHidIds } from "../layouts/physical";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

// Standard numeric keypad layout. + and KP Enter are normally 1U×2U and 0
// is 2U×1U on a real numpad; we keep heights uniform and only widen 0 to
// 2U so the bottom row still looks like a numpad.
const NUMPAD_LAYOUT: BasicCell[][] = [
  [{ id: 83 }, { id: 84 }, { id: 85 }, { id: 86 }],
  [{ id: 95 }, { id: 96 }, { id: 97 }, { id: 87 }],
  [{ id: 92 }, { id: 93 }, { id: 94 }, { id: 88 }],
  [{ id: 89 }, { id: 90 }, { id: 91 }],
  [{ id: 98, w: 2 }, { id: 99 }],
];

// Function row laid out in 3 stacks so the tab isn't a single super-wide
// row. Esc sits at top-left where it lives on a real keyboard.
const FUNCTION_LAYOUT: (BasicCell | null)[][] = [
  [{ id: 41 }, { id: 58 }, { id: 59 }, { id: 60 }, { id: 61 }], // Esc F1 F2 F3 F4
  [null,       { id: 62 }, { id: 63 }, { id: 64 }, { id: 65 }], // F5-F8
  [null,       { id: 66 }, { id: 67 }, { id: 68 }, { id: 69 }], // F9-F12
];

// TKL navigation cluster: PrSc/ScLk/Pause, the 2x3 edit block, then the
// inverted-T arrow cluster. `null` cells render as transparent spacers so
// the up arrow centers above left/down/right.
const NAVIGATION_LAYOUT: (BasicCell | null)[][] = [
  [{ id: 70 }, { id: 71 }, { id: 72 }],       // PrSc ScLk Pause
  [{ id: 73 }, { id: 74 }, { id: 75 }],       // Ins Home PgUp
  [{ id: 76 }, { id: 77 }, { id: 78 }],       // Del End  PgDn
  [null,        { id: 82 }, null      ],       //     ↑
  [{ id: 80 }, { id: 81 }, { id: 79 }],       // ←   ↓    →
];

export interface HidUsagePage {
  id: number;
  min?: number;
  max?: number;
}

export interface HidUsagePickerProps {
  label?: string;
  value?: number;
  usagePages: HidUsagePage[];
  onValueChanged: (value?: number) => void;
  /**
   * When true the picker stays visible but is fully non-interactive and
   * dimmed. Used as a stable placeholder when the current behavior takes no
   * parameters, so switching to/from `&kp` doesn't cause a layout jump.
   */
  disabled?: boolean;
}

enum Mods {
  LeftControl = 0x01,
  LeftShift = 0x02,
  LeftAlt = 0x04,
  LeftGUI = 0x08,
  RightControl = 0x10,
  RightShift = 0x20,
  RightAlt = 0x40,
  RightGUI = 0x80,
}

const mod_labels: Record<Mods, string> = {
  [Mods.LeftControl]: "L Ctrl",
  [Mods.LeftShift]: "L Shift",
  [Mods.LeftAlt]: "L Alt",
  [Mods.LeftGUI]: "L GUI",
  [Mods.RightControl]: "R Ctrl",
  [Mods.RightShift]: "R Shift",
  [Mods.RightAlt]: "R Alt",
  [Mods.RightGUI]: "R GUI",
};

const all_mods = [
  Mods.LeftControl,
  Mods.LeftShift,
  Mods.LeftAlt,
  Mods.LeftGUI,
  Mods.RightControl,
  Mods.RightShift,
  Mods.RightAlt,
  Mods.RightGUI,
];

function mods_to_flags(mods: Mods[]): number {
  return mods.reduce((a, v) => a + v, 0);
}

function mask_mods(value: number) {
  return value & ~(mods_to_flags(all_mods) << 24);
}

const HidUsageGrid = ({
  value,
  onValueChanged,
  usagePages,
}: HidUsagePickerProps) => {
  const layout = useHostLayout();
  const shape = useKeyboardShape();
  const basicLayoutHidIds = useMemo(() => shapeHidIds(shape), [shape]);
  type Usage = {
    Name: string;
    Id: number;
    pageName: string;
    pageId: number;
  };
  const allUsages = useMemo(() => {
    return usagePages.flatMap((page) => {
      const pageInfo = hid_usage_page_get_ids(page.id);
      if (!pageInfo) {
        return [];
      }

      let usages = pageInfo.UsageIds || [];
      if (page.max || page.min) {
        usages = usages.filter(
          (i) =>
            (i.Id <= (page.max || Number.MAX_SAFE_INTEGER) &&
              i.Id >= (page.min || 0)) ||
            (page.id === 7 && i.Id >= 0xe0 && i.Id <= 0xe7),
        );
      }

      return usages.map((usage) => ({
        ...usage,
        pageId: page.id,
        pageName: pageInfo.Name,
      }));
    });
  }, [usagePages]);

  const selectedKey = value !== undefined ? mask_mods(value) : null;

  const getButtonLabel = (usage: Usage, opts?: { preferShort?: boolean }) => {
    const metadata = hid_usage_get_metadata(usage.pageId, usage.Id, layout);
    if (opts?.preferShort && metadata?.short) {
      return metadata.short;
    }
    if (metadata?.med) {
      return metadata.med;
    }
    if (metadata?.short) {
      return metadata.short;
    }

    if (usage.pageName === "Keyboard/Keypad") {
      const match = usage.Name.match(/^(Keyboard|Keypad) (\S+)/);
      if (match && match[2]) {
        return match[2];
      }
    }
    return usage.Name;
  };

  const categorizedUsages = useMemo(() => {
    const categories: Record<string, Usage[]> = {};

    for (const usage of allUsages) {
      const metadata = hid_usage_get_metadata(usage.pageId, usage.Id, layout);
      let category = metadata?.category || "Other";
      // Collapse the typing keys (alphabet + number row + adjacent
      // punctuation) into a single Basic tab. Two separate tabs for
      // "Letters" vs "Numbers" forces an extra click for the most common
      // edits.
      if (category === "Letters" || category === "Numbers + Punctuation") {
        category = "Basic";
      }
      // The old "Function + Navigation" metadata category covers the TKL
      // function row + navigation cluster + arrows. We keep them in one
      // tab — they share screen real estate cleanly without scrolling.
      if (category === "Function + Navigation") {
        category = "Function + Nav";
      }
      // Anything explicitly placed on the Basic layout (modifiers, Tab,
      // Caps, Ret, BkSp, Space, Menu, ...) lives in the Basic tab alone —
      // otherwise it'd appear in Navigation too and the auto-jump would
      // prefer that stale duplicate.
      if (usage.pageId === 7 && basicLayoutHidIds.has(usage.Id)) {
        category = "Basic";
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(usage);
    }

    return categories;
  }, [allUsages, layout, basicLayoutHidIds]);

  const basicRows = useMemo(() => {
    // Pull from allUsages so the edge keys (Tab/BkSp/Ret/modifiers/...)
    // appear here regardless of which category their metadata assigns them.
    const byHidId = new Map<number, Usage>();
    for (const u of allUsages) {
      if (u.pageId === 7) {
        byHidId.set(u.Id, u);
      }
    }
    const placed = new Set<Usage>();
    const rows = shape.rows.map((row: BasicCell[]) => {
      const out: { usage: Usage; w?: number }[] = [];
      for (const cell of row) {
        const u = byHidId.get(cell.id);
        if (u) {
          out.push({ usage: u, w: cell.w });
          placed.add(u);
        }
      }
      return out;
    });
    const extras = (categorizedUsages["Basic"] || []).filter(
      (u) => !placed.has(u)
    );
    if (extras.length) {
      rows.push(extras.map((u) => ({ usage: u })));
    }
    return rows;
  }, [allUsages, categorizedUsages, shape]);

  const UNIT_PX = 48;
  // HID IDs whose "short" label (e.g. "Shft", "Ctrl") loses the L/R
  // distinction. Use the metadata "med" label instead so the keycap reads
  // as "L Shft" / "R Shft" / "CapsLk" etc.
  const BASIC_PREFER_MED = new Set([
    57,                               // Caps Lock
    224, 225, 226, 227,               // Left  mods (Ctrl/Shft/Alt/GUI)
    228, 229, 230, 231,               // Right mods (Ctrl/Shft/Alt/GUI)
  ]);

  const numpadRows = useMemo(() => {
    const byHidId = new Map<number, Usage>();
    for (const u of allUsages) {
      if (u.pageId === 7) {
        byHidId.set(u.Id, u);
      }
    }
    const placed = new Set<Usage>();
    const rows = NUMPAD_LAYOUT.map((row) => {
      const out: { usage: Usage; w?: number }[] = [];
      for (const cell of row) {
        const u = byHidId.get(cell.id);
        if (u) {
          out.push({ usage: u, w: cell.w });
          placed.add(u);
        }
      }
      return out;
    });
    const extras = (categorizedUsages["Numpad"] || []).filter(
      (u) => !placed.has(u)
    );
    if (extras.length) {
      rows.push(extras.map((u) => ({ usage: u })));
    }
    return rows;
  }, [allUsages, categorizedUsages]);

  // For the merged Function tab we render two layouts side-by-side. The
  // layouts together cover every Function-category HID we care about, so
  // we don't bother surfacing leftovers.
  const { functionRows, navigationRows } = useMemo(() => {
    const byHidId = new Map<number, Usage>();
    for (const u of allUsages) {
      if (u.pageId === 7) {
        byHidId.set(u.Id, u);
      }
    }
    const renderRow = (row: (BasicCell | null)[]) => {
      const out: ({ usage: Usage; w?: number } | null)[] = [];
      for (const cell of row) {
        if (cell === null) {
          out.push(null);
          continue;
        }
        const u = byHidId.get(cell.id);
        if (u) {
          out.push({ usage: u, w: cell.w });
        }
      }
      return out;
    };
    return {
      functionRows: FUNCTION_LAYOUT.map(renderRow),
      navigationRows: NAVIGATION_LAYOUT.map(renderRow),
    };
  }, [allUsages]);
  const renderBasicButton = ({ usage, w }: { usage: Usage; w?: number }) => {
    const usageValue = (usage.pageId << 16) | usage.Id;
    const preferShort =
      !(usage.pageId === 7 && BASIC_PREFER_MED.has(usage.Id));
    const label = getButtonLabel(usage, { preferShort });
    const pair = label.match(/^(\S{1,2}) (\S{1,2})$/);
    const width = (w ?? 1) * UNIT_PX + ((w ?? 1) - 1) * 4; // include the gap absorbed
    return (
      <Button
        key={usageValue}
        onPress={() => onValueChanged(usageValue)}
        style={{ width: `${width}px` }}
        className={`h-12 p-0.5 rounded border text-center flex items-center justify-center text-sm leading-none shrink-0 ${selectedKey === usageValue ? "bg-primary text-primary-content" : "bg-base-200 hover:bg-base-300"}`}
      >
        {pair ? (
          <span className="flex flex-col items-center gap-px">
            <span className="text-[0.65em] opacity-70">{pair[2]}</span>
            <span>{pair[1]}</span>
          </span>
        ) : (
          label
        )}
      </Button>
    );
  };

  const sortedCategories = useMemo(() => {
    const categoryOrder = [
      "Basic",
      "Function + Nav",
      "Numpad",
      "Apps/Media/Special",
      "International",
      "Other",
    ];
    return Object.keys(categorizedUsages).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [categorizedUsages]);

  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim().toLowerCase();

  // Auto-select the tab containing the current value when it changes. When
  // the value resets (no selection / 0 from a behavior swap), fall back to
  // the first tab instead of leaving the user on the previous behavior's
  // stale category.
  const [activeTab, setActiveTab] = useState<string | null>(null);
  useEffect(() => {
    if (value === undefined || value === 0) {
      setActiveTab(null);
      return;
    }
    const masked = mask_mods(value);
    for (const cat of sortedCategories) {
      const hit = categorizedUsages[cat]?.some(
        (u) => ((u.pageId << 16) | u.Id) === masked
      );
      if (hit) {
        setActiveTab(cat);
        return;
      }
    }
  }, [value, categorizedUsages, sortedCategories]);

  const searchResults = useMemo(() => {
    if (!trimmedSearch) {
      return null;
    }
    return allUsages.filter((usage) => {
      const metadata = hid_usage_get_metadata(usage.pageId, usage.Id, layout);
      const haystack = [
        usage.Name,
        metadata?.short,
        metadata?.med,
        metadata?.long,
        metadata?.category,
      ]
        .filter((s): s is string => Boolean(s))
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmedSearch);
    });
  }, [allUsages, trimmedSearch, layout]);

  const renderUsageButton = (usage: Usage) => {
    const usageValue = (usage.pageId << 16) | usage.Id;
    return (
      <Button
        key={usageValue}
        onPress={() => onValueChanged(usageValue)}
        className={`w-16 h-16 p-1 rounded border text-center flex items-center justify-center ${selectedKey === usageValue ? "bg-primary text-primary-content" : "bg-base-200 hover:bg-base-300"}`}
      >
        {getButtonLabel(usage)}
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="h-8 flex flex-row items-center gap-2">
        <Label className="text-sm uppercase tracking-widest font-bold text-primary shrink-0">
          Key
        </Label>
        <div className="ml-auto relative w-64 max-w-full">
          <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-base-content/50 pointer-events-none" />
          <input
            type="search"
            aria-label="Filter keys"
            placeholder="Filter keys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1 rounded border border-base-300 bg-base-100 focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>
      {searchResults !== null ? (
        <div
          aria-label="Search results"
          className="min-h-56 max-h-56 overflow-y-auto flex flex-wrap justify-start content-start gap-1 p-1 border rounded"
        >
          {searchResults.length === 0 ? (
            <div className="p-2 text-base-content/60">No keys match "{search}".</div>
          ) : (
            searchResults.map(renderUsageButton)
          )}
        </div>
      ) : (
    <Tabs
      className="flex flex-col"
      selectedKey={activeTab ?? sortedCategories[0]}
      onSelectionChange={(k) => setActiveTab(k as string)}
    >
      <TabList className="flex border-b">
        {sortedCategories.map((category) => (
          <Tab
            key={category}
            id={category}
            className="px-4 pb-2 cursor-default outline-none rac-selected:border-b-2 rac-selected:border-primary rac-focus-visible:ring-2 rac-focus-visible:ring-primary rounded-t-md"
          >
            {category}
          </Tab>
        ))}
      </TabList>
      {sortedCategories.map((category) => (
        <TabPanel
          key={category}
          id={category}
          className={
            // Unified height across all tabs so switching tabs doesn't
            // shift the rest of the picker. Sized to fit the tallest case
            // (Basic = ANSI 60% layout).
            category === "Basic" ||
            category === "Numpad" ||
            category === "Function + Nav"
              ? "min-h-[17rem] max-h-[17rem] overflow-auto p-1 border border-t-0 rounded-b rac-focus-visible:ring-2 rac-focus-visible:ring-primary"
              : "min-h-[17rem] max-h-[17rem] overflow-y-auto flex flex-wrap justify-start content-start gap-1 p-1 border border-t-0 rounded-b rac-focus-visible:ring-2 rac-focus-visible:ring-primary"
          }
        >
          {category === "Basic" ? (
            <div className="flex flex-col gap-1 w-fit">
              {basicRows.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map(renderBasicButton)}
                </div>
              ))}
            </div>
          ) : category === "Numpad" ? (
            <div className="flex flex-col gap-1 w-fit">
              {numpadRows.map((row, i) => (
                <div key={i} className="flex gap-1">
                  {row.map(renderBasicButton)}
                </div>
              ))}
            </div>
          ) : category === "Function + Nav" ? (
            <div className="flex flex-row gap-6 w-fit">
              <div className="flex flex-col gap-1">
                {functionRows.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((cell, j) =>
                      cell ? (
                        renderBasicButton(cell)
                      ) : (
                        <div key={`gap-${j}`} className="w-12 h-12 shrink-0" />
                      )
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {navigationRows.map((row, i) => (
                  <div key={i} className="flex gap-1">
                    {row.map((cell, j) =>
                      cell ? (
                        renderBasicButton(cell)
                      ) : (
                        <div key={`gap-${j}`} className="w-12 h-12 shrink-0" />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : category === "Other" ? (
            <ComboBox
              className="w-full p-2"
              defaultItems={categorizedUsages[category]}
              selectedKey={selectedKey}
              onSelectionChange={(key) =>
                key !== null && onValueChanged(key as number)
              }
            >
              <Label className="text-sm">Search for another key</Label>
              <div className="relative flex items-center">
                <Input className="p-1 rounded-l" />
                <Button className="rounded-r bg-primary text-primary-content w-8 h-8 flex justify-center items-center">
                  <ChevronDown className="size-4" />
                </Button>
              </div>
              <Popover className="w-[var(--trigger-width)] max-h-4 shadow-md text-base-content rounded border-base-content bg-base-100">
                <ListBox className="block max-h-[30vh] min-h-[unset] overflow-auto p-2">
                  {(item: Usage) => {
                    const usageValue = (item.pageId << 16) | item.Id;
                    return (
                      <ListBoxItem
                        id={usageValue}
                        textValue={item.Name}
                        className="rac-hover:bg-base-300 pl-3 relative rac-focus:bg-base-300 cursor-default select-none rac-selected:before:content-['✔'] before:absolute before:left-[0] before:top-[0]"
                      >
                        {item.Name}
                      </ListBoxItem>
                    );
                  }}
                </ListBox>
              </Popover>
            </ComboBox>
          ) : (
            categorizedUsages[category].map(renderUsageButton)
          )}
        </TabPanel>
      ))}
    </Tabs>
      )}
    </div>
  );
};

export const HidUsagePicker = ({
  label,
  value,
  usagePages,
  onValueChanged,
  disabled,
}: HidUsagePickerProps) => {
  const mods = useMemo(() => {
    let flags = value ? value >> 24 : 0;

    return all_mods.filter((m) => m & flags).map((m) => m.toLocaleString());
  }, [value]);

  const selectionChanged = useCallback(
    (e: number | undefined) => {
      let value = typeof e == "number" ? e : undefined;
      if (value !== undefined) {
        let mod_flags = mods_to_flags(mods.map((m) => parseInt(m)));
        value = value | (mod_flags << 24);
      }

      onValueChanged(value);
    },
    [onValueChanged, mods],
  );

  const modifiersChanged = useCallback(
    (m: string[]) => {
      if (!value) {
        return;
      }

      let mod_flags = mods_to_flags(m.map((m) => parseInt(m)));
      let new_value = mask_mods(value) | (mod_flags << 24);
      onValueChanged(new_value);
    },
    [value],
  );

  return (
    <div
      className={`flex flex-row gap-3 relative ${
        disabled ? "opacity-40 pointer-events-none select-none" : ""
      }`}
      aria-disabled={disabled || undefined}
    >
      <div className="flex flex-col gap-1 shrink-0">
        <div className="h-8 flex items-center">
          <Label
            id="hid-usage-picker"
            className="text-sm uppercase tracking-widest font-bold text-primary"
          >
            + Modifier
          </Label>
        </div>
        <CheckboxGroup
          aria-label={label ? `Implicit modifiers for ${label}` : "Implicit modifiers"}
          className="flex flex-col gap-px rounded-md"
          value={mods}
          onChange={modifiersChanged}
        >
          {all_mods.map((m) => (
            <Checkbox
              key={m}
              value={m.toLocaleString()}
              className="text-nowrap cursor-pointer flex px-3 py-1 items-center rac-selected:bg-primary border-base-100 bg-base-300 hover:bg-base-100 first:rounded-t-md last:rounded-b-md rac-selected:text-primary-content"
            >
              {mod_labels[m]}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
      <div className="flex-1 min-w-0">
        <HidUsageGrid
          value={value}
          onValueChanged={selectionChanged}
          usagePages={usagePages}
        />
      </div>
    </div>
  );
};
