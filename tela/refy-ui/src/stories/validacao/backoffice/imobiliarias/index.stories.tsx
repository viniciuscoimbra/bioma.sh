import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "../../../../prototypes/BackofficeOperationalPages";
import { validationViewports } from "../../../../prototypes/productValidationFixtures";

const meta = {
  title: "Validação de Produto/Backoffice/Imobiliárias",
  component: BackofficeOperationalPage,
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports, defaultViewport: "desktop1440" } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof BackofficeOperationalPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inventario: Story = {
  name: "Inventário",
  args: {
    title: "Inventário de telas de imobiliárias",
    lead: "Cobertura das telas, estados e ações do fluxo cadastral.",
    sectionTitle: "Cobertura atual",
    sectionLead: "Cada linha aponta o que já existe e o que ainda precisa de revisão.",
    primaryAction: "Revisar pendências",
    resultMessage: "Pendências abertas",
    rows: [
      { title: "T01 · Lista", description: "Padrão, carregando, sem dados e erro.", meta: "4 stories", status: "Coberto", tone: "success" },
      { title: "T01A · Detalhe", description: "Análise, vínculos, ciclo e transferência.", meta: "4 stories", status: "Em revisão", tone: "warn" },
      { title: "T05 e T06 · Decisão", description: "Solicitação, aprovação e recusa.", meta: "3 stories", status: "Coberto", tone: "success" },
    ],
  },
};
