import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Menu, type MenuEntry } from "./Menu";

const UserIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);
const GearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
  </svg>
);

const entries: MenuEntry[] = [
  { type: "label", label: "Conta" },
  { id: "perfil", label: "Perfil", icon: UserIcon, shortcut: "⌘P" },
  { id: "config", label: "Configurações", icon: GearIcon },
  { type: "separator" },
  { type: "label", label: "Ações" },
  { id: "nova", label: "Nova análise", icon: PlusIcon },
  { type: "separator" },
  { id: "apagar", label: "Apagar análise", icon: TrashIcon, danger: true },
];

/**
 * `Menu` — lista de ações pop-up ancorada a um trigger.
 */
const meta = {
  title: "Components/Molecules/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Ícone, atalho `kbd`, separadores, rótulos de seção e item destrutivo (vermelho). ↑/↓ + Enter, Esc/clique fora fecham. `role=\"menu\"`/`menuitem`. Controlado por `open`/`onOpenChange`. Min-width 200px.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 320, display: "flex", alignItems: "flex-start", paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    align: { control: "inline-radio", options: ["start", "end"] },
    open: { control: false },
    onOpenChange: { control: false },
    entries: { control: false },
    children: { control: false },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof Menu>;
export default meta;

type Story = StoryObj<typeof Menu>;

/** Menu de conta com seções, atalho e item destrutivo. */
export const Playground: Story = {
  args: { open: false, onOpenChange: () => {}, entries, children: null },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <Menu {...args} open={open} onOpenChange={setOpen}>
        <Button onClick={() => setOpen(!open)}>Ações ▾</Button>
      </Menu>
    );
  },
};
