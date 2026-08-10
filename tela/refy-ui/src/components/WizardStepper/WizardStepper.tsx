import { useMemo, useRef } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import styles from "./WizardStepper.module.css";

export interface WizardStep {
  id: string;
  label: string;
  /** Impede retorno/navegação direta para esta etapa. */
  disabled?: boolean;
}

export interface WizardStepperProps {
  steps: WizardStep[];
  /** ID da etapa atual. */
  current: string;
  /** Título da jornada, anunciado junto do progresso. */
  label?: string;
  /** `auto` fica compacto por container query; as outras opções forçam o layout. */
  variant?: "auto" | "horizontal" | "compact";
  /** Por padrão só etapas concluídas e a atual podem ser abertas. */
  allowFutureNavigation?: boolean;
  onStepChange?: (id: string) => void;
  /** Ação de retorno; usa o IconButton canônico. */
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

/**
 * Progresso navegável de wizard. Compõe ProgressBar e IconButton, deriva os
 * estados concluído/atual/futuro e mantém etapas futuras bloqueadas por padrão.
 */
export function WizardStepper({
  steps,
  current,
  label = "Progresso",
  variant = "auto",
  allowFutureNavigation = false,
  onStepChange,
  onBack,
  backLabel = "Voltar à etapa anterior",
  className,
}: WizardStepperProps) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === current));
  const currentStep = steps[currentIndex];
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navigable = useMemo(
    () => steps.filter((step, index) => !step.disabled && (allowFutureNavigation || index <= currentIndex)),
    [steps, currentIndex, allowFutureNavigation]
  );
  const progress = steps.length ? ((currentIndex + 1) / steps.length) * 100 : 0;

  function focusRelative(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onStepChange?.(id);
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = navigable.findIndex((step) => step.id === id);
    let next = index;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = navigable.length - 1;
    else if (event.key === "ArrowLeft") next = (index - 1 + navigable.length) % navigable.length;
    else next = (index + 1) % navigable.length;
    const nextStep = navigable[next];
    if (nextStep) refs.current[nextStep.id]?.focus();
  }

  return (
    <nav
      className={cn(styles.root, styles[variant], className)}
      aria-label={label}
      style={{
        "--step-count": Math.max(steps.length, 1),
        "--wizard-ratio": steps.length > 1 ? currentIndex / (steps.length - 1) : 1,
      } as CSSProperties}
    >
      <div className={styles.summary}>
        {onBack && (
          <IconButton
            className={styles.back}
            size="sm"
            variant="ghost"
            aria-label={backLabel}
            disabled={currentIndex === 0}
            onClick={onBack}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            }
          />
        )}
        <div className={styles.copy}>
          <span>{label}</span>
          <strong>{currentStep?.label ?? "Etapa"}</strong>
        </div>
        <b className={styles.count}>{Math.min(currentIndex + 1, steps.length)} de {steps.length}</b>
      </div>
      <ProgressBar
        className={styles.progress}
        value={progress}
        size="sm"
        aria-label={`${label}: etapa ${currentIndex + 1} de ${steps.length}`}
      />
      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "future";
          const canNavigate = !step.disabled && (allowFutureNavigation || index <= currentIndex);
          return (
            <li key={step.id} className={cn(styles.step, styles[state], step.disabled && styles.disabled)}>
              <button
                ref={(node) => { refs.current[step.id] = node; }}
                type="button"
                className={styles.stepButton}
                aria-current={state === "current" ? "step" : undefined}
                aria-label={`${step.label}: ${state === "complete" ? "concluída" : state === "current" ? "etapa atual" : "não iniciada"}`}
                disabled={!canNavigate}
                tabIndex={state === "current" ? 0 : -1}
                onClick={() => onStepChange?.(step.id)}
                onKeyDown={(event) => focusRelative(event, step.id)}
              >
                <span className={styles.marker} aria-hidden="true">
                  {state === "complete" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m20 6-11 11-5-5" />
                    </svg>
                  ) : index + 1}
                </span>
                <span className={styles.stepLabel}>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
