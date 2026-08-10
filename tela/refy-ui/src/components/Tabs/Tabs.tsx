import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Tabs.module.css";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  /** Estado da parte representada pela aba. */
  status?: "complete" | "warning";
  content?: ReactNode;
  disabled?: boolean;
}

const completeIcon = <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>;
const warningIcon = <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2 14 13H2L8 2Z" /><path d="M8 6v3M8 11.5h.01" /></svg>;

/** Props for the Tabs component. */
export interface TabsProps {
  items: TabItem[];
  /** Aba ativa controlada. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** underline (padrão) ou pill. */
  variant?: "underline" | "pill";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/** Abas com indicador. Renderiza o conteúdo da aba ativa se `content` for fornecido. */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  orientation = "horizontal",
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;
  const base = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string) {
    if (items.find((item) => item.id === id)?.disabled) return;
    if (value === undefined) setInternal(id);
    onChange?.(id);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, id: string) {
    const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (![previousKey, nextKey, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.id === id);
    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabled.length - 1;
    else if (event.key === previousKey) nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
    else if (event.key === nextKey) nextIndex = (currentIndex + 1) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) return;
    select(next.id);
    tabRefs.current[next.id]?.focus();
  }

  const activeItem = items.find((i) => i.id === active);

  return (
    <div className={cn(styles.wrap, orientation === "vertical" && styles.wrapVertical, className)}>
      <div
        className={cn(
          styles.list,
          orientation === "vertical" ? styles.listVertical : variant === "pill" ? styles.pill : styles.underline
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              ref={(node) => { tabRefs.current[it.id] = node; }}
              id={`${base}-tab-${it.id}`}
              aria-selected={isActive}
              aria-controls={`${base}-panel-${it.id}`}
              aria-disabled={it.disabled || undefined}
              disabled={it.disabled}
              tabIndex={isActive ? 0 : -1}
              className={cn(styles.tab, isActive && styles.active)}
              onClick={() => select(it.id)}
              onKeyDown={(event) => onKeyDown(event, it.id)}
            >
              {it.label}
              {it.badge != null && <span className={styles.badge}>{it.badge}</span>}
              {it.status != null && (
                <span
                  className={cn(styles.status, styles[it.status])}
                  aria-label={it.status === "complete" ? "Status: concluída" : "Status: requer atenção"}
                  title={it.status === "complete" ? "Concluída" : "Requer atenção"}
                >
                  {it.status === "complete" ? completeIcon : warningIcon}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {activeItem?.content != null && (
        <div
          role="tabpanel"
          id={`${base}-panel-${activeItem.id}`}
          aria-labelledby={`${base}-tab-${activeItem.id}`}
          className={styles.panel}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
