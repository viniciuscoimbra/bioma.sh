import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SplitButton } from "./SplitButton";

const Download = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const exportOptions = [
  { id: "pdf", label: "PDF", hint: ".pdf" },
  { id: "csv", label: "CSV", hint: ".csv" },
  { id: "excel", label: "Excel", hint: ".xlsx" },
  { id: "markdown", label: "Markdown", hint: ".md" },
  { id: "json", label: "JSON", hint: ".json" },
];

/**
 * `SplitButton` — ação principal + caret que abre um menu de variações.
 */
const meta = {
  title: "Components/Molecules/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "inline-radio", options: ["secondary", "primary"], description: "`secondary` (superfície) ou `primary` (cor da marca)." },
    menuAlign: { control: "inline-radio", options: ["end", "start"], description: "Alinhamento do menu em relação ao botão." },
    size: { control: "inline-radio", options: ["sm", "md"] },
    leadingIcon: { control: false },
    options: { control: false },
    onClick: { action: "clicked" },
    open: { control: false },
    onOpenChange: { control: false },
    onSelect: { control: false },
  },
  args: {
    label: "Exportar",
    defaultOptionId: "pdf",
    leadingIcon: Download,
    size: "md",
    variant: "secondary",
    menuAlign: "end",
    options: exportOptions,
  },
  // Reserva espaço abaixo do botão para o menu abrir sem ser cortado pelo canvas.
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SplitButton>;
export default meta;

type Story = StoryObj<typeof SplitButton>;

/** PDF é o padrão; ao escolher outro formato ele passa a aparecer no botão principal. */
export const Secondary: Story = { name: "Secondary · padrão" };

/** Variante da cor da marca, para a ação principal da tela. */
export const Primary: Story = {
  args: { variant: "primary" },
};

/** Menu alinhado ao início do botão (para botões encostados na borda direita). */
export const MenuStart: Story = {
  name: "Menu alinhado ao início",
  args: { menuAlign: "start" },
};

/** Tamanho compacto. */
export const Small: Story = {
  args: { size: "sm" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true, loadingLabel: "Exportando…" },
};

export const Open: Story = {
  name: "Menu aberto",
  args: { defaultOpen: true },
};

export const Interativo: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Nenhuma exportação iniciada.");

    function runDefault() {
      setLoading(true);
      setMessage("Exportando PDF…");
      window.setTimeout(() => {
        setLoading(false);
        setMessage("PDF exportado.");
      }, 700);
    }

    return (
      <div>
        <SplitButton
          {...args}
          loading={loading}
          onClick={runDefault}
          onSelect={(id) => setMessage(`${id.toUpperCase()} escolhido. O botão principal agora exporta nesse formato.`)}
        />
        <p role="status" aria-live="polite" style={{ marginTop: 16, color: "var(--ink-2)" }}>
          {message}
        </p>
      </div>
    );
  },
};
