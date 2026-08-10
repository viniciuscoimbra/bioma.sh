import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SettingsSubnav } from "./SettingsSubnav";
import type { SettingsSubnavGroup } from "./SettingsSubnav";

const GROUPS: SettingsSubnavGroup[] = [
  {
    title: "Pessoal",
    items: [
      { href: "#account", label: "Conta", description: "Perfil, senha, 2FA" },
      { href: "#general", label: "Geral", description: "Idioma, tema, notificações" },
    ],
  },
  {
    title: "Ambiente",
    items: [
      { href: "#workspace", label: "Ambiente", description: "Nome, domínio, logo" },
      { href: "#team", label: "Time", description: "Membros e papéis" },
      { href: "#projects", label: "Projetos", description: "Áreas de trabalho do time" },
      { href: "#billing", label: "Cobrança", description: "Plano, pagamento, faturas" },
    ],
  },
  {
    title: "Integrações",
    items: [
      { href: "#connectors", label: "Conectores", description: "Apps externos" },
      { href: "#api", label: "API & Webhooks", description: "Chaves e endpoints" },
    ],
  },
];

const gearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const userIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/**
 * `SettingsSubnav` — menu secundário vertical de subpáginas do mesmo assunto.
 */
const meta = {
  title: "Components/Molecules/SettingsSubnav",
  component: SettingsSubnav,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: { default: "surface-2" },
    docs: {
      description: {
        component: [
          "Menu secundário vertical de subpáginas do MESMO assunto (ex.: Configurações → Conta/Geral/Time/Projetos) — a coluna esquerda das telas `settings_*`. Cada item é um link real (`{href, label, icon?, description?}`); o item cujo `href` casa com `activeHref` recebe `aria-current=\"page\"`. `renderLink` injeta o Link do router (Next etc.) sem acoplar a lib; `groups` agrupa com título de seção.",
          "",
          "**Onde usar:** navegação entre subpáginas irmãs de uma área (settings, admin, perfil) — cada item é uma ROTA própria (regra pétrea: CRUD/entidade = página roteada).",
          "",
          "**Onde NÃO usar:** navegação principal do app (use `Sidebar`); seções DENTRO de uma página (use `TableOfContents`); troca de conteúdo sem mudar rota (use `Tabs`); menus de ação (use `Menu`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    activeHref: { control: "text", description: "href do item ativo." },
    label: { control: "text", description: "aria-label do nav." },
    items: { control: false },
    groups: { control: false },
    renderLink: { control: false },
    onNavigate: { action: "navigate" },
  },
} satisfies Meta<typeof SettingsSubnav>;
export default meta;

type Story = StoryObj<typeof SettingsSubnav>;

/** Agrupado com descrições — réplica da coluna das telas `settings_*`. */
export const Playground: Story = {
  args: { groups: GROUPS, activeHref: "#account" },
  render: (args) => (
    <div style={{ width: 220, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
      <SettingsSubnav {...args} />
    </div>
  ),
};

/** Flat — só `items`, sem grupos nem descrição. */
export const Flat: Story = {
  args: {
    items: [
      { href: "#conta", label: "Conta" },
      { href: "#geral", label: "Geral" },
      { href: "#time", label: "Time" },
      { href: "#projetos", label: "Projetos" },
    ],
    activeHref: "#geral",
  },
  render: (args) => (
    <div style={{ width: 200, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
      <SettingsSubnav {...args} />
    </div>
  ),
};

/** Com ícones via prop ReactNode (ícones nunca são bundleados). */
export const ComIcones: Story = {
  name: "Com ícones",
  args: {
    items: [
      { href: "#conta", label: "Conta", icon: userIcon, description: "Perfil, senha, 2FA" },
      { href: "#geral", label: "Geral", icon: gearIcon, description: "Idioma, tema" },
    ],
    activeHref: "#conta",
  },
  render: (args) => (
    <div style={{ width: 220, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
      <SettingsSubnav {...args} />
    </div>
  ),
};

/**
 * `renderLink` injetável — aqui simulando um Link de router que intercepta a
 * navegação e troca o ativo por estado (mesma assinatura do Next `<Link>`).
 */
export const RenderLinkInjetado: Story = {
  name: "renderLink injetado (router)",
  args: { groups: GROUPS },
  render: (args) => {
    const [active, setActive] = useState("#account");
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ width: 220, padding: 16, background: "var(--surface-2)", borderRadius: 8 }}>
          <SettingsSubnav
            {...args}
            activeHref={active}
            renderLink={(item, p) => (
              <a
                {...p}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(item.href);
                }}
              />
            )}
          />
        </div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
          rota atual: {active}
        </code>
      </div>
    );
  },
};
