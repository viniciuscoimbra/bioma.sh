import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Multiselect, type MultiselectOption } from "./Multiselect";

/**
 * `Multiselect` — seleção múltipla com chips removíveis dentro do campo.
 * Altura fixa: mostra até três chips e acumula o restante em `+N`.
 */
const meta = {
  title: "Components/Molecules/Multiselect",
  component: Multiselect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Digite para filtrar, Enter/clique alterna a opção, Backspace com o input vazio remove o último chip. Padrão ARIA combobox + listbox `aria-multiselectable`, navegação por setas/Home/End e `aria-activedescendant`. Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.",
      },
    },
  },
  // Largura fixa: o campo não cresce conforme chips são adicionados.
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    options: { control: false, description: "Opções disponíveis." },
    maxVisibleChips: { control: "number", description: "Colapsa chips além de N num contador +N." },
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Multiselect>;
export default meta;

type Story = StoryObj<typeof Multiselect>;

const areas: MultiselectOption[] = [
  { value: "seo", label: "SEO Técnico" },
  { value: "content", label: "Conteúdo" },
  { value: "links", label: "Backlinks" },
  { value: "perf", label: "Performance" },
  { value: "a11y", label: "Acessibilidade" },
  { value: "schema", label: "Schema · JSON-LD" },
  { value: "intl", label: "Internacionalização" },
  { value: "mobile", label: "Mobile UX" },
  { value: "social", label: "Open Graph · Cards" },
  { value: "index", label: "Indexação" },
];

/** Playground — digite para filtrar, Backspace remove o último chip. */
export const Playground: Story = {
  args: {
    label: "Áreas de análise",
    placeholder: "Adicionar áreas…",
    options: areas,
    defaultValue: ["seo", "content", "links", "perf", "a11y", "schema"],
  },
};

/** Três selecionados — cabem na linha, sem fade. */
export const Selected: Story = {
  name: "Com seleção",
  args: {
    label: "Áreas de análise",
    options: areas,
    defaultValue: ["seo", "content", "links"],
    hint: "Clique no × para remover ou pressione Backspace com o input vazio.",
  },
};

/** Sete selecionados — três visíveis e o restante acumulado. */
export const OverflowScroll: Story = {
  name: "Overflow · contador automático",
  args: {
    label: "Áreas de análise",
    options: areas,
    defaultValue: ["seo", "content", "links", "perf", "a11y", "schema", "intl"],
    hint: "Três chips visíveis +4 itens selecionados.",
  },
};

/** Chips além de 2 colapsam num contador +N. */
export const OverflowCounter: Story = {
  name: "Overflow · contador +N",
  args: {
    label: "Áreas de análise",
    options: areas,
    defaultValue: ["seo", "content", "links", "perf", "a11y"],
    maxVisibleChips: 2,
  },
};

/** Controlado — o estado vive no pai e aparece abaixo. */
export const Controlled: Story = {
  name: "Controlado",
  args: { label: "Áreas de análise", options: areas },
  render: (args) => {
    const [values, setValues] = useState<string[]>(["seo"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Multiselect {...args} value={values} onChange={setValues} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{values.join(", ") || "vazio"}]
        </code>
      </div>
    );
  },
};

/** Estado de erro com mensagem. */
export const WithError: Story = {
  name: "Com erro",
  args: {
    label: "Áreas de análise",
    options: areas,
    defaultValue: ["seo"],
    error: "Selecione ao menos duas áreas.",
  },
};

/** Campo desabilitado. */
export const Disabled: Story = {
  args: {
    label: "Áreas de análise",
    options: areas,
    defaultValue: ["seo", "content"],
    disabled: true,
  },
};
