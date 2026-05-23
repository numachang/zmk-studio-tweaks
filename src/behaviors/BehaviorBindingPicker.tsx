import { useEffect, useMemo, useState } from "react";

import {
  GetBehaviorDetailsResponse,
  BehaviorBindingParametersSet,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { BehaviorParametersPicker } from "./BehaviorParametersPicker";
import { validateValue } from "./parameters";

export interface BehaviorBindingPickerProps {
  binding: BehaviorBinding;
  behaviors: GetBehaviorDetailsResponse[];
  layers: { id: number; name: string }[];
  onBindingChanged: (binding: BehaviorBinding) => void;
}

// ZMK upstream-shipped behaviors, ordered by how often a typical keymap author
// reaches for them within each group. The first entry of each group is the
// "anchor" behavior (Key Press for typing, Momentary Layer for layers, etc.);
// placeholders (Transparent / None) sit at the end.
const STANDARD_BEHAVIORS: ReadonlyArray<readonly [name: string, group: string]> = [
  // Basic
  ["Key Press", "Basic"],
  ["Sticky Key", "Basic"],
  ["Caps Word", "Basic"],
  ["Key Repeat", "Basic"],
  ["Key Toggle", "Basic"],
  ["Grave/Escape", "Basic"],
  ["Transparent", "Basic"],
  ["None", "Basic"],
  // Layer
  ["Momentary Layer", "Layer"],
  ["Layer-Tap", "Layer"],
  ["To Layer", "Layer"],
  ["Toggle Layer", "Layer"],
  ["Sticky Layer", "Layer"],
  // Hold-Tap
  ["Mod-Tap", "Hold-Tap"],
  // Mouse
  ["Mouse Key Press", "Mouse"],
  ["Mouse Move", "Mouse"],
  ["Mouse Scroll", "Mouse"],
  ["mouse_move", "Mouse"],
  ["mouse_scroll", "Mouse"],
  // System
  ["Bluetooth", "System"],
  ["Output Selection", "System"],
  ["External Power", "System"],
  ["Reset", "System"],
  ["Bootloader", "System"],
  ["Studio Unlock", "System"],
];

const STANDARD_BEHAVIOR_GROUPS: Record<string, string> = Object.fromEntries(
  STANDARD_BEHAVIORS.map(([name, group]) => [name, group])
);
const STANDARD_BEHAVIOR_ORDER: Record<string, number> = Object.fromEntries(
  STANDARD_BEHAVIORS.map(([name], i) => [name, i])
);

const GROUP_ORDER = ["Basic", "Layer", "Hold-Tap", "Mouse", "System", "Other"];

interface BehaviorClass {
  tier: "standard" | "extension";
  group: string;
}

function classifyBehavior(b: GetBehaviorDetailsResponse): BehaviorClass {
  const standard = STANDARD_BEHAVIOR_GROUPS[b.displayName];
  if (standard) return { tier: "standard", group: standard };

  // Firmware-extension (keymap-author-defined) behaviors: classify by shape.
  if (b.displayName.toLowerCase().includes("mouse")) {
    return { tier: "extension", group: "Mouse" };
  }
  const set = b.metadata?.[0];
  if (set?.param2?.some((v) => v.hidUsage)) {
    return { tier: "extension", group: "Hold-Tap" };
  }
  return { tier: "extension", group: "Other" };
}

function validateBinding(
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[],
  param1?: number,
  param2?: number
): boolean {
  if (
    (param1 === undefined || param1 === 0) &&
    metadata.every((s) => !s.param1 || s.param1.length === 0)
  ) {
    return true;
  }

  let matchingSet = metadata.find((s) =>
    validateValue(layerIds, param1, s.param1)
  );

  if (!matchingSet) {
    return false;
  }

  return validateValue(layerIds, param2, matchingSet.param2);
}

export const BehaviorBindingPicker = ({
  binding,
  layers,
  behaviors,
  onBindingChanged,
}: BehaviorBindingPickerProps) => {
  const [behaviorId, setBehaviorId] = useState(binding.behaviorId);
  const [param1, setParam1] = useState<number | undefined>(binding.param1);
  const [param2, setParam2] = useState<number | undefined>(binding.param2);

  const metadata = useMemo(
    () => behaviors.find((b) => b.id == behaviorId)?.metadata,
    [behaviorId, behaviors]
  );

  const sortedBehaviors = useMemo(
    () =>
      behaviors.slice().sort((a, b) => {
        const ai = STANDARD_BEHAVIOR_ORDER[a.displayName];
        const bi = STANDARD_BEHAVIOR_ORDER[b.displayName];
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1;
        if (bi !== undefined) return 1;
        return a.displayName.localeCompare(b.displayName);
      }),
    [behaviors]
  );

  const tieredBehaviors = useMemo(() => {
    const out: Record<
      "standard" | "extension",
      Record<string, GetBehaviorDetailsResponse[]>
    > = { standard: {}, extension: {} };
    for (const b of sortedBehaviors) {
      const { tier, group } = classifyBehavior(b);
      if (!out[tier][group]) out[tier][group] = [];
      out[tier][group].push(b);
    }
    return out;
  }, [sortedBehaviors]);

  const tiers: { key: "standard" | "extension"; title: string }[] = [
    { key: "standard", title: "ZMK Standard" },
    { key: "extension", title: "Firmware Extension" },
  ];

  const currentBehavior = behaviors.find((b) => b.id === behaviorId);
  const currentClass = currentBehavior
    ? classifyBehavior(currentBehavior)
    : null;

  const [activeTier, setActiveTier] = useState<"standard" | "extension">(
    currentClass?.tier ?? "standard"
  );
  const [activeGroup, setActiveGroup] = useState<string>(
    currentClass?.group ?? "Basic"
  );

  // When the bound behavior changes (e.g. user clicked a different key on the
  // keyboard image), jump the picker tabs to the matching tier/group.
  useEffect(() => {
    if (!currentClass) return;
    setActiveTier(currentClass.tier);
    setActiveGroup(currentClass.group);
  }, [behaviorId]);

  const availableTiers = tiers.filter((t) =>
    Object.values(tieredBehaviors[t.key]).some((arr) => arr.length > 0)
  );
  const availableGroupsForActiveTier = GROUP_ORDER.filter(
    (g) => tieredBehaviors[activeTier][g]?.length
  );
  const effectiveGroup = availableGroupsForActiveTier.includes(activeGroup)
    ? activeGroup
    : availableGroupsForActiveTier[0];

  const renderBehaviorChip = (b: GetBehaviorDetailsResponse) => {
    const selected = b.id === behaviorId;
    return (
      <button
        key={b.id}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => {
          if (b.id !== behaviorId) {
            setBehaviorId(b.id);
            setParam1(0);
            setParam2(0);
          }
        }}
        className={`px-3 py-1 rounded border text-sm ${
          selected
            ? "bg-primary text-primary-content border-primary"
            : "bg-base-200 hover:bg-base-300 border-base-300"
        }`}
      >
        {b.displayName}
      </button>
    );
  };

  useEffect(() => {
    if (
      binding.behaviorId === behaviorId &&
      binding.param1 === param1 &&
      binding.param2 === param2
    ) {
      return;
    }

    if (!metadata) {
      console.error(
        "Can't find metadata for the selected behaviorId",
        behaviorId
      );
      return;
    }

    if (
      validateBinding(
        metadata,
        layers.map(({ id }) => id),
        param1,
        param2
      )
    ) {
      onBindingChanged({
        behaviorId,
        param1: param1 || 0,
        param2: param2 || 0,
      });
    }
  }, [behaviorId, param1, param2]);

  useEffect(() => {
    setBehaviorId(binding.behaviorId);
    setParam1(binding.param1);
    setParam2(binding.param2);
  }, [binding]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-sm uppercase tracking-widest font-bold text-primary">
          Behavior
        </label>
        <div className="flex flex-col gap-1">
          <div role="tablist" aria-label="Behavior tier" className="flex border-b">
              {availableTiers.map((tier) => {
                const isActive = activeTier === tier.key;
                return (
                  <button
                    key={tier.key}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveTier(tier.key);
                      // Reset to the leftmost category of the new tier so the
                      // previous tier's context (e.g. Hold-Tap selected in
                      // Firmware Ext) doesn't carry over and look pre-selected.
                      const firstGroup = GROUP_ORDER.find(
                        (g) => tieredBehaviors[tier.key][g]?.length
                      );
                      if (firstGroup) {
                        setActiveGroup(firstGroup);
                      }
                    }}
                    className={`px-4 py-1 text-base ${
                      isActive
                        ? "border-b-2 border-primary text-primary font-semibold"
                        : "text-base-content/80 hover:text-base-content"
                    }`}
                  >
                    {tier.title}
                  </button>
                );
              })}
            </div>
            <div
              role="tablist"
              aria-label="Behavior category"
              className="flex flex-wrap gap-1"
            >
              {availableGroupsForActiveTier.map((g) => {
                const isActive = effectiveGroup === g;
                return (
                  <button
                    key={g}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActiveGroup(g)}
                    className={`px-3 py-1 text-sm ${
                      isActive
                        ? "border-b-2 border-primary text-primary font-medium"
                        : "text-base-content/70 hover:text-base-content border-b-2 border-transparent"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <div
              role="radiogroup"
              aria-label="Behavior"
              className="flex flex-wrap gap-1 pt-1"
            >
              {(tieredBehaviors[activeTier][effectiveGroup] || []).map(
                renderBehaviorChip
              )}
            </div>
        </div>
      </div>
      {metadata && (
        <BehaviorParametersPicker
          metadata={metadata}
          param1={param1}
          param2={param2}
          layers={layers}
          onParam1Changed={setParam1}
          onParam2Changed={setParam2}
        />
      )}
    </div>
  );
};
