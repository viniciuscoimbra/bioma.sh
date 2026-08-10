import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";
const meta = { id: "produto-backoffice-pipeline", title: "Produto/Backoffice/Pipeline/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pipeline: Story = { name: "Index", args: { title: "Pipeline", lead: "Veja o processamento entre a captura e os dados publicados.", sectionTitle: "Execuções", sectionLead: "Etapas recentes com volume e resultado.", primaryAction: "Abrir execução", resultMessage: "Execução selecionada", rows: [
  { title: "Captura para tratamento", description: "12.840 registros transformados.", meta: "6 min", status: "Concluída", tone: "success" },
  { title: "Tratamento para publicação", description: "328 registros aguardam revisão.", meta: "Em andamento", status: "Processando", tone: "warn" },
  { title: "Publicação", description: "Última versão liberada sem divergência.", meta: "v2026.07.26", status: "Concluída", tone: "success" },
] } };
