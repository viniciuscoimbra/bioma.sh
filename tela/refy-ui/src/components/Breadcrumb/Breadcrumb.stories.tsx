import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";

/**
 * `Breadcrumb` — trilha de navegação mono uppercase.
 */
const meta = {
  title: "Components/Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Trilha em uma linha com raiz icônica, links truncados e miolo colapsado em Menu navegável. O último item usa `aria-current=\"page\"`; separador é customizável.",
      },
    },
  },
  argTypes: {
    items: { control: false },
    separator: { control: "text" },
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

/** Três níveis com links. */
export const Playground: Story = {
  args: {
    items: [
      { label: "Projetos", href: "#projetos" },
      { label: "refy.com.br", href: "#refy" },
      { label: "SEO Técnico" },
    ],
  },
};

/** Separador customizado. */
export const SeparadorSeta: Story = {
  name: "Separador ›",
  args: {
    separator: "›",
    items: [
      { label: "Dashboard", href: "#dash" },
      { label: "Análises", href: "#analises" },
      { label: "84 páginas" },
    ],
  },
};

export const SeteNiveis: Story = {
  name: "7 níveis · colapso navegável",
  args: {
    root: { label: "Início", href: "#inicio" },
    items: [
      { label: "Workspaces", href: "#workspaces" },
      { label: "Imobiliária Horizonte", href: "#imobiliaria" },
      { label: "Clientes", href: "#clientes" },
      { label: "Vinícius Coimbra", href: "#cliente" },
      { label: "Buscas", href: "#buscas" },
      { label: "Imóveis ideais", href: "#imoveis" },
      { label: "Apartamento no Sion" },
    ],
  },
};

export const TermoLongo: Story = {
  name: "Label longo · truncamento",
  args: {
    root: { label: "Início", href: "#inicio" },
    items: [
      { label: "Imóveis", href: "#imoveis" },
      { label: "Apartamento de três quartos com varanda e duas vagas no Sion, Belo Horizonte" },
    ],
  },
  render: (args) => <div style={{ width: 420, overflow: "hidden" }}><Breadcrumb {...args} /></div>,
};
