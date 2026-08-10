import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Otp } from "./Otp";

/**
 * `Otp` — código de verificação, um dígito por campo (48×56, mono 22px).
 */
const meta = {
  title: "Components/Atoms/Otp",
  component: Otp,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Digitar avança o foco, Backspace limpa e volta, ←/→ navegam, colar distribui o código inteiro. `groupSize` insere o separador \"—\" entre grupos e `onComplete` dispara com o código cheio. `autocomplete=\"one-time-code\"` no primeiro campo para SMS no mobile. Controlado via `value`/`onChange` ou não-controlado.",
      },
    },
  },
  argTypes: {
    length: { control: "number" },
    groupSize: { control: "number" },
    alphanumeric: { control: "boolean" },
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    autoFocus: { control: false },
    onChange: { action: "changed" },
    onComplete: { action: "complete" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Otp>;
export default meta;

type Story = StoryObj<typeof Otp>;

/** Playground — 6 dígitos com separador a cada 3. Cole "392114" para testar. */
export const Playground: Story = {
  args: { length: 6, groupSize: 3 },
};

/** Sem separador, 4 dígitos (PIN curto). */
export const Pin4: Story = {
  name: "PIN de 4",
  args: { length: 4 },
};

/** Parcialmente preenchido (não-controlado). */
export const Preenchido: Story = {
  name: "Pré-preenchido",
  args: { length: 6, groupSize: 3, defaultValue: "392" },
};

/** Controlado — dispara `onComplete` no último dígito. */
export const Controlled: Story = {
  name: "Controlado",
  args: { length: 6, groupSize: 3 },
  render: (args) => {
    const [code, setCode] = useState("");
    const [done, setDone] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Otp {...args} value={code} onChange={(c) => { setCode(c); setDone(false); }} onComplete={() => setDone(true)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          código: "{code}" {done && "✓ completo"}
        </code>
      </div>
    );
  },
};

/** Código incorreto. */
export const ComErro: Story = {
  name: "Com erro",
  args: { length: 6, groupSize: 3, defaultValue: "392114", error: "Código incorreto. Tente novamente." },
};

/** Desabilitado. */
export const Disabled: Story = {
  args: { length: 6, groupSize: 3, defaultValue: "392", disabled: true },
};
