import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Switch.module.css";

/** Props for the Switch control. */
export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Rótulo acessível quando não há <label> visível associado. */
  "aria-label"?: string;
}

/** Toggle on/off com semântica de switch; usa a cor primary do tema quando ligado. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, disabled, ...rest },
  ref
) {
  return (
    <label className={cn(styles.wrap, disabled && styles.disabled, className)}>
      <input ref={ref} type="checkbox" role="switch" className={styles.input} disabled={disabled} {...rest} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </label>
  );
});
