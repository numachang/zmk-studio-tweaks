import { BehaviorParameterValueDescription } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { HidUsagePicker } from "./HidUsagePicker";

export interface ParameterValuePickerProps {
  value?: number;
  values: BehaviorParameterValueDescription[];
  layers: { id: number; name: string }[];
  onValueChanged: (value?: number) => void;
}

export const ParameterValuePicker = ({
  value,
  values,
  layers,
  onValueChanged,
}: ParameterValuePickerProps) => {
  if (values.length == 0) {
    return <></>;
  } else if (values.every((v) => v.constant !== undefined)) {
    return (
      <div>
        <select
          value={value}
          className="h-8 rounded"
          onChange={(e) => onValueChanged(parseInt(e.target.value))}
        >
          {values.map((v) => (
            <option value={v.constant}>{v.name}</option>
          ))}
        </select>
      </div>
    );
  } else if (values.length == 1) {
    if (values[0].range) {
      return (
        <div>
          <label>{values[0].name}: </label>
          <input
            type="number"
            min={values[0].range.min}
            max={values[0].range.max}
            value={value}
            onChange={(e) => onValueChanged(parseInt(e.target.value))}
          />
        </div>
      );
    } else if (values[0].hidUsage) {
      return (
        <HidUsagePicker
          onValueChanged={onValueChanged}
          label={values[0].name}
          value={value}
          usagePages={[
            { id: 7, min: 4, max: values[0].hidUsage.keyboardMax },
            { id: 12, max: values[0].hidUsage.consumerMax },
          ]}
        />
      );
    } else if (values[0].layerId) {
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm">{values[0].name}:</label>
          <div
            role="radiogroup"
            aria-label={values[0].name}
            className="flex flex-wrap gap-1"
          >
            {layers.map(({ name, id }, i) => {
              const selected = value === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onValueChanged(id)}
                  className={`px-3 py-1 rounded border text-sm ${
                    selected
                      ? "bg-primary text-primary-content border-primary"
                      : "bg-base-200 hover:bg-base-300 border-base-300"
                  }`}
                >
                  {name || i.toLocaleString()}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
  } else {
    console.log("Not sure how to handle", values);
    return (
      <>
        <p>Some composite?</p>
      </>
    );
  }

  return <></>;
};
