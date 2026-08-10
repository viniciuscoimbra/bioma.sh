import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";

const meta = {
  title: "Components/Molecules/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    items: [
      { id: "a", title: "Como os créditos são cobrados?", content: <p>100 créditos por análise padrão, 300 por síntese profunda. Créditos são acumulativos e nunca expiram.</p> },
      { id: "b", title: "Posso mudar de plano a qualquer momento?", content: <p>Sim. O upgrade vale na hora; o downgrade entra no próximo ciclo. Créditos acumulados permanecem.</p> },
      { id: "c", title: "O que acontece se eu cancelar?", content: <p>Você mantém acesso até o fim do período pago. Depois, o ambiente fica somente leitura e os créditos ficam disponíveis para consumo.</p> },
    ],
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    items: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof Accordion>;
export default meta;

type Story = StoryObj<typeof Accordion>;

/** Um aberto por vez (padrão). */
export const AccordionSingle: Story = { name: "Single", args: { type: "single", defaultValue: ["a"] } };

/** Vários abertos simultaneamente. */
export const AccordionMultiple: Story = { name: "Múltiplo", args: { type: "multiple", defaultValue: ["a", "c"] } };

/** Com um item desabilitado. */
export const AccordionDesabilitado: Story = {
  name: "Com desabilitado",
  args: {
    items: [
      { id: "a", title: "Item ativo", content: <p>Conteúdo normal.</p> },
      { id: "b", title: "Item desabilitado", content: <p>Não abre.</p>, disabled: true },
    ],
  },
};
