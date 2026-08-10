import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox";

/**
 * `Combobox` — input com sugestões ancoradas. O popover compartilha a borda
 * e o fundo do input: uma única superfície que expande, sem gap.
 */
const meta = {
  title: "Components/Molecules/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Padrão ARIA 1.2 combobox: filtro com destaque do trecho digitado, seções por `group`, teclado completo (setas, Enter, Escape, Home/End) e `aria-activedescendant`. Controlado via `value`/`onChange` ou não-controlado via `defaultValue`; o texto também pode ser controlado (`inputValue`) para suggest assíncrono com `filter={false}`.",
          "",
          "Variante \"pessoas\": opções com `avatar` (foto/iniciais via átomo `Avatar`) e `description` (meta secundária, ex.: CRECI). O valor selecionado também mostra o avatar no input.",
          "",
          "### Onde usar",
          "- Escolher UMA entidade numa lista pesquisável: página, domínio, imóvel.",
          "- Variante com `avatar` + `description` sempre que a opção é uma pessoa/imobiliária: escolher corretor, transferir carteira (origem/destino), atribuir responsável.",
          "",
          "### Onde NÃO usar",
          "- Múltipla seleção — use `Multiselect`.",
          "- Poucas opções fixas (≤ ~7) sem busca — use `Select` nativo.",
          "- Navegação/comando global — use `Command` (⌘K).",
          "- Nunca criar um \"combobox de pessoas\" paralelo: é esta variante (campos opcionais da opção), não outro componente.",
        ].join("\n"),
      },
    },
  },
  // Largura fixa para o campo não variar entre estados.
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    options: { control: false, description: "Opções sugeridas." },
    filter: { control: false, description: "`true` (padrão), função custom ou `false` (lista já filtrada)." },
    icon: { control: false, description: "Ícone à esquerda (padrão: lupa)." },
    clearable: { control: "boolean", description: "Botão de limpar quando há texto." },
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    onInputValueChange: { action: "input" },
    value: { control: false },
    defaultValue: { control: false },
    inputValue: { control: false },
  },
} satisfies Meta<typeof Combobox>;
export default meta;

type Story = StoryObj<typeof Combobox>;

const competitors: ComboboxOption[] = [
  { value: "rdstation", label: "rdstation.com", lead: "RS", meta: "DA 78", group: "Sugestões" },
  { value: "rdsaude", label: "rdsaude.com.br", lead: "RS", meta: "DA 64", group: "Sugestões" },
  { value: "rdrentacar", label: "rdrentacar.com", lead: "RR", meta: "DA 51", group: "Sugestões" },
  { value: "resultadigital", label: "resultadigital.com.br", lead: "RD", meta: "DA 43", group: "Sugestões" },
  { value: "remaxbrasil", label: "remaxbrasil.com.br", lead: "RB", meta: "DA 60", group: "Sugestões" },
];

const pages: ComboboxOption[] = [
  { value: "/checkout/confirmacao", label: "/checkout/confirmacao", lead: "/", meta: "2.3k/mês", group: "Recentes" },
  { value: "/checkout/pix", label: "/checkout/pix", lead: "/", meta: "980/mês", group: "Recentes" },
  { value: "/planos", label: "/planos", lead: "/", meta: "5.1k/mês", group: "Mais visitadas" },
  { value: "/blog/seo-tecnico", label: "/blog/seo-tecnico", lead: "/", meta: "3.4k/mês", group: "Mais visitadas" },
  { value: "/precos", label: "/precos", lead: "/", meta: "1.9k/mês", group: "Mais visitadas" },
];

/** Playground — digite "rd" para ver filtro + destaque. */
export const Playground: Story = {
  args: {
    label: "Concorrente",
    placeholder: "Buscar domínio…",
    options: competitors,
  },
};

/** Não-controlado com seleção inicial. */
export const Default: Story = {
  name: "Padrão · não-controlado",
  args: {
    label: "Concorrente",
    placeholder: "Buscar domínio…",
    options: competitors,
    defaultValue: "rdstation",
  },
};

/** Controlado — a seleção vive no pai e aparece abaixo. */
export const Controlled: Story = {
  name: "Controlado",
  args: { label: "Concorrente", options: competitors },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Combobox
          {...args}
          value={selected}
          onChange={(option) => setSelected(option?.value ?? null)}
        />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          selecionado: {selected ?? "—"}
        </code>
      </div>
    );
  },
};

/** Seções múltiplas via `group` — Recentes + Mais visitadas. */
export const Grouped: Story = {
  name: "Com seções",
  args: {
    label: "Buscar página",
    placeholder: "Digite um caminho…",
    options: pages,
  },
};

/** Nenhum resultado para a busca. */
export const Empty: Story = {
  name: "Sem resultados",
  args: {
    label: "Concorrente",
    options: competitors,
    inputValue: "zzz",
    emptyMessage: "Nenhum domínio encontrado",
  },
};

/** Estado de erro com mensagem. */
export const WithError: Story = {
  name: "Com erro",
  args: {
    label: "Concorrente",
    options: competitors,
    error: "Selecione um domínio válido.",
  },
};

const corretores: ComboboxOption[] = [
  { value: "joana", label: "Joana Martins", avatar: { name: "Joana Martins" }, description: "CRECI 34.512-MG" },
  { value: "marcos", label: "Marcos Silva", avatar: { name: "Marcos Silva", color: "var(--legacy-ink-2)" }, description: "CRECI 21.877-MG" },
  { value: "renata", label: "Renata Costa", avatar: { name: "Renata Costa" }, description: "CRECI 40.203-MG" },
  { value: "paulo", label: "Paulo Braga", avatar: { name: "Paulo Braga", color: "var(--legacy-ink-3)" }, description: "CRECI 18.665-MG" },
  { value: "ana", label: "Ana Lúcia Prado", avatar: { name: "Ana Lúcia Prado" }, description: "CRECI 44.910-MG" },
];

/**
 * Caso guia — transferir carteira: corretor de ORIGEM (selecionado, avatar no
 * input) em cima; DESTINO embaixo. Cada opção mostra Avatar + nome + CRECI.
 */
export const ComAvatar: Story = {
  name: "Com avatar (pessoas)",
  args: { options: corretores },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Combobox
        label="Corretor de origem"
        placeholder="Buscar corretor…"
        options={corretores}
        defaultValue="joana"
      />
      <Combobox
        label="Corretor de destino"
        placeholder="Buscar corretor…"
        options={corretores.filter((c) => c.value !== "joana")}
      />
    </div>
  ),
};

/** Campo desabilitado. */
export const Disabled: Story = {
  args: {
    label: "Concorrente",
    options: competitors,
    disabled: true,
    placeholder: "Indisponível",
  },
};
