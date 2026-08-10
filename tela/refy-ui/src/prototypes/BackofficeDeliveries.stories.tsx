import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";
const meta = { title: "Produto/Backoffice/Entregas", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Deliveries: Story = { name: "Entregas", args: { title: "Entregas", lead: "Acompanhe lotes publicados e quem recebeu cada versão.", sectionTitle: "Últimas entregas", sectionLead: "Situação por destino e versão.", primaryAction: "Preparar entrega", resultMessage: "Nova entrega aberta", rows: [
  { title: "Imobiliárias · lote 284", description: "Dados publicados para 42 imobiliárias.", meta: "v2026.07.26", status: "Entregue", tone: "success" },
  { title: "Corretores · lote 283", description: "3 destinatários recusaram a versão.", meta: "v2026.07.25", status: "Parcial", tone: "warn" },
  { title: "Clientes · lote 282", description: "Seleções entregues sem falha.", meta: "v2026.07.25", status: "Entregue", tone: "success" },
] } };
