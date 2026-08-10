import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";

const meta = { id: "produto-backoffice-auditoria", title: "Produto/Backoffice/Auditoria/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Audit: Story = { name: "Index", args: { title: "Auditoria", lead: "Consulte mudanças de acesso e ações sensíveis sem alterar o histórico.", sectionTitle: "Eventos recentes", sectionLead: "Cada evento identifica autor, contexto, decisão e política usada.", primaryAction: "Exportar eventos", resultMessage: "Preparação da exportação iniciada", rows: [
  { title: "Perfil publicado", description: "André Martins publicou Identidades e acessos v4.", meta: "AUD-20418 · Plataforma · há 12 min", status: "Permitido", tone: "success" },
  { title: "Exclusão de imobiliária negada", description: "O perfil Suporte não possui permissão para excluir.", meta: "AUD-20411 · TNT-018 · há 31 min", status: "Negado", tone: "danger" },
  { title: "Permissão individual revogada", description: "Ana Lima deixou de atribuir clientes na Andrade Imóveis.", meta: "ACC-2026-0148 · há 1 h", status: "Registrado", tone: "neutral" },
] } };
