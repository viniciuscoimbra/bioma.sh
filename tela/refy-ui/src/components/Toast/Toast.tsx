import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Toast.module.css";

export type ToastTone = "default" | "success" | "danger";

/** Dados de um toast na pilha. */
export interface ToastData {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Ação inline (ex.: Desfazer). */
  action?: { label: string; onClick: () => void };
  /** ms até auto-dispensar. `null` = fica até fechar. Padrão 5000. */
  duration?: number | null;
}

const ICONS: Record<Exclude<ToastTone, "default">, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8.5 12.5 11 15 15.5 9.5" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
    </svg>
  ),
};

/** Props for a single Toast notification. */
export interface ToastProps extends ToastData {
  onDismiss?: (id: string) => void;
}

/** Um toast individual — pílula escura com ícone por tom, título e descrição. */
export function Toast({ id, title, description, tone = "default", action, duration = 5000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (duration === null || !onDismiss) return;
    const t = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  return (
    <div className={styles.toast} role="status">
      {tone !== "default" && <span className={cn(styles.icon, styles[tone])}>{ICONS[tone]}</span>}
      <div className={styles.textBlock}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.desc}>{description}</div>}
      </div>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            action.onClick();
            onDismiss?.(id);
          }}
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button type="button" className={styles.close} aria-label="Fechar" onClick={() => onDismiss(id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Props for the ToastRegion stack. */
export interface ToastRegionProps {
  /** Pilha de toasts (controlada — o app é dono da lista). */
  toasts: ToastData[];
  /** Remove um toast da lista (auto-dismiss, ×, ou após a ação). */
  onDismiss: (id: string) => void;
  /** Canto da tela. Padrão `bottom-right`. */
  position?: "bottom-right" | "bottom-left" | "top-right";
  className?: string;
}

/**
 * ToastRegion — pilha fixa de toasts num canto da tela.
 *
 * Totalmente controlada: o app mantém a lista e recebe `onDismiss` quando um
 * toast expira (`duration`, padrão 5s), é fechado no × ou tem a ação clicada.
 * `aria-live="polite"` anuncia entradas para leitores de tela.
 *
 *   const [toasts, setToasts] = useState<ToastData[]>([]);
 *   <ToastRegion toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
 */
export function ToastRegion({ toasts, onDismiss, position = "bottom-right", className }: ToastRegionProps) {
  return (
    <div aria-live="polite" className={cn(styles.region, styles[position.replace("-", "_") as keyof typeof styles], className)}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
