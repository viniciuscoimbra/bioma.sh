import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import { Button } from "../Button";

const meta = {
  title: "Components/Atoms/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Separador visual entre blocos: linha horizontal (com rótulo central opcional, como o \"ou\" do workspace picker) ou vertical entre itens inline. `spacing` controla a margem externa no eixo do fluxo. Sempre `role=\"separator\"`.\n\n" +
          "**Onde usar:** separar alternativas em fluxos (\"ou\" entre entrar num workspace e criar um novo), separar seções soltas dentro de um card, separar grupos de ações inline (vertical em toolbars).\n\n" +
          "**Onde NÃO usar:** entre linhas de lista/configuração (o divisor ali é do container — `UsageMeterGroup`, `Table` e afins já trazem o seu); como título de seção (isso é cabeçalho de seção, lacuna L2); não use `<hr>` estilizado à mão — este átomo existe justamente para matar esse improviso.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
  },
} satisfies Meta<typeof Divider>;
export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <p style={{ margin: 0 }}>Bloco de cima</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Bloco de baixo</p>
    </div>
  ),
};

export const ComRotulo: Story = {
  name: "Com rótulo central",
  args: { label: "ou" },
  render: (args) => (
    <div style={{ maxWidth: 420, display: "flex", flexDirection: "column" }}>
      <Button variant="secondary">Entrar num ambiente</Button>
      <Divider {...args} />
      <Button variant="ghost">Criar ambiente novo</Button>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical", spacing: "sm" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button variant="ghost" size="sm">Exportar</Button>
      <Divider {...args} />
      <Button variant="ghost" size="sm">Duplicar</Button>
      <Divider {...args} />
      <Button variant="ghost" size="sm">Arquivar</Button>
    </div>
  ),
};

export const Espacamentos: Story = {
  name: "Espaçamentos",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      {(["none", "sm", "md", "lg"] as const).map((spacing) => (
        <div key={spacing}>
          <code style={{ fontSize: "var(--text-2xs)" }}>spacing="{spacing}"</code>
          <Divider spacing={spacing} />
        </div>
      ))}
    </div>
  ),
};
