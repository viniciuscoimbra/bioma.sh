import type { Meta, StoryObj } from "@storybook/react";
import { UsageMeter, UsageMeterGroup } from "./UsageMeter";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";

const meta = {
  title: "Components/Molecules/UsageMeter",
  component: UsageMeter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Consumo vs limite: label, valores formatados (pt-BR) e barra — composição sobre `ProgressBar`. O tom muda por limiar: ok → atenção (≥ `warnAt`, padrão 80%) → crítico (≥ `criticalAt`, padrão 100%). `UsageMeterGroup` empilha vários medidores com divisores (consumo por projeto, limites de API).\n\n" +
          "**Onde usar:** páginas de Uso e Cobrança (créditos do ciclo, membros, projetos), limites de API na página de Desenvolvedor, e qualquer recurso com teto numérico conhecido.\n\n" +
          "**Onde NÃO usar:** não use para progresso de tarefa/etapa (isso é `ProgressBar` puro ou stepper); não use sem limite conhecido (número solto não é medidor); não use como gráfico de série temporal (isso é `Charts`); não empilhe medidores soltos sem `UsageMeterGroup` dentro de um mesmo card.",
      },
    },
  },
  argTypes: {
    used: { control: { type: "number", min: 0 } },
    limit: { control: { type: "number", min: 0 } },
    warnAt: { control: { type: "number", min: 0, max: 100 } },
    criticalAt: { control: { type: "number", min: 0, max: 200 } },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <UsageMeter {...args} />
    </div>
  ),
} satisfies Meta<typeof UsageMeter>;
export default meta;

type Story = StoryObj<typeof UsageMeter>;

export const Saudavel: Story = {
  name: "Saudável",
  args: {
    label: "Créditos do ciclo",
    used: 800,
    limit: 2500,
    unit: "créditos",
    meta: "8 análises padrão · 0 sínteses profundas",
  },
};

export const Atencao: Story = {
  name: "Atenção (≥80%)",
  args: {
    label: "Projetos",
    used: 17,
    limit: 20,
    meta: "3 disponíveis",
  },
};

export const Critico: Story = {
  name: "Crítico (limite atingido)",
  args: {
    label: "Membros",
    used: 3,
    limit: 3,
    meta: "limite do plano Pro atingido",
  },
};

/** Lista de medidores com divisores, como em "Consumo por projeto" na tela de Uso. */
export const ListaPorProjeto: Story = {
  name: "Lista (UsageMeterGroup)",
  args: { label: "-", used: 0, limit: 1 },
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader
        title="Consumo por projeto"
        count="800 / 2.500"
        action={<Button variant="ghost" size="sm">Exportar</Button>}
      />
      <UsageMeterGroup>
        <UsageMeter
          label="Globo · Editoria de Economia"
          used={600}
          limit={700}
          size="sm"
          meta="3 análises · 1 síntese profunda"
        />
        <UsageMeter label="Quem · Famosos & Realeza" used={200} limit={700} size="sm" meta="2 análises" />
        <UsageMeter
          label="Casa Vogue · Decoração"
          used={0}
          limit={700}
          size="sm"
          meta="0 análises · monitoramento ativo"
        />
      </UsageMeterGroup>
    </Card>
  ),
};
