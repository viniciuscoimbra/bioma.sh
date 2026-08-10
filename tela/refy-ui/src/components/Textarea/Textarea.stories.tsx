import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    label: "Descrição do papel",
    placeholder: "Para que esse papel é usado?",
    block: true,
    rows: 3,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    rows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;
export default meta;

type Story = StoryObj<typeof Textarea>;

export const TextareaPadrao: Story = {};
export const TextareaComHint: Story = {
  args: { hint: "Aparece na lista de papéis do time.", defaultValue: "Roda análises mas não publica." },
};
export const TextareaComErro: Story = { args: { error: "Máximo de 280 caracteres." } };
