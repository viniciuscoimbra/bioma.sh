import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { StickyBar } from "./StickyBar";

const meta = {
  title: "Components/Molecules/StickyBar",
  component: StickyBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Horizonte Negócios",
    meta: "TNT-002",
    status: <Badge tone="warn" dot>Em análise</Badge>,
    actions: <Button variant="primary" size="sm">Aprovar imobiliária</Button>,
  },
} satisfies Meta<typeof StickyBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Padrão",
};
