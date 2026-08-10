import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleGroup } from "./ToggleGroup";

/**
 * `ToggleGroup` — botões liga/desliga independentes (seleção múltipla).
 */
const meta = {
  title: "Components/Atoms/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cada toggle é um botão `aria-pressed`; ligado ganha primary-soft + tinta da marca. Para seleção única use `Segmented`. Controlado via `value`/`onChange` ou não-controlado.",
      },
    },
  },
  argTypes: {
    options: { control: false },
    label: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof ToggleGroup>;
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

const camadas = [
  { value: "criticos", label: "Críticos" },
  { value: "avisos", label: "Avisos" },
  { value: "resolvidos", label: "Resolvidos" },
  { value: "info", label: "Info" },
];

/** Múltiplos toggles independentes. */
export const Playground: Story = {
  args: { options: camadas, label: "Camadas", defaultValue: ["criticos", "avisos"] },
};

/** Controlado. */
export const Controlled: Story = {
  name: "Controlado",
  args: { options: camadas, label: "Camadas" },
  render: (args) => {
    const [values, setValues] = useState<string[]>(["criticos"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <ToggleGroup {...args} value={values} onChange={setValues} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{values.join(", ") || "vazio"}]
        </code>
      </div>
    );
  },
};
