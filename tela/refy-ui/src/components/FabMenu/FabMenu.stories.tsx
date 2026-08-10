import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Icons } from "../../_demo/icons";
import { FabMenu, type FabMenuAction } from "./FabMenu";

const actions: FabMenuAction[] = [
  { id: "cliente", label: "Novo cliente", icon: Icons.plus },
  { id: "buscar", label: "Buscar imóvel", icon: Icons.search },
  { id: "importar", label: "Importar contato", icon: Icons.download },
  { id: "ajuda", label: "Pedir ajuda", icon: Icons.help },
];

const meta = {
  title: "Components/Molecules/FabMenu",
  component: FabMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Compõe Fab e Menu canônicos. Abre para cima com scrim, três a cinco ações e animação progressiva; setas, Enter, Escape e clique externo são herdados de Menu.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: "100vh", boxSizing: "border-box", display: "grid", placeItems: "end", padding: 32, background: "var(--surface-2)" }}>
        <Story />
      </div>
    ),
  ],
  args: { actions, label: "Abrir ações" },
  argTypes: {
    actions: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    onSelect: { control: false },
  },
} satisfies Meta<typeof FabMenu>;

export default meta;
type Story = StoryObj<typeof FabMenu>;

export const Fechado: Story = {};

export const Aberto: Story = {
  args: { defaultOpen: true },
};

export const Interativo: Story = {
  render: (args) => {
    const [selection, setSelection] = useState("Nenhuma ação executada.");
    return (
      <div>
        <FabMenu {...args} onSelect={(id) => setSelection(`Ação executada: ${id}.`)} />
        <p role="status" aria-live="polite" style={{ position: "fixed", left: 24, bottom: 18, margin: 0, color: "var(--ink-2)" }}>
          {selection}
        </p>
      </div>
    );
  },
};
