import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Snackbar.module.css";

/** Props for the Snackbar notification. */
export interface SnackbarProps {
  /** Mensagem de uma linha. */
  children: ReactNode;
  /** Ação inline (ex.: "Desfazer", "Ver"). */
  action?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Snackbar — toast minimalista de uma linha com ação inline.
 *
 * Use para confirmar ações reversíveis ("Issue movida · Desfazer").
 * É um elemento de apresentação: posicione-o você mesmo (ou dentro de
 * `ToastRegion` via `Toast` para pilha com auto-dismiss).
 *
 *   <Snackbar action={{ label: "Desfazer", onClick: undo }}>Issue movida para Backlog</Snackbar>
 */
export function Snackbar({ children, action, className }: SnackbarProps) {
  return (
    <div className={cn(styles.snackbar, className)} role="status">
      <span className={styles.message}>{children}</span>
      {action && (
        <button type="button" className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
