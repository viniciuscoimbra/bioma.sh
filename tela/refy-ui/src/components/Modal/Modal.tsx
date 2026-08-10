import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useDialogFocusTrap } from "../../lib/useDialogFocusTrap";
import { IconButton } from "../IconButton";
import styles from "./Modal.module.css";

const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** Props for the Modal dialog. */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Nome acessível quando não há título visível. */
  ariaLabel?: string;
  /** Ações do rodapé (botões). Sem rodapé se ausente. */
  footer?: ReactNode;
  /** Largura máxima em px. Default 520. */
  width?: number;
  children: ReactNode;
  className?: string;
}

/** Modal centralizado com scrim, fecha no Esc / clique fora / botão ✕. */
export function Modal({ open, onClose, title, ariaLabel = "Janela modal", footer, width = 520, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogFocusTrap(open, modalRef, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(styles.modal, className)}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <IconButton icon={CloseIcon} aria-label="Fechar" variant="ghost" onClick={onClose} />
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
