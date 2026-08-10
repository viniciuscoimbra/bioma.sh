import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Components/Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Nome do ambiente", placeholder: "Globo Editorial", block: true },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    prefix: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof Input>;

export const InputPadrao: Story = {};
export const InputComHint: Story = {
  args: { label: "E-mail de cobrança", hint: "Recebe as notas fiscais.", placeholder: "financeiro@empresa.com" },
};
export const InputComErro: Story = {
  args: { label: "URL", error: "Informe uma URL válida.", defaultValue: "globo" },
};
export const InputComPrefixo: Story = {
  render: (args) => <Input {...args} label="URL do ambiente" prefix="refy.app/" defaultValue="globo-editorial" />,
};
export const InputDesabilitado: Story = { args: { label: "Plano", defaultValue: "Pro Anual", disabled: true } };
