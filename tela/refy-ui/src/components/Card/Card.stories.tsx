import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader } from "./Card";
import { Button } from "../Button";
import { Badge } from "../Badge";

const meta = {
  title: "Components/Molecules/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Superfície-base do app. `tone=\"inverted\"` vira a superfície escura de destaque (tinta + radial da marca) usada nos heróis de billing/uso — os tokens de tinta são re-escopados dentro do card, então átomos filhos ficam legíveis sem prop extra.",
          "",
          "**Onde usar:** agrupar conteúdo relacionado em uma superfície; `inverted` só para UM destaque por tela (resumo do plano, herói de uso, upsell).",
          "",
          "**Onde NÃO usar:** card inteiro clicável que navega (use `NavCard`); opção selecionável (use `ChoiceCard`); `inverted` em cards comuns de formulário/lista — perde a função de destaque.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    elevation: { control: "inline-radio", options: [0, 1, 2, 3, 4] },
    padding: { control: "inline-radio", options: ["none", "sm", "md"] },
    tone: { control: "inline-radio", options: ["default", "inverted"] },
  },
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof Card>;

export const Simples: Story = {
  args: { elevation: 0, children: "Conteúdo do card." },
  render: (args) => <Card {...args} style={{ maxWidth: 360 }} />,
};

export const ComHeader: Story = {
  render: () => (
    <Card style={{ maxWidth: 360 }}>
      <CardHeader
        title="Uso este mês"
        count="12 / 50"
        action={<Button variant="ghost" size="sm">Detalhes</Button>}
      />
      <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)" }}>
        Consumo de créditos do ciclo atual.
      </p>
    </Card>
  ),
};

export const NiveisDeElevacao: Story = {
  name: "Elevação · e0–e4",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", minHeight: 520 }}>
      {(["light", "dark"] as const).map((theme) => (
        <section key={theme} data-theme={theme} style={{ padding: 32, color: "var(--ink-1)", background: "var(--bg)" }}>
          <div style={{ marginBottom: 22 }}>
            <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>Components · Data · {theme}</span>
            <h3 style={{ margin: "6px 0 4px", fontFamily: "var(--font-headline)", fontSize: 22 }}>Cards · 5 níveis de elevação</h3>
            <p style={{ maxWidth: "56ch", margin: 0, color: "var(--ink-3)", fontSize: 12.5, lineHeight: 1.55 }}>e0 para listas densas, e2 para destaques e e4 para overlays.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            {(["Flat", "Resting", "Hover", "Lifted", "Overlay"] as const).map((label, elevation) => (
              <Card key={label} elevation={elevation as 0 | 1 | 2 | 3 | 4} style={{ minHeight: 112 }}>
                <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>e{elevation}</span>
                <div style={{ marginTop: 8, fontWeight: 600 }}>{label}</div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  parameters: { layout: "fullscreen" },
};

export const Invertido: Story = {
  name: "Invertido (tone=inverted)",
  render: () => (
    <Card tone="inverted" style={{ maxWidth: 480 }}>
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-eyebrow)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          color: "var(--brand-primary)",
        }}
      >
        Plano atual
      </p>
      <h3
        style={{
          margin: "0 0 6px",
          fontFamily: "var(--font-headline)",
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "-0.025em",
          color: "var(--ink-1)",
        }}
      >
        Growth
      </h3>
      <p style={{ margin: "0 0 18px", fontSize: 13.5, color: "var(--ink-2)" }}>
        Renova em 12 de agosto · cobrança anual
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Badge tone="success">Ativo</Badge>
        <Button variant="secondary" size="sm">
          Gerenciar plano
        </Button>
      </div>
    </Card>
  ),
};
