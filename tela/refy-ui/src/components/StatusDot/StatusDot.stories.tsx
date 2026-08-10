import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./StatusDot";

/** `StatusDot` — dot de estado com halo + rótulo mono uppercase opcional. */
const meta = {
  title: "Components/Atoms/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Dot colorido 6px com halo e rótulo mono uppercase opcional. `pulse` anima o halo (\"ao vivo\") e respeita `prefers-reduced-motion`. Sem rótulo visível, passe `aria-label` no próprio componente.",
          "",
          "**Onde usar:** estado vivo no cabeçalho de página (\"monitorando\"), status de conexão OAuth (\"Conectado · primário\"), presença/atividade em listas — todo lugar onde hoje se improvisa um `<span>` redondo colorido.",
          "",
          "**Onde NÃO usar:** contadores ou texto de categoria (use `Badge`/`Chip`); status dentro do `Badge` que já tem `dot` próprio; indicador de progresso (use `ProgressBar`/`Skeleton`).",
        ].join("\n"),
      },
    },
  },
  args: { tone: "good", pulse: false, children: "Conectado" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["good", "ok", "warn", "critical", "info", "neutral"],
    },
    pulse: { control: "boolean" },
    children: { control: "text", description: "Rótulo mono uppercase opcional." },
  },
} satisfies Meta<typeof StatusDot>;
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Padrao: Story = {};

export const AoVivo: Story = {
  name: "Ao vivo (pulse)",
  args: { pulse: true, children: "Monitorando" },
};

export const SemRotulo: Story = {
  name: "Só o dot (com aria-label)",
  args: { children: undefined, "aria-label": "Conectado" },
};

export const Tons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <StatusDot tone="good">Conectado · primário</StatusDot>
      <StatusDot tone="ok">Sincronizado</StatusDot>
      <StatusDot tone="warn">Atenção</StatusDot>
      <StatusDot tone="critical">Falha de conexão</StatusDot>
      <StatusDot tone="info">Em análise</StatusDot>
      <StatusDot tone="neutral">Inativo</StatusDot>
    </div>
  ),
};
