import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";
import { KanbanBoard } from "./KanbanBoard";

const meta = {
  title: "Components/Organisms/KanbanBoard",
  component: KanbanBoard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof KanbanBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  args: {
    columns: [
      {
        id: "review",
        title: "Em análise",
        description: "Cadastros assumidos pela equipe.",
        items: [
          { id: "agency-1", title: "Horizonte Negócios", description: "Documentos e responsável em revisão.", meta: "TNT-002", footer: <Badge tone="warn">há 2 horas</Badge> },
        ],
      },
      {
        id: "waiting",
        title: "Aguardando informações",
        description: "A imobiliária precisa responder.",
        items: [
          { id: "agency-2", title: "Pampulha Imóveis", description: "Comprovante de endereço solicitado.", meta: "TNT-004", footer: <Badge tone="danger">vence amanhã</Badge> },
        ],
      },
      { id: "done", title: "Concluídos", description: "Decisões registradas.", items: [] },
    ],
  },
};
