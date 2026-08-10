import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { tone: "success", children: "Pago", dot: false },
  argTypes: {
    tone: { control: "inline-radio", options: ["success", "info", "warn", "danger", "neutral"] },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof Badge>;

export const Success: Story = {};
export const ComDot: Story = { args: { dot: true, children: "Ativo" } };

export const Todos: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="success">Pago</Badge>
      <Badge tone="info">Plano Agency</Badge>
      <Badge tone="warn">Pendente</Badge>
      <Badge tone="danger">Falhou</Badge>
      <Badge tone="neutral">Arquivado</Badge>
    </div>
  ),
};
