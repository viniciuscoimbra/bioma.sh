import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import styles from "./PlanCard.module.css";

/** Props for the PlanCard component. */
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Nome do plano. Ex.: "Pro". */
  name: ReactNode;
  /** Preço formatado. Ex.: "R$ 199". */
  price: ReactNode;
  /** Sufixo do preço. Ex.: "/mês". */
  period?: ReactNode;
  /** Nota abaixo do preço. Ex.: "R$ 2.388 cobrados anualmente". */
  priceNote?: ReactNode;
  /** Lista de features (um nó por linha). */
  features?: ReactNode[];
  /** Ícone de check das features (via prop — o DS não bundleia ícones). Tem fallback interno. */
  checkIcon?: ReactNode;
  /** CTA do plano — slot para `Button`. Ignorada quando `current` (vira botão desabilitado). */
  cta?: ReactNode;
  /** Plano atual do workspace: tag + CTA desabilitada. */
  current?: boolean;
  /** Texto da tag/CTA quando `current`. */
  currentLabel?: string;
  /** Destaque visual do plano recomendado. */
  highlighted?: boolean;
  /** Texto da tag quando `highlighted` (e não `current`). */
  highlightLabel?: string;
}

const defaultCheck = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

/**
 * Card de plano (pricing): nome, preço/período, features com check e CTA.
 * `current` marca o plano vigente (tag + CTA desabilitada);
 * `highlighted` destaca o recomendado. A grade 2–4 colunas é do consumidor
 * (ver story "Grade de planos").
 */
export function PlanCard({
  name,
  price,
  period,
  priceNote,
  features,
  checkIcon,
  cta,
  current = false,
  currentLabel = "Plano atual",
  highlighted = false,
  highlightLabel = "Recomendado",
  className,
  ...rest
}: PlanCardProps) {
  const tag = current ? currentLabel : highlighted ? highlightLabel : null;
  return (
    <div
      className={cn(
        styles.plan,
        current && styles.current,
        highlighted && styles.highlighted,
        className
      )}
      {...rest}
    >
      {tag && (
        <span className={cn(styles.tag, current && !highlighted && styles.tagNeutral)}>{tag}</span>
      )}
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.priceRow}>
        <span className={styles.price}>{price}</span>
        {period && <span className={styles.period}>{period}</span>}
      </div>
      <div className={styles.priceNote}>{priceNote}</div>
      <div className={styles.cta}>
        {current ? (
          <Button variant="secondary" block disabled>
            {currentLabel}
          </Button>
        ) : (
          cta
        )}
      </div>
      {features && features.length > 0 && (
        <ul className={styles.features}>
          {features.map((feature, i) => (
            <li key={i} className={styles.feature}>
              <span className={styles.check} aria-hidden="true">
                {checkIcon ?? defaultCheck}
              </span>
              <span className={styles.featureText}>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
