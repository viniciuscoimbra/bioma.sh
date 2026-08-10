import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { HelpField } from "./HelpField";
import { Input } from "../Input";
import { Select } from "../Select";
import { Drawer } from "../Drawer";

/**
 * `HelpField` — padrão para campo técnico inevitável.
 */
const meta = {
  title: "Components/Molecules/HelpField",
  component: HelpField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Form-row com rótulo simples + ícone de ajuda (`IconButton` sm). No hover/foco, `Tooltip` com o `helpText` e o link \"Saber mais\", que chama `onLearnMore` — o app abre a Drawer de ajuda (o componente traz só o gancho, nunca a Drawer). O campo (children) recebe `aria-describedby` ligado ao texto de ajuda.",
          "",
          "### Onde usar",
          "- Campo técnico inevitável que precisa de nome simples + explicação: planos de comissão (nunca expor `share_pct` cru — rótulo \"Participação na comissão\" + ajuda), chaves de API, parâmetros de crawler.",
          "- Sempre que a explicação não cabe num `hint` de uma linha e existe doc mais longa (\"Saber mais\" → Drawer de ajuda do app).",
          "",
          "### Onde NÃO usar",
          "- Campo autoexplicativo (\"Nome\", \"E-mail\") — o `label`/`hint` do próprio Input basta.",
          "- Como tooltip genérico fora de formulário — use o átomo `Tooltip`.",
          "- Para validação/erro — erro é do campo (`error` do Input), não da ajuda.",
          "- Nunca usar o nome interno do banco como `label`: ontologia PT simples na UI.",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380, paddingTop: 96 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    helpText: { control: "text" },
    learnMoreLabel: { control: "text" },
    side: { control: "radio", options: ["top", "bottom", "left", "right"] },
    children: { control: false },
    onLearnMore: { control: false, description: "Gancho do \"Saber mais\": o app abre a Drawer de ajuda." },
    htmlFor: { control: false },
  },
} satisfies Meta<typeof HelpField>;
export default meta;

type Story = StoryObj<typeof HelpField>;

/** Caso guia: plano de comissão — nome simples + ajuda, nunca `share_pct` cru. */
export const Playground: Story = {
  args: {
    label: "Participação na comissão",
    helpText:
      "Quanto da comissão de venda fica com o corretor. O restante fica com a imobiliária, conforme o plano.",
    htmlFor: "share-input",
    onLearnMore: () => console.log("abrir Drawer de ajuda"),
    children: <Input id="share-input" placeholder="Ex.: 40" suffix="%" />,
  },
};

/** Sem `onLearnMore`: tooltip só com o texto (sem link). */
export const SemSaberMais: Story = {
  name: "Sem \"Saber mais\"",
  args: {
    label: "Fila de distribuição",
    helpText: "Ordem em que novos contatos são oferecidos aos corretores.",
    htmlFor: "queue-select",
    children: (
      <Select id="queue-select">
        <option value="rr">Rodízio</option>
        <option value="top">Melhor desempenho</option>
      </Select>
    ),
  },
};

/** Integração completa: "Saber mais" abre a Drawer de ajuda DO APP (a Drawer não é do HelpField). */
export const ComDrawerDoApp: Story = {
  name: "Com Drawer do app",
  args: {
    label: "Participação na comissão",
    helpText: "Quanto da comissão de venda fica com o corretor.",
    children: <Input id="share-drawer" placeholder="Ex.: 40" suffix="%" />,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <HelpField {...args} onLearnMore={() => setOpen(true)} />
        <Drawer open={open} onOpenChange={setOpen} side="right" title="Planos de comissão">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Conteúdo de ajuda longo do app: como os planos dividem a comissão entre corretor e
            imobiliária, exemplos e regras.
          </p>
        </Drawer>
      </>
    );
  },
};
