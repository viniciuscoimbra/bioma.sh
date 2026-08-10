import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { WorkspaceSwitcher, type Workspace } from "./WorkspaceSwitcher";

const workspaces: Workspace[] = [
  { id: "globo", name: "Globo Editorial", role: "Workspace · Pro", initials: "GE" },
  { id: "refy", name: "Refy Labs", role: "Workspace · Interno", initials: "RL" },
  { id: "acme", name: "Acme Marketing", role: "Workspace · Starter", initials: "AM" },
  { id: "nexus", name: "Nexus Imóveis", role: "Workspace · Pro", initials: "NI" },
  { id: "vertex", name: "Vertex Consultoria", role: "Workspace · Trial", initials: "VC" },
];

/**
 * `WorkspaceSwitcher` — seletor de workspace estilo combobox.
 */
const meta = {
  title: "Components/Molecules/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Trigger com avatar + nome + papel + caret duplo; abre painel com busca (a partir de 5 workspaces) e check no atual. ↑/↓ + Enter, Esc/clique fora fecham. `compact` para sidebar colapsada. Controlado via `value`/`onChange` ou não-controlado.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260, minHeight: 380 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    workspaces: { control: false },
    compact: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof WorkspaceSwitcher>;
export default meta;

type Story = StoryObj<typeof WorkspaceSwitcher>;

/** 5 workspaces — abre com busca. */
export const Playground: Story = {
  args: { workspaces },
};

/** Controlado — a seleção vive no pai. */
export const Controlled: Story = {
  name: "Controlado",
  args: { workspaces },
  render: (args) => {
    const [id, setId] = useState("globo");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <WorkspaceSwitcher {...args} value={id} onChange={(w) => setId(w.id)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{id}</code>
      </div>
    );
  },
};

/** Poucos workspaces — sem busca. */
export const SemBusca: Story = {
  name: "Sem busca (< 5)",
  args: { workspaces: workspaces.slice(0, 3) },
};
