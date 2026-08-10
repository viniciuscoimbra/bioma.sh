import type { Meta, StoryObj } from "@storybook/react";
import { Stat, StatGroup } from "./Stat";
import { Sparkline } from "../Charts";
import { Card, CardHeader } from "../Card";

const meta = {
  title: "Components/Molecules/Stat",
  component: Stat,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Indicador numérico: label mono uppercase + valor grande tabular (`font-variant-numeric: tabular-nums`) + delta (up/down com cor semântica) e descrição opcionais. `StatGroup` monta o grid responsivo de tiles. Slot `chart` aceita o `Sparkline` do Charts para tendência. As cores vêm dos tokens do tema do ancestral — em painel invertido (hero de uso, resumo do plano) basta `data-theme=\"dark\"` no container.\n\n" +
          "**Onde usar:** tiles de limites da API (Desenvolvedor), cota de projetos, hero da página de Uso, resumo do plano em Cobrança — qualquer número-chave com rótulo curto.\n\n" +
          "**Onde NÃO usar:** não use para consumo vs limite com barra (isso é `UsageMeter`); não use para score 0–100 circular (isso é `ScoreGauge`); não use como gráfico (isso é `Charts` — o `chart` aqui é tendência de apoio, não leitura precisa); não use para contadores dentro de texto corrido (isso é `Badge`).",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Stat>;
export default meta;

type Story = StoryObj<typeof Stat>;

export const Basico: Story = {
  name: "Básico",
  args: {
    label: "Rate limit",
    value: "60",
    unit: "req/min",
    description: "por API key; 429 retorna após exceder.",
  },
};

export const ComDelta: Story = {
  name: "Com delta (up/down)",
  render: () => (
    <StatGroup style={{ maxWidth: 560 }}>
      <Stat
        label="Análises no ciclo"
        value="128"
        delta={{ value: "+12%", trend: "up" }}
        description="vs ciclo anterior"
      />
      <Stat
        label="Score médio"
        value="74"
        delta={{ value: "-3 pts", trend: "down" }}
        description="vs ciclo anterior"
      />
      <Stat
        label="Custo por análise"
        value="18"
        unit="créditos"
        delta={{ value: "+2", trend: "up", sentiment: "negative" }}
        description="subir aqui é ruim, sentimento invertido"
      />
    </StatGroup>
  ),
};

export const ComSparkline: Story = {
  name: "Com Sparkline (slot chart)",
  args: {
    label: "Análises / dia",
    value: "42",
    delta: { value: "+8%", trend: "up" },
    chart: (
      <Sparkline
        data={[12, 18, 14, 22, 26, 24, 31, 29, 38, 42]}
        label="Tendência de análises por dia"
      />
    ),
  },
};

/** Grid de tiles como em "Limites de uso" na página do Desenvolvedor. */
export const GrupoEmGrid: Story = {
  name: "StatGroup (limites da API)",
  render: () => (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader title="Limites de uso" />
      <StatGroup>
        <Stat size="sm" label="Rate limit" value="60" unit="req/min" description="por API key, 429 após exceder." />
        <Stat size="sm" label="Análises paralelas" value="3" unit="simultâneas" description="plano Pro · upgrade libera 10." />
        <Stat size="sm" label="Webhook timeout" value="10s" unit="· 5 retries" description="backoff exponencial 30s → 4h." />
      </StatGroup>
    </Card>
  ),
};

/** Em painel invertido (hero de uso): tokens flip via data-theme no container. */
export const SuperficieInvertida: Story = {
  name: "Superfície invertida (hero)",
  render: (_args, context) => (
    <div
      data-theme={String(context.globals.theme).startsWith("dommus") ? "dommus-dark" : "dark"}
      style={{
        background: "var(--surface-container-low)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        maxWidth: 640,
      }}
    >
      <StatGroup>
        <Stat size="lg" label="Saldo total disponível" value="3.700" unit="créditos" description="2.500 do plano Pro · 1.200 acumulados" />
        <Stat size="lg" label="Consumido neste ciclo" value="800" unit="/ 2.500" description="8 análises padrão · 0 sínteses" />
        <Stat size="lg" label="Pacotes adicionais" value="2.000" unit="restantes" description="Pacote 2.000 cr · comprado em 02 mai." />
      </StatGroup>
    </div>
  ),
};
