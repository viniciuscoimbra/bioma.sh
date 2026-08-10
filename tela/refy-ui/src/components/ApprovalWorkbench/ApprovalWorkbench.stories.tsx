import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { SectionHeader } from "../SectionHeader";
import { Skeleton } from "../Skeleton";
import {
  ApprovalWorkbench,
  type ApprovalWorkbenchItem,
} from "./ApprovalWorkbench";

const items: ApprovalWorkbenchItem[] = [
  { id: "empresa", label: "Dados da empresa", meta: "3 de 3 avaliados", state: "complete" },
  { id: "endereco", label: "Endereço", meta: "3 de 3 avaliados", state: "attention" },
  { id: "registro", label: "Registro profissional", meta: "0 de 3 avaliados", state: "not-started" },
];

const meta = {
  title: "Components/Organisms/ApprovalWorkbench",
  component: ApprovalWorkbench,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Organiza uma análise manual em uma fila de itens e um editor ativo. Use para cadastros que passam por aprovação. O organismo não decide resultados nem cria pendências: a página fornece os itens, o conteúdo e as ações.",
      },
    },
  },
  argTypes: {
    items: { control: false },
    activeId: { control: false },
    onActiveChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ApprovalWorkbench>;

export default meta;
type Story = StoryObj<typeof ApprovalWorkbench>;

export const EmAnalise: Story = {
  name: "Em análise",
  render: () => {
    const [active, setActive] = useState("endereco");
    const item = items.find((entry) => entry.id === active) ?? items[0];
    return (
      <ApprovalWorkbench items={items} activeId={active} onActiveChange={setActive}>
        <Card>
          <SectionHeader
            title={item.label}
            sub="Confira as fontes e registre o resultado de cada critério."
          />
        </Card>
      </ApprovalWorkbench>
    );
  },
};

export const Concluida: Story = {
  name: "Concluída",
  args: {
    items: items.map((item) => ({ ...item, meta: "3 de 3 avaliados", state: "complete" })),
    activeId: "empresa",
    onActiveChange: () => undefined,
    children: (
      <EmptyState
        title="Análise concluída"
        message="Todos os itens receberam um resultado e um registro."
      />
    ),
  },
};

export const Carregando: Story = {
  args: {
    items,
    activeId: "endereco",
    onActiveChange: () => undefined,
    children: (
      <Card aria-busy="true">
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton width="38%" height={20} />
          <Skeleton />
          <Skeleton />
          <Skeleton width="72%" />
        </div>
      </Card>
    ),
  },
};
