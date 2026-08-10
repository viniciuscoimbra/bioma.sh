import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Input.module.css";

/** Props for the text Input field. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Rótulo mono uppercase acima do campo. */
  label?: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  /** Mensagem de erro (substitui hint e pinta a borda). */
  error?: string;
  /** Conteúdo fixo à esquerda (ícone ou prefixo tipo "refy.app/"). */
  prefix?: ReactNode;
  /** Conteúdo fixo à direita (ícone ou sufixo). */
  suffix?: ReactNode;
  block?: boolean;
}

/**
 * Campo de texto do Refy. Rótulo mono uppercase e foco na cor da marca ativa.
 * Números/URLs devem usar a família mono via a prop `mono`… ou classe utilitária.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    block = true,
    className,
    id,
    disabled,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    ...rest
  },
  ref
) {
  const fieldId = id || (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const helpId = fieldId && (error || hint) ? `${fieldId}-help` : undefined;
  return (
    <div className={cn(styles.field, block && styles.block, className)}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div
        className={cn(styles.shell, error && styles.hasError, disabled && styles.disabled)}
      >
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <input
          ref={ref}
          id={fieldId}
          className={styles.input}
          disabled={disabled}
          aria-describedby={describedBy ?? helpId}
          aria-invalid={error ? true : invalid}
          {...rest}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </div>
      {(error || hint) && (
        <p id={helpId} className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>
      )}
    </div>
  );
});
