import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { ChevronDown, KeyboardMusic } from "lucide-react";

import { Tooltip } from "../misc/Tooltip";
import { useHostLayoutControls } from "./LayoutContext";
import type { ShapeId } from "./physical";

/**
 * Header dropdown that picks the physical-keyboard shape rendered in
 * the picker's Basic tab. Independent of the host OS layout — pick the
 * shape that matches your actual keyboard hardware (ANSI / ISO / JIS).
 */
export const KeyboardShapePicker = () => {
  const { shape, setShapeId, shapes } = useHostLayoutControls();

  return (
    <MenuTrigger>
      <Tooltip label="Keyboard shape (picker grid only)">
        <Button className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-base-300">
          <KeyboardMusic className="w-4" aria-hidden="true" />
          <span>{shape.name}</span>
          <ChevronDown className="w-4" aria-hidden="true" />
        </Button>
      </Tooltip>
      <Popover>
        <Menu className="shadow-md rounded bg-base-100 text-base-content cursor-pointer overflow-hidden min-w-32">
          {shapes.map((s) => (
            <MenuItem
              key={s.id}
              className={`px-2 py-1 hover:bg-base-200 ${
                s.id === shape.id ? "font-semibold text-primary" : ""
              }`}
              onAction={() => setShapeId(s.id as ShapeId)}
            >
              {s.name}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};
