import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeAgencies } from "../../../../prototypes/BackofficeAgencies";
import { validationViewports } from "../../../../prototypes/productValidationFixtures";

const meta = {
  title: "Produto/Backoffice/Imobiliárias",
  component: BackofficeAgencies,
  args: { state: "default" },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports, defaultViewport: "desktop1440" } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof BackofficeAgencies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  tags: ["aprovada"],
};
