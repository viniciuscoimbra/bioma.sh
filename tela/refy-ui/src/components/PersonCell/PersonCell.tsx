import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./PersonCell.module.css";

/** Props for the PersonCell display cell. */
export interface PersonCellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Slot inicial — `Avatar` (circle p/ pessoa, `shape="square"` p/ entidade:
   * projeto, workspace, imobiliária). Composição: o átomo vem de fora.
   */
  avatar?: ReactNode;
  /** Nome (linha principal). */
  name: ReactNode;
  /** Sufixo inline após o nome (ex.: "você" mono, `Badge` de papel). */
  tag?: ReactNode;
  /** Linha secundária (email, descrição, meta da entidade). */
  secondary?: ReactNode;
  /** Densidade: `sm` p/ células de tabela compactas, `md` p/ listas. */
  size?: "sm" | "md";
}

/**
 * PersonCell — célula padrão de pessoa/entidade: `Avatar` + nome (+ tag
 * inline) + linha secundária. Display puro (não clicável); vive dentro de
 * `Table`, listas e menus.
 */
export function PersonCell({
  avatar,
  name,
  tag,
  secondary,
  size = "md",
  className,
  ...rest
}: PersonCellProps) {
  return (
    <div className={cn(styles.cell, styles[size], className)} {...rest}>
      {avatar != null && <span className={styles.avatar}>{avatar}</span>}
      <span className={styles.info}>
        <span className={styles.name}>
          {name}
          {tag != null && <span className={styles.tag}>{tag}</span>}
        </span>
        {secondary != null && <span className={styles.secondary}>{secondary}</span>}
      </span>
    </div>
  );
}
