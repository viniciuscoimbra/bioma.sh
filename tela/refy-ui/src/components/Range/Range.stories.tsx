import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Range, type RangeValue } from "./Range";

// distribuição fictícia p/ o histograma (fixa, para render estável)
const DIST = [3, 5, 9, 14, 18, 24, 30, 34, 30, 26, 22, 18, 15, 12, 10, 8, 6, 5, 3, 2];

/**
 * `Range` — slider de intervalo com dois handles. Clique na track teleporta
 * o handle mais próximo; o mínimo nunca cruza o máximo.
 */
const meta = {
  title: "Components/Atoms/Range",
  component: Range,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dois `role=\"slider\"` (Mínimo/Máximo) com `aria-valuemin/max/now/text`, arraste com pointer capture, ←/→ por `step` (Shift = 10×), Home/End até o limite disponível. `fixedMinimum` fixa a origem e expõe um único handle para raios/limites. Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.",
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
    fixedMinimum: { control: "boolean" },
    disabled: { control: "boolean" },
    formatValue: { control: false },
    ticks: { control: false },
    histogram: { control: false },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Range>;
export default meta;

type Story = StoryObj<typeof Range>;

/** Playground — faixa de Domain Authority com ticks. */
export const Playground: Story = {
  args: {
    label: "Faixa de DA",
    defaultValue: [30, 80],
    ticks: ["0", "25", "50", "75", "100"],
  },
};

/** Com histograma — as barras dentro do intervalo acendem. */
export const ComHistograma: Story = {
  name: "Com histograma",
  args: {
    label: "Faixa de DA",
    defaultValue: [30, 80],
    histogram: DIST,
    ticks: ["0", "25", "50", "75", "100"],
  },
};

/** Valores formatados (volume de busca mensal). */
export const Formatado: Story = {
  name: "Com formatação",
  args: {
    label: "Volume de busca (mensal)",
    min: 0,
    max: 100_000,
    step: 1000,
    defaultValue: [10_000, 60_000],
    formatValue: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)),
    ticks: ["0", "25k", "50k", "75k", "100k"],
  },
};

/** Controlado — o intervalo vive no pai. */
export const Controlled: Story = {
  name: "Controlado",
  args: { label: "Faixa de DA" },
  render: (args) => {
    const [range, setRange] = useState<RangeValue>([20, 60]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Range {...args} value={range} onChange={setRange} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{range[0]}, {range[1]}]
        </code>
      </div>
    );
  },
};

/** Origem fixa — um único handle para raio/limite acumulado. */
export const MinimoFixo: Story = {
  args: {
    label: "Raio de entorno",
    min: 0,
    max: 5,
    step: 0.5,
    fixedMinimum: true,
    defaultValue: [0, 2],
    formatValue: (value: number) => `${value.toLocaleString("pt-BR")} km`,
    ticks: ["0", "1", "2", "3", "4", "5 km"],
  },
};

/** Desabilitado. */
export const Disabled: Story = {
  args: {
    label: "Faixa de DA",
    defaultValue: [30, 80],
    disabled: true,
  },
};
