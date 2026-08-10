import type { Meta, StoryObj } from "@storybook/react";
import { PersonCell } from "./PersonCell";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";

/** `PersonCell` — célula padrão de pessoa/entidade em tabelas e listas. */
const meta = {
  title: "Components/Molecules/PersonCell",
  component: PersonCell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Célula de exibição: `Avatar` (slot) + nome + linha secundária. `tag` adiciona sufixo inline (\"você\", papel). Variante entidade = mesmo componente com `Avatar shape=\"square\"` (projeto, workspace, imobiliária).",
          "",
          "**Onde usar:** colunas de membro/dono em `Table` (time, projetos), listas de pessoas, cabeçalho de menus de conta. Todo corretor/imobiliária aparece com avatar — este é o padrão.",
          "",
          "**Onde NÃO usar:** item inteiro clicável que navega (use `NavCard` com `leading`); grupo de vários avatares (use `AvatarGroup`); célula só de texto (use texto direto na `Table`).",
        ].join("\n"),
      },
    },
  },
  args: {
    name: "Marina Salgado",
    secondary: "marina@globoeditorial.com",
    size: "md",
  },
  argTypes: {
    name: { control: "text" },
    secondary: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    avatar: { control: false, description: "Slot: passe o átomo `Avatar`." },
    tag: { control: false, description: "Sufixo inline após o nome." },
  },
} satisfies Meta<typeof PersonCell>;
export default meta;

type Story = StoryObj<typeof PersonCell>;

export const Pessoa: Story = {
  render: (args) => (
    <PersonCell {...args} avatar={<Avatar size="md" initials="MS" seed="Marina Salgado" />} />
  ),
};

export const VoceComTag: Story = {
  name: "Com tag (você)",
  render: () => (
    <PersonCell
      avatar={<Avatar size="md" initials="JM" seed="João Mendes" />}
      name="João Mendes"
      tag="você"
      secondary="joao@globoeditorial.com"
    />
  ),
};

export const ComBadgeDePapel: Story = {
  render: () => (
    <PersonCell
      avatar={<Avatar size="md" initials="RC" seed="Rafael Costa" />}
      name="Rafael Costa"
      tag={<Badge tone="neutral">Membro</Badge>}
      secondary="rafael@globoeditorial.com"
    />
  ),
};

export const Entidade: Story = {
  name: "Entidade (Avatar square)",
  render: () => (
    <PersonCell
      avatar={<Avatar shape="square" size="md" initials="CV" seed="Casa Vogue" />}
      name="Casa Vogue"
      secondary="cobertura editorial · 128 páginas"
    />
  ),
};

export const CompactaEmTabela: Story = {
  name: "Compacta (sm, célula de tabela)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 260 }}>
      <PersonCell
        size="sm"
        avatar={<Avatar size="xs" initials="JM" seed="João Mendes" />}
        name="João Mendes"
        secondary="dono"
      />
      <PersonCell
        size="sm"
        avatar={<Avatar size="xs" initials="MS" seed="Marina Salgado" />}
        name="Marina Salgado"
        secondary="dona"
      />
    </div>
  ),
};
