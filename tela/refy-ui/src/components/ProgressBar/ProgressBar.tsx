import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./ProgressBar.module.css";

export type ProgressTone = "primary" | "neutral" | "warn" | "critical";

/** Props for the ProgressBar component. */
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–100. Ignorado (e opcional) quando `indeterminate`. */
  value?: number;
  /**
   * Cor do preenchimento. `neutral` (tinta/ink) é o tom das barras de cota
   * das telas de settings — informativo, sem julgamento de estado.
   */
  tone?: ProgressTone;
  /** Altura da trilha. */
  size?: "sm" | "md";
  /**
   * Carregando sem progresso conhecido: o preenchimento desliza em loop.
   * Expõe `aria-busy` e omite `aria-valuenow`. Com `prefers-reduced-motion`
   * a animação para (trilha preenchida a meia opacidade).
   */
  indeterminate?: boolean;
}

/** Barra de progresso horizontal (uso de créditos, consumo por projeto). */
export function ProgressBar({
  value = 0,
  tone = "primary",
  size = "md",
  indeterminate = false,
  className,
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(styles.track, styles[size], className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      {...(indeterminate ? { "aria-busy": true } : { "aria-valuenow": pct })}
      {...rest}
    >
      <span
        className={cn(styles.fill, styles[tone], indeterminate && styles.indeterminate)}
        style={indeterminate ? undefined : { width: `${pct}%` }}
      />
    </div>
  );
}
