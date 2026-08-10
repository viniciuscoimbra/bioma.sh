import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  id: "produto-backoffice-clientes-e-buscas",
  title: "Produto/Backoffice/Clientes e buscas/Index",
  component: BackofficeOperationalPage,
  parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Clients: Story = {
  name: "Index",
  args: {
    title: "Clientes e buscas",
    lead: "Consulte contas cliente e as intenções usadas na busca de imóveis.",
    sectionTitle: "Atividade recente",
    sectionLead: "Contas com busca ativa ou pendência de atendimento.",
    primaryAction: "Filtrar clientes",
    resultMessage: "Filtros abertos",
    rows: [
      { title: "CLI-041 · Ana Lima", description: "2 intenções ativas e 7 favoritos.", meta: "Atualizado hoje", status: "Ativa", tone: "success" },
      { title: "CLI-032 · Família Nogueira", description: "Busca sem imóveis compatíveis.", meta: "Há 2 dias", status: "Revisar", tone: "warn" },
      { title: "CLI-019 · Marcos Silva", description: "Conta sem intenção ativa.", meta: "Há 8 dias", status: "Sem busca" },
    ],
  },
};
