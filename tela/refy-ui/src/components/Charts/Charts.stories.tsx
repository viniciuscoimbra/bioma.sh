import type { Meta, StoryObj } from "@storybook/react";
import { BarChart, DonutChart, LineChart, Sparkline } from "./Charts";

/**
 * `Charts` — line/bar/donut/sparkline em SVG puro, sem dependências.
 */
const meta = {
  title: "Components/Organisms/Charts",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Escolha pelo dado: **LineChart** para evolução no tempo; **BarChart** para comparar uma medida entre categorias; **DonutChart** para partes de um mesmo total; **Sparkline** para tendência compacta. Não transforme ausência, falha ou status em série: mostre esses estados como alerta fora do gráfico. Todos usam títulos, medidas, acessibilidade e cores via tokens.",
      },
    },
  },
  argTypes: {
    data: { control: false },
    xLabels: { control: false },
    formatY: { control: false },
    label: { control: "text" },
    area: { control: "boolean" },
    max: { control: "number" },
  },
} satisfies Meta<typeof LineChart>;
export default meta;

type Story = StoryObj<typeof LineChart>;

const trafego = [3200, 3600, 3400, 4800, 5200, 6100, 6800, 7400, 8600, 8900, 10200, 11400];

/** Line chart com área — tráfego orgânico em 90 dias. */
export const Line: Story = {
  name: "LineChart",
  args: {
    title: "Tráfego orgânico",
    data: trafego,
    xLabels: ["Ago", "Set", "Out", "Hoje"],
    pointLabels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8", "Sem 9", "Sem 10", "Sem 11", "Sem 12"],
    formatY: (v: number) => `${(v / 1000).toFixed(1)}k`,
    yTitle: "Visitas/mês",
    xTitle: "Últimos 90 dias",
    label: "Tráfego orgânico (90 dias)",
  },
  render: (args) => (
    <div style={{ maxWidth: 680 }}>
      <LineChart {...args} />
    </div>
  ),
};

/** Duas séries com legenda — você × concorrente. */
export const MultiSerie: Story = {
  name: "LineChart · 2 séries",
  args: { data: trafego, label: "Você × concorrente" },
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <LineChart
        title="Tráfego comparado"
        label="Tráfego: você × concorrente"
        series={[
          { name: "refy.com.br", data: trafego, tone: "primary" },
          { name: "rdstation.com", data: [5200, 5400, 5600, 5300, 5800, 6200, 6100, 6600, 7000, 6800, 7400, 7800], tone: "info" },
        ]}
        xLabels={["Ago", "Set", "Out", "Hoje"]}
        formatY={(v: number) => `${(v / 1000).toFixed(1)}k`}
        yTitle="Visitas/mês"
      />
    </div>
  ),
};

/** Barras com eixo de valores (réguas + medidas + unidade). */
export const Bar: Story = {
  name: "BarChart",
  args: { data: [], label: "Issues por categoria" },
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <BarChart
        title="Ocorrências por categoria"
        label="Issues por categoria"
        valueTitle="Issues abertas"
        items={[
          { label: "Conteúdo", value: 320 },
          { label: "Links", value: 220, tone: "info" },
          { label: "Performance", value: 180, tone: "warn" },
          { label: "Schema", value: 120 },
          { label: "Mobile", value: 60, tone: "critical" },
        ]}
      />
    </div>
  ),
};

/** Anel de progresso com valor central. */
export const Donut: Story = {
  name: "DonutChart · progresso",
  args: { data: [], label: "Score de SEO" },
  render: () => <DonutChart value={74} caption="Score de SEO" label="Score de SEO" />,
};

/** Distribuição em segmentos com tons semânticos. */
export const DonutSegmentos: Story = {
  name: "DonutChart · segmentos",
  args: { data: [], label: "Issues por severidade" },
  render: () => (
    <DonutChart
      label="Issues por severidade"
      centerLabel="128"
      caption="Issues"
      segments={[
        { value: 34, tone: "critical", label: "Críticos" },
        { value: 52, tone: "warn", label: "Médios" },
        { value: 28, tone: "primary", label: "Resolvidos" },
        { value: 14, tone: "muted", label: "Ignorados" },
      ]}
      formatValue={(v) => `${v} issues`}
    />
  ),
};

/** Mini-tendências para células de tabela e cards. */
export const Sparklines: Story = {
  name: "Sparkline",
  args: { data: [], label: "Tendência" },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Sparkline data={[4, 6, 5, 8, 7, 11, 9, 13]} label="Tendência de tráfego (subindo)" />
      <Sparkline data={[13, 10, 11, 9, 6, 7, 4, 2]} tone="bad" label="Tendência de posição (caindo)" />
      <Sparkline data={[5, 6, 8, 7, 10, 9, 11, 12]} label="Tendência de keywords" />
    </div>
  ),
};
