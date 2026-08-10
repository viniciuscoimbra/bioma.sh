import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "./Kbd";

/**
 * `Kbd` — tecla/atalho de teclado. Átomo usado por Command, Menu e Topbar.
 */
const meta = {
  title: "Components/Atoms/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: { children: { control: "text" } },
} satisfies Meta<typeof Kbd>;
export default meta;

type Story = StoryObj<typeof Kbd>;

export const Playground: Story = {
  args: { children: "⌘K" },
};

export const Combinacoes: Story = {
  name: "Combinações",
  args: { children: "⌘K" },
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Kbd>⌘K</Kbd>
      <Kbd>esc</Kbd>
      <Kbd>↵</Kbd>
      <Kbd>⇧⌘P</Kbd>
    </div>
  ),
};
