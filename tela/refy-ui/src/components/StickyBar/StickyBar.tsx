import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./StickyBar.module.css";

export interface StickyBarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  visible?: boolean;
}

/** Contexto e ações que permanecem disponíveis depois que o cabeçalho sai da tela. */
export const StickyBar = forwardRef<HTMLElement, StickyBarProps>(function StickyBar(
  { title, meta, status, actions, visible = true, className, ...rest },
  ref
) {
  return (
    <header
      ref={ref}
      className={cn(styles.bar, visible ? styles.visible : styles.hidden, className)}
      aria-hidden={visible ? undefined : true}
      {...rest}
    >
      <div className={styles.context}>
        <strong className={styles.title}>{title}</strong>
        {meta != null && <span className={styles.meta}>{meta}</span>}
      </div>
      <div className={styles.end}>
        {status}
        {visible && actions != null && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
});
