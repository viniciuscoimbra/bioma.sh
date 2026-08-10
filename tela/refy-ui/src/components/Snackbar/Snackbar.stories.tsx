import type { Meta, StoryObj } from "@storybook/react";
import { Snackbar } from "./Snackbar";

/**
 * `Snackbar` — toast minimalista de uma linha com ação inline.
 */
const meta = {
  title: "Components/Molecules/Snackbar",
  component: Snackbar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Confirma ações reversíveis numa linha só (\"Issue movida · Desfazer\"). Elemento de apresentação: posicione você mesmo, ou use `Toast`/`ToastRegion` para pilha com auto-dismiss.",
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    action: { control: false },
  },
} satisfies Meta<typeof Snackbar>;
export default meta;

type Story = StoryObj<typeof Snackbar>;

/** Com ação de desfazer. */
export const Desfazer: Story = {
  args: { children: "Issue movida para Backlog", action: { label: "Desfazer", onClick: () => {} } },
};

/** Com ação de navegar. */
export const Ver: Story = {
  args: { children: "3 análises arquivadas", action: { label: "Ver", onClick: () => {} } },
};

/** Só mensagem. */
export const Simples: Story = {
  args: { children: "Link copiado" },
};
