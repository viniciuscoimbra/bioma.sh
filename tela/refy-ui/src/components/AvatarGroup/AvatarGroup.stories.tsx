import type { Meta, StoryObj } from "@storybook/react";
import { AvatarGroup, type AvatarGroupItem } from "./AvatarGroup";

/**
 * `AvatarGroup` — avatares empilhados com sobreposição e overflow "+N".
 */
const meta = {
  title: "Components/Molecules/AvatarGroup",
  component: AvatarGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Composição sobre o átomo `Avatar`: cada pessoa é um Avatar com anel da superfície; o excedente (`items.length - max`) vira um chip \"+N\" cujo tooltip lista os nomes restantes. Ordem estável (primeira pessoa por cima). Com `onItemClick`/`onOverflowClick` os itens viram botões reais (Tab, Enter/Espaço, foco visível).",
          "",
          "### Onde usar",
          "- Resumo compacto de quem participa de algo: membros do time (ref. `settings_team`), corretores de uma carteira, responsáveis por um imóvel/projeto.",
          "- Célula de tabela ou header de card onde a lista completa não cabe.",
          "- Com `onOverflowClick` levando à lista completa (página ou Drawer do app).",
          "",
          "### Onde NÃO usar",
          "- Uma pessoa só — use o átomo `Avatar` direto.",
          "- Quando o nome de cada pessoa precisa estar visível (use lista/`Table` com célula avatar + nome).",
          "- Como seletor de pessoas — para escolher, use `Combobox` (variante com avatar) ou `Multiselect`.",
          "- Nunca reimplementar o empilhamento na mão em telas — este componente é o padrão.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: { control: false, description: "Pessoas na ordem de exibição." },
    max: { control: { type: "number", min: 1 }, description: "Máximo visível antes do \"+N\"." },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    onItemClick: { control: false, description: "Se presente, cada avatar vira botão." },
    onOverflowClick: { control: false, description: "Se presente, o \"+N\" vira botão." },
  },
} satisfies Meta<typeof AvatarGroup>;
export default meta;

type Story = StoryObj<typeof AvatarGroup>;

const team: AvatarGroupItem[] = [
  { name: "Joana Martins" },
  { name: "Marcos Silva", color: "var(--legacy-ink-2)" },
  { name: "Renata Costa" },
  { name: "Paulo Braga", color: "var(--legacy-ink-3)" },
  { name: "Ana Lúcia Prado" },
  { name: "Caio Fernandes" },
  { name: "Duda Rocha" },
];

/** Playground — 7 pessoas, `max=4` gera o chip "+3" (hover mostra os nomes). */
export const Playground: Story = {
  args: { items: team, max: 4 },
};

/** Todos visíveis (itens ≤ max): sem chip "+N". */
export const SemOverflow: Story = {
  name: "Sem overflow",
  args: { items: team.slice(0, 3), max: 4 },
};

/** Tamanhos herdados do átomo Avatar. */
export const Tamanhos: Story = {
  args: { items: team, max: 4 },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <AvatarGroup {...args} size="sm" />
      <AvatarGroup {...args} size="md" />
      <AvatarGroup {...args} size="lg" />
    </div>
  ),
};

/** Clicável: avatares e "+N" viram botões (Tab + Enter/Espaço, foco visível). */
export const Clicavel: Story = {
  name: "Clicável",
  args: {
    items: team,
    max: 4,
    onItemClick: (item) => console.log("pessoa:", item.name),
    onOverflowClick: () => console.log("abrir lista completa"),
  },
};
