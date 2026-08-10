import type { Meta, StoryObj } from "@storybook/react";
import { FlowScope } from "./BackofficeAgencyFlow";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Imobiliária/Visão geral",
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

export const H02AgencyArea: Story = {
  args: {
    id: "H02",
    title: "Visão geral da imobiliária",
    entry: "Entrada autenticada no sistema da imobiliária.",
    purpose:
      "Pendências, operação recente e atalhos para as áreas usadas pela equipe.",
    requirements: [
      "Resumir pendências e atividade recente.",
      "Abrir equipe, imóveis e negociações.",
      "Representar estados sem atividade e com falha de carregamento.",
      "Exibir a aprovação agency-approval-001 registrada no evento EVT-AGENCY-APPROVED-001.",
    ],
    result: "Usuário direcionado à próxima tarefa da imobiliária.",
  },
};
