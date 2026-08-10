import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Popover } from "./Popover";

/**
 * `Popover` — conteúdo flutuante interativo ancorado a um trigger.
 * Diferente do Tooltip: aceita interação (form curto, filtros).
 */
const meta = {
  title: "Components/Molecules/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controlado por `open`/`onOpenChange` (overlays não têm estado global). Fecha com Esc ou clique fora. Posição por `side` (top/bottom/left/right) + `align` (start/center/end). Min-width 220px, elevação 3.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, display: "flex", alignItems: "flex-start", paddingTop: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    open: { control: false },
    onOpenChange: { control: false },
    content: { control: false },
    children: { control: false },
    label: { control: "text" },
  },
} satisfies Meta<typeof Popover>;
export default meta;

type Story = StoryObj<typeof Popover>;

function FiltroEstagio() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-eyebrow)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-uppercase)",
          color: "var(--ink-3)",
          marginBottom: 6,
        }}
      >
        Filtrar por estágio
      </span>
      <Checkbox label="Diagnóstico" defaultChecked />
      <Checkbox label="Backlog" />
      <Checkbox label="Em progresso" />
      <Checkbox label="Resolvido" />
    </div>
  );
}

/** Filtros num popover — clique no botão para abrir/fechar. */
export const Playground: Story = {
  args: { open: false, onOpenChange: () => {}, content: null, children: null, label: "Filtros" },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <Popover {...args} open={open} onOpenChange={setOpen} content={<FiltroEstagio />}>
        <Button onClick={() => setOpen(!open)}>Filtrar</Button>
      </Popover>
    );
  },
};

/** Alinhado ao fim, abrindo para cima. */
export const TopEnd: Story = {
  name: "Top · end",
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
        <Story />
      </div>
    ),
  ],
  args: { open: false, onOpenChange: () => {}, content: null, children: null, side: "top", align: "end" },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <Popover {...args} open={open} onOpenChange={setOpen} content={<FiltroEstagio />}>
        <Button onClick={() => setOpen(!open)}>Filtrar</Button>
      </Popover>
    );
  },
};
