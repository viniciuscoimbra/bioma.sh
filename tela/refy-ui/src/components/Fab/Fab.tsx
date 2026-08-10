import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Fab.module.css";

export type FabSize = "md" | "lg";
export type FabVariant = "primary" | "surface";

/** Props for the floating action button. */
export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ícone (obrigatório — é o sujeito do FAB). */
  icon: ReactNode;
  /** Se presente e `extended`, vira FAB estendido com texto. */
  label?: string;
  extended?: boolean;
  size?: FabSize;
  variant?: FabVariant;
}

/**
 * FAB — floating action button. Redondo por padrão; com `extended` + `label`
 * vira pílula com texto. Fixe você mesmo via wrapper `position: fixed`.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { icon, label, extended = false, size = "lg", variant = "primary", className, ...rest },
  ref
) {
  const isExtended = extended && !!label;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={!isExtended ? label : undefined}
      className={cn(
        styles.fab,
        styles[size],
        styles[variant],
        isExtended && styles.extended,
        className
      )}
      {...rest}
    >
      <span className={styles.icon}>{icon}</span>
      {isExtended && <span className={styles.label}>{label}</span>}
    </button>
  );
});
