import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Segmented.module.css";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Props for the single-select segmented control. */
export interface SegmentedProps {
  options: SegmentedOption[];
  /** Valor selecionado (controlado). */
  value?: string;
  /** Seleção inicial (não-controlado). Padrão: primeira opção. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Rótulo acessível do grupo. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Segmented — seleção única em pílula (switch de visões).
 *
 * Trilho com fundo rebaixado; o segmento ativo ganha superfície elevada.
 * Semântica de `radiogroup`: ←/→ movem a seleção, cada segmento é um
 * `role="radio"`. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <Segmented options={[{ value: "lista", label: "Lista" }, { value: "kanban", label: "Kanban" }]} />
 */
export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  label,
  disabled,
  className,
}: SegmentedProps) {
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const current = value !== undefined ? value : internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const at = enabled.findIndex((o) => o.value === current);
    const next = enabled[(at + (e.key === "ArrowRight" ? 1 : enabled.length - 1)) % enabled.length];
    if (next) {
      select(next.value);
      (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement)?.focus();
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(styles.segmented, disabled && styles.disabled, className)}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const isActive = option.value === current;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            data-value={option.value}
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled || option.disabled}
            className={cn(styles.segment, isActive && styles.active)}
            onClick={() => select(option.value)}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
