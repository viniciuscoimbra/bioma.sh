import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Drawer } from "./Drawer";

/**
 * `Drawer` — painel lateral deslizante; `side="bottom"` vira um sheet com alça.
 */
const meta = {
  title: "Components/Organisms/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Scrim atrás (clique fecha), Esc fecha, × no cabeçalho, body rolável e rodapé fixo opcional. `side`: `left`/`right` (320px) ou `bottom` (sheet, cantos 20px + alça). Controlado por `open`/`onOpenChange`.",
      },
    },
  },
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right", "bottom"] },
    open: { control: false },
    onOpenChange: { control: false },
    title: { control: "text" },
    footer: { control: false },
    children: { control: false },
    hideClose: { control: "boolean" },
  },
} satisfies Meta<typeof Drawer>;
export default meta;

type Story = StoryObj<typeof Drawer>;

const corpo = (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <p style={{ margin: 0 }}>
      Detalhes da análise do domínio: 84 páginas rastreadas, 12 problemas críticos e 31 avisos.
    </p>
    <p style={{ margin: 0 }}>
      O corpo do drawer rola de forma independente quando o conteúdo passa da altura disponível.
    </p>
    {Array.from({ length: 18 }, (_, i) => (
      <p key={i} style={{ margin: 0, color: "var(--ink-3)" }}>
        Item de conteúdo {i + 1} — texto de preenchimento para demonstrar a rolagem interna.
      </p>
    ))}
  </div>
);

const footer = (close?: () => void) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
    <span style={{ marginRight: "auto", color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      12 itens · Esc para cancelar
    </span>
    <Button variant="ghost" onClick={close}>Cancelar</Button>
    <Button variant="primary" onClick={close}>Aplicar</Button>
  </div>
);

function DrawerDemo({ side }: { side: "left" | "right" | "bottom" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ minHeight: 420, padding: 24 }}>
      <Button onClick={() => setOpen(true)}>Abrir {side === "bottom" ? "sheet" : `drawer ${side}`}</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side={side}
        title="Detalhes da análise"
        footer={footer(() => setOpen(false))}
      >
        {corpo}
      </Drawer>
    </div>
  );
}

/** Drawer à direita (padrão) com rodapé de ações. */
export const Direita: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="right" />,
};

/** Drawer à esquerda. */
export const Esquerda: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="left" />,
};

/** Sheet inferior com alça (grab). */
export const Sheet: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="bottom" />,
};

/** Sheet aberto para inspecionar alça, rolagem e footer fixo no tema ativo. */
export const SheetAberto: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    side: "bottom",
    title: "Mover 12 clientes",
    footer: footer(),
    children: corpo,
  },
};
