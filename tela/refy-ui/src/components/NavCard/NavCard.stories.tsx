import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { NavCard } from "./NavCard";

/**
 * `NavCard` — card de navegação clicável com chevron ">" (padrão do
 * workspace picker). O card inteiro é o alvo de clique/teclado.
 */
const meta = {
  title: "Components/Molecules/NavCard",
  component: NavCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Card de navegação clicável com chevron \">\" à direita. Com `href` vira `<a>` (navegação real); sem `href` vira `<button>` (ação via `onClick`). `leading` recebe `Avatar` ou ícone; `meta` recebe pill/contador; `current` marca o destino atual; `variant=\"dashed\"` é a variante de criação (\"criar novo…\").",
          "",
          "**Onde usar:** listas de destinos onde o item inteiro navega, inclusive origem de conta, vínculos com pessoas ou organizações, escolha de workspace, escolha de projeto, hub de configurações e \"criar novo X\" no fim de uma lista de entidades.",
          "",
          "**Onde NÃO usar:** configuração ou ação dentro da página atual (use `SettingRow`); linhas de dados com várias ações por linha (use `Table`); navegação persistente lateral (use `Sidebar` ou `SettingsSubnav`); card informativo sem navegação (use `Card`); ação pontual simples (use `Button`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Linha principal." },
    description: { control: "text", description: "Linha secundária opcional." },
    href: { control: "text", description: "Com href vira `<a>`; sem, `<button>`." },
    disabled: { control: "boolean" },
    current: { control: "boolean", description: "Destino atual (borda/fundo primários)." },
    variant: { control: "inline-radio", options: ["solid", "dashed"] },
    showChevron: { control: "boolean" },
    onClick: { action: "clicked" },
    leading: { control: false },
    meta: { control: false },
  },
} satisfies Meta<typeof NavCard>;
export default meta;

type Story = StoryObj<typeof NavCard>;

/** Playground — botão (sem href), com avatar e meta. */
export const Playground: Story = {
  args: {
    title: "Globo Editorial",
    description: "globoeditorial.com · Refy Pro · 4 membros",
    leading: <Avatar initials="GE" size="lg" />,
    meta: <span>Admin</span>,
  },
};

/** Como link — renderiza `<a href>`; navegação nativa por teclado. */
export const ComoLink: Story = {
  name: "Como link (href)",
  args: {
    title: "Flora Bem-Estar",
    description: "florabemestar.com.br · Refy Starter",
    leading: <Avatar initials="FB" size="lg" />,
    href: "#flora",
  },
};

/** Destino atual — `current` liga borda/fundo primários + `aria-current`. */
export const Atual: Story = {
  args: {
    title: "Globo Editorial",
    description: "Ambiente em que você está agora",
    leading: <Avatar initials="GE" size="lg" />,
    current: true,
    href: "#atual",
  },
};

/** Desabilitado — sem clique nem foco por Tab (link) / `disabled` (botão). */
export const Desabilitado: Story = {
  args: {
    title: "Estúdio Papel",
    description: "Convite pendente. Aguarde a aprovação do administrador",
    leading: <Avatar initials="EP" size="lg" />,
    disabled: true,
  },
};

/** Variante tracejada — ação de criação no fim de uma lista. */
export const CriarNovo: Story = {
  name: "Criar novo (dashed)",
  args: {
    title: "Criar novo ambiente",
    description: "Para um novo site, cliente ou marca. Plano e faturamento separados.",
    variant: "dashed",
    leading: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
};

/** Lista completa — composição igual à tela `workspace_picker`. */
export const ListaDeWorkspaces: Story = {
  name: "Lista de ambientes",
  args: { title: "" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 560 }}>
      <NavCard
        title="Globo Editorial"
        description="globoeditorial.com · Refy Pro · 4 membros · 3 projetos"
        leading={<Avatar initials="GE" size="lg" />}
        meta={<span>Admin · proprietário</span>}
        current
        href="#globo"
      />
      <NavCard
        title="Flora Bem-Estar"
        description="florabemestar.com.br · Refy Starter · 1 membro"
        leading={<Avatar initials="FB" size="lg" />}
        meta={<span>Admin</span>}
        href="#flora"
      />
      <NavCard
        title="Criar novo ambiente"
        description="Para um novo site, cliente ou marca."
        variant="dashed"
        leading={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
      />
    </div>
  ),
};
