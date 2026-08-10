import type { Meta, StoryObj } from "@storybook/react";
import { BillingCard } from "./BillingCard";
import { Badge } from "../Badge";
import { Button } from "../Button";

const meta = {
  title: "Components/Molecules/BillingCard",
  component: BillingCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Cartão de cobrança do workspace: método de pagamento (bandeira via slot + final do cartão), próxima cobrança e ações. Composição sobre `Card`.\n\n" +
          "**Onde usar:** na página de Cobrança (settings), um card por método de pagamento — o primário com próxima cobrança + ações (trocar cartão, ver faturas), secundários (ex.: Pix) só com método + status + ação de remover.\n\n" +
          "**Onde NÃO usar:** não use para escolher/comparar planos (isso é `PlanCard`); não use para mostrar consumo de créditos (isso é `UsageMeter`); não use como linha de tabela de faturas (isso é `Table`); não use fora do contexto de cobrança como card genérico (use `Card`).",
      },
    },
  },
  argTypes: {
    elevation: { control: "inline-radio", options: [0, 1, 2] },
    lastDigits: { control: "text" },
  },
} satisfies Meta<typeof BillingCard>;
export default meta;

type Story = StoryObj<typeof BillingCard>;

/** Bandeira de exemplo — em produção entra o logo real via slot (o DS não bundleia logos). */
const visa = <span>VISA</span>;

export const Completo: Story = {
  args: {
    brandIcon: visa,
    methodLabel: "Cartão de crédito",
    lastDigits: "4242",
    methodMeta: "Vence em 09/2028 · Asaas (Brasil)",
    status: (
      <Badge tone="success" dot>
        Ativa
      </Badge>
    ),
    nextChargeAmount: "R$ 2.388",
    nextChargeDate: "em 2 mai. 2027",
    actions: (
      <>
        <Button variant="ghost" size="sm">
          Ver faturas
        </Button>
        <Button variant="secondary" size="sm">
          Trocar cartão
        </Button>
      </>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};

export const SoMetodo: Story = {
  name: "Só método (secundário)",
  args: {
    methodLabel: "Pix",
    methodMeta: "joao@globoeditorial.com · AbacatePay",
    status: <Badge tone="neutral">Secundário</Badge>,
    actions: (
      <Button variant="ghost" size="sm">
        Remover
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};

export const PagamentoAtrasado: Story = {
  args: {
    brandIcon: <span>MC</span>,
    methodLabel: "Cartão de crédito",
    lastDigits: "8810",
    methodMeta: "Vence em 01/2027 · Asaas (Brasil)",
    status: (
      <Badge tone="danger" dot>
        Falha na cobrança
      </Badge>
    ),
    nextChargeAmount: "R$ 199",
    nextChargeDate: "nova tentativa em 3 dias",
    actions: (
      <Button variant="primary" size="sm">
        Atualizar pagamento
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};
