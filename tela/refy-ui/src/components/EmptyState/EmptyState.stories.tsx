import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { EmptyState } from "./EmptyState";

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/**
 * `EmptyState` — estado de "nada aqui" com ícone, título, copy e CTA opcional.
 */
const meta = {
  title: "Components/Molecules/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Borda dashed em volta para indicar ausência (`bordered={false}` quando o container já tem moldura). Ícone via prop, título em headline, copy limitada a ~36ch.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    bordered: { control: "boolean" },
    icon: { control: false },
    action: { control: false },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof EmptyState>;

/** Busca sem resultados, com CTA. */
export const Playground: Story = {
  args: {
    icon: SearchIcon,
    title: "Nenhuma issue corresponde",
    message: "Tente remover filtros ou trocar a busca. Você tem 12 issues no total.",
    action: <Button size="sm">Limpar filtros</Button>,
  },
};

/** Sem borda (dentro de um card que já tem moldura). */
export const SemBorda: Story = {
  name: "Sem borda",
  args: {
    icon: SearchIcon,
    title: "Nenhuma análise ainda",
    message: "Rode a primeira análise para ver os resultados aqui.",
    bordered: false,
  },
};
