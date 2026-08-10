import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";

const meta = { id: "produto-backoffice-parâmetros", title: "Produto/Backoffice/Parâmetros/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Parameters: Story = { name: "Index", args: { title: "Parâmetros", lead: "Consulte configurações globais antes de alterar o comportamento da Plataforma.", sectionTitle: "Configurações", sectionLead: "Toda alteração registra autor, motivo e valor anterior.", primaryAction: "Revisar alteração", resultMessage: "Revisão do parâmetro aberta", rows: [
  { title: "Prazo da análise cadastral", description: "Tempo esperado para a primeira decisão.", meta: "2 dias úteis", status: "Ativo", tone: "success" },
  { title: "Limite de tentativas de entrada", description: "Bloqueia novas tentativas após falhas seguidas.", meta: "5 tentativas", status: "Ativo", tone: "success" },
  { title: "Exportação de auditoria", description: "Disponível somente para perfis autorizados.", meta: "Até 90 dias por arquivo", status: "Restrito", tone: "warn" },
] } };
