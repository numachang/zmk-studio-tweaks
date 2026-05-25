import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useMemo,
} from "react";

import { useLocalStorageState } from "../misc/useLocalStorageState";
import {
  DEFAULT_LAYOUT_ID,
  getLayoutById,
  HostLayout,
  LAYOUTS,
} from "./index";
import {
  DEFAULT_SHAPE_ID,
  getShapeById,
  KEYBOARD_SHAPES,
  KeyboardShape,
  ShapeId,
} from "./physical";

interface LayoutContextValue {
  // Host OS layout — controls picker / keycap *labels*.
  layout: HostLayout;
  layoutId: string;
  setLayoutId: Dispatch<SetStateAction<string>>;
  layouts: ReadonlyArray<HostLayout>;

  // Picker's keyboard shape — controls the Basic-tab *grid shape*.
  // Independent of the host layout (a JIS-physical keyboard can be
  // used with an ANSI host and vice versa).
  shape: KeyboardShape;
  shapeId: ShapeId;
  setShapeId: Dispatch<SetStateAction<ShapeId>>;
  shapes: ReadonlyArray<KeyboardShape>;
}

const LayoutContext = createContext<LayoutContextValue>({
  layout: getLayoutById(DEFAULT_LAYOUT_ID),
  layoutId: DEFAULT_LAYOUT_ID,
  setLayoutId: () => {},
  layouts: LAYOUTS,
  shape: getShapeById(DEFAULT_SHAPE_ID),
  shapeId: DEFAULT_SHAPE_ID,
  setShapeId: () => {},
  shapes: KEYBOARD_SHAPES,
});

export const HostLayoutProvider = ({ children }: PropsWithChildren) => {
  const [layoutId, setLayoutId] = useLocalStorageState<string>(
    "host-layout",
    DEFAULT_LAYOUT_ID
  );
  const [shapeId, setShapeId] = useLocalStorageState<ShapeId>(
    "keyboard-shape",
    DEFAULT_SHAPE_ID
  );

  const value = useMemo<LayoutContextValue>(
    () => ({
      layout: getLayoutById(layoutId),
      layoutId,
      setLayoutId,
      layouts: LAYOUTS,
      shape: getShapeById(shapeId),
      shapeId,
      setShapeId,
      shapes: KEYBOARD_SHAPES,
    }),
    [layoutId, setLayoutId, shapeId, setShapeId]
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
};

export function useHostLayout(): HostLayout {
  return useContext(LayoutContext).layout;
}

export function useHostLayoutControls() {
  return useContext(LayoutContext);
}

export function useKeyboardShape(): KeyboardShape {
  return useContext(LayoutContext).shape;
}
