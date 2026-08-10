import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TableOfContents } from "./TableOfContents";

const SECTIONS = [
  {
    id: "perfil",
    label: "Perfil",
    body: "Seu nome, foto e dados públicos do workspace. O nome aparece em comentários, menções e no histórico de atividades — mantenha-o reconhecível para o time. A foto é opcional, mas ajuda em times grandes.",
  },
  {
    id: "senha",
    label: "Senha",
    body: "Troque a senha periodicamente e nunca reutilize a de outros serviços. Uma senha forte tem 12+ caracteres, mistura maiúsculas, números e símbolos. Se você entrou por SSO, esta seção fica somente leitura.",
  },
  {
    id: "twofa",
    label: "Verificação em duas etapas",
    body: "A verificação em duas etapas protege sua conta mesmo que a senha vaze. Recomendamos app autenticador (TOTP) em vez de SMS. Guarde os códigos de recuperação em local seguro — cada um funciona uma única vez.",
  },
  {
    id: "conexoes",
    label: "Conexões",
    body: "Apps externos autorizados a acessar sua conta: calendário, e-mail, integrações de CRM. Revise esta lista de tempos em tempos e revogue o que não usa mais — cada conexão ativa é uma porta de acesso.",
  },
  {
    id: "sessoes",
    label: "Sessões ativas",
    body: "Todos os dispositivos com sessão aberta nesta conta, com navegador, IP aproximado e último acesso. Encerre sessões que você não reconhece imediatamente e troque a senha em seguida.",
  },
  {
    id: "excluir",
    label: "Excluir conta",
    body: "Ação permanente: remove seu acesso, transfere ou apaga seus dados conforme a política do workspace. Projetos dos quais você é o único dono precisam ser transferidos antes. Não há como desfazer.",
  },
];

const ITEMS = SECTIONS.map(({ id, label }) => ({ id, label }));

/**
 * `TableOfContents` — trilho "Nesta página" com scrollspy.
 */
const meta = {
  title: "Components/Molecules/TableOfContents",
  component: TableOfContents,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Trilho lateral de sumário de página longa (\"Nesta página\"). Recebe âncoras `{id, label}` na ordem da página e destaca a seção visível via scrollspy (IntersectionObserver). Clique rola suave até a âncora (instantâneo com `prefers-reduced-motion`). Passe `activeId`/`onActiveChange` para controlar por fora — o scrollspy desliga sozinho. `level` (2/3) indenta subitens; `sticky` cola o trilho na rolagem; `root` aponta o scrollspy para um contêiner rolável próprio (padrão: viewport).",
          "",
          "**Onde usar:** coluna direita de páginas longas com várias seções — telas de settings (`settings_*`), documentação, formulários extensos divididos em seções com `id`.",
          "",
          "**Onde NÃO usar:** navegação entre PÁGINAS diferentes (use `SettingsSubnav` ou `Sidebar`); páginas curtas com 1–2 seções (ruído); dentro de modal/drawer; como tabs — TOC não troca conteúdo, só rola.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    scrollSpy: { control: "boolean" },
    sticky: { control: "boolean" },
    rootMargin: { control: "text" },
    onActiveChange: { action: "activeChange" },
    activeId: { control: false },
    defaultActiveId: { control: false },
    items: { control: false },
    root: { control: false },
  },
  args: { items: ITEMS },
} satisfies Meta<typeof TableOfContents>;
export default meta;

type Story = StoryObj<typeof TableOfContents>;

/**
 * Scrollspy vivo: role o CONTEÚDO no painel rolável abaixo (não a página) —
 * o item ativo do trilho acompanha a seção visível. O contêiner é passado ao
 * scrollspy via `root`. Clique num item para rolar suave até a seção.
 */
export const Playground: Story = {
  render: (args) => {
    const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
    return (
      <div
        ref={setScroller}
        data-testid="toc-scroller"
        style={{
          height: 420,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 200px",
          gap: 32,
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-default)",
          padding: "0 var(--space-6)",
          background: "var(--surface)",
        }}
      >
        <div>
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} style={{ minHeight: 340, paddingTop: 24 }}>
              <h2 style={{ fontFamily: "var(--font-headline)", color: "var(--ink-1)" }}>
                {s.label}
              </h2>
              <p style={{ color: "var(--ink-3)", maxWidth: 480, lineHeight: 1.6 }}>{s.body}</p>
              <p style={{ color: "var(--ink-3)", maxWidth: 480, lineHeight: 1.6 }}>
                Role este painel para ver o trilho ao lado acompanhar a seção visível.
              </p>
            </section>
          ))}
        </div>
        <div style={{ position: "sticky", top: 24, alignSelf: "start", paddingTop: 24 }}>
          <TableOfContents {...args} root={scroller} rootMargin="-24px 0px -60% 0px" />
        </div>
      </div>
    );
  },
};

/** Controlado — `activeId` vem do pai, scrollspy desligado. Playground simples. */
export const Controlado: Story = {
  render: (args) => {
    const [active, setActive] = useState("senha");
    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <TableOfContents {...args} activeId={active} onActiveChange={setActive} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
          activeId = {active}
        </code>
      </div>
    );
  },
};

/** Níveis — `level: 2`/`3` indentam subitens. */
export const ComNiveis: Story = {
  name: "Com níveis",
  args: {
    items: [
      { id: "perfil", label: "Perfil" },
      { id: "avatar", label: "Foto", level: 2 },
      { id: "dados", label: "Dados pessoais", level: 2 },
      { id: "senha", label: "Senha" },
      { id: "requisitos", label: "Requisitos", level: 2 },
      { id: "historico", label: "Histórico", level: 3 },
    ],
    defaultActiveId: "dados",
    scrollSpy: false,
  },
};

/** Rótulo customizado. */
export const RotuloCustom: Story = {
  name: "Rótulo customizado",
  args: { label: "Neste guia", defaultActiveId: "conexoes", scrollSpy: false },
};
