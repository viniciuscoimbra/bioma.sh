import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChoiceCard, ChoiceCardGroup } from "./ChoiceCard";

/** `ChoiceCard` — card selecionável com semântica de radio/checkbox. */
const meta = {
  title: "Components/Molecules/ChoiceCard",
  component: ChoiceCardGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Card-como-radio (ou checkbox, `mode=\"multiple\"`): título + descrição + ícone/preview + meta. Grupo com navegação por teclado — roving tabindex no modo single (setas movem E selecionam, como radio nativo; Home/End vão às pontas). Seleção com anel primário e transição por tokens de motion.",
          "",
          "**Onde usar:** escolha de tema (claro/escuro/sistema), pacotes de créditos com preço, propriedades no fluxo GSC, e o caso futuro dos **perfis do motor de recomendação — Criterioso / Equilibrado / Explorador** (uma escolha, cada opção com nome + descrição do comportamento).",
          "",
          "**Onde NÃO usar:** escolha simples sem descrição/preview (use `RadioGroup`); alternância compacta em toolbar (use `Segmented`/`ToggleGroup`); card que navega (use `NavCard`); plano com CTA próprio (use `PlanCard`).",
        ].join("\n"),
      },
    },
  },
  args: { mode: "single", columns: 3, label: "Opções" },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "multiple"] },
    columns: { control: { type: "number", min: 1, max: 4 } },
    label: { control: "text" },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ChoiceCardGroup>;
export default meta;

type Story = StoryObj<typeof ChoiceCardGroup>;

const themePreview = (bg: string, fg: string, label: string) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      alignSelf: "stretch",
      minHeight: 78,
      background: bg,
      color: fg,
      fontFamily: "var(--font-headline)",
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

const roomPreview = (
  <svg viewBox="0 0 320 120" role="img" aria-label="Sala clara com janela e plantas" style={{ display: "block", width: "100%", minHeight: 78 }}>
    <rect width="320" height="120" fill="#e9f0f2" />
    <rect x="30" y="20" width="110" height="70" rx="4" fill="#b8d8ea" />
    <path d="M30 55h110M85 20v70" stroke="#fff" strokeWidth="4" />
    <rect x="172" y="55" width="105" height="44" rx="12" fill="#f47a42" />
    <circle cx="260" cy="37" r="18" fill="#76a66e" />
    <rect x="256" y="37" width="8" height="38" fill="#6b4a32" />
  </svg>
);

export const EscolhaDeTema: Story = {
  name: "Escolha de tema (single)",
  render: (args) => (
    <ChoiceCardGroup {...args} label="Tema da interface" defaultValue="light">
      <ChoiceCard
        value="light"
        title="Claro"
        description="Fundo branco, tinta escura."
        preview={themePreview("var(--surface)", "var(--ink-1)", "Aa")}
      />
      <ChoiceCard
        value="dark"
        title="Escuro"
        description="Tinta clara sobre fundo escuro."
        preview={themePreview("var(--legacy-ink-1)", "var(--brand-primary)", "Aa")}
      />
      <ChoiceCard
        value="system"
        title="Sistema"
        description="Segue a preferência do aparelho."
        preview={roomPreview}
      />
    </ChoiceCardGroup>
  ),
};

export const PacotesDeCreditos: Story = {
  name: "Pacotes de créditos (com meta/preço)",
  render: () => (
    <ChoiceCardGroup label="Pacote de créditos" defaultValue="200">
      <ChoiceCard value="100" title="100 créditos" description="Uso pontual." meta="R$ 90 · R$ 0,90/crédito" />
      <ChoiceCard value="200" title="200 créditos" description="Melhor custo-benefício." meta="R$ 160 · R$ 0,80/crédito" />
      <ChoiceCard value="500" title="500 créditos" description="Operação intensa." meta="R$ 350 · R$ 0,70/crédito" />
    </ChoiceCardGroup>
  ),
};

export const PerfisDeRecomendacao: Story = {
  name: "Perfis do motor de recomendação (caso futuro)",
  render: () => (
    <ChoiceCardGroup label="Perfil de recomendação" defaultValue="equilibrado">
      <ChoiceCard
        value="criterioso"
        title="Criterioso"
        description="Só recomenda com alta confiança; menos sugestões, mais certeiras."
      />
      <ChoiceCard
        value="equilibrado"
        title="Equilibrado"
        description="Balanceia confiança e cobertura; o default para a maioria."
      />
      <ChoiceCard
        value="explorador"
        title="Explorador"
        description="Sugere mais opções, inclusive apostas fora do padrão do cliente."
      />
    </ChoiceCardGroup>
  ),
};

export const MultiplaControlada: Story = {
  name: "Múltipla (checkbox) controlada",
  render: () => {
    const [values, setValues] = useState<string[]>(["globo"]);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <ChoiceCardGroup
          mode="multiple"
          columns={1}
          label="Propriedades do Search Console"
          value={values}
          onChange={(v) => setValues(v as string[])}
        >
          <ChoiceCard value="globo" title="sc-domain:globo.com" meta="42 mil cliques / 28d" />
          <ChoiceCard value="vogue" title="sc-domain:vogue.com.br" meta="8 mil cliques / 28d" />
          <ChoiceCard
            value="casavogue"
            title="sc-domain:casavogue.globo.com"
            meta="3 mil cliques / 28d"
          />
        </ChoiceCardGroup>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
          selecionadas: {values.join(", ") || "nenhuma"}
        </span>
      </div>
    );
  },
};

export const ComOpcaoDesabilitada: Story = {
  render: () => (
    <ChoiceCardGroup label="Plano de análise" defaultValue="padrao">
      <ChoiceCard value="padrao" title="Padrão" description="Análise completa do site." />
      <ChoiceCard value="rapida" title="Rápida" description="Só as páginas principais." />
      <ChoiceCard
        value="profunda"
        title="Profunda"
        description="Disponível no plano Growth."
        disabled
      />
    </ChoiceCardGroup>
  ),
};
