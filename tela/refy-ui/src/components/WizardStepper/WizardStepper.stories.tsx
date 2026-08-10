import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { WizardStepper } from "./WizardStepper";
import type { WizardStep } from "./WizardStepper";

const steps: WizardStep[] = [
  { id: "pedido", label: "Pedido" },
  { id: "sobre", label: "Sobre você" },
  { id: "tipos", label: "Tipos" },
  { id: "bairros", label: "Bairros" },
  { id: "investimento", label: "Investimento" },
  { id: "preferencias", label: "Preferências" },
  { id: "revisao", label: "Revisão" },
];

const meta = {
  title: "Components/Molecules/WizardStepper",
  component: WizardStepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Progresso do wizard, sem relação com loading. Deriva etapas concluídas/atual/futuras, permite voltar apenas ao que já foi concluído e compõe `ProgressBar` + `IconButton`. Setas movem o foco entre etapas navegáveis; Enter ou Espaço abrem a etapa focada.",
      },
    },
  },
  argTypes: {
    steps: { control: false }, current: { control: false }, onStepChange: { action: "step-change" },
    onBack: { action: "back" }, label: { control: "text" }, variant: { control: "select", options: ["auto", "horizontal", "compact"] },
    allowFutureNavigation: { control: "boolean" },
  },
} satisfies Meta<typeof WizardStepper>;
export default meta;

type Story = StoryObj<typeof WizardStepper>;

/** Jornada real: Pedido → Sobre você → demais critérios → Revisão. */
export const Horizontal: Story = {
  render: (args) => {
    const [current, setCurrent] = useState("bairros");
    const index = steps.findIndex((step) => step.id === current);
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
        <WizardStepper
          {...args}
          steps={steps}
          current={current}
          variant="horizontal"
          label="Montando seu perfil de busca"
          onStepChange={setCurrent}
          onBack={() => setCurrent(steps[Math.max(index - 1, 0)].id)}
        />
        <p aria-live="polite" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>
          Etapa aberta: {steps.find((step) => step.id === current)?.label}.
        </p>
      </div>
    );
  },
};

/** Mobile/containers estreitos: mantém contexto, retorno e progresso sem espremer sete labels. */
export const Compacto: Story = {
  render: (args) => {
    const [current, setCurrent] = useState("sobre");
    const index = steps.findIndex((step) => step.id === current);
    return (
      <div style={{ maxWidth: 390 }}>
        <WizardStepper
          {...args}
          steps={steps}
          current={current}
          variant="compact"
          label="Montando seu perfil de busca"
          onStepChange={setCurrent}
          onBack={() => setCurrent(steps[Math.max(index - 1, 0)].id)}
        />
      </div>
    );
  },
};

/** Concluída, atual, futura e futura indisponível na mesma composição. */
export const Estados: Story = {
  args: {
    steps: steps.map((step) => step.id === "investimento" ? { ...step, disabled: true } : step),
    current: "tipos",
    variant: "horizontal",
    label: "Estados das etapas",
    onStepChange: () => {},
  },
};

/** No final, todas as etapas anteriores permanecem revisáveis. */
export const Concluido: Story = {
  args: {
    steps,
    current: "revisao",
    variant: "auto",
    label: "Perfil pronto para revisão",
    onStepChange: () => {},
  },
};
