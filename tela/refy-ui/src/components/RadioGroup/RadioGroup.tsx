import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./RadioGroup.module.css";

export interface RadioOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** Props for the RadioGroup control. */
export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Rótulo mono uppercase acima do grupo. */
  label?: string;
  className?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

/** Grupo de rádio — escolha única. Cada opção é uma linha clicável. */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { name, options, value, defaultValue, onChange, label, className, inputProps },
  ref
) {
  return (
    <div ref={ref} className={cn(styles.group, className)} role="radiogroup" aria-label={label}>
      {label && <span className={styles.groupLabel}>{label}</span>}
      {options.map((opt) => {
        const checked = value !== undefined ? value === opt.value : undefined;
        const defChecked = value === undefined ? defaultValue === opt.value : undefined;
        return (
          <label key={opt.value} className={cn(styles.opt, opt.disabled && styles.disabled)}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              className={styles.input}
              checked={checked}
              defaultChecked={defChecked}
              disabled={opt.disabled}
              onChange={(e) => onChange?.(e.target.value)}
              {...inputProps}
            />
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.body}>
              <span className={styles.optLabel}>{opt.label}</span>
              {opt.hint && <span className={styles.optHint}>{opt.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
});
