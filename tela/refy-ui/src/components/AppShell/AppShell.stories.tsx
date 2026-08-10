import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";
import { Card } from "../Card";
import { Button } from "../Button";
import { Command, type CommandItem } from "../Command";
import { HelpMenu } from "../HelpMenu";
import { NotificationBell, type NotificationItem } from "../NotificationBell";
import { UserMenu } from "../UserMenu";
import type { Workspace } from "../WorkspaceSwitcher";
import { Icons } from "../../_demo/icons";

const workspaces: Workspace[] = [
  { id: "horizonte", name: "Horizonte Imóveis", role: "Imobiliária · Pro", initials: "HI" },
  { id: "coimbra", name: "Vinícius Coimbra", role: "Corretor autônomo", initials: "VC" },
  { id: "pampulha", name: "Pampulha Lar", role: "Imobiliária · Starter", initials: "PL" },
];

const notifications: NotificationItem[] = [
  { id: "n1", title: "Novo cliente interessado", description: "Marina guardou um apartamento no Itapoã.", time: "há 5min", unread: true },
  { id: "n2", title: "Visita solicitada", description: "Três horários foram enviados para confirmação.", time: "há 2h", unread: true },
  { id: "n3", title: "Corretor associado", description: "Ana Costa entrou na imobiliária.", time: "há 3d" },
];

const commands: CommandItem[] = [
  { id: "new", label: "Cadastrar cliente", group: "Ações", shortcut: "⌘N" },
  { id: "visit", label: "Ver próximas visitas", group: "Ações", shortcut: "⌘V" },
  { id: "property", label: "Apartamento · Itapoã", group: "Imóveis recentes", lead: "IT" },
];

const user = { name: "João Mendes", email: "joao@globoeditorial.com", initials: "JM" };

const sidebar = {
  brand: "dommus",
  defaultActiveId: "dashboard",
  workspaces,
  account: user,
  cta: { label: "Novo cliente", icon: Icons.plus },
  groups: [
    {
      section: "Trabalho",
      items: [
        { id: "dashboard", label: "Visão geral", icon: Icons.dashboard },
        { id: "projects", label: "Imóveis", icon: Icons.projects },
        { id: "backlog", label: "Clientes", icon: Icons.backlog, badge: 12 },
        { id: "monitor", label: "Visitas", icon: Icons.monitor },
        { id: "competitors", label: "Leads", icon: Icons.competitors },
      ],
    },
    {
      section: "Sistema",
      items: [
        { id: "notifications", label: "Notificações", icon: Icons.bell, badge: 3 },
        { id: "settings", label: "Configurações", icon: Icons.settings },
      ],
    },
  ],
};

const meta = {
  title: "Components/Organisms/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    sidebar: { control: false },
    topbar: { control: false },
    contentMaxWidth: { control: "number" },
    children: { control: false },
  },
} satisfies Meta<typeof AppShell>;
export default meta;

type Story = StoryObj<typeof AppShell>;

/**
 * Layout completo do app autenticado — pura composição dos componentes reais:
 * Sidebar (WorkspaceSwitcher + UserMenu), Topbar (Breadcrumb + trigger do
 * Command), NotificationBell, HelpMenu e a paleta ⌘K funcional.
 */
export const Completo: Story = {
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
      <>
        <AppShell
          sidebar={sidebar}
          topbar={{
            crumbs: [{ label: "Horizonte Imóveis", href: "#" }, { label: "Visão geral" }],
            onSearchClick: () => setCommandOpen(true),
            actions: (
              <>
                <NotificationBell
                  items={items}
                  onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, unread: false })))}
                />
                <HelpMenu />
                <UserMenu user={user} compact />
              </>
            ),
          }}
        >
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".16em", color: "var(--ink-3)", margin: "0 0 8px" }}>
            Imobiliária · Horizonte Imóveis
          </p>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: 30, fontWeight: 700, letterSpacing: "-.025em", color: "var(--ink-1)", margin: "0 0 20px" }}>
            Visão geral
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
            <Card><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink-3)" }}>Clientes ativos</div><div style={{ fontFamily: "var(--font-headline)", fontSize: 26, fontWeight: 600, color: "var(--ink-1)", marginTop: 6 }}>128</div></Card>
            <Card><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink-3)" }}>Visitas · semana</div><div style={{ fontFamily: "var(--font-headline)", fontSize: 26, fontWeight: 600, color: "var(--ink-1)", marginTop: 6 }}>24</div></Card>
            <Card><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--ink-3)" }}>Imóveis ativos</div><div style={{ fontFamily: "var(--font-headline)", fontSize: 26, fontWeight: 600, color: "var(--ink-1)", marginTop: 6 }}>386</div></Card>
          </div>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--ink-1)", fontSize: 14 }}>Novo cliente</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>Cadastre o perfil e encontre imóveis compatíveis.</div>
              </div>
              <Button variant="primary" leadingIcon={Icons.plus}>Cadastrar cliente</Button>
            </div>
          </Card>
        </AppShell>
        <Command open={commandOpen} onOpenChange={setCommandOpen} items={commands} />
      </>
    );
  },
};
