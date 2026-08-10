import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Badge.module.css";

export type BadgeTone = "success" | "info" | "warn" | "danger" | "neutral";

/** Props for the Badge status label. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Ponto colorido à esquerda (status). */
  dot?: boolean;
  children: ReactNode;
}

/** Chip/badge de status. Fundo soft + texto na cor semântica. Mono, uppercase. */
export function Badge({ tone = "neutral", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], className)} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
