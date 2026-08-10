import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";

const meta = { id: "produto-backoffice-imóveis", title: "Produto/Backoffice/Imóveis/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Properties: Story = { name: "Index", args: { title: "Imóveis", lead: "Consulte os imóveis publicados e encontre registros que precisam de correção.", sectionTitle: "Base publicada", sectionLead: "Situação dos registros recebidos pelas fontes.", primaryAction: "Revisar imóvel", resultMessage: "Revisão do imóvel aberta", rows: [
  { title: "Apartamento · Lourdes", description: "3 quartos · 118 m² · Belo Horizonte", meta: "IMO-18420 · atualizado há 8 min", status: "Publicado", tone: "success" },
  { title: "Casa · Vila da Serra", description: "4 quartos · 340 m² · Nova Lima", meta: "IMO-18388 · preço sem confirmação", status: "Revisar", tone: "warn" },
  { title: "Cobertura · Funcionários", description: "4 quartos · 226 m² · Belo Horizonte", meta: "IMO-18291 · fonte indisponível", status: "Pausado", tone: "danger" },
] } };
