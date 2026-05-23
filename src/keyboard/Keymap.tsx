import {
  PhysicalLayout,
  Keymap as KeymapMsg,
  Layer,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import type {
  BehaviorParameterValueDescription,
  GetBehaviorDetailsResponse,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";

import {
  LayoutZoom,
  PhysicalLayout as PhysicalLayoutComp,
} from "./PhysicalLayout";
import { HidUsageLabel } from "./HidUsageLabel";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

type ParamRender = {
  node: JSX.Element;
  // Drives the displayed font size — HID labels are short, layer names tend
  // to be longer so they need a smaller default.
  kind: "hid" | "layer" | "constant" | "raw";
};

function renderBindingParam(
  value: number,
  spec: BehaviorParameterValueDescription[],
  layers: Layer[],
  options?: { compact?: boolean }
): ParamRender | null {
  if (!spec || spec.length === 0) {
    return null;
  }
  if (spec.some((s) => s.hidUsage)) {
    return {
      node: <HidUsageLabel hid_usage={value} compact={options?.compact} />,
      kind: "hid",
    };
  }
  if (spec.some((s) => s.layerId)) {
    const idx = layers.findIndex((l) => l.id === value);
    const layer = idx >= 0 ? layers[idx] : undefined;
    return {
      node: (
        <span>{layer?.name || (idx >= 0 ? idx.toString() : `L${value}`)}</span>
      ),
      kind: "layer",
    };
  }
  const constMatch = spec.find((s) => s.constant === value);
  if (constMatch?.name) {
    return { node: <span>{constMatch.name}</span>, kind: "constant" };
  }
  return { node: <span>{value}</span>, kind: "raw" };
}

function sizeClassFor(kind: ParamRender["kind"]): string {
  // Tailwind needs full class strings in source for purge to keep them.
  if (kind === "hid") return "text-base";
  if (kind === "layer") return "text-xs";
  return "text-sm"; // constant / raw
}

export interface KeymapProps {
  layout: PhysicalLayout;
  keymap: KeymapMsg;
  behaviors: BehaviorMap;
  scale: LayoutZoom;
  selectedLayerIndex: number;
  selectedKeyPosition: number | undefined;
  onKeyPositionClicked: (keyPosition: number) => void;
}

export const Keymap = ({
  layout,
  keymap,
  behaviors,
  scale,
  selectedLayerIndex,
  selectedKeyPosition,
  onKeyPositionClicked,
}: KeymapProps) => {
  if (!keymap.layers[selectedLayerIndex]) {
    return <></>;
  }

  const positions = layout.keys.map((k, i) => {
    if (i >= keymap.layers[selectedLayerIndex].bindings.length) {
      return {
        id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
        header: "Unknown",
        x: k.x / 100.0,
        y: k.y / 100.0,
        width: k.width / 100,
        height: k.height / 100.0,
        children: <span></span>,
      };
    }

    const binding = keymap.layers[selectedLayerIndex].bindings[i];
    const behavior = behaviors[binding.behaviorId];
    const set = behavior?.metadata?.[0];
    const isHoldTap = !!set?.param1?.length && !!set?.param2?.length;
    const p1 = set?.param1?.length
      ? renderBindingParam(binding.param1, set.param1, keymap.layers, {
          compact: isHoldTap,
        })
      : null;
    const p2 = set?.param2?.length
      ? renderBindingParam(binding.param2, set.param2, keymap.layers, {
          compact: isHoldTap,
        })
      : null;

    return {
      id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
      header: behavior?.displayName || "Unknown",
      x: k.x / 100.0,
      y: k.y / 100.0,
      width: k.width / 100,
      height: k.height / 100.0,
      r: (k.r || 0) / 100.0,
      rx: (k.rx || 0) / 100.0,
      ry: (k.ry || 0) / 100.0,
      children: (
        <div className="@container flex flex-col items-center justify-center leading-tight w-full gap-px">
          {p1 && p2 ? (
            // Hold-tap style: hold above (faded, always small), tap below
            // (bold, sized per type) — the tap fires on a normal press so
            // it gets the prominent slot.
            <>
              <div className="text-xs truncate max-w-full opacity-60">
                {p1.node}
              </div>
              <div
                className={`${sizeClassFor(p2.kind)} truncate max-w-full font-bold`}
              >
                {p2.node}
              </div>
            </>
          ) : (
            p1 && (
              <div
                className={`${sizeClassFor(p1.kind)} truncate max-w-full font-medium`}
              >
                {p1.node}
              </div>
            )
          )}
        </div>
      ),
    };
  });

  return (
    <PhysicalLayoutComp
      positions={positions}
      oneU={48}
      hoverZoom={true}
      zoom={scale}
      selectedPosition={selectedKeyPosition}
      onPositionClicked={onKeyPositionClicked}
    />
  );
};
