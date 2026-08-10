import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { Button } from "../Button";

const meta = {
  title: "Components/Atoms/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Barra de progresso horizontal, sem rótulo embutido.",
          "",
          "**Onde usar:** consumo vs. limite (créditos, cota de projetos, uso de API),",
          "progresso de tarefa determinada. `tone=\"neutral\"` (tinta) é o tom das barras",
          "de cota informativas das telas de settings (ex.: \"5 / 20 projetos\" em",
          "`settings_projects`) — quando a barra só informa proporção, sem julgar estado.",
          "`primary` = saudável/ativo; `warn`/`critical` = aproximando/estourando o limite.",
          "",
          "`indeterminate` cobre carregamento contínuo sem percentual conhecido",
          "(o preenchimento desliza em loop; `aria-busy`, sem `aria-valuenow`).",
          "Mudanças de `value` animam o crescimento do preenchimento (motion tokens);",
          "`prefers-reduced-motion` desliga as duas animações.",
          "",
          "**Onde NÃO usar:** placeholder de conteúdo carregando (use `Skeleton`); o composto",
          "número + descrição + barra + ação (use `UsageMeter`, que envolve esta barra);",
          "passos de wizard (use navegação de passos). Rótulos ficam FORA da barra —",
          "este átomo nunca renderiza texto.",
        ].join("\n"),
      },
    },
  },
  args: { value: 49, tone: "primary", size: "md" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    tone: { control: "inline-radio", options: ["primary", "neutral", "warn", "critical"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    indeterminate: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Saudavel: Story = {};
export const Atencao: Story = { args: { value: 72, tone: "warn" } };
export const Critico: Story = { args: { value: 94, tone: "critical" } };

/**
 * Tom neutro (tinta): barra de cota informativa das telas de settings —
 * proporção sem julgamento de estado (ex.: "5 / 20 projetos ativos").
 */
export const CotaNeutra: Story = {
  args: { value: 25, tone: "neutral" },
  render: (args) => (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 8 }}>
      <ProgressBar {...args} aria-label="5 de 20 projetos ativos" />
    </div>
  ),
};

/**
 * O width do preenchimento é animado (motion token): clique nos botões e veja
 * a barra "crescer"/"encolher" até o novo valor em vez de saltar seco.
 */
export const ValorAnimado: Story = {
  name: "Valor animado",
  render: (args) => {
    const [value, setValue] = useState(20);
    return (
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <ProgressBar {...args} value={value} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 25))}>
            −25
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.min(100, v + 25))}>
            +25
          </Button>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
            value = {value}
          </code>
        </div>
      </div>
    );
  },
};

/**
 * `indeterminate` — carregamento contínuo sem percentual conhecido: o
 * preenchimento desliza em loop. Acessibilidade: `aria-busy`, sem
 * `aria-valuenow`. Com `prefers-reduced-motion`, a animação para e a trilha
 * fica preenchida a meia opacidade.
 */
export const Carregando: Story = {
  args: { indeterminate: true },
  render: (args) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} aria-label="Carregando" />
    </div>
  ),
};
