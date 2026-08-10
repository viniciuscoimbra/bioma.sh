import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "../Badge";
import { ProgressBar } from "../ProgressBar";
import { cn } from "../../lib/cn";
import styles from "./ApprovalWorkbench.module.css";

export type ApprovalWorkbenchItemState =
  | "not-started"
  | "in-progress"
  | "attention"
  | "complete";

export interface ApprovalWorkbenchItem {
  id: string;
  label: string;
  meta?: string;
  state: ApprovalWorkbenchItemState;
}

export interface ApprovalWorkbenchProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> {
  /** Nome acessível e título da lista de trabalho. */
  label?: string;
  /** Itens avaliados nesta análise. */
  items: ApprovalWorkbenchItem[];
  /** Item exibido no painel. */
  activeId: string;
  /** Seleciona outro item sem mudar de página. */
  onActiveChange: (id: string) => void;
  /** Editor do item ativo. */
  children: ReactNode;
}

const stateLabel: Record<ApprovalWorkbenchItemState, string> = {
  "not-started": "Não iniciado",
  "in-progress": "Em análise",
  attention: "Com pendência",
  complete: "Concluído",
};

/**
 * ApprovalWorkbench organiza uma análise manual em dois planos: a fila de
 * itens e o editor do item selecionado. Resultados, solicitações e decisões
 * continuam sob responsabilidade da página que compõe o organismo.
 */
export function ApprovalWorkbench({
  label = "Itens da análise",
  items,
  activeId,
  onActiveChange,
  children,
  className,
  ...rest
}: ApprovalWorkbenchProps) {
  const completed = items.filter((item) => item.state === "complete").length;
  const progress = items.length === 0 ? 0 : (completed / items.length) * 100;

  return (
    <section className={cn(styles.root, className)} {...rest}>
      <aside className={styles.queue}>
        <div className={styles.summary}>
          <div>
            <strong>{label}</strong>
            <span>{completed} de {items.length} concluídos</span>
          </div>
          <ProgressBar
            value={progress}
            tone={completed === items.length && items.length > 0 ? "neutral" : "primary"}
            size="sm"
            aria-label={`Andamento da análise: ${completed} de ${items.length} itens concluídos`}
          />
        </div>

        <nav className={styles.items} aria-label={label}>
          {items.map((item, index) => {
            const active = item.id === activeId;
            const complete = item.state === "complete";
            const attention = item.state === "attention";
            return (
              <button
                key={item.id}
                type="button"
                className={cn(styles.item, active && styles.active)}
                aria-current={active ? "step" : undefined}
                onClick={() => onActiveChange(item.id)}
              >
                <span className={cn(styles.mark, complete && styles.markComplete, attention && styles.markAttention)} aria-hidden="true">
                  {complete ? "✓" : attention ? "!" : index + 1}
                </span>
                <span className={styles.itemBody}>
                  <strong>{item.label}</strong>
                  {item.meta != null && <small>{item.meta}</small>}
                </span>
                <Badge
                  tone={complete ? "success" : attention ? "warn" : item.state === "in-progress" ? "info" : "neutral"}
                >
                  {stateLabel[item.state]}
                </Badge>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={styles.editor}>{children}</div>
    </section>
  );
}
