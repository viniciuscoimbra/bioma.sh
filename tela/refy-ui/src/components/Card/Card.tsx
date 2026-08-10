import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Card.module.css";

export type CardTone = "default" | "inverted";

/** Props for the Card surface component. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Elevação da sombra (0–4). 0 = plano; 4 = overlay. */
  elevation?: 0 | 1 | 2 | 3 | 4;
  padding?: "none" | "sm" | "md";
  /**
   * Tom da superfície. `inverted` = superfície escura (tinta) com gradiente
   * radial da marca e tokens de texto invertidos no escopo do card — base dos
   * heróis de billing/uso (plan-summary, usage-hero).
   */
  tone?: CardTone;
  children: ReactNode;
}

/** Props for the optional Card header. */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
}

/** Superfície-base do app. Caixa branca, borda fria, cantos suaves. */
export function Card({
  elevation = 0,
  padding = "md",
  tone = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[`e${elevation}`],
        styles[`p-${padding}`],
        tone === "inverted" && styles.inverted,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Cabeçalho opcional do card: título + contador + ação à direita. */
export function CardHeader({ title, count, action, className, ...rest }: CardHeaderProps) {
  return (
    <div className={cn(styles.header, className)} {...rest}>
      <h3 className={styles.title}>{title}</h3>
      {count != null && <span className={styles.count}>{count}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
