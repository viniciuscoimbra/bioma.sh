import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Matrix2x2, type MatrixPoint } from "./Matrix2x2";

const points: MatrixPoint[] = [
  { id: "p1", label: "Bloco como o esquema funcionava", x: 55, y: 88, prioritized: true },
  { id: "p2", label: "Linha do tempo da investigação", x: 18, y: 66 },
  { id: "p3", label: "Responder perguntas reais", x: 22, y: 78 },
  { id: "p4", label: "Título com promessa explicativa", x: 18, y: 34 },
  { id: "p5", label: "FAQ de contexto", x: 30, y: 82 },
  { id: "p6", label: "Links de contexto", x: 24, y: 32 },
  { id: "p7", label: "Reescrever meta description", x: 62, y: 55 },
  { id: "p8", label: "Consolidar páginas duplicadas", x: 74, y: 70 },
  { id: "p9", label: "Migrar para SSR", x: 88, y: 60 },
  { id: "p10", label: "Ajustar alt text", x: 40, y: 20 },
];

/**
 * `Matrix2x2` — matriz impacto × esforço com pontos numerados por prioridade.
 */
const meta = {
  title: "Components/Organisms/Matrix2x2",
  component: Matrix2x2,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Pontos posicionados por `x`/`y` (0–100) e coloridos numa régua contínua de `--critical` (1º da lista) a `--info` (último) via `color-mix`. Mira central, grade pontilhada, quadrantes e eixos rotulados, legenda com a régua. Cada ponto é um botão focável com tooltip.",
      },
    },
  },
  argTypes: {
    points: { control: false },
    selectedId: { control: false },
    defaultSelectedId: { control: false },
    quadrants: { control: false },
    legend: { control: false },
    xLabel: { control: "text" },
    yLabel: { control: "text" },
    onPointClick: { action: "point" },
  },
} satisfies Meta<typeof Matrix2x2>;
export default meta;

type Story = StoryObj<typeof Matrix2x2>;

/** Priorização de melhorias — impacto × esforço. */
export const Playground: Story = {
  args: {
    points,
    xLabel: "Esforço →",
    yLabel: "Impacto →",
    quadrants: {
      topLeft: (
        <>
          <b>Executar agora</b>Alto impacto, baixo esforço.
        </>
      ),
      topRight: (
        <>
          <b>Fundação</b>Alto impacto, exige planejamento.
        </>
      ),
      bottomLeft: (
        <>
          <b>Ajuste fino</b>Rápido, ganho marginal.
        </>
      ),
      bottomRight: (
        <>
          <b>Reavaliar</b>Custo alto, retorno baixo.
        </>
      ),
    },
  },
};

/** Seleção controlada — clique num ponto e veja o item abaixo. */
export const Selecionavel: Story = {
  name: "Com seleção",
  args: { points },
  render: (args) => {
    const [selected, setSelected] = useState<MatrixPoint | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Matrix2x2
          {...args}
          selectedId={selected?.id ?? null}
          onPointClick={setSelected}
        />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          selecionado: {selected ? selected.label : "sem seleção"}
        </code>
      </div>
    );
  },
};
