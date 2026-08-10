import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

const Search = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const meta = {
  title: "Components/Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { "aria-label": "Pesquisar", icon: Search, variant: "ghost", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "outline", "solid"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof IconButton>;
export default meta;

type Story = StoryObj<typeof IconButton>;

export const GhostIcon: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Solid: Story = { args: { variant: "solid" } };
