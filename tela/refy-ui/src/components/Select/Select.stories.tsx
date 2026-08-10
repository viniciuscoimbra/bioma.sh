import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta = {
  title: "Components/Atoms/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Papel", block: true },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof Select>;

export const SelectPadrao: Story = {
  render: (args) => (
    <Select {...args}>
      <option>Membro</option>
      <option>Admin</option>
      <option>Visualizador</option>
    </Select>
  ),
};

export const SelectComGrupos: Story = {
  render: (args) => (
    <Select {...args} label="Papel do convidado">
      <optgroup label="Built-in">
        <option>Membro</option>
        <option>Admin</option>
        <option>Visualizador</option>
      </optgroup>
      <optgroup label="Customizados">
        <option>Pesquisador externo</option>
        <option>Cliente (read-only)</option>
      </optgroup>
    </Select>
  ),
};

export const SelectComHint: Story = {
  render: (args) => (
    <Select {...args} label="Mercado padrão" hint="Aplicado a toda nova análise.">
      <option>Brasil · pt-BR</option>
      <option>Portugal · pt-PT</option>
      <option>EUA · en-US</option>
    </Select>
  ),
};
