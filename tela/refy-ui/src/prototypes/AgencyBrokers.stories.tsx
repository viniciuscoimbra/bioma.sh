import type { Meta, StoryObj } from "@storybook/react";
import { FlowScope } from "./BackofficeAgencyFlow";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Imobiliária/Corretores",
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

export const T09AAffiliationRequests: Story = {
  args: {
    id: "T09A",
    title: "Solicitações de vínculo",
    entry: "Menu Corretores da Imobiliária.",
    purpose:
      "Pedidos de corretores para entrar na imobiliária, com aceite, recusa e histórico.",
    requirements: [
      "Listar solicitações pendentes e concluídas.",
      "Aceitar ou recusar com confirmação.",
      "Refletir a decisão no corretor e na equipe da imobiliária.",
    ],
    result: "Solicitação decidida e vínculo sincronizado.",
  },
};
