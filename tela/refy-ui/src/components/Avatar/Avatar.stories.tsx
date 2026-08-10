import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

/**
 * `Avatar` — pessoa (circular) ou entidade (quadrado arredondado):
 * workspace, projeto, logo de imobiliária.
 */
const meta = {
  title: "Components/Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Avatar com iniciais ou imagem. `shape=\"circle\"` (default) para pessoa; `shape=\"square\"` para entidade (workspace, projeto, logo). `seed` gera gradiente de marca determinístico por string — o mesmo nome sempre recebe a mesma cor, em qualquer tela.",
          "",
          "**Onde usar:** toda pessoa (corretor, membro do time, conta) e toda entidade nomeável (workspace no picker, projeto em tabela, logo sem imagem). Tamanhos: `xs`/`sm` em células de tabela e listas; `md` em menus e topos; `lg` no picker; `xl` (72px) só no perfil (foto da conta).",
          "",
          "**Onde NÃO usar:** logo de serviço externo com SVG próprio (WordPress, Google — use o slot de logo do `ConnectorCard`); ícone de ação (use `IconButton`); grupos empilhados (use `AvatarGroup`).",
        ].join("\n"),
      },
    },
  },
  args: { initials: "JM", size: "md", shape: "circle" },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    seed: { control: "text", description: "Gradiente determinístico por string." },
    color: { control: "color" },
  },
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Iniciais: Story = {};

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar size="xs" initials="JM" />
      <Avatar size="sm" initials="JM" />
      <Avatar size="md" initials="MC" seed="Marina Costa" />
      <Avatar size="lg" initials="PL" seed="Paulo Lima" />
      <Avatar size="xl" initials="JM" />
    </div>
  ),
};

export const QuadradoEntidade: Story = {
  name: "Quadrado (entidade)",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar shape="square" size="sm" initials="GE" seed="Globo Editorial" />
      <Avatar shape="square" size="md" initials="GE" seed="Globo Editorial" />
      <Avatar shape="square" size="lg" initials="VG" seed="Vogue Brasil" />
      <Avatar shape="square" size="xl" initials="CV" seed="Casa Vogue" />
    </div>
  ),
};

export const GradienteDeterministico: Story = {
  name: "Gradiente determinístico (seed)",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {["Globo Editorial", "Vogue Brasil", "Casa Vogue", "João Mendes", "Marina Salgado"].map(
        (name) => (
          <Avatar
            key={name}
            shape="square"
            size="lg"
            seed={name}
            initials={name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
            title={name}
          />
        )
      )}
    </div>
  ),
};

export const PerfilXL: Story = {
  name: "Perfil (xl, 72px)",
  args: { size: "xl", initials: "JM" },
};
