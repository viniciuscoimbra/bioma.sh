import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Segmented } from "./Segmented";

/**
 * `Segmented` — seleção única em pílula (switch de visões).
 */
const meta = {
  title: "Components/Atoms/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Trilho rebaixado; o segmento ativo ganha superfície elevada. Semântica `radiogroup` com ←/→ movendo a seleção. Controlado via `value`/`onChange` ou não-controlado. Para múltipla escolha use `ToggleGroup`.",
      },
    },
  },
  argTypes: {
    options: { control: false },
    label: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Segmented>;
export default meta;

type Story = StoryObj<typeof Segmented>;

const visoes = [
  { value: "lista", label: "Lista" },
  { value: "kanban", label: "Kanban" },
  { value: "timeline", label: "Timeline" },
];

/** Três visões — clique ou use ←/→. */
export const Playground: Story = {
  args: { options: visoes, label: "Visão", defaultValue: "lista" },
};

/** Controlado. */
export const Controlled: Story = {
  name: "Controlado",
  args: { options: visoes, label: "Visão" },
  render: (args) => {
    const [view, setView] = useState("kanban");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Segmented {...args} value={view} onChange={setView} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{view}</code>
      </div>
    );
  },
};

/** Com opção desabilitada. */
export const ComDisabled: Story = {
  name: "Opção desabilitada",
  args: {
    label: "Visão",
    options: [...visoes.slice(0, 2), { value: "mapa", label: "Mapa", disabled: true }],
  },
};
