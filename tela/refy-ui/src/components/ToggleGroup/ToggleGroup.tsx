import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./ToggleGroup.module.css";

export interface ToggleOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Props for the multi-select ToggleGroup. */
export interface ToggleGroupProps {
  options: ToggleOption[];
  /** Valores ligados (controlado). */
  value?: string[];
  /** Estado inicial (não-controlado). */
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** Rótulo acessível do grupo. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * ToggleGroup — botões liga/desliga independentes (seleção múltipla).
 *
 * Cada toggle é um botão com `aria-pressed`; ligado ganha fundo
 * primary-soft e texto na tinta da marca. Para seleção única use
 * `Segmented`. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <ToggleGroup options={visoes} defaultValue={["grid"]} onChange={setVisoes} />
 */
export function ToggleGroup({
  options,
  value,
  defaultValue = [],
  onChange,
  label,
  disabled,
  className,
}: ToggleGroupProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const current = value !== undefined ? value : internal;

  function toggle(option: ToggleOption) {
    if (option.disabled) return;
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div role="group" aria-label={label} className={cn(styles.group, disabled && styles.disabled, className)}>
      {options.map((option) => {
        const on = current.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            disabled={disabled || option.disabled}
            className={cn(styles.toggle, on && styles.on)}
            onClick={() => toggle(option)}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
