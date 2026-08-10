import type { Meta, StoryObj } from "@storybook/react";
import { FlowScope } from "./BackofficeAgencyFlow";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Corretor/Visão geral",
  component: FlowScope,
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: validationViewports,
      defaultViewport: "desktop1440",
    },
  },
  globals: {
    theme: "dommus-admin",
  },
} satisfies Meta<typeof FlowScope>;

export default meta;
type Story = StoryObj;

export const H03PersonalOperation: Story = {
  args: {
    id: "H03",
    title: "Visão geral do corretor",
    entry: "Entrada autenticada no sistema do corretor.",
    purpose:
      "Pendências, imóveis e negociações da operação pessoal do corretor.",
    requirements: [
      "Resumir pendências, imóveis e negociações.",
      "Separar operação pessoal dos vínculos com imobiliárias.",
      "Representar estados sem atividade e com falha de carregamento.",
    ],
    result: "Corretor direcionado à próxima tarefa da operação pessoal.",
  },
};
