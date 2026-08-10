import type { Meta, StoryObj } from "@storybook/react";
import { HelpMenu } from "./HelpMenu";

/**
 * `HelpMenu` — botão "?" que abre o menu de ajuda (compõe Menu).
 */
const meta = {
  title: "Components/Molecules/HelpMenu",
  component: HelpMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Itens padrão: Documentação, Atalhos de teclado (⌘K) e Falar com suporte — customizáveis via `entries` (mesma API do `Menu`). Menu alinhado ao fim, para o canto da topbar.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 260, paddingLeft: 200, paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    entries: { control: false },
    label: { control: "text" },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof HelpMenu>;
export default meta;

type Story = StoryObj<typeof HelpMenu>;

/** Clique no "?" para abrir. */
export const Playground: Story = {};
