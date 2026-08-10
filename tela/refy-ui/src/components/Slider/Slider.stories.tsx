import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

/**
 * `Slider` — controle contínuo arrastável. Clique na track teleporta o thumb,
 * setas ←/→ ajustam por step (Shift = 10×). Suporta steps discretos com `marks`.
 */
const meta = {
  title: "Components/Atoms/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Arraste o thumb (pointer capture), clique na track para teleportar, ←/→ por `step` (Shift = 10×), Home/End para os extremos. `marks` transforma em slider discreto com pontos e rótulos. `role=\"slider\"` com `aria-valuemin/max/now/text`. Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    label: { control: "text" },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
    formatValue: { control: false },
    ticks: { control: false },
    marks: { control: false },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Slider>;
export default meta;

type Story = StoryObj<typeof Slider>;

/** Playground — contínuo 0–100 com readout em %. */
export const Playground: Story = {
  args: {
    label: "Profundidade da análise",
    defaultValue: 35,
    formatValue: (v: number) => `${v}%`,
    ticks: ["Rasa", "Profunda"],
  },
};

/** Step decimal (0.1) — limiar de 0 a 10. */
export const Decimal: Story = {
  name: "Step decimal",
  args: {
    label: "Limiar de prioridade",
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 7,
    formatValue: (v: number) => v.toFixed(1),
    ticks: ["0", "10"],
  },
};

/** Discreto com `marks` — pontos na track e rótulo por step. */
export const Discreto: Story = {
  name: "Discreto · marks",
  args: {
    label: "Frequência de monitoramento",
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    marks: ["Hora", "Diário", "Semanal", "Quinzenal", "Mensal"],
    formatValue: (v: number) => ["Hora", "Diário", "Semanal", "Quinzenal", "Mensal"][v],
  },
};

/** Controlado — o valor vive no pai. */
export const Controlled: Story = {
  name: "Controlado",
  args: { label: "Profundidade" },
  render: (args) => {
    const [v, setV] = useState(50);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Slider {...args} value={v} onChange={setV} formatValue={(x) => `${x}%`} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          valor: {v}
        </code>
      </div>
    );
  },
};

/** Desabilitado. */
export const Disabled: Story = {
  args: {
    label: "Profundidade da análise",
    defaultValue: 35,
    formatValue: (v: number) => `${v}%`,
    disabled: true,
  },
};
