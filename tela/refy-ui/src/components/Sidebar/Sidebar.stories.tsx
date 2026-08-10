import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";
import { Icons } from "../../_demo/icons";

const meta = {
  title: "Components/Organisms/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composição viva: workspace é um `WorkspaceSwitcher`, CTA é `Button`, contadores são `Badge` e a conta é um `UserMenu` que abre para cima. Clicar num item muda o ativo (`defaultActiveId`). Colapsada, workspace/conta viram avatares que EXPANDEM a sidebar antes de abrir.",
      },
    },
  },
  argTypes: {
    defaultCollapsed: { control: "boolean" },
    defaultMode: { control: "inline-radio", options: ["expanded", "rail", "compact"] },
    defaultActiveId: { control: "text" },
    workspaces: { control: false },
    account: { control: false },
    cta: { control: false },
    groups: { control: false },
  },
  args: {
    brand: "dommus",
    defaultActiveId: "dashboard",
    workspaces: [
      { id: "horizonte", name: "Horizonte Imóveis", role: "Imobiliária · Pro", initials: "HI" },
      { id: "coimbra", name: "Vinícius Coimbra", role: "Corretor autônomo", initials: "VC" },
      { id: "pampulha", name: "Pampulha Lar", role: "Imobiliária · Starter", initials: "PL" },
    ],
    account: { name: "João Mendes", email: "joao@globoeditorial.com", initials: "JM" },
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
  },
} satisfies Meta<typeof Sidebar>;
export default meta;

type Story = StoryObj<typeof Sidebar>;

/** Workspace switcher + user menu funcionais — clique neles. */
export const Expandida: Story = {};

/** Rail (72px): ícones e labels curtos, com os mesmos itens e badges. */
export const Rail: Story = { args: { defaultMode: "rail" } };

/** Compacta (56px): apenas ícones; labels permanecem em nome acessível e tooltip. */
export const Compacta: Story = { args: { defaultMode: "compact" } };
