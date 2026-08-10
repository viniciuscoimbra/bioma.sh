import type { Meta, StoryObj } from "@storybook/react";
import { BackofficeAgencyCreate } from "../../../../../prototypes/BackofficeAgencyCreate";
import { validationViewports } from "../../../../../prototypes/productValidationFixtures";

const meta = {
  title: "Produto/Backoffice/Imobiliárias/Cadastrar imobiliária",
  component: BackofficeAgencyCreate,
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports, defaultViewport: "desktop1440" } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof BackofficeAgencyCreate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {};
