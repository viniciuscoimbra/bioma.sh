import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { StickyFooter } from "./StickyFooter";

/**
 * `StickyFooter` — barra de ações de formulário fixa ao fundo.
 */
const meta = {
  title: "Components/Molecules/StickyFooter",
  component: StickyFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Barra de ações de formulário fixa ao fundo do container (`position=\"sticky\"`, padrão) ou da viewport (`position=\"fixed\"`, com spacer automático medido por ResizeObserver para não cobrir conteúdo). Slot `start` à esquerda (info/erros/\"alterações não salvas\") e `children` à direita (Cancelar/Salvar com `Button`). Borda superior + fundo em token; respeita `env(safe-area-inset-bottom)` no mobile.",
          "",
          "**Onde usar:** formulários longos de página roteada onde Salvar/Cancelar precisam ficar sempre visíveis — settings, cadastro/edição de entidade, wizards de página inteira.",
          "",
          "**Onde NÃO usar:** dentro de `Modal`/`Drawer` (eles têm o próprio rodapé); formulários curtos que cabem na tela (botões no fluxo bastam); como barra de navegação inferior (não é tab bar); para toasts/avisos flutuantes (use `Toast`/`Snackbar`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    position: { control: "inline-radio", options: ["sticky", "fixed"] },
    start: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof StickyFooter>;
export default meta;

type Story = StoryObj<typeof StickyFooter>;

const longForm = (
  <div style={{ padding: "24px 32px", display: "grid", gap: 16 }}>
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        style={{
          height: 72,
          borderRadius: 8,
          border: "1px solid var(--line-soft)",
          background: "var(--surface)",
          display: "grid",
          placeItems: "center",
          color: "var(--ink-4)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        campo {i + 1}
      </div>
    ))}
  </div>
);

/** Sticky (padrão) — cola no fundo do container rolável, sem spacer. */
export const Playground: Story = {
  render: (args) => (
    <div
      style={{
        height: 380,
        overflow: "auto",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
      }}
    >
      {longForm}
      <StickyFooter {...args}>
        <Button variant="ghost">Cancelar</Button>
        <Button>Salvar alterações</Button>
      </StickyFooter>
    </div>
  ),
};

/** Slot `start` — estado do formulário à esquerda das ações. */
export const ComInfo: Story = {
  name: "Com info (start)",
  render: (args) => (
    <div style={{ height: 320, overflow: "auto", background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter {...args} start={<span>Alterações não salvas</span>}>
        <Button variant="ghost">Descartar</Button>
        <Button>Salvar</Button>
      </StickyFooter>
    </div>
  ),
};

/** Erros no `start` — feedback de validação sempre visível junto das ações. */
export const ComErro: Story = {
  name: "Com erro",
  render: (args) => (
    <div style={{ height: 320, overflow: "auto", background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter
        {...args}
        start={<span style={{ color: "var(--critical)" }}>2 campos com erro. Revise antes de salvar</span>}
      >
        <Button variant="ghost">Cancelar</Button>
        <Button disabled>Salvar</Button>
      </StickyFooter>
    </div>
  ),
};

/** `position="fixed"` — fixa na viewport; o spacer evita cobrir o conteúdo. */
export const Fixed: Story = {
  args: { position: "fixed" },
  render: (args) => (
    <div style={{ background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter {...args} start={<span>Rodapé fixo na viewport</span>}>
        <Button variant="ghost">Cancelar</Button>
        <Button>Salvar</Button>
      </StickyFooter>
    </div>
  ),
};
