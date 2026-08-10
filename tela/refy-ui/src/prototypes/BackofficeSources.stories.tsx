import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";
const meta = { id: "produto-backoffice-fontes-e-crawlers", title: "Produto/Backoffice/Fontes e crawlers/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Sources: Story = { name: "Index", args: { title: "Fontes e crawlers", lead: "Acompanhe coletas, falhas e a atualização das fontes.", sectionTitle: "Fontes monitoradas", sectionLead: "Última coleta e situação operacional.", primaryAction: "Cadastrar fonte", resultMessage: "Cadastro de fonte aberto", rows: [
  { title: "Portal Horizonte", description: "1.284 imóveis recebidos na última coleta.", meta: "Hoje, 05:30", status: "Ativa", tone: "success" },
  { title: "Rede Casa Norte", description: "Falha de autenticação na origem.", meta: "3 tentativas", status: "Com erro", tone: "danger" },
  { title: "Andrade Imóveis", description: "Coleta aguardando a próxima janela.", meta: "Hoje, 06:00", status: "Agendada" },
] } };
