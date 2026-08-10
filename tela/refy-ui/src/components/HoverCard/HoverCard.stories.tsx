import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { HoverCard } from "./HoverCard";

/**
 * `HoverCard` — preview rico ao pairar sobre uma referência (link, mention, avatar).
 */
const meta = {
  title: "Components/Molecules/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Abre com delay (padrão 500ms) e fecha com tolerância de 200ms — dá para levar o cursor até o card. Também abre no foco por teclado. Card de 280px, elevação 3. Para conteúdo clicável complexo, use `Popover`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 260, paddingTop: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    openDelay: { control: "number" },
    closeDelay: { control: "number" },
    side: { control: "inline-radio", options: ["top", "bottom"] },
    content: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof HoverCard>;
export default meta;

type Story = StoryObj<typeof HoverCard>;

function PerfilDominio() {
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar initials="RD" />
        <div>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>rdstation.com</div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--ink-3)" }}>
            Concorrente · monitorado há 12 dias
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, color: "var(--ink-2)", lineHeight: "var(--leading-normal)" }}>
        DA 78 · 142 keywords no top 10 · 23k backlinks
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <Badge tone="success">Saudável</Badge>
        <Badge tone="neutral">SaaS B2B</Badge>
      </div>
    </div>
  );
}

/** Passe o mouse no link (500ms de delay). */
export const Playground: Story = {
  args: { content: null, children: null },
  render: (args) => (
    <HoverCard {...args} content={<PerfilDominio />}>
      <a href="#exemplo" style={{ color: "var(--primary-ink, var(--primary))", fontWeight: 600, fontSize: 14 }}>
        rdstation.com
      </a>
    </HoverCard>
  ),
};

/** Sem delay (openDelay 0), para demonstração imediata. */
export const SemDelay: Story = {
  name: "Sem delay",
  args: { content: null, children: null, openDelay: 0 },
  render: (args) => (
    <HoverCard {...args} content={<PerfilDominio />}>
      <a href="#exemplo" style={{ color: "var(--primary-ink, var(--primary))", fontWeight: 600, fontSize: 14 }}>
        rdstation.com
      </a>
    </HoverCard>
  ),
};
