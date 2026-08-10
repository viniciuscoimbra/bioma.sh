import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, type DateRange } from "./Calendar";

/**
 * `Calendar` — molécula de date picker. Modo `single` (uma data) ou `range`
 * (início → fim, ex.: ida e volta). Isolada, acessível (grid + teclado) e
 * baseada em tokens. Esta página cobre todos os estados possíveis.
 */
const meta = {
  title: "Components/Molecules/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Date picker funcional. `mode=\"single\"` seleciona um dia; `mode=\"range\"` seleciona um intervalo com preview no hover. Navegação por mês (botões + PageUp/Down), teclado (setas + Enter) e limites `min`/`max`. Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"], description: "Tipo de seleção." },
    numberOfMonths: { control: "inline-radio", options: [1, 2], description: "Meses lado a lado." },
    weekStartsOn: { control: "inline-radio", options: [0, 1], description: "0 = domingo, 1 = segunda." },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
  },
} satisfies Meta<typeof Calendar>;
export default meta;

type Story = StoryObj<typeof Calendar>;

/** Playground — troque `mode`, `numberOfMonths` e `weekStartsOn` nos controls. */
export const Playground: Story = {
  args: { mode: "single", numberOfMonths: 1, weekStartsOn: 0, defaultValue: new Date() },
};

/** Uma data, não-controlado. Clique num dia e ele seleciona sozinho. */
export const SingleDefault: Story = {
  name: "Single · padrão",
  args: { mode: "single", defaultValue: new Date() },
};

/** Uma data, controlado — o estado vive no pai e aparece abaixo. */
export const SingleControlled: Story = {
  name: "Single · controlado",
  render: (args) => {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Calendar {...args} mode="single" value={date} onChange={(v) => setDate(v as Date)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#3e3e44" }}>
          {date ? date.toLocaleDateString("pt-BR") : "nenhuma data"}
        </code>
      </div>
    );
  },
};

/** Intervalo em dois meses — o caso ida/volta de uma viagem. */
export const RangeDualMonth: Story = {
  name: "Range · ida e volta",
  render: (args) => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    const fmt = (d: Date | null) => (d ? d.toLocaleDateString("pt-BR") : "—");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Calendar {...args} mode="range" numberOfMonths={2} value={range} onChange={(v) => setRange(v as DateRange)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#3e3e44" }}>
          {fmt(range.start)} → {fmt(range.end)}
        </code>
      </div>
    );
  },
};

/** Intervalo num único mês. */
export const RangeSingleMonth: Story = {
  name: "Range · 1 mês",
  args: { mode: "range", numberOfMonths: 1 },
};

/** Só permite selecionar de hoje em diante (dias passados desabilitados). */
export const MinLimit: Story = {
  name: "Com limite mínimo",
  args: { mode: "single", min: new Date() },
};

/** Semana começando na segunda-feira. */
export const WeekStartsMonday: Story = {
  name: "Semana na segunda",
  args: { mode: "single", weekStartsOn: 1, defaultValue: new Date() },
};
