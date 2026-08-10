import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Popover.module.css";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

/** Props for the Popover component. */
export interface PopoverProps {
  /** Popover visível (controlado — overlay não tem estado interno). */
  open: boolean;
  /** Pedido de fechamento: Esc ou clique fora. */
  onOpenChange: (open: boolean) => void;
  /** Conteúdo flutuante interativo (form curto, filtros…). */
  content: ReactNode;
  /** Elemento âncora (trigger). */
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  /** Rótulo acessível do diálogo flutuante. */
  label?: string;
  className?: string;
}

/**
 * Popover — conteúdo flutuante interativo ancorado a um trigger.
 *
 * Diferente do Tooltip, aceita interação (checkboxes, botões, inputs).
 * Fecha com Esc ou clique fora. Controlado por `open`/`onOpenChange`,
 * posicionado por `side` + `align`. Min-width 220px, elevação 3.
 *
 *   <Popover open={open} onOpenChange={setOpen} content={<Filtros />}>
 *     <Button onClick={() => setOpen(!open)}>Filtrar</Button>
 *   </Popover>
 */
export function Popover({
  open,
  onOpenChange,
  content,
  children,
  side = "bottom",
  align = "start",
  label,
  className,
}: PopoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)}>
      {children}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          data-side={side}
          data-align={align}
          className={styles.pop}
        >
          {content}
        </div>
      )}
    </div>
  );
}
