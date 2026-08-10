import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalAccess, desktop, mobile } from "./ProfessionalAccess.stories";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Corretor/Entrada e cadastro",
  component: ProfessionalAccess,
  args: { screen: "gateway-broker" },
  argTypes: { screen: { control: "select", options: ["gateway-broker", "broker-login", "broker-signup", "verify-email", "verify-phone", "forgot-password", "new-password", "broker-profile", "broker-mode", "broker-pending", "agency-request"] } },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports } },
  globals: { theme: "dommus" },
} satisfies Meta<typeof ProfessionalAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const E01EntradaProfissionalDesktop: Story = { args: { screen: "gateway-broker" }, parameters: desktop, tags: ["em-revisao"] };
export const E01EntradaProfissionalMobile: Story = { args: { screen: "gateway-broker" }, parameters: mobile, tags: ["em-revisao"] };
export const E02EntrarDesktop: Story = { args: { screen: "broker-login" }, parameters: desktop, tags: ["aprovada"] };
export const E02EntrarMobile: Story = { args: { screen: "broker-login" }, parameters: mobile, tags: ["aprovada"] };
export const E03CriarContaDesktop: Story = { args: { screen: "broker-signup" }, parameters: desktop, tags: ["aprovada"] };
export const E03CriarContaMobile: Story = { args: { screen: "broker-signup" }, parameters: mobile, tags: ["aprovada"] };
export const E04ConfirmarEmail: Story = { args: { screen: "verify-email" }, parameters: desktop, tags: ["em-revisao"] };
export const E05ConfirmarEntrada: Story = { args: { screen: "verify-phone" }, parameters: desktop, tags: ["em-revisao"] };
export const E06RecuperarSenha: Story = { args: { screen: "forgot-password" }, parameters: desktop, tags: ["em-revisao"] };
export const E06CriarNovaSenha: Story = { args: { screen: "new-password" }, parameters: desktop, tags: ["em-revisao"] };
export const T07PerfilProfissional: Story = { args: { screen: "broker-profile" }, parameters: desktop, tags: ["em-revisao"] };
export const T08ModeloDeAtuacao: Story = { args: { screen: "broker-mode" }, parameters: desktop, tags: ["em-revisao"] };
export const T10VinculoAguardandoImobiliaria: Story = { args: { screen: "broker-pending" }, parameters: desktop, tags: ["em-revisao"] };
export const T12SolicitarImobiliariaAusente: Story = { args: { screen: "agency-request" }, parameters: desktop, tags: ["em-revisao"] };
