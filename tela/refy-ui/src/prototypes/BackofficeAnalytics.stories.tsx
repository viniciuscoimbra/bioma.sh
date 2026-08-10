import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";
const meta = { id: "produto-backoffice-analítica", title: "Produto/Backoffice/Analítica/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Analytics: Story = { name: "Index", args: { title: "Analítica", lead: "Indicadores operacionais para acompanhar cadastro, dados e entregas.", sectionTitle: "Indicadores", sectionLead: "Recorte dos últimos sete dias.", primaryAction: "Alterar período", resultMessage: "Seletor de período aberto", rows: [
  { title: "Cadastros analisados", description: "34 decisões concluídas no período.", meta: "+8 na semana", status: "No prazo", tone: "success" },
  { title: "Revisões de dados", description: "17 itens acima do prazo esperado.", meta: "312 na fila", status: "Atenção", tone: "warn" },
  { title: "Entregas concluídas", description: "98,4% dos destinos receberam a versão.", meta: "6 lotes", status: "Estável", tone: "success" },
] } };
