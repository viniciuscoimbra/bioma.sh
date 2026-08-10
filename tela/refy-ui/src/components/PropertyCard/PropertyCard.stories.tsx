import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { PropertyCard } from "./PropertyCard";

function photo(_label: string, sky = "#bedcf0") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${sky}"/><rect y="580" width="1200" height="220" fill="#91ad7b"/><rect x="220" y="300" width="760" height="390" rx="12" fill="#fff9f4"/><path d="M150 340 600 90l450 250" fill="none" stroke="#be4c31" stroke-width="38"/><rect x="480" y="450" width="220" height="240" fill="#6b503f"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const base = {
  title: "Apartamento com varanda e luz natural",
  address: "Rua das Acácias, 180 · Itapoã, Belo Horizonte",
  price: "R$ 780.000",
  media: [
    { src: photo("Sala e varanda"), alt: "Sala integrada à varanda" },
    { src: photo("Fachada", "#d5c8ed"), alt: "Fachada do edifício" },
    { src: photo("Quintal", "#f0d0ac"), alt: "Área externa do condomínio" },
  ],
  matchScore: 92,
  badges: [{ label: "Novo", tone: "info" as const }, { label: "Aceita FGTS", tone: "success" as const }],
  facts: [
    { label: "Quartos", value: "3" },
    { label: "Área", value: "98 m²" },
    { label: "Vagas", value: "2" },
  ],
  summary: "Combina o espaço para trabalhar em casa com uma varanda segura para os cachorros e acesso rápido ao transporte público.",
  detailsAction: <Button size="sm">Ver detalhes</Button>,
};

const meta = {
  title: "Components/Organisms/PropertyCard",
  component: PropertyCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: base,
} satisfies Meta<typeof PropertyCard>;
export default meta;
type Story = StoryObj<typeof PropertyCard>;

export const Grid: Story = { args: { layout: "grid", actions: false } };
export const Lista: Story = { args: { layout: "list", actions: false } };
export const Deck: Story = { args: { layout: "deck", actions: {} } };
export const ConteudoExtremo: Story = {
  args: {
    layout: "list",
    title: "Casa independente com área externa excepcionalmente ampla, escritório silencioso e estrutura completa para uma família que precisa conciliar trabalho, estudo e animais",
    address: "Avenida Professor Mário Werneck, 9999, bloco 14, apartamento 1204 · Bairro Estoril, Belo Horizonte, Minas Gerais",
    price: "R$ 12.480.000",
    priceSuffix: "+ R$ 4.890 condomínio/mês",
    facts: [...base.facts, { label: "Banheiros", value: "7" }, { label: "Distância", value: "1,2 km da escola" }, { label: "Atualização", value: "há 3 minutos" }],
    summary: "Este texto propositalmente longo verifica se informações reais e detalhadas continuam legíveis sem empurrar a galeria ou as decisões para fora do card. Também garante que endereços extensos, valores altos e uma quantidade maior de atributos possam coexistir.",
    headerAction: <IconButton aria-label="Compartilhar imóvel" variant="outline" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 12v8h16v-8M12 16V3m0 0L7 8m5-5 5 5" /></svg>} />,
  },
};
