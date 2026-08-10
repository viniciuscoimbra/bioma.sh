import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Atoms/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { "aria-label": "Ativar recarga automática", defaultChecked: false },
  argTypes: {
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof Switch>;

export const Desligado: Story = {};
export const Ligado: Story = { args: { defaultChecked: true } };
export const Desabilitado: Story = { args: { disabled: true, defaultChecked: true } };
