import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";
const meta = { id: "produto-backoffice-revisões-de-dados", title: "Produto/Backoffice/Revisões de dados/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DataReviews: Story = { name: "Index", args: { title: "Revisões de dados", lead: "Decida divergências antes que elas cheguem ao dado publicado.", sectionTitle: "Fila de revisão", sectionLead: "Itens ordenados por risco e tempo de espera.", primaryAction: "Revisar próximo", resultMessage: "Próxima revisão aberta", rows: [
  { title: "REV-204 · Endereço divergente", description: "Duas fontes informam bairros diferentes.", meta: "Risco alto", status: "Pendente", tone: "danger" },
  { title: "REV-198 · Área útil", description: "Diferença de 8 m² entre anúncios.", meta: "Risco médio", status: "Pendente", tone: "warn" },
  { title: "REV-191 · Telefone", description: "Contato validado na fonte principal.", meta: "Risco baixo", status: "Pronta", tone: "success" },
] } };
