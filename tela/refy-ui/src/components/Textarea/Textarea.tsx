import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Textarea.module.css";

/** Props for the Textarea field. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
}

/** Área de texto multi-linha. Mesmo chrome do Input, altura ajustável. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, block = true, className, id, disabled, rows = 3, ...rest },
  ref
) {
  const fieldId = id || (label ? `ta-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className={cn(styles.field, block && styles.block, className)}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        disabled={disabled}
        className={cn(styles.textarea, error && styles.hasError, disabled && styles.disabled)}
        {...rest}
      />
      {(error || hint) && (
        <p className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>
      )}
    </div>
  );
});
