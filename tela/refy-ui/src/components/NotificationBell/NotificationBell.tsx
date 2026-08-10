import { useEffect, useRef, useState } from "react";
import { IconButton } from "../IconButton";
import { cn } from "../../lib/cn";
import styles from "./NotificationBell.module.css";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  /** Tempo relativo já formatado (ex.: "há 2h"). */
  time?: string;
  unread?: boolean;
}

/** Props for the notification bell menu. */
export interface NotificationBellProps {
  items: NotificationItem[];
  /** Clique numa notificação. */
  onItemClick?: (item: NotificationItem) => void;
  /** "Marcar todas como lidas". */
  onMarkAllRead?: () => void;
  /** Título do painel. */
  title?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * NotificationBell — sino com contador de não lidas + painel de notificações.
 *
 * Compõe `IconButton` (lg). O badge mostra quantos itens têm `unread`; o painel lista título,
 * descrição, tempo e ponto de não lida, com ação "Marcar todas como lidas".
 * Esc/clique fora fecham. O estado das notificações é do app — o componente
 * só exibe `items` e emite eventos.
 *
 *   <NotificationBell items={notifications} onItemClick={open} onMarkAllRead={clear} />
 */
export function NotificationBell({
  items,
  onItemClick,
  onMarkAllRead,
  title = "Notificações",
  emptyMessage = "Nenhuma notificação",
  className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => i.unread).length;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)}>
      <span className={styles.bellWrap}>
        <IconButton
          size="lg"
          aria-label={unread ? `Notificações: ${unread} não lidas` : "Notificações"}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(open && styles.bellOpen)}
          onClick={() => setOpen((v) => !v)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
        />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? "9+" : unread}</span>}
      </span>

      {open && (
        <div role="dialog" aria-label={title} className={styles.pop}>
          <div className={styles.head}>
            <span className={styles.title}>{title}</span>
            {onMarkAllRead && unread > 0 && (
              <button type="button" className={styles.markAll} onClick={onMarkAllRead}>
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className={styles.list}>
            {items.length === 0 ? (
              <div className={styles.empty}>{emptyMessage}</div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(styles.item, item.unread && styles.itemUnread)}
                  onClick={() => {
                    onItemClick?.(item);
                    setOpen(false);
                  }}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    {item.description && <span className={styles.itemDesc}>{item.description}</span>}
                  </span>
                  {item.time && <span className={styles.time}>{item.time}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
