import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Command, type CommandItem } from "./Command";

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const RerunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const items: CommandItem[] = [
  { id: "new", label: "Iniciar nova análise", group: "Ações", icon: PlusIcon, shortcut: "⌘N", keywords: "criar começar" },
  { id: "rerun", label: "Re-rodar última análise", group: "Ações", icon: RerunIcon, shortcut: "⌘R", keywords: "repetir atualizar" },
  { id: "rd", label: "rdstation.com", group: "Domínios recentes", lead: "RD" },
  { id: "rr", label: "resultadosdigitais.com.br", group: "Domínios recentes", lead: "RR" },
  { id: "settings", label: "Abrir configurações", group: "Ações", shortcut: "⌘," },
];

/**
 * `Command` — paleta de comandos (⌘K) com busca global, grupos e atalhos.
 */
const meta = {
  title: "Components/Organisms/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Busca com destaque do termo, agrupamento por `group`, atalhos em `kbd`, ↑/↓ + Enter + Esc, `aria-activedescendant`. Overlay controlado por `open`/`onOpenChange` (sem estado global) — registre o atalho ⌘K no app e abra a paleta. Card de 560px, lista com max-height 360px.",
      },
    },
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    items: { control: false },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof Command>;
export default meta;

type Story = StoryObj<typeof Command>;

/** Aberta por padrão — digite "análise" para ver filtro + destaque. */
export const Aberta: Story = {
  args: { open: true, onOpenChange: () => {}, items },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: 480 }}>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button onClick={() => setOpen(true)}>Reabrir paleta</Button>
          </div>
        )}
        <Command {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};

/** Fluxo real: ⌘K (ou Ctrl+K) abre, Esc fecha. Clique na área e use o atalho. */
export const ComAtalho: Story = {
  name: "Com atalho ⌘K",
  args: { open: false, onOpenChange: () => {}, items },
  render: (args) => {
    const [open, setOpen] = useState(false);
    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen(true);
        }
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (
      <div style={{ minHeight: 480, padding: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          ou pressione ⌘K / Ctrl+K
        </code>
        <Command {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};
