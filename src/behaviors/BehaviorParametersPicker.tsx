import { BehaviorBindingParametersSet } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { useEffect, useState } from "react";
import { ParameterValuePicker } from "./ParameterValuePicker";
import { HidUsagePicker } from "./HidUsagePicker";
import { validateValue } from "./parameters";

export interface BehaviorParametersPickerProps {
  param1?: number;
  param2?: number;
  metadata: BehaviorBindingParametersSet[];
  layers: { id: number; name: string }[];
  onParam1Changed: (value?: number) => void;
  onParam2Changed: (value?: number) => void;
}

export const BehaviorParametersPicker = ({
  param1,
  param2,
  metadata,
  layers,
  onParam1Changed,
  onParam2Changed,
}: BehaviorParametersPickerProps) => {
  const [activeParam, setActiveParam] = useState<"p1" | "p2">("p1");

  const param1Values = metadata.flatMap((m) => m.param1);
  // Fall back to the first set when the current param1 doesn't validate
  // (typical when a fresh behavior is picked and param1 hasn't been set
  // yet) so we can still inspect param2's shape and render the right tabs.
  const set =
    metadata.find((s) =>
      validateValue(
        layers.map((l) => l.id),
        param1,
        s.param1
      )
    ) ?? metadata[0];
  const param2Values = set?.param2 ?? [];

  const hasParam1 = param1Values.length > 0;
  const hasParam2 = param2Values.length > 0;

  // Switching from a 2-param behavior (Mod-Tap, ...) to a 1-param one
  // (Key Press, ...) hides the p2 tab. Snap back to p1 so we don't pass a
  // dangling selectedKey to <Tabs>.
  useEffect(() => {
    if (!hasParam2 && activeParam === "p2") {
      setActiveParam("p1");
    }
  }, [hasParam2, activeParam]);

  const param1Name = param1Values[0]?.name || "Param 1";
  const param2Name = param2Values[0]?.name || "Param 2";
  const sameName = hasParam2 && param1Name === param2Name;
  // ZMK hold-tap class behaviors (Mod-Tap, Layer-Tap, custom homerow_mods,
  // ...) share the shape: param1 = whatever you hold, param2 = a HID key
  // that fires on tap. Label them with the user-facing Hold / Tap concept
  // rather than the raw metadata names.
  const isHoldTapLike = hasParam1 && hasParam2 && !!param2Values[0]?.hidUsage;
  const tab1Label = isHoldTapLike
    ? "Hold"
    : sameName
      ? `${param1Name} 1`
      : hasParam1
        ? param1Name
        : "—";
  const tab2Label = isHoldTapLike
    ? "Tap"
    : sameName
      ? `${param2Name} 2`
      : param2Name;

  const tabClass =
    "px-4 py-1 cursor-default outline-none rac-selected:border-b-2 rac-selected:border-primary rac-focus-visible:ring-2 rac-focus-visible:ring-primary rac-disabled:opacity-40 rac-disabled:cursor-not-allowed rounded-t-md";

  return (
    <Tabs
      selectedKey={activeParam}
      onSelectionChange={(k) => setActiveParam(k as "p1" | "p2")}
    >
      <TabList className="flex border-b mb-2" aria-label="Parameters">
        <Tab id="p1" isDisabled={!hasParam1} className={tabClass}>
          {tab1Label}
        </Tab>
        {hasParam2 && (
          <Tab id="p2" className={tabClass}>
            {tab2Label}
          </Tab>
        )}
      </TabList>
      <TabPanel id="p1">
        {hasParam1 ? (
          <ParameterValuePicker
            values={param1Values}
            value={param1}
            layers={layers}
            onValueChanged={onParam1Changed}
          />
        ) : (
          // 0-param behaviors (None, Transparent, Caps Word, ...) get the
          // dimmed HID picker as a placeholder so the panel keeps its size
          // when the user toggles to/from a `&kp`-style behavior.
          <HidUsagePicker
            disabled
            usagePages={[
              { id: 7, min: 4 },
              { id: 12 },
            ]}
            onValueChanged={() => {}}
          />
        )}
      </TabPanel>
      {hasParam2 && (
        <TabPanel id="p2">
          <ParameterValuePicker
            values={param2Values}
            value={param2}
            layers={layers}
            onValueChanged={onParam2Changed}
          />
        </TabPanel>
      )}
    </Tabs>
  );
};
