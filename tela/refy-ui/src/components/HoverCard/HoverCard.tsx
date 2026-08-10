import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./HoverCard.module.css";

export type HoverCardSide = "top" | "bottom";

/** Props for the HoverCard component. */
export interface HoverCardProps {
  /** Preview rico exibido ao pairar sobre o trigger. */
  content: ReactNode;
  /** Referência que dispara o card (link, mention, avatar). */
  children: ReactNode;
  /** Delay para abrir, em ms. Padrão 500. */
  openDelay?: number;
  /** Delay para fechar ao sair, em ms. Padrão 200. */
  closeDelay?: number;
  side?: HoverCardSide;
  className?: string;
}

/**
 * HoverCard — preview rico ao passar o mouse sobre uma referência.
 *
 * Abre com delay (padrão 500ms) e fecha com tolerância de 200ms, então dá
 * para mover o cursor até o card sem ele sumir. Também abre no foco por
 * teclado. Card de 280px, elevação 3. Não é interativo-modal: para conteúdo
 * clicável complexo, use `Popover`.
 *
 *   <HoverCard content={<PerfilDominio />}> <a href="…">rdstation.com</a> </HoverCard>
 */
export function HoverCard({
  content,
  children,
  openDelay = 500,
  closeDelay = 200,
  side = "bottom",
  className,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function schedule(next: boolean, delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  }

  return (
    <div
      className={cn(styles.wrap, className)}
      onMouseEnter={() => schedule(true, openDelay)}
      onMouseLeave={() => schedule(false, closeDelay)}
      onFocus={() => schedule(true, 0)}
      onBlur={() => schedule(false, 0)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          clearTimeout(timer.current);
          setOpen(false);
        }
      }}
    >
      {children}
      {open && (
        <div data-side={side} className={styles.card}>
          {content}
        </div>
      )}
    </div>
  );
}
