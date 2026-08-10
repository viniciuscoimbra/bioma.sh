import type { Meta, StoryObj } from "@storybook/react";
import { ProfessionalAccess, desktop } from "./ProfessionalAccess.stories";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  title: "Produto/Backoffice/Entrada",
  component: ProfessionalAccess,
  args: { screen: "platform-login" },
  argTypes: { screen: { control: "select", options: ["platform-login", "platform-otp", "platform-unauthorized"] } },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof ProfessionalAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const E08EntrarComGoogle: Story = { args: { screen: "platform-login" }, parameters: desktop, tags: ["aprovada"] };
export const E08ConfirmarEntrada: Story = { args: { screen: "platform-otp" }, parameters: desktop, tags: ["aprovada"] };
export const E08AcessoNegado: Story = { args: { screen: "platform-unauthorized" }, parameters: desktop, tags: ["aprovada"] };
