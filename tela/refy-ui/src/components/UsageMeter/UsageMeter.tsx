import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ProgressBar } from "../ProgressBar";
import type { ProgressTone } from "../ProgressBar";
import styles from "./UsageMeter.module.css";

/** Props for the UsageMeter component. */
export interface UsageMeterProps extends HTMLAttributes<HTMLDivElement> {
  /** Nome do recurso medido. Ex.: "Créditos do ciclo". */
  label: ReactNode;
  /** Quantidade consumida. */
  used: number;
  /** Limite do recurso. */
  limit: number;
  /** Unidade exibida após os números. Ex.: "créditos". */
  unit?: ReactNode;
  /** Linha secundária. Ex.: "8 análises padrão · 0 sínteses". */
  meta?: ReactNode;
  /** Formatação dos números (padrão: pt-BR, ex. 2.500). */
  formatValue?: (value: number) => string;
  /** % a partir do qual o tom vira atenção (padrão 80). */
  warnAt?: number;
  /** % a partir do qual o tom vira crítico (padrão 100). */
  criticalAt?: number;
  /** Altura da barra (repassado ao ProgressBar). */
  size?: "sm" | "md";
}

/** Props for the UsageMeterGroup list wrapper. */
export interface UsageMeterGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const ptBR = new Intl.NumberFormat("pt-BR");
const defaultFormat = (value: number) => ptBR.format(value);

/** Deriva o tom da barra a partir do % consumido e dos limiares. */
export function usageTone(percent: number, warnAt = 80, criticalAt = 100): ProgressTone {
  if (percent >= criticalAt) return "critical";
  if (percent >= warnAt) return "warn";
  return "primary";
}

/**
 * Consumo vs limite: label, "usado / limite" e barra (composição sobre
 * `ProgressBar`). O tom muda por limiar: ok → atenção (≥80%) → crítico (≥100%).
 */
export function UsageMeter({
  label,
  used,
  limit,
  unit,
  meta,
  formatValue = defaultFormat,
  warnAt = 80,
  criticalAt = 100,
  size = "md",
  className,
  ...rest
}: UsageMeterProps) {
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const tone = usageTone(percent, warnAt, criticalAt);
  const usedText = formatValue(used);
  const limitText = formatValue(limit);
  return (
    <div className={cn(styles.meter, className)} {...rest}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={cn(styles.value, styles[`value-${tone}`])}>
          <span className={styles.used}>{usedText}</span>
          <span className={styles.limit}> / {limitText}</span>
          {unit && <span className={styles.unit}> {unit}</span>}
        </span>
      </div>
      <ProgressBar
        value={percent}
        tone={tone}
        size={size}
        aria-label={typeof label === "string" ? label : undefined}
        aria-valuetext={`${usedText} de ${limitText}${typeof unit === "string" ? ` ${unit}` : ""}`}
      />
      {meta && <div className={styles.meta}>{meta}</div>}
    </div>
  );
}

/**
 * Lista de medidores (ex.: consumo por projeto) — empilha `UsageMeter`
 * com divisores, como na tela de Uso.
 */
export function UsageMeterGroup({ children, className, ...rest }: UsageMeterGroupProps) {
  return (
    <div role="list" className={cn(styles.group, className)} {...rest}>
      {children}
    </div>
  );
}
