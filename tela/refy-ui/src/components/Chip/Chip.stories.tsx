import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

function ChipShowcase({ theme }: { theme: "light" | "dark" }) {
  const [severities, setSeverities] = useState(["critical"]);
  const [period, setPeriod] = useState("7");
  const [active, setActive] = useState(["Severidade: crítico", "DA > 50", "Idioma: pt-BR"]);
  const severity = [
    { id: "critical", label: "Críticos", count: 8, tone: "critical" as const },
    { id: "warning", label: "Médios", count: 14, tone: "warning" as const },
    { id: "success", label: "Resolvidos", count: 23, tone: "success" as const },
    { id: "info", label: "Em progresso", count: 5, tone: "info" as const },
  ];

  return (
    <section data-theme={theme} style={{ padding: 32, color: "var(--ink-1)", background: "var(--bg)" }}>
      <span style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>Components · Forms · {theme}</span>
      <h3 style={{ margin: "6px 0 4px", fontFamily: "var(--font-headline)", fontSize: 22 }}>Filter chip</h3>
      <p style={{ maxWidth: "56ch", margin: "0 0 22px", color: "var(--ink-3)", fontSize: 12.5, lineHeight: 1.55 }}>Toggle, seleção única, severidade, contador e remoção no mesmo átomo.</p>

      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ padding: 22, border: "1px solid var(--line)", borderRadius: 14, background: "var(--surface)" }}>
          <span style={{ display: "block", marginBottom: 14, color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>Filtro · severidade</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {severity.map((item) => <Chip key={item.id} tone={item.tone} count={item.count} showCheck selected={severities.includes(item.id)} onClick={() => setSeverities((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{item.label}</Chip>)}
          </div>
        </div>

        <div style={{ padding: 22, border: "1px solid var(--line)", borderRadius: 14, background: "var(--surface)" }}>
          <span style={{ display: "block", marginBottom: 14, color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>Filtro · única seleção</span>
          <div role="radiogroup" aria-label="Período" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["all", "Tudo"]].map(([id, label]) => <Chip key={id} selectionMode="radio" showCheck selected={period === id} onClick={() => setPeriod(id)}>{label}</Chip>)}
          </div>
        </div>

        <div style={{ padding: 22, border: "1px solid var(--line)", borderRadius: 14, background: "var(--surface)" }}>
          <span style={{ display: "block", marginBottom: 14, color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" }}>Filtro · ativo + removível</span>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {active.map((label) => <Chip key={label} selected removable onRemove={() => setActive((items) => items.filter((item) => item !== label))}>{label}</Chip>)}
          </div>
        </div>
      </div>
    </section>
  );
}

const meta = {
  title: "Components/Atoms/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    selected: { control: "boolean" },
    removable: { control: "boolean" },
    count: { control: "number" },
    tone: { control: "inline-radio", options: ["neutral", "critical", "warning", "success", "info"] },
    selectionMode: { control: "inline-radio", options: ["toggle", "radio"] },
    showCheck: { control: "boolean" },
    children: { control: "text" },
    onRemove: { control: false },
  },
} satisfies Meta<typeof Chip>;
export default meta;

type Story = StoryObj<typeof Chip>;

export const FiltrosDeSeveridade: Story = {
  render: () => {
    const [sel, setSel] = useState("criticos");
    const filtros = [
      { id: "todos", label: "Todos", count: 87 },
      { id: "criticos", label: "Críticos", count: 12 },
      { id: "medios", label: "Médios", count: 34 },
      { id: "resolvidos", label: "Resolvidos", count: 41 },
    ];
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {filtros.map((f) => (
          <Chip key={f.id} selected={sel === f.id} count={f.count} onClick={() => setSel(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>
    );
  },
};

export const Removivel: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Chip selected removable onRemove={() => {}}>Economia</Chip>
      <Chip selected removable onRemove={() => {}}>Beleza</Chip>
      <Chip selected removable onRemove={() => {}}>Política</Chip>
    </div>
  ),
};

export const VariacoesDoHandoff: Story = {
  name: "Variações · toggle, radio e removível",
  render: () => <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}><ChipShowcase theme="light" /><ChipShowcase theme="dark" /></div>,
  parameters: { layout: "fullscreen" },
};
