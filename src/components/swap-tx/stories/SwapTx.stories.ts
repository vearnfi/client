import type { Meta, StoryObj } from "@storybook/svelte";
import { SwapTx } from "../";
import SwapTxStory from "./SwapTx.story.svelte";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
  title: "components/SwapTx",
  component: SwapTx,
  tags: ["autodocs"],
  // argTypes: {
  //   backgroundColor: { control: "color" },
  //   size: {
  //     control: { type: "select" },
  //     options: ["small", "medium", "large"],
  //   },
  // },
} satisfies Meta<SwapTx>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Primary: Story = {
  render: (args) => ({
    Component: SwapTx,
    props: args,
  }),
  args: {
    amountIn: "490",
    amountOut: "23.45",
    txId: "0x123",
    explorerUrl: "https://some.url",
  },
};

// export const Secondary: Story = {
//   render: (args) => ({
//     Component: SwapTxStory,
//     props: args,
//   }),
//   args: {},
// };

// export const Danger: Story = {
//   render: (args) => ({
//     Component: SwapTxStory,
//     props: args,
//   }),
//   args: {
//     intent: "danger",
//   },
// };

// export const Small: Story = {
//   render: (args) => ({
//     Component: SwapTxStory,
//     props: args,
//   }),
//   args: {
//     size: "small",
//   },
// };

// export const FullWidth: Story = {
//   render: (args) => ({
//     Component: SwapTxStory,
//     props: args,
//   }),
//   args: {
//     fullWidth: true,
//   },
// };

// export const Disabled: Story = {
//   render: (args) => ({
//     Component: SwapTxStory,
//     props: args,
//   }),
//   args: {
//     disabled: true,
//   },
// };
