import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import { validationViewports } from "./productValidationFixtures";

const meta = { id: "produto-backoffice-versões", title: "Produto/Backoffice/Versões/Index", component: BackofficeOperationalPage, parameters: { layout: "fullscreen", viewport: { options: validationViewports, defaultViewport: "desktop1440" } }, globals: { theme: "dommus-admin" } } satisfies Meta<typeof BackofficeOperationalPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Versions: Story = { name: "Index", args: { title: "Versões", lead: "Acompanhe o que está publicado e o que ainda aguarda liberação.", sectionTitle: "Histórico de versões", sectionLead: "Publicar exige confirmação e mantém a versão anterior disponível para retorno.", primaryAction: "Revisar publicação", resultMessage: "Revisão da versão aberta", rows: [
  { title: "2026.07.26", description: "Perfis de acesso e fluxos do Backoffice.", meta: "Rascunho · 12 alterações", status: "Revisar", tone: "warn" },
  { title: "2026.07.18", description: "Design System 0.4.0.", meta: "Publicada por Vinícius Coimbra", status: "Atual", tone: "success" },
  { title: "2026.07.09", description: "Base anterior ao programa de refatoração.", meta: "Disponível para retorno", status: "Anterior", tone: "neutral" },
] } };
