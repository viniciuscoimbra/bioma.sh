import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";

/** Props for the Avatar component. */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Iniciais (1–2 letras) quando não há imagem. */
  initials?: string;
  /** URL da foto; se presente, sobrepõe as iniciais. */
  src?: string;
  alt?: string;
  size?: AvatarSize;
  /**
   * Forma: `circle` (pessoa, default) ou `square` (workspace/projeto/logo,
   * cantos arredondados proporcionais ao tamanho).
   */
  shape?: AvatarShape;
  /** Cor de fundo (para iniciais). Default = cor da marca ativa. */
  color?: string;
  /**
   * Semente p/ gradiente determinístico de marca (ex.: nome do workspace).
   * A mesma string sempre gera o mesmo gradiente. Ignorada com `src`/`color`.
   */
  seed?: string;
}

/** Quantidade de gradientes de marca (classes g0–g4 no CSS Module). */
const GRADIENT_COUNT = 5;

/** Hash determinístico simples (charCodes ponderados) → índice de gradiente. */
function gradientIndex(seed: string): number {
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc + seed.charCodeAt(i) * (i + 1)) % 997;
  return acc % GRADIENT_COUNT;
}

/**
 * Avatar de pessoa (`circle`) ou de entidade — workspace, projeto, logo
 * (`shape="square"`). Iniciais ou imagem; com `seed`, gradiente de marca
 * determinístico por string (mesmo nome → mesma cor, em qualquer tela).
 */
export function Avatar({
  initials,
  src,
  alt = "",
  size = "md",
  shape = "circle",
  color,
  seed,
  className,
  style,
  ...rest
}: AvatarProps) {
  const useSeed = !src && !color && seed != null && seed.length > 0;
  return (
    <span
      className={cn(
        styles.avatar,
        styles[size],
        shape === "square" && styles.square,
        useSeed && styles[`g${gradientIndex(seed)}`],
        className
      )}
      style={{
        background: src || useSeed ? undefined : color ?? "var(--brand-gradient)",
        ...style,
      }}
      {...rest}
    >
      {src ? <img className={styles.img} src={src} alt={alt} /> : initials}
    </span>
  );
}
