import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../Breadcrumb";
import { Button } from "../Button";
import { SplitButton } from "../SplitButton";
import { PageHeader } from "./PageHeader";

/**
 * `PageHeader` — cabeçalho de página do app: eyebrow mono + `<h1>` + lead +
 * ações à direita, com slot de `Breadcrumb` em cima.
 */
const meta = {
  title: "Components/Molecules/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Cabeçalho de página (padrão `.ph`/`.shell-page-*` das telas de referência). `eyebrow` mono uppercase opcional, `title` vira o `<h1>` da página, `lead` é a descrição (máx. 62ch) e `actions` recebe `Button`/`SplitButton` alinhados à direita. O slot `breadcrumb` recebe o átomo `Breadcrumb` — regra do PO: breadcrumb sempre no header, sempre com volta ao pai (todo nível anterior tem `href`).",
          "",
          "**Onde usar:** no topo de TODA página roteada do app — dashboard, listas de entidades, cada tela de configurações. É o único lugar do `<h1>`.",
          "",
          "**Onde NÃO usar:** títulos de seção dentro da página (use `SectionHeader`); cabeçalho de card (use `Card` com `title`); cabeçalho de modal/drawer (o `Modal`/`Drawer` já tem o próprio); barra superior do app (use `Topbar`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    eyebrow: { control: "text", description: "Eyebrow mono uppercase acima do título." },
    title: { control: "text", description: "Título da página (`<h1>`)." },
    lead: { control: "text", description: "Descrição sob o título (máx. 62ch)." },
    actions: { control: false, description: "Slot de ações (`Button`/`SplitButton`)." },
    breadcrumb: { control: false, description: "Slot do átomo `Breadcrumb` (em cima)." },
  },
} satisfies Meta<typeof PageHeader>;
export default meta;

type Story = StoryObj<typeof PageHeader>;

/** Playground — eyebrow + título + lead + ações (padrão do dashboard). */
export const Playground: Story = {
  args: {
    eyebrow: "Ambiente · última análise há 14min",
    title: "Visão geral",
    lead: "3 projetos · 12 análises este mês · 8 tarefas no backlog",
    actions: (
      <>
        <Button variant="secondary">Exportar</Button>
        <Button variant="primary">Nova análise</Button>
      </>
    ),
  },
};

/** Com breadcrumb — trilha em cima, com volta ao pai (regra do PO). */
export const ComBreadcrumb: Story = {
  name: "Com breadcrumb",
  args: {
    breadcrumb: (
      <Breadcrumb
        items={[
          { label: "Configurações", href: "#config" },
          { label: "Pessoal", href: "#pessoal" },
          { label: "Conta" },
        ]}
      />
    ),
    title: "Conta",
    lead: "Seu perfil, provedores de login e sessões ativas neste ambiente.",
    actions: <Button variant="secondary">Salvar alterações</Button>,
  },
};

/** Só título — página simples, sem eyebrow/lead/ações. */
export const SoTitulo: Story = {
  name: "Só título",
  args: { title: "Preferências" },
};

/** Com SplitButton — ação principal + menu de variações (ex.: exportar). */
export const ComSplitButton: Story = {
  name: "Com SplitButton",
  args: {
    eyebrow: "Projeto · globoeditorial.com",
    title: "Relatórios",
    lead: "Análises consolidadas do projeto, prontas para exportar.",
    actions: (
      <SplitButton
        label="Exportar PDF"
        options={[
          { label: "Exportar CSV", hint: ".csv", onSelect: () => {} },
          { label: "Exportar JSON", hint: ".json", onSelect: () => {} },
        ]}
        onClick={() => {}}
      />
    ),
  },
};
