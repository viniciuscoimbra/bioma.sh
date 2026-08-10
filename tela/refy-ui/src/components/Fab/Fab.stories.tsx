import type { Meta, StoryObj } from "@storybook/react";
import { Fab } from "./Fab";
import { Icons } from "../../_demo/icons";

const meta = {
  title: "Components/Atoms/Fab",
  component: Fab,
  tags: ["autodocs"],
  args: { icon: Icons.plus, label: "Nova análise" },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "lg"] },
    variant: { control: "inline-radio", options: ["primary", "surface"] },
  },
} satisfies Meta<typeof Fab>;
export default meta;

type Story = StoryObj<typeof Fab>;

/** Redondo, ícone só (o label vira aria-label). */
export const FabPadrao: Story = { name: "Padrão" };

/** Estendido — pílula com texto. */
export const FabEstendido: Story = { name: "Estendido", args: { extended: true } };

/** Variante surface (branco). */
export const FabSurface: Story = { name: "Surface", args: { variant: "surface" } };

/** Tamanho médio. */
export const FabMedio: Story = { name: "Médio", args: { size: "md" } };
