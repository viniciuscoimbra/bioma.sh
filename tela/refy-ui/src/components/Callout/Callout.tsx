import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode, TransitionEvent } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "../IconButton";
import styles from "./Callout.module.css";

export type CalloutTone = "info" | "note" | "warn" | "danger" | "upsell";

/** Props for the Callout component. */
export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Tom semântico do banner (padrão: "info"). */
  tone?: CalloutTone;
  /** Ícone à esquerda (o DS não bundleia ícones — passe por prop). */
  icon?: ReactNode;
  /** Título do banner. */
  title: ReactNode;
  /** Corpo do banner. */
  children?: ReactNode;
  /** Ação opcional à direita (ex.: `<Button size="sm">Fazer upgrade</Button>`). */
  action?: ReactNode;
  /** Exibe o botão de fechar. O banner some com transição e desmonta. */
  dismissible?: boolean;
  /** Chamado após o banner sair (fim da transição). */
  onDismiss?: () => void;
  /** Rótulo acessível do botão de fechar (padrão: "Dispensar aviso"). */
  dismissLabel?: string;
}

/**
 * Banner ESTÁTICO inline: contexto que pertence à página (dica de first-run,
 * nota explicativa, aviso de limite, upsell de plano). Não é transiente —
 * a fronteira com Toast/Snackbar está documentada na story.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  {
    tone = "info",
    icon,
    title,
    children,
    action,
    dismissible = false,
    onDismiss,
    dismissLabel = "Dispensar aviso",
    className,
    ...rest
  },
  ref
) {
  const [closing, setClosing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const doneRef = useRef(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const handleDismiss = () => {
    setClosing(true);
    /* fallback p/ prefers-reduced-motion (transição zerada não dispara transitionend) */
    timeoutRef.current = window.setTimeout(finish, 260);
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closing) finish();
  };

  if (dismissed) return null;

  return (
    <div
      ref={ref}
      role="note"
      className={cn(styles.callout, styles[tone], closing && styles.closing, className)}
      onTransitionEnd={handleTransitionEnd}
      {...rest}
    >
      {icon != null && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children != null && <div className={styles.text}>{children}</div>}
      </div>
      {action != null && <div className={styles.action}>{action}</div>}
      {dismissible && (
        <IconButton
          size="sm"
          variant="ghost"
          className={styles.close}
          aria-label={dismissLabel}
          onClick={handleDismiss}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          }
        />
      )}
    </div>
  );
});
