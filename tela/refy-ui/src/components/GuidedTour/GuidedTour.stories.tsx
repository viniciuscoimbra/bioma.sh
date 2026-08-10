import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Segmented } from "../Segmented";
import { GuidedTour, GuidedTourAnchor } from "./GuidedTour";
import type { GuidedTourStep } from "./GuidedTour";

const meta = {
  title: "Components/Organisms/GuidedTour",
  component: GuidedTour,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tour multi-step ancorado aos controles reais por `GuidedTourAnchor`. Compõe `Popover`, `ProgressBar`, `Button` e `IconButton`; aplica spotlight, foco inicial, Escape e restauração de foco. A ação do passo chama o mesmo estado do controle explicado — não é uma simulação separada.",
      },
    },
  },
  argTypes: {
    steps: { control: false }, children: { control: false }, open: { control: false }, currentStep: { control: false },
    onOpenChange: { action: "open" }, onStepChange: { action: "step" }, onComplete: { action: "complete" },
  },
} satisfies Meta<typeof GuidedTour>;
export default meta;

type Story = StoryObj<typeof GuidedTour>;

function TourDemo({ startStep = "operacao", initiallyOpen = true }: { startStep?: string; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [current, setCurrent] = useState(startStep);
  const [operation, setOperation] = useState("comprar");
  const [types, setTypes] = useState(["apartamento"]);
  const [message, setMessage] = useState("Tour iniciado.");

  const steps = useMemo<GuidedTourStep[]>(() => [
    {
      id: "operacao",
      title: "Comprar ou alugar?",
      description: "Comece pela operação. Você pode trocar esta escolha depois.",
      side: "bottom",
      align: "start",
    },
    {
      id: "tipos",
      title: "Escolha mais de um tipo",
      description: "Apartamento e casa podem entrar juntos na mesma busca.",
      side: "bottom",
      action: {
        label: types.includes("casa") ? "Casa já selecionada" : "Selecionar Casa agora",
        onAction: () => {
          setTypes((value) => value.includes("casa") ? value : [...value, "casa"]);
          setMessage("A ação do tour selecionou Casa no controle real.");
        },
      },
    },
    {
      id: "continuar",
      title: "Continue quando fizer sentido",
      description: "O pedido permanece editável nos próximos passos do wizard.",
      side: "top",
      align: "end",
    },
  ], [types]);

  return (
    <div style={{ minHeight: 480, display: "grid", alignContent: "start", gap: 28, maxWidth: 760, padding: "28px 12px 180px" }}>
      <Button
        size="sm"
        variant="secondary"
        style={{ justifySelf: "start" }}
        onClick={() => { setCurrent("operacao"); setOpen(true); setMessage("Tour reiniciado."); }}
      >
        Reiniciar tour
      </Button>
      <GuidedTour
        steps={steps}
        open={open}
        currentStep={current}
        onOpenChange={setOpen}
        onStepChange={setCurrent}
        onComplete={() => setMessage("Tour concluído.")}
      >
        <div style={{ display: "grid", gap: 24 }}>
          <GuidedTourAnchor stepId="operacao">
            <Segmented
              label="Operação"
              value={operation}
              onChange={setOperation}
              options={[{ value: "comprar", label: "Comprar" }, { value: "alugar", label: "Alugar" }]}
            />
          </GuidedTourAnchor>

          <GuidedTourAnchor stepId="tipos" block>
            <div role="group" aria-label="Tipos de imóvel" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["apartamento", "casa", "cobertura"].map((type) => (
                <Chip
                  key={type}
                  selected={types.includes(type)}
                  showCheck
                  onClick={() => setTypes((value) => value.includes(type) ? value.filter((item) => item !== type) : [...value, type])}
                >
                  {type[0].toUpperCase() + type.slice(1)}
                </Chip>
              ))}
            </div>
          </GuidedTourAnchor>

          <GuidedTourAnchor stepId="continuar">
            <Button variant="primary" onClick={() => setMessage("O controle real avançaria para o wizard.")}>Continuar</Button>
          </GuidedTourAnchor>
        </div>
      </GuidedTour>
      <p role="status" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{message}</p>
    </div>
  );
}

/** Três âncoras reais, avanço/retorno, foco, Escape e conclusão. */
export const MultiEtapas: Story = { render: () => <TourDemo /> };

/** Começa no passo cuja ação seleciona Casa no mesmo Chip exibido na tela. */
export const AcaoNoControle: Story = { render: () => <TourDemo startStep="tipos" /> };

/** Estado fechado; Reiniciar tour abre e posiciona o primeiro passo. */
export const Fechado: Story = { render: () => <TourDemo initiallyOpen={false} /> };
