import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScoreGauge } from "./ScoreGauge";
import { Button } from "../Button";

const meta = {
  title: "Components/Molecules/ScoreGauge",
  component: ScoreGauge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Medidor circular de score (0–100): arco SVG com progresso animado ao montar e ao mudar de valor (motion tokens; `prefers-reduced-motion` zera), cor por banda de limiar — ok (≥ `okAt`, padrão 70), warn (≥ `warnAt`, padrão 40) e critical abaixo — e rótulo central (valor + label). Acessível como `role=\"meter\"` com valuemin/max/now.\n\n" +
          "**Onde usar:** score do projeto no dashboard (cards e linhas recentes), score no detalhe da análise, qualquer indicador único 0–100 com bandas de qualidade.\n\n" +
          "**Onde NÃO usar:** progresso de tarefa/upload (isso é `ProgressBar` — progresso não tem banda de qualidade); consumo vs limite (isso é `UsageMeter`); proporções de um todo (isso é `DonutChart` do Charts); número sem escala 0–100 conhecida (isso é `Stat`).",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    okAt: { control: { type: "number", min: 0, max: 100 } },
    warnAt: { control: { type: "number", min: 0, max: 100 } },
  },
} satisfies Meta<typeof ScoreGauge>;
export default meta;

type Story = StoryObj<typeof ScoreGauge>;

export const Basico: Story = {
  name: "Básico (banda ok)",
  args: { value: 74, label: "Score" },
};

export const Bandas: Story = {
  name: "Bandas por limiar",
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
      <ScoreGauge value={86} label="boa" aria-label="Score 86, banda boa" />
      <ScoreGauge value={54} label="mediana" aria-label="Score 54, banda mediana" />
      <ScoreGauge value={23} label="fraca" aria-label="Score 23, banda fraca" />
    </div>
  ),
};

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
      <ScoreGauge size="sm" value={74} aria-label="Score 74" />
      <ScoreGauge size="md" value={74} label="Score" />
      <ScoreGauge size="lg" value={74} label="Geral" />
    </div>
  ),
};

/** O arco transiciona suave ao mudar o valor (e a cor muda de banda junto). */
export const ValorVivo: Story = {
  name: "Animação ao mudar valor",
  args: { value: 74 },
  render: function Render() {
    const [value, setValue] = useState(30);
    return (
      <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
        <ScoreGauge size="lg" value={value} label="Score" />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {[23, 54, 86].map((v) => (
            <Button key={v} size="sm" variant={value === v ? "primary" : "secondary"} onClick={() => setValue(v)}>
              {v}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};
