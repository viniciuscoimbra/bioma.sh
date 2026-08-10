import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Badge } from "../Badge";

const meta = {
  title: "Components/Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Caixa de seleção com check customizado sobre input nativo. Cobre também o padrão \"campo de checkbox\": `description` (texto de apoio), `tag` (etiqueta inline, ex.: `Badge` \"destrutivo\" em permissão perigosa), `meta` (mono à direita) e `boxed` (linha com borda selecionável — propriedades GSC, escolhas em modal).",
          "",
          "**Onde usar:** múltipla escolha em formulários, listas de permissões, seleção de propriedades/itens em modais (`boxed`).",
          "",
          "**Onde NÃO usar:** escolha única (use `RadioGroup` ou `ChoiceCard`); liga/desliga imediato de preferência (use `Switch`); opção rica com preview/preço (use `ChoiceCard`).",
        ].join("\n"),
      },
    },
  },
  args: { label: "Recarga automática", defaultChecked: true },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    tag: { control: false, description: "Etiqueta inline após o rótulo (slot, ex.: Badge)." },
    meta: { control: "text", description: "Meta mono à direita da linha." },
    boxed: { control: "boolean", description: "Linha com borda selecionável." },
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const CheckboxPadrao: Story = {};
export const CheckboxComDescricao: Story = {
  args: {
    label: "analyses:create",
    description: "Roda novas análises (consome créditos do ambiente).",
  },
};
export const CheckboxDesabilitado: Story = {
  args: { label: "billing", description: "Vê e altera plano.", disabled: true, defaultChecked: false },
};
export const CheckboxComTagDestrutiva: Story = {
  name: "Com tag destrutiva",
  args: {
    label: "analyses:delete",
    description: "Apaga análises permanentemente.",
    tag: <Badge tone="danger">destrutivo</Badge>,
    defaultChecked: false,
  },
};
export const CheckboxBoxed: Story = {
  name: "Boxed (linha selecionável)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440 }}>
      <Checkbox boxed label="sc-domain:globo.com" meta="42 mil cliques / 28d" defaultChecked />
      <Checkbox boxed label="sc-domain:vogue.com.br" meta="8 mil cliques / 28d" defaultChecked />
      <Checkbox boxed label="sc-domain:casavogue.globo.com" meta="3 mil cliques / 28d" />
    </div>
  ),
};
export const CheckboxGrupo: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
      <Checkbox label="analyses:read" description="Lê análises do ambiente." defaultChecked />
      <Checkbox label="analyses:create" description="Roda novas análises." defaultChecked />
      <Checkbox label="analyses:publish" description="Publica para Visualizadores." />
      <Checkbox
        label="analyses:delete"
        description="Apaga análises permanentemente."
        tag={<Badge tone="danger">destrutivo</Badge>}
      />
    </div>
  ),
};
