import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Select.module.css";

/** Props for the Select field. */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
  children: ReactNode;
}

/** Select nativo estilizado. Use <option>/<optgroup> como filhos. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, block = true, className, id, disabled, children, ...rest },
  ref
) {
  const fieldId = id || (label ? `sel-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className={cn(styles.field, block && styles.block, className)}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div className={cn(styles.shell, error && styles.hasError, disabled && styles.disabled)}>
        <select ref={ref} id={fieldId} className={styles.select} disabled={disabled} {...rest}>
          {children}
        </select>
        <svg className={styles.caret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {(error || hint) && (
        <p className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>
      )}
    </div>
  );
});
