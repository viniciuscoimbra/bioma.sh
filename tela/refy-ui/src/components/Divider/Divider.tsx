import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Divider.module.css";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerSpacing = "none" | "sm" | "md" | "lg";

/** Props for the Divider component. */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Direção do separador (padrão: horizontal). */
  orientation?: DividerOrientation;
  /**
   * Rótulo central opcional (ex.: "ou"). Só faz sentido na horizontal;
   * na vertical é ignorado.
   */
  label?: ReactNode;
  /** Margem externa no eixo do fluxo (padrão: "md"). */
  spacing?: DividerSpacing;
}

/**
 * Separador visual entre blocos: linha horizontal (com rótulo central
 * opcional, como o "ou" do workspace picker) ou linha vertical entre
 * itens inline. Sempre `role="separator"`.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = "horizontal", label, spacing = "md", className, ...rest },
  ref
) {
  const vertical = orientation === "vertical";
  const withLabel = !vertical && label != null;
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={vertical ? "vertical" : undefined}
      className={cn(
        styles.divider,
        vertical ? styles.vertical : styles.horizontal,
        withLabel && styles.withLabel,
        styles[`spacing-${spacing}`],
        className
      )}
      {...rest}
    >
      {withLabel && <span className={styles.label}>{label}</span>}
    </div>
  );
});
