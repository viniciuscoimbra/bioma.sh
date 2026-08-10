import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalAccess, desktop, mobile } from "./ProfessionalAccess.stories";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Cliente/Entrada e busca",
  component: ProfessionalAccess,
  args: { screen: "client-login" },
  argTypes: { screen: { control: "select", options: ["client-login", "client-signup", "client-start"] } },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports } },
  globals: { theme: "dommus" },
} satisfies Meta<typeof ProfessionalAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const E07EntrarDesktop: Story = { args: { screen: "client-login" }, parameters: desktop, tags: ["aprovada"] };
export const E07EntrarMobile: Story = { args: { screen: "client-login" }, parameters: mobile, tags: ["aprovada"] };
export const E07CriarConta: Story = { args: { screen: "client-signup" }, parameters: mobile, tags: ["aprovada"] };
export const E07IniciarBusca: Story = { args: { screen: "client-start" }, parameters: mobile, tags: ["aprovada"] };
