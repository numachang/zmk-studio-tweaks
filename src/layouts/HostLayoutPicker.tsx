import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { ChevronDown, Keyboard } from "lucide-react";

import { Tooltip } from "../misc/Tooltip";
import { useHostLayoutControls } from "./LayoutContext";

/**
 * Header dropdown that lets the user pick which host OS keyboard layout
 * Studio is displaying labels for. Persisted to localStorage via the
 * surrounding [[HostLayoutProvider]]. Affects display labels only — the
 * underlying HID bindings stored on the device don't change.
 */
export const HostLayoutPicker = () => {
  const { layout, setLayoutId, layouts } = useHostLayoutControls();

  return (
    <MenuTrigger>
      <Tooltip label="Host keyboard layout (display labels only)">
        <Button className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-base-300">
          <Keyboard className="w-4" aria-hidden="true" />
          <span>{layout.name}</span>
          <ChevronDown className="w-4" aria-hidden="true" />
        </Button>
      </Tooltip>
      <Popover>
        <Menu className="shadow-md rounded bg-base-100 text-base-content cursor-pointer overflow-hidden min-w-48">
          {layouts.map((l) => (
            <MenuItem
              key={l.id}
              className={`px-2 py-1 hover:bg-base-200 ${
                l.id === layout.id ? "font-semibold text-primary" : ""
              }`}
              onAction={() => setLayoutId(l.id)}
            >
              {l.name}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
};
