import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { PhysicalLayout } from "./PhysicalLayout";
import { HidUsageLabel } from "./HidUsageLabel";
import { hid_usage_from_page_and_id } from "../hid-usages";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Keyboard/PhysicalLayout",
  component: PhysicalLayout,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  args: {
    onPositionClicked: fn(),
  },
} satisfies Meta<typeof PhysicalLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const TOP = [41, ...[..."QWERTYUIOP"].map((c) => c.charCodeAt(0) - 61)];
const MIDDLE = [...[..."ASDFGHJKL"].map((c) => c.charCodeAt(0) - 61), 51];
const LOWER = [
  ...[..."ZXCVBNM"].map((c) => c.charCodeAt(0) - 61),
  54,
  55,
  82,
  229,
];

const MINIVAN_POSITIONS = [
  ...TOP.map((k, i) => ({
    width: 1,
    height: 1,
    x: i,
    y: 0,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: TOP.length,
    y: 0,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 42)} />],
  },
  {
    x: 0,
    y: 1,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [<span>Tab</span>],
  },
  ...MIDDLE.map((k, i) => ({
    x: i + 1.25,
    y: 1,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: MIDDLE.length + 1.25,
    y: 1,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 40)} />],
  },
  {
    x: 0,
    y: 2,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 225)} />,
    ],
  },
  ...LOWER.map((k, i) => ({
    x: i + 1.75,
    y: 2,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: 0,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 224)} />,
    ],
  },
  {
    x: 1.25,
    y: 3,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 227)} />,
    ],
  },
  {
    x: 2.75,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 226)} />,
    ],
  },
  {
    x: 4,
    y: 3,
    width: 2.25,
    height: 1,
    header: "Key Press",
    children: [<span></span>],
  },
  {
    x: 6.25,
    y: 3,
    width: 2,
    height: 1,
    header: "Key Press",
    children: [<span></span>],
  },
  {
    x: 8.25,
    y: 3,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 230)} />,
    ],
  },
  {
    x: 9.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 80)} />],
  },
  {
    x: 10.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 81)} />],
  },
  {
    x: 11.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 79)} />],
  },
];
const POSITIONS = MINIVAN_POSITIONS.map((k, i) => ({ ...k, id: `base-${i}` }));

export const Minivan: Story = {
  args: {
    positions: POSITIONS,
    hoverZoom: true,
  },
};

export const MiniMinivan: Story = {
  args: {
    positions: POSITIONS.map(({ id, x, y, width, height }) => ({
      id,
      x,
      y,
      width,
      height,
    })),
    oneU: 15,
    hoverZoom: false,
  },
};

// Regression demo for zmk-studio#97: a pair of thumb keys rotated about a
// shared origin (rx/ry) plus one rotated about the layout origin (rx = ry = 0).
// Before the `?? ` fix these pivoted around each key's own corner instead.
const ROTATED_POSITIONS = [
  // Two plain rows for reference.
  ...[..."QWER"].map((c, i) => ({
    id: `r0-${i}`,
    x: i,
    y: 0,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>{c}</span>],
  })),
  ...[..."ASDF"].map((c, i) => ({
    id: `r1-${i}`,
    x: i,
    y: 1,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>{c}</span>],
  })),
  // Thumb cluster rotated about a shared origin near its left edge.
  {
    id: "thumb-0",
    x: 1,
    y: 2.5,
    width: 1.5,
    height: 1,
    r: 20,
    rx: 1,
    ry: 2.5,
    header: "Key Press",
    children: [<span>T1</span>],
  },
  {
    id: "thumb-1",
    x: 2.5,
    y: 2.5,
    width: 1.5,
    height: 1,
    r: 20,
    rx: 1,
    ry: 2.5,
    header: "Key Press",
    children: [<span>T2</span>],
  },
  // Key rotated about the layout origin (0,0) — the exact #97 case.
  {
    id: "origin-rot",
    x: 5,
    y: 1,
    width: 1,
    height: 1,
    r: -15,
    rx: 0,
    ry: 0,
    header: "Key Press",
    children: [<span>O</span>],
  },
];

export const RotatedKeys: Story = {
  args: {
    positions: ROTATED_POSITIONS,
    hoverZoom: true,
  },
};
