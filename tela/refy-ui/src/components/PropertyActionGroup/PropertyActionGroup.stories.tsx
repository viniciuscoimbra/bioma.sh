import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PropertyActionGroup, type PropertyAction, type PropertyActionGroupState } from "./PropertyActionGroup";

const meta = {
  title: "Components/Molecules/PropertyActionGroup",
  component: PropertyActionGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof PropertyActionGroup>;
export default meta;
type Story = StoryObj<typeof PropertyActionGroup>;

function FunctionalActions() {
  const [active, setActive] = useState<PropertyAction>();
  const [state, setState] = useState<PropertyActionGroupState>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function act(action: PropertyAction) {
    setActive(action);
    setState("processing");
    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setState("completed"), 700),
      window.setTimeout(() => {
        setState("idle");
        setActive(undefined);
      }, 1800),
    ];
  }

  return <PropertyActionGroup activeAction={active} state={state} onAction={act} />;
}

export const TresAcoes: Story = { render: () => <FunctionalActions /> };
export const Processando: Story = { args: { state: "processing", activeAction: "visit" } };
export const Concluido: Story = { args: { state: "completed", activeAction: "save" } };
export const Indisponivel: Story = { args: { state: "unavailable" } };
export const Vertical: Story = { args: { orientation: "vertical" } };
