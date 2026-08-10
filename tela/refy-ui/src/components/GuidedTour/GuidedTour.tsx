import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Popover } from "../Popover";
import type { PopoverAlign, PopoverSide } from "../Popover";
import { ProgressBar } from "../ProgressBar";
import { cn } from "../../lib/cn";
import styles from "./GuidedTour.module.css";

export interface GuidedTourAction {
  label: string;
  onAction: () => void;
  /** Avança depois de executar a ação. */
  advance?: boolean;
}

export interface GuidedTourStep {
  id: string;
  title: string;
  description: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  action?: GuidedTourAction;
}

export interface GuidedTourProps {
  steps: GuidedTourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentStep?: string;
  defaultStep?: string;
  onStepChange?: (id: string) => void;
  onComplete?: () => void;
  children: ReactNode;
}

export interface GuidedTourAnchorProps {
  stepId: string;
  children: ReactNode;
  /** Use block para controles que ocupam toda a largura. */
  block?: boolean;
  className?: string;
}

interface GuidedTourContextValue {
  steps: GuidedTourStep[];
  currentId?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  go: (id: string) => void;
  previous: () => void;
  next: () => void;
  complete: () => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

/** Estado e navegação de um tour; use GuidedTourAnchor nos elementos reais. */
export function GuidedTour({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  currentStep,
  defaultStep,
  onStepChange,
  onComplete,
  children,
}: GuidedTourProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalStep, setInternalStep] = useState(defaultStep ?? steps[0]?.id);
  const isOpen = open ?? internalOpen;
  const currentId = currentStep ?? internalStep;
  const index = Math.max(0, steps.findIndex((step) => step.id === currentId));

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function go(id: string) {
    if (!steps.some((step) => step.id === id)) return;
    if (currentStep === undefined) setInternalStep(id);
    onStepChange?.(id);
  }

  function previous() {
    const target = steps[Math.max(0, index - 1)];
    if (target) go(target.id);
  }

  function complete() {
    setOpen(false);
    onComplete?.();
  }

  function next() {
    const target = steps[index + 1];
    if (target) go(target.id);
    else complete();
  }

  const value = useMemo<GuidedTourContextValue>(
    () => ({ steps, currentId, open: isOpen, setOpen, go, previous, next, complete }),
    [steps, currentId, isOpen, index]
  );

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
}

function TourCard({ step, index, context }: { step: GuidedTourStep; index: number; context: GuidedTourContextValue }) {
  const last = index === context.steps.length - 1;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span>{index + 1} de {context.steps.length}</span>
        <IconButton
          autoFocus
          size="sm"
          variant="ghost"
          aria-label="Fechar tour"
          onClick={() => context.setOpen(false)}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>}
        />
      </div>
      <ProgressBar value={((index + 1) / context.steps.length) * 100} size="sm" aria-label={`Etapa ${index + 1} de ${context.steps.length}`} />
      <div className={styles.copy}>
        <h3>{step.title}</h3>
        <div>{step.description}</div>
      </div>
      {step.action && (
        <Button
          size="sm"
          variant="secondary"
          block
          onClick={() => {
            step.action?.onAction();
            if (step.action?.advance) context.next();
          }}
        >
          {step.action.label}
        </Button>
      )}
      <div className={styles.navigation}>
        <Button size="sm" variant="ghost" disabled={index === 0} onClick={context.previous}>Voltar</Button>
        <Button size="sm" variant="primary" onClick={context.next}>{last ? "Concluir" : "Próximo"}</Button>
      </div>
    </div>
  );
}

/** Âncora um passo do tour ao controle real que está sendo explicado. */
export function GuidedTourAnchor({ stepId, children, block = false, className }: GuidedTourAnchorProps) {
  const context = useContext(GuidedTourContext);
  if (!context) throw new Error("GuidedTourAnchor precisa estar dentro de GuidedTour.");
  const step = context.steps.find((item) => item.id === stepId);
  if (!step) throw new Error(`Etapa de tour inexistente: ${stepId}`);
  const index = context.steps.findIndex((item) => item.id === stepId);
  const active = context.open && context.currentId === stepId;
  const targetRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef(active);

  useEffect(() => {
    if (wasActive.current && !active && !context.open) {
      const focusable = targetRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      focusable?.focus();
    }
    wasActive.current = active;
  }, [active]);

  return (
    <Popover
      open={active}
      onOpenChange={context.setOpen}
      side={step.side ?? "bottom"}
      align={step.align ?? "start"}
      label={step.title}
      className={cn(styles.anchorWrap, block && styles.block, active && styles.isActive, className)}
      content={<TourCard step={step} index={index} context={context} />}
    >
      <div ref={targetRef} className={styles.target}>{children}</div>
    </Popover>
  );
}
