import {
  CSSProperties,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Key } from "./Key";

export type KeyPosition = PropsWithChildren<{
  id: string;
  header?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  r?: number;
  rx?: number;
  ry?: number;
}>;

export type LayoutZoom = number | "auto";

export function deserializeLayoutZoom(value: string): LayoutZoom {
  if (value === "auto") {
    return "auto";
  }
  return parseFloat(value) || "auto";
}

interface PhysicalLayoutProps {
  positions: Array<KeyPosition>;
  selectedPosition?: number;
  oneU?: number;
  hoverZoom?: boolean;
  zoom?: LayoutZoom;
  onPositionClicked?: (position: number) => void;
}

interface PhysicalLayoutPositionLocation {
  x: number;
  y: number;
  r?: number;
  rx?: number;
  ry?: number;
}

export function scalePosition(
  { x, y, r, rx, ry }: PhysicalLayoutPositionLocation,
  oneU: number,
): CSSProperties {
  let left = x * oneU;
  let top = y * oneU;
  let transformOrigin = undefined;
  let transform = undefined;
  const transformStyle = "preserve-3d";

  if (r) {
    // Rotate around the layout point (rx, ry), expressed in this key's local
    // pixel space. Use `??` (not `||`) so an explicit origin of 0 stays 0 —
    // `rx || x` collapsed a legitimate 0 back to the key's own x, pivoting the
    // key around its own corner instead of the layout origin (zmk-studio#97).
    // This matches the bounding-box math below, which already uses `??`.
    const transformX = ((rx ?? x) - x) * oneU;
    const transformY = ((ry ?? y) - y) * oneU;
    transformOrigin = `${transformX}px ${transformY}px`;
    transform = `rotate(${r}deg)`;
  }

  return {
    top,
    left,
    transformOrigin,
    transform,
    transformStyle,
  };
}

export const PhysicalLayout = ({
  positions,
  selectedPosition,
  oneU = 48,
  onPositionClicked,
  ...props
}: PhysicalLayoutProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Bounding box that *includes* rotated keys. The naive max(k.x+k.width) /
  // max(k.y+k.height) ignores rotation, so rotated thumb keys extend past the
  // wrapper, the parent's centering uses the wrong size, and the visible
  // keyboard ends up top-aligned with content clipping at the bottom.
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  for (const p of positions) {
    const r = p.r || 0;
    if (!r) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x + p.width > maxX) maxX = p.x + p.width;
      if (p.y + p.height > maxY) maxY = p.y + p.height;
      continue;
    }
    const rx = p.rx ?? p.x;
    const ry = p.ry ?? p.y;
    const rad = (r * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const corners = [
      [p.x, p.y],
      [p.x + p.width, p.y],
      [p.x + p.width, p.y + p.height],
      [p.x, p.y + p.height],
    ];
    for (const [cx, cy] of corners) {
      const dx = cx - rx;
      const dy = cy - ry;
      const rotX = dx * cos - dy * sin + rx;
      const rotY = dx * sin + dy * cos + ry;
      if (rotX < minX) minX = rotX;
      if (rotY < minY) minY = rotY;
      if (rotX > maxX) maxX = rotX;
      if (rotY > maxY) maxY = rotY;
    }
  }
  const origWidth = (maxX - minX) * oneU;
  const origHeight = (maxY - minY) * oneU;
  const offsetX = -minX * oneU;
  const offsetY = -minY * oneU;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const parent = element.parentElement;
    if (!parent) return;

    const calculateScale = () => {
      if (props.zoom === "auto") {
        // Trimmer margin (~2% of the smaller viewport dim) than the original
        // 5%, so the keyboard fills more of the available area without quite
        // touching the edges.
        const padding = Math.min(window.innerWidth, window.innerHeight) * 0.02;
        // Compute from the constant original keyboard size, not the live
        // element size — the element's clientHeight tracks the scaled wrapper
        // and observing it creates a feedback loop where scale shrinks to 0.
        const newScale = Math.min(
          parent.clientWidth / (origWidth + 2 * padding),
          parent.clientHeight / (origHeight + 2 * padding),
        );
        setScale(newScale);
      } else {
        setScale(props.zoom || 1);
      }
    };

    calculateScale();

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    // Only observe the parent — observing the (now scale-driven) element
    // re-fires the loop above.
    resizeObserver.observe(parent);

    return () => {
      resizeObserver.disconnect();
    };
  }, [props.zoom, origWidth, origHeight]);

  const positionItems = positions.map((p, idx) => (
    <div className="absolute" style={scalePosition(p, oneU)}>
      <div
        key={p.id}
        onClick={() => onPositionClicked?.(idx)}
      >
        <Key
          oneU={oneU}
          selected={idx === selectedPosition}
          {...p}
        />
      </div>
    </div>
  ));

  // Anchor the scale at top-left and size the DOM box to the visually scaled
  // dimensions, so the parent's `items-center` actually centers what the user
  // sees instead of the unscaled box (which made the keyboard hug the top and
  // leave dead space at the bottom).
  return (
    <div
      className="relative"
      style={{
        height: origHeight * scale + "px",
        width: origWidth * scale + "px",
      }}
      ref={ref}
    >
      <div
        className="relative"
        style={{
          height: origHeight + "px",
          width: origWidth + "px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          transformStyle: "preserve-3d",
        }}
        {...props}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
        >
          {positionItems}
        </div>
      </div>
    </div>
  );
};
