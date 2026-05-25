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

interface LayoutContextValue {
  layout: HostLayout;
  layoutId: string;
  setLayoutId: Dispatch<SetStateAction<string>>;
  /** All registered layouts, exposed so the picker dropdown can list them. */
  layouts: ReadonlyArray<HostLayout>;
}

const LayoutContext = createContext<LayoutContextValue>({
  layout: getLayoutById(DEFAULT_LAYOUT_ID),
  layoutId: DEFAULT_LAYOUT_ID,
  setLayoutId: () => {},
  layouts: LAYOUTS,
});

export const HostLayoutProvider = ({ children }: PropsWithChildren) => {
  const [layoutId, setLayoutId] = useLocalStorageState<string>(
    "host-layout",
    DEFAULT_LAYOUT_ID
  );

  const value = useMemo<LayoutContextValue>(
    () => ({
      layout: getLayoutById(layoutId),
      layoutId,
      setLayoutId,
      layouts: LAYOUTS,
    }),
    [layoutId, setLayoutId]
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
