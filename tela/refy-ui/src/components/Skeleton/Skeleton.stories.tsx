import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

/**
 * `Skeleton` — placeholder com shimmer enquanto o conteúdo carrega.
 */
const meta = {
  title: "Components/Atoms/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Bloco de 14px por padrão (linha de texto); componha vários para cards e listas. `circle` para avatares. Marque o container real com `aria-busy` enquanto carrega; o shimmer congela com `prefers-reduced-motion`.",
      },
    },
  },
  argTypes: {
    width: { control: "text" },
    height: { control: "text" },
    circle: { control: "boolean" },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof Skeleton>;

/** Linha de texto. */
export const Playground: Story = {
  args: { width: 220 },
};

/** Card em carregamento — avatar + título + linhas. */
export const CardLoading: Story = {
  name: "Card em carregamento",
  render: () => (
    <div
      aria-busy="true"
      style={{
        width: 320,
        padding: 16,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton circle width={32} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width="60%" />
          <Skeleton width="35%" height={10} />
        </div>
      </div>
      <Skeleton />
      <Skeleton width="85%" />
      <Skeleton width="70%" />
    </div>
  ),
};

/** Catálogo de composições para os componentes usados nas telas. */
export const CatalogoDeComponentes: Story = {
  name: "Catálogo · componentes",
  render: () => (
    <div aria-busy="true" style={{ width: "min(920px, 92vw)", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
      {[
        ["Botões", <div style={{ display: "flex", gap: 8 }}><Skeleton width={112} height={40} /><Skeleton width={112} height={40} /></div>],
        ["Campo", <div style={{ display: "grid", gap: 7 }}><Skeleton width={90} height={10} /><Skeleton height={44} /></div>],
        ["Avatar e usuário", <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Skeleton circle width={40} /><div style={{ flex: 1, display: "grid", gap: 6 }}><Skeleton width="55%" /><Skeleton width="38%" height={10} /></div></div>],
        ["Stat", <div style={{ display: "grid", gap: 8 }}><Skeleton width={80} height={10} /><Skeleton width={140} height={34} /><Skeleton width={110} height={10} /></div>],
        ["Linha de tabela", <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}><Skeleton /><Skeleton /><Skeleton /></div>],
        ["Item de timeline", <div style={{ display: "flex", gap: 12 }}><Skeleton circle width={32} /><div style={{ flex: 1, display: "grid", gap: 8 }}><Skeleton width="62%" /><Skeleton /><Skeleton width="78%" /></div></div>],
        ["Card de imóvel", <div style={{ display: "grid", gap: 12 }}><Skeleton height={160} /><Skeleton width="72%" height={20} /><Skeleton width="42%" /><div style={{ display: "flex", gap: 8 }}><Skeleton width={84} height={28} /><Skeleton width={84} height={28} /></div></div>],
        ["Agenda", <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>{Array.from({ length: 12 }, (_, index) => <Skeleton key={index} height={36} />)}</div>],
      ].map(([label, preview]) => (
        <section key={label as string} style={{ minWidth: 0, padding: 16, border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", background: "var(--surface)" }}>
          <p style={{ margin: "0 0 14px", color: "var(--ink-2)", fontSize: 12, fontWeight: 700 }}>{label}</p>
          {preview}
        </section>
      ))}
    </div>
  ),
};
