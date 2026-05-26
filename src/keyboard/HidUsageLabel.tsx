import {
  hid_usage_get_metadata,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";
import { useHostLayout } from "../layouts/LayoutContext";

export interface HidUsageLabelProps {
  hid_usage: number;
  /**
   * When true, render "1 !" as a single token instead of stacking the
   * shifted variant on top. Used by hold-tap previews where the badge and
   * hold label already eat most of the vertical budget.
   */
  compact?: boolean;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

// 1U keys are ~48px wide. text-base (~16px) bold fits about 4 glyphs before
// the label overflows and the parent's `truncate` clips it. Shrink relative
// to the parent so longer labels still fit without ellipsis.
function shrink_class_for(len: number): string {
  if (len <= 4) return "";
  if (len === 5) return "text-[0.82em]";
  if (len === 6) return "text-[0.7em]";
  if (len === 7) return "text-[0.6em]";
  return "text-[0.5em]";
}

export const HidUsageLabel = ({ hid_usage, compact }: HidUsageLabelProps) => {
  const layout = useHostLayout();
  let [pageWithMods, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // The encoded value packs implicit-modifier bits into the high byte of
  // the page word: bit 1 / bit 5 = L Shift / R Shift, etc.
  const mods = (pageWithMods >> 8) & 0xff;
  const page = pageWithMods & 0xff;
  const shiftActive = (mods & (0x02 | 0x20)) !== 0;

  let labels = hid_usage_get_metadata(page, id, layout);

  // Short labels like "1 !" / "- _" / "[ {" are unshifted+shifted pairs.
  // When an implicit Shift is applied the binding always types the shifted
  // glyph, so show just that. Otherwise render them stacked like a
  // physical keycap — unless compact is requested.
  const short = labels.short || "";
  const pair = short.match(/^(\S{1,2}) (\S{1,2})$/);
  if (pair && shiftActive) {
    return <span>{pair[2]}</span>;
  }
  if (pair && !compact) {
    return (
      <span className="inline-flex flex-col items-center leading-none gap-px">
        <span className="text-[0.7em] opacity-70">{pair[2]}</span>
        <span>{pair[1]}</span>
      </span>
    );
  }

  const shrink = shrink_class_for((labels.short || "").length);
  return (
    <span
      className={`${shrink} @[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]`}
      aria-label={labels.short}
      data-med-content={labels.med || labels.short}
      data-long-content={remove_prefix(
        labels.long || labels.med || labels.short
      )}
    />
  );
};
