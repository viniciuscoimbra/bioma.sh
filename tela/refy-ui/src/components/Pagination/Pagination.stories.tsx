import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./Pagination";

/**
 * `Pagination` — paginação numérica em mono; ativa em ink-1, demais ghost.
 */
const meta = {
  title: "Components/Atoms/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controlada: `page` (1-based) + `onPageChange`. Setas desabilitam nos limites; reticências colapsam trechos longos (`siblingCount` controla os vizinhos visíveis). `aria-current=\"page\"` no item ativo.",
      },
    },
  },
  argTypes: {
    page: { control: false },
    pageCount: { control: "number" },
    siblingCount: { control: "number" },
    onPageChange: { action: "page" },
  },
} satisfies Meta<typeof Pagination>;
export default meta;

type Story = StoryObj<typeof Pagination>;

/** 12 páginas com reticências — navegue pelos números e setas. */
export const Playground: Story = {
  args: { page: 2, pageCount: 12, onPageChange: () => {} },
  render: (args) => {
    const [page, setPage] = useState(2);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** Poucas páginas — sem reticências. */
export const Curta: Story = {
  args: { page: 1, pageCount: 4, onPageChange: () => {} },
  render: (args) => {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} pageCount={4} onPageChange={setPage} />;
  },
};
