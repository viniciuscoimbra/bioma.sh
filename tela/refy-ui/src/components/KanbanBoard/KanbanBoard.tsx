import type { ReactNode } from "react";
import { Badge } from "../Badge";
import { cn } from "../../lib/cn";
import styles from "./KanbanBoard.module.css";

export interface KanbanCardItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  footer?: ReactNode;
}

export interface KanbanColumnItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  items: KanbanCardItem[];
}

export interface KanbanBoardProps {
  columns: KanbanColumnItem[];
  ariaLabel?: string;
  className?: string;
}

/** Quadro horizontal para acompanhar itens entre etapas explícitas de um fluxo. */
export function KanbanBoard({ columns, ariaLabel = "Quadro Kanban", className }: KanbanBoardProps) {
  return (
    <div className={cn(styles.board, className)} aria-label={ariaLabel}>
      {columns.map((column) => (
        <section key={column.id} className={styles.column} aria-labelledby={`kanban-${column.id}`}>
          <header className={styles.columnHeader}>
            <div>
              <h2 id={`kanban-${column.id}`}>{column.title}</h2>
              {column.description && <p>{column.description}</p>}
            </div>
            <Badge tone="neutral">{column.items.length}</Badge>
          </header>
          <div className={styles.items}>
            {column.items.map((item) => (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardHead}>
                  {item.leading && <span className={styles.leading}>{item.leading}</span>}
                  <h3>{item.title}</h3>
                </div>
                {item.description && <div className={styles.description}>{item.description}</div>}
                {item.meta && <div className={styles.meta}>{item.meta}</div>}
                {item.footer && <footer>{item.footer}</footer>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
