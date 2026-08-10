import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./EmptyState.module.css";

/** Props for the EmptyState component. */
export interface EmptyStateProps {
  /** Ícone dentro do quadro (via prop, nunca bundleado). */
  icon?: ReactNode;
  title: ReactNode;
  /** Copy explicativa (máx ~36ch). */
  message?: ReactNode;
  /** CTA opcional (ex.: <Button>Limpar filtros</Button>). */
  action?: ReactNode;
  /** Borda dashed em volta, indicando ausência. Padrão `true`. */
  bordered?: boolean;
  className?: string;
}

/**
 * EmptyState — estado de "nada aqui" com ícone, título, copy e CTA opcional.
 *
 * Borda dashed em volta para indicar ausência (desligável com
 * `bordered={false}` quando o container já tem moldura própria).
 *
 *   <EmptyState icon={<SearchIcon />} title="Nenhuma issue corresponde"
 *     message="Tente remover filtros." action={<Button>Limpar filtros</Button>} />
 */
export function EmptyState({ icon, title, message, action, bordered = true, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, bordered && styles.bordered, className)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h4 className={styles.title}>{title}</h4>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
