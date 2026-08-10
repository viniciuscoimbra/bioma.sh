import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Checkbox.module.css";

/** Props for the accessible Checkbox control. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Rótulo à direita da caixa. */
  label?: ReactNode;
  /** Texto de apoio abaixo do rótulo. */
  description?: ReactNode;
  /**
   * Etiqueta inline após o rótulo (ex.: `<Badge tone="danger">destrutivo</Badge>`
   * numa permissão perigosa). Slot — o átomo não bundleia texto.
   */
  tag?: ReactNode;
  /** Meta mono à direita da linha (ex.: "42 mil cliques / 28d"). */
  meta?: ReactNode;
  /**
   * Variante em caixa: linha com borda selecionável (lista de propriedades,
   * escolhas em modal). Borda acende com o estado marcado.
   */
  boxed?: boolean;
}

/** Caixa de seleção com check customizado, mantendo o input nativo no DOM. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, tag, meta, boxed = false, className, id, disabled, ...rest },
  ref
) {
  const fieldId = id || rest.name;
  return (
    <label
      className={cn(styles.row, boxed && styles.boxed, disabled && styles.disabled, className)}
      htmlFor={fieldId}
    >
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {(label || description) && (
        <span className={styles.text}>
          {label && (
            <span className={styles.label}>
              {label}
              {tag != null && <span className={styles.tag}>{tag}</span>}
            </span>
          )}
          {description && <span className={styles.desc}>{description}</span>}
        </span>
      )}
      {meta != null && <span className={styles.meta}>{meta}</span>}
    </label>
  );
});
