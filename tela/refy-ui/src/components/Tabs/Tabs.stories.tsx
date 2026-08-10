import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Molecules/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    items: { control: false },
    variant: { control: "inline-radio", options: ["underline", "pill"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Tabs>;
export default meta;

type Story = StoryObj<typeof Tabs>;

const items = [
  { id: "geral", label: "Visão geral", content: <p style={{ color: "var(--ink-2)" }}>Painel de cobertura.</p> },
  { id: "issues", label: "Issues", badge: 14, content: <p style={{ color: "var(--ink-2)" }}>14 issues mapeadas.</p> },
  { id: "backlog", label: "Backlog", badge: 23, content: <p style={{ color: "var(--ink-2)" }}>Backlog priorizado.</p> },
  { id: "hist", label: "Histórico", content: <p style={{ color: "var(--ink-2)" }}>Análises anteriores.</p> },
];

export const Sublinhado: Story = { args: { items, variant: "underline" } };
export const Pilula: Story = { args: { items, variant: "pill" } };

/** Use os estados apenas quando cada aba representa uma parte salva de forma independente. */
export const EstadosDoCadastro: Story = {
  name: "Estados do cadastro",
  args: {
    items: [
      { id: "empresa", label: "Empresa", status: "complete", content: <p>Dados da empresa salvos.</p> },
      { id: "contato", label: "Endereço e contato", content: <p>Parte ainda não preenchida.</p> },
      { id: "responsavel", label: "Responsável", status: "warning", content: <p>Há campos que precisam de atenção.</p> },
      { id: "documentos", label: "Documentos", content: <p>Documentos ainda não enviados.</p> },
    ],
  },
};

export const Vertical: Story = {
  args: {
    items: [
      ...items.slice(0, 2),
      { id: "indisponivel", label: "Indisponível", disabled: true, content: null },
      ...items.slice(2),
    ],
    orientation: "vertical",
  },
};

export const ConteudoExtremo: Story = {
  name: "Conteúdo extremo",
  decorators: [(Story) => <div style={{ width: 420, maxWidth: "100%" }}><Story /></div>],
  args: {
    items: [
      { id: "curto", label: "Geral", content: <p style={{ color: "var(--ink-2)" }}>Conteúdo curto.</p> },
      { id: "longo", label: "Clientes aguardando a confirmação definitiva de visita", badge: 128, content: <p style={{ color: "var(--ink-2)", maxWidth: 760 }}>Uma aba deliberadamente longa permanece em uma linha e a lista ganha rolagem horizontal silenciosa quando necessário.</p> },
      { id: "outro", label: "Histórico completo de atribuição e atendimento", content: <p style={{ color: "var(--ink-2)" }}>Histórico.</p> },
    ],
    variant: "underline",
  },
};
