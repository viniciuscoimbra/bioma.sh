import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Topbar } from "./Topbar";
import { Command, type CommandItem } from "../Command";
import { HelpMenu } from "../HelpMenu";
import { NotificationBell, type NotificationItem } from "../NotificationBell";
import { UserMenu } from "../UserMenu";

const notifications: NotificationItem[] = [
  { id: "n1", title: "Análise concluída", description: "refy.com.br: 84 páginas, 12 críticos.", time: "há 5min", unread: true },
  { id: "n2", title: "Concorrente subiu 4 posições", description: "rdstation.com para 'seo técnico'.", time: "há 2h", unread: true },
  { id: "n3", title: "Convite aceito", description: "Ana Costa entrou no ambiente.", time: "há 3d" },
];

const commands: CommandItem[] = [
  { id: "new", label: "Iniciar nova análise", group: "Ações", shortcut: "⌘N" },
  { id: "rerun", label: "Re-rodar última análise", group: "Ações", shortcut: "⌘R" },
  { id: "rd", label: "rdstation.com", group: "Domínios recentes", lead: "RD" },
];

/**
 * `Topbar` — barra superior global. Composição pura: `Breadcrumb` à esquerda,
 * a busca é o trigger do `Command` (⌘K) e as ações compõem `NotificationBell`,
 * `HelpMenu` e `UserMenu`.
 */
const meta = {
  title: "Components/Organisms/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tudo funcional nesta story: clique na busca (ou ⌘K) para abrir a paleta `Command`; o sino abre o painel de notificações (clicar numa marca como lida); o \"?\" abre o `HelpMenu`; o avatar abre o `UserMenu`.",
      },
    },
  },
  argTypes: {
    crumbs: { control: false },
    brand: { control: "inline-radio", options: ["refy", "dommus"] },
    composition: { control: "inline-radio", options: ["search", "tabs", "dense"] },
    searchPlaceholder: { control: "text" },
    onSearchClick: { control: false },
    tabs: { control: false },
    segments: { control: false },
    actions: { control: false },
  },
} satisfies Meta<typeof Topbar>;
export default meta;

type Story = StoryObj<typeof Topbar>;

/** Topbar viva — todos os componentes integrados e funcionando juntos. */
export const Padrao: Story = {
  render: () => {
    const [commandOpen, setCommandOpen] = useState(false);
    const [items, setItems] = useState(notifications);
    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setCommandOpen(true);
        }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (
      <div style={{ minHeight: 480 }}>
        <Topbar
          brand="dommus"
          crumbs={[{ label: "Globo Editorial", href: "#" }, { label: "Visão geral" }]}
          onSearchClick={() => setCommandOpen(true)}
          actions={
            <>
              <NotificationBell
                items={items}
                onItemClick={(item) =>
                  setItems((l) => l.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))
                }
                onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, unread: false })))}
              />
              <HelpMenu />
              <UserMenu user={{ name: "João Mendes", email: "joao@globoeditorial.com", initials: "JM" }} compact />
            </>
          }
        />
        <p style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          Clique na busca ou pressione ⌘K · sino, ajuda e avatar também abrem.
        </p>
        <Command open={commandOpen} onOpenChange={setCommandOpen} items={commands} />
      </div>
    );
  },
};

const appTabs = [
  { id: "visao", label: "Visão" },
  { id: "clientes", label: "Clientes", badge: 18 },
  { id: "imoveis", label: "Imóveis" },
  { id: "visitas", label: "Visitas", badge: 4 },
];

/** Composição com Tabs pill canônico e navegação real. */
export const TabsPill: Story = {
  render: () => {
    const [tab, setTab] = useState("visao");
    return (
      <div style={{ minHeight: 360 }}>
        <Topbar
          brand="dommus"
          composition="tabs"
          crumbs={[{ label: "Carteira" }, { label: "Visão geral" }]}
          tabs={appTabs}
          tabValue={tab}
          onTabChange={setTab}
          actions={<UserMenu user={{ name: "Vinícius Coimbra", email: "vinicius@dommus.app", initials: "VC" }} compact />}
        />
        <p role="status" style={{ padding: 24, color: "var(--ink-2)" }}>Área ativa: {tab}.</p>
      </div>
    );
  },
};

/** Composição densa com Segmented canônico. */
export const DensaSegmentada: Story = {
  render: () => {
    const [view, setView] = useState("lista");
    return (
      <div style={{ minHeight: 360 }}>
        <Topbar
          brand="dommus"
          composition="dense"
          crumbs={[{ label: "Clientes" }, { label: "18 ativos" }]}
          segments={[
            { value: "lista", label: "Lista" },
            { value: "kanban", label: "Kanban" },
            { value: "matriz", label: "Matriz" },
          ]}
          segmentValue={view}
          onSegmentChange={setView}
          actions={<UserMenu user={{ name: "Vinícius Coimbra", email: "vinicius@dommus.app", initials: "VC" }} compact />}
        />
        <p role="status" style={{ padding: 24, color: "var(--ink-2)" }}>Visualização: {view}.</p>
      </div>
    );
  },
};

/** Container estreito prova a resposta local da Topbar, sem depender da viewport da documentação. */
export const Responsiva: Story = {
  decorators: [(Story) => <div style={{ width: 390, maxWidth: "100%", borderRight: "1px solid var(--line)" }}><Story /></div>],
  render: () => (
    <div style={{ minHeight: 320 }}>
      <Topbar
        brand="dommus"
        crumbs={[{ label: "Carteira" }, { label: "Clientes com visitas agendadas nesta semana" }]}
        onSearchClick={() => {}}
        actions={<UserMenu user={{ name: "Vinícius Coimbra", email: "vinicius@dommus.app", initials: "VC" }} compact />}
      />
    </div>
  ),
};
