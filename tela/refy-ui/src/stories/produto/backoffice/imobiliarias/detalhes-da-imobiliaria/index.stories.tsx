import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeAgencyReview } from "../../../../../prototypes/BackofficeAgencies";
import {
  AgencyLifecycle,
  InformationRequestPage,
  RejectionPage,
} from "../../../../../prototypes/BackofficeAgencyFlow";
import { BackofficeOperationalPage } from "../../../../../prototypes/BackofficeOperationalPages";
import { validationViewports } from "../../../../../prototypes/productValidationFixtures";

const meta = {
  title: "Produto/Backoffice/Imobiliárias/Detalhes da imobiliária",
  component: BackofficeAgencyReview,
  args: {
    initialView: "general",
    initialState: "pending-review",
  },
  parameters: {
    layout: "fullscreen",
    viewport: { viewports: validationViewports, defaultViewport: "desktop1440" },
  },
  globals: { theme: "dommus-admin" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  tags: ["aprovada"],
};

export const Responsavel: Story = {
  name: "Responsável",
  render: () => <BackofficeAgencyReview initialView="responsible" />,
};

export const Historico: Story = {
  name: "Histórico",
  render: () => <BackofficeAgencyReview initialView="history" />,
};

export const Administracao: Story = {
  name: "Administração",
  render: () => <BackofficeAgencyReview initialView="administration" />,
};

export const CicloDoCadastro: Story = {
  name: "Situações",
  render: () => <AgencyLifecycle />,
};

export const SolicitarInformacoes: Story = {
  name: "Análise",
  render: () => <InformationRequestPage />,
};

export const RecusarCadastro: Story = {
  name: "Recusar cadastro",
  render: () => <RejectionPage />,
};

export const TransferirResponsabilidade: Story = {
  name: "Transferir responsabilidade",
  render: () => (
    <BackofficeOperationalPage
      title="Trocar responsável"
      lead="Escolha quem passa a responder pela Andrade Imóveis. O vínculo anterior continua no histórico."
      sectionTitle="Usuários elegíveis"
      sectionLead="A transferência atualiza a imobiliária e o cadastro do usuário escolhido."
      primaryAction="Revisar transferência"
      resultMessage="Revisão da transferência aberta"
      rows={[
        { title: "Ana Martins", description: "Administradora da Andrade Imóveis", meta: "Acesso ativo · ana.martins@andrade.com.br", status: "Atual", tone: "neutral" },
        { title: "Mariana Costa", description: "Gestora operacional", meta: "agency-responsible-transfer-001 · EVT-RESPONSIBLE-TRANSFER-001", status: "Elegível", tone: "success" },
        { title: "Paulo Mendes", description: "Corretor sem acesso administrativo", meta: "Precisa receber o papel de administrador antes da troca", status: "Bloqueado", tone: "warn" },
      ]}
    />
  ),
};
