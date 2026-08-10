import type { Meta, StoryObj } from "@storybook/react";
import { DashboardPage } from "./DashboardPage";

const dashboardMeta: Meta<typeof DashboardPage> = {
  title: "Páginas/Dashboard",
  component: DashboardPage,
  parameters: { layout: "fullscreen" },
};
export default dashboardMeta;

type Story = StoryObj<typeof DashboardPage>;

/** Tela real montada só com componentes do @refy/ui. */
export const VisaoGeral: Story = {};
