import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SwipeDeck, type SwipeDeckItem } from "./SwipeDeck";

function image(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="1200" height="760" fill="${color}"/><rect y="560" width="1200" height="200" fill="#8fac78"/><rect x="230" y="270" width="740" height="390" rx="12" fill="#fff8f2"/><path d="M160 320 600 80l440 240" fill="none" stroke="#bd4b30" stroke-width="38"/><rect x="490" y="440" width="220" height="220" fill="#6d5140"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const common = {
  price: "R$ 780.000",
  facts: [{ label: "Quartos", value: "3" }, { label: "Área", value: "98 m²" }, { label: "Vagas", value: "2" }],
  badges: [{ label: "Novo", tone: "info" as const }],
};

const items: SwipeDeckItem[] = [
  { id: "a", ...common, title: "Apartamento com varanda e luz natural", address: "Itapoã · Belo Horizonte", media: [{ src: image("#bfdcf0"), alt: "Apartamento com varanda" }], matchScore: 92, summary: "Espaço para home office, varanda segura e transporte próximo." },
  { id: "b", ...common, title: "Casa tranquila perto da escola", address: "Planalto · Belo Horizonte", media: [{ src: image("#efd1aa"), alt: "Casa com jardim" }], matchScore: 88, summary: "Rua calma, quintal para os cachorros e comércio a poucos minutos." },
  { id: "c", ...common, title: "Apartamento funcional de um quarto", address: "Santo Agostinho · Belo Horizonte", price: "R$ 510.000", media: [{ src: image("#d5c9eb"), alt: "Apartamento funcional" }], matchScore: 84, summary: "Planta prática e acesso direto aos principais corredores da cidade." },
];

const meta = {
  title: "Components/Organisms/SwipeDeck",
  component: SwipeDeck,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { items },
} satisfies Meta<typeof SwipeDeck>;
export default meta;
type Story = StoryObj<typeof SwipeDeck>;

export const Gesto: Story = { args: { gestureEnabled: true } };
export const Teclado: Story = { args: { gestureEnabled: true } };
export const MovimentoReduzido: Story = { args: { motion: "reduced" } };
export const FimDaFila: Story = {
  render: () => {
    const [index, setIndex] = useState(items.length);
    return <SwipeDeck items={items} index={index} onReset={() => setIndex(0)} />;
  },
};
