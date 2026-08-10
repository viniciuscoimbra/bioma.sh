import type { Meta, StoryObj } from "@storybook/react";
import { PlanCard } from "./PlanCard";
import { Button } from "../Button";

const meta = {
  title: "Components/Molecules/PlanCard",
  component: PlanCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Card de plano (pricing): nome, preço/período, lista de features com check e CTA. `current` marca o plano vigente (tag + CTA desabilitada); `highlighted` destaca o recomendado.\n\n" +
          "**Onde usar:** no modal/página \"Mudar plano\" (settings de Cobrança) e em telas de upgrade — sempre em grade de 2 a 4 planos lado a lado (a grade é do consumidor, ver story \"Grade de planos\").\n\n" +
          "**Onde NÃO usar:** não use para mostrar o plano vigente com consumo/renovação (isso é o resumo de plano na página de Cobrança, com `BillingCard`/`UsageMeter`); não use para pacotes de créditos avulsos (padrão próprio de seleção); não use como card genérico de navegação (isso é `NavCard`/`Card`); nunca um PlanCard sozinho fora de contexto de comparação.",
      },
    },
  },
  argTypes: {
    current: { control: "boolean" },
    highlighted: { control: "boolean" },
    currentLabel: { control: "text" },
    highlightLabel: { control: "text" },
  },
} satisfies Meta<typeof PlanCard>;
export default meta;

type Story = StoryObj<typeof PlanCard>;

const starterFeatures = [
  <span key="1"><strong>800 créditos</strong> por mês</span>,
  "1 membro · 5 projetos",
  "Análise padrão, rerun, recomendações",
  "Monitoramento básico",
];
const proFeatures = [
  <span key="1"><strong>2.500 créditos</strong> por mês</span>,
  "3 membros · 20 projetos",
  "Tudo do Starter +",
  "Monitoramento completo",
  "API/MCP completos",
];
const agencyFeatures = [
  <span key="1"><strong>8.000 créditos</strong> por mês</span>,
  "10 membros · 75 projetos",
  "Tudo do Pro +",
  "Suporte prioritário",
];
const enterpriseFeatures = [
  <span key="1"><strong>Créditos customizados</strong></span>,
  "Membros e projetos sob demanda",
  "SSO e contratos personalizados",
  "SLA e gerente dedicado",
];

export const Padrao: Story = {
  name: "Padrão",
  args: {
    name: "Starter",
    price: "R$ 79",
    period: "/mês",
    priceNote: "R$ 948 cobrados anualmente",
    features: starterFeatures,
    cta: (
      <Button variant="secondary" block>
        Mudar para Starter
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <PlanCard {...args} />
    </div>
  ),
};

export const PlanoAtual: Story = {
  args: {
    name: "Pro",
    price: "R$ 199",
    period: "/mês",
    priceNote: "R$ 2.388 cobrados anualmente",
    features: proFeatures,
    current: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 260, paddingTop: 12 }}>
      <PlanCard {...args} />
    </div>
  ),
};

export const Recomendado: Story = {
  args: {
    name: "Agency",
    price: "R$ 479",
    period: "/mês",
    priceNote: "R$ 5.748 cobrados anualmente",
    features: agencyFeatures,
    highlighted: true,
    cta: (
      <Button variant="primary" block>
        Atualizar para Agency
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 260, paddingTop: 12 }}>
      <PlanCard {...args} />
    </div>
  ),
};

/** Grade responsiva 2–4 colunas — o container é do consumidor. */
export const GradeDePlanos: Story = {
  name: "Grade de planos",
  args: { name: "-", price: "-" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        paddingTop: 12,
        maxWidth: 1080,
      }}
    >
      <PlanCard
        name="Starter"
        price="R$ 79"
        period="/mês"
        priceNote="R$ 948 cobrados anualmente"
        features={starterFeatures}
        cta={<Button variant="secondary" block>Mudar para Starter</Button>}
      />
      <PlanCard
        name="Pro"
        price="R$ 199"
        period="/mês"
        priceNote="R$ 2.388 cobrados anualmente"
        features={proFeatures}
        current
        highlighted
        currentLabel="Seu plano"
      />
      <PlanCard
        name="Agency"
        price="R$ 479"
        period="/mês"
        priceNote="R$ 5.748 cobrados anualmente"
        features={agencyFeatures}
        cta={<Button variant="primary" block>Atualizar para Agency</Button>}
      />
      <PlanCard
        name="Enterprise"
        price="Sob consulta"
        priceNote="faturamento e ciclo customizados"
        features={enterpriseFeatures}
        cta={<Button variant="secondary" block>Falar com vendas</Button>}
      />
    </div>
  ),
};
