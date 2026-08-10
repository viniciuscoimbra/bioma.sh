import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Kbd } from "../Kbd";
import { Icons } from "../../_demo/icons";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Components/Molecules/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    shortcut: { control: "text" },
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    delayMs: { control: { type: "range", min: 0, max: 1000, step: 50 } },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const NoBotao: Story = {
  args: { label: "Créditos acumulam", side: "top", delayMs: 350 },
  render: (args) => <Tooltip {...args}><Button variant="secondary">Créditos</Button></Tooltip>,
};

export const ComAtalho: Story = {
  args: { label: "Rodar análise", shortcut: "⌘ Enter", defaultOpen: true },
  render: (args) => <Tooltip {...args}><Button variant="primary">Analisar</Button></Tooltip>,
};

export const ComDescricao: Story = {
  args: {
    label: "Correspondência do imóvel",
    description: "Calculada a partir do perfil e das preferências confirmadas.",
    defaultOpen: true,
  },
  render: (args) => <Tooltip {...args}><IconButton aria-label="Entenda o score" icon={Icons.help} /></Tooltip>,
};

export const Lados: Story = {
  decorators: [(Story) => <div style={{ padding: 110 }}><Story /></div>],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 120px)", gap: 100, placeItems: "center" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip key={side} label={`Lado ${side}`} side={side} defaultOpen delayMs={0}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Gatilhos: Story = {
  decorators: [(Story) => <div style={{ padding: 80 }}><Story /></div>],
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
      <Tooltip label="Score consolidado" delayMs={0}><IconButton aria-label="Informações" icon={Icons.help} /></Tooltip>
      <Tooltip label="Atalho principal" shortcut="⌘ Enter" delayMs={0}><Button variant="primary">Analisar</Button></Tooltip>
      <Tooltip label="CSV, JSON ou PDF" delayMs={0}><Button variant="ghost">Exportar</Button></Tooltip>
      <Tooltip label="Abrir documentação" delayMs={0}><a href="#docs">dommus.app/docs</a></Tooltip>
      <Tooltip label="Paleta de comandos" delayMs={0}><span tabIndex={0}><Kbd>⌘K</Kbd></span></Tooltip>
      <Tooltip label="Última atualização" side="bottom" delayMs={0}><span tabIndex={0}>?</span></Tooltip>
    </div>
  ),
};
