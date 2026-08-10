import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Stat.module.css";

export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down";
export type StatDeltaSentiment = "positive" | "negative" | "neutral";

/** Delta/variação exibida ao lado do valor. */
export interface StatDelta {
  /** Texto do delta. Ex.: "+12%" ou "-3 pts". */
  value: ReactNode;
  /** Direção da seta. */
  trend: StatTrend;
  /**
   * Cor semântica. Padrão derivado da direção: up → positive, down → negative.
   * Use "neutral" (ou inverta) quando subir NÃO é bom (ex.: custo).
   */
  sentiment?: StatDeltaSentiment;
}

/** Props for the Stat component. */
export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** Rótulo mono uppercase acima do número. Ex.: "Rate limit". */
  label: ReactNode;
  /** Valor principal (número grande tabular). Ex.: "3.700" ou "60 req/min". */
  value: ReactNode;
  /** Sufixo menor ao lado do valor. Ex.: "créditos", "/ 2.500". */
  unit?: ReactNode;
  /** Linha secundária sob o valor. Ex.: "por API key, 429 após exceder". */
  description?: ReactNode;
  /** Variação com seta up/down e cor semântica. */
  delta?: StatDelta;
  /** Slot de mini-gráfico (ex.: `<Sparkline />` do Charts) sob o conteúdo. */
  chart?: ReactNode;
  /** Escala do valor (padrão: "md"). */
  size?: StatSize;
}

/** Props for the StatGroup grid wrapper. */
export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const trendPath: Record<StatTrend, string> = {
  up: "M7 17 17 7M8 7h9v9",
  down: "M7 7l10 10M17 8v9H8",
};

/**
 * Indicador numérico: label mono uppercase + valor grande tabular + delta e
 * descrição opcionais. Funciona em superfície clara e invertida (as cores vêm
 * dos tokens do tema do ancestral — em painel escuro, use `data-theme="dark"`).
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, unit, description, delta, chart, size = "md", className, ...rest },
  ref
) {
  const sentiment = delta?.sentiment ?? (delta?.trend === "up" ? "positive" : "negative");
  return (
    <div ref={ref} className={cn(styles.stat, styles[size], className)} {...rest}>
      <span className={styles.label}>{label}</span>
      <span className={styles.valueRow}>
        <span className={styles.value}>
          {value}
          {unit != null && <span className={styles.unit}>{unit}</span>}
        </span>
        {delta && (
          <span className={cn(styles.delta, styles[`delta-${sentiment}`])}>
            <svg
              className={styles.deltaIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={trendPath[delta.trend]} />
            </svg>
            {delta.value}
            <span className={styles.srOnly}>
              {delta.trend === "up" ? " (em alta)" : " (em queda)"}
            </span>
          </span>
        )}
      </span>
      {description != null && <span className={styles.description}>{description}</span>}
      {chart != null && <span className={styles.chart}>{chart}</span>}
    </div>
  );
});

/**
 * Grid responsivo de `Stat` (tiles de limites da API, hero de uso,
 * resumo do plano). Colunas automáticas com mínimo confortável de leitura.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup(
  { children, className, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn(styles.group, className)} {...rest}>
      {children}
    </div>
  );
});
