import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Skeleton.module.css";

/** Props for the Skeleton loading placeholder. */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Largura (número = px). Padrão 100%. */
  width?: number | string;
  /** Altura (número = px). Padrão 14px (linha de texto). */
  height?: number | string;
  /** Círculo (avatar). Usa `width` como diâmetro. */
  circle?: boolean;
}

/**
 * Skeleton — placeholder com shimmer enquanto o conteúdo carrega.
 *
 * Bloco de 14px por padrão (linha de texto); componha vários para formar
 * cards e listas. `circle` para avatares. Marque o container real com
 * `aria-busy="true"` enquanto os skeletons estiverem visíveis; o shimmer
 * congela com `prefers-reduced-motion`.
 *
 *   <Skeleton width={180} /> <Skeleton circle width={32} />
 */
export function Skeleton({ width = "100%", height = 14, circle, className, style, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skel, circle && styles.circle, className)}
      style={{
        width,
        height: circle ? width : height,
        ...style,
      }}
      {...rest}
    />
  );
}
