import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Components/Atoms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    name: { control: "text" },
    label: { control: "text" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const CicloDeCobranca: Story = {
  args: {
    name: "ciclo",
    label: "Ciclo de cobrança",
    defaultValue: "anual",
    options: [
      { value: "mensal", label: "Mensal", hint: "R$ 249/mês, cancela quando quiser" },
      { value: "anual", label: "Anual", hint: "R$ 199/mês cobrado uma vez, economize 20%" },
    ],
  },
  render: (args) => <div style={{ maxWidth: 420 }}><RadioGroup {...args} /></div>,
};
