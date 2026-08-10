import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./ScoreGauge.module.css";

export type ScoreGaugeSize = "sm" | "md" | "lg";
export type ScoreBand = "ok" | "warn" | "critical";

/** Props for the ScoreGauge component. */
export interface ScoreGaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Score de 0 a 100 (valores fora da faixa são grampeados). */
  value: number;
  /** Rótulo curto sob o número (ex.: "Editorial"). Oculto no tamanho sm. */
  label?: ReactNode;
  /** Diâmetro: sm 32px (linhas), md 56px (cards, padrão), lg 96px (hero). */
  size?: ScoreGaugeSize;
  /** Score mínimo da banda ok (padrão 70). */
  okAt?: number;
  /** Score mínimo da banda warn (padrão 40; abaixo = critical). */
  warnAt?: number;
  /** Formatação do número central (padrão: inteiro arredondado). */
  formatValue?: (value: number) => ReactNode;
  /** Texto acessível do medidor. Obrigatório se `label` não for string. */
  "aria-label"?: string;
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Deriva a banda de tom a partir do score e dos limiares. */
export function scoreBand(value: number, okAt = 70, warnAt = 40): ScoreBand {
  if (value >= okAt) return "ok";
  if (value >= warnAt) return "warn";
  return "critical";
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Medidor circular de score (0–100): arco SVG com progresso animado ao montar
 * e ao mudar de valor (motion tokens; `prefers-reduced-motion` zera a animação),
 * cor por banda de limiar (ok/warn/critical) e rótulo central.
 * `role="meter"` com valuemin/max/now.
 */
export const ScoreGauge = forwardRef<HTMLDivElement, ScoreGaugeProps>(function ScoreGauge(
  {
    value,
    label,
    size = "md",
    okAt = 70,
    warnAt = 40,
    formatValue,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const target = clamp(value);
  /* com reduced-motion o arco nasce já no valor final (sem frame em 0) */
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(target);
      return;
    }
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const band = scoreBand(target, okAt, warnAt);
  const offset = CIRCUMFERENCE * (1 - progress / 100);
  const display = formatValue ? formatValue(target) : Math.round(target);
  const accessibleName =
    ariaLabel ?? (typeof label === "string" ? label : "Score");

  return (
    <div
      ref={ref}
      role="meter"
      aria-label={accessibleName}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={target}
      className={cn(styles.gauge, styles[size], styles[`band-${band}`], className)}
      {...rest}
    >
      <svg className={styles.svg} viewBox="0 0 64 64" aria-hidden="true">
        <circle className={styles.track} cx="32" cy="32" r={RADIUS} />
        <circle
          className={styles.arc}
          cx="32"
          cy="32"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.center} aria-hidden="true">
        <span className={styles.value}>{display}</span>
        {label != null && <span className={styles.label}>{label}</span>}
      </span>
    </div>
  );
});
