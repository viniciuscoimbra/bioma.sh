import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./StickyFooter.module.css";

/** Props for the StickyFooter form action bar. */
export interface StickyFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Slot à esquerda: info de estado, contagem de erros, "alterações não salvas". */
  start?: ReactNode;
  /** Ações à direita (ex.: `Button` Cancelar/Salvar). */
  children?: ReactNode;
  /**
   * `sticky` (padrão) cola no fim do container rolável mais próximo;
   * `fixed` fixa na viewport e insere um spacer para não cobrir conteúdo.
   */
  position?: "sticky" | "fixed";
}

/**
 * StickyFooter — barra de ações de formulário fixa ao fundo. Borda superior +
 * fundo em token, respeita `env(safe-area-inset-bottom)` no mobile. Em
 * `position="fixed"` renderiza um spacer com a altura medida da barra
 * (ResizeObserver) para o conteúdo nunca ficar coberto; em `sticky` a barra
 * ocupa o próprio fluxo, sem spacer.
 *
 *   <StickyFooter start={<span>Alterações não salvas</span>}>
 *     <Button variant="ghost">Cancelar</Button>
 *     <Button>Salvar</Button>
 *   </StickyFooter>
 */
export const StickyFooter = forwardRef<HTMLDivElement, StickyFooterProps>(
  function StickyFooter({ start, children, position = "sticky", className, ...rest }, ref) {
    const barRef = useRef<HTMLDivElement | null>(null);
    const [spacerHeight, setSpacerHeight] = useState(0);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        barRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    useEffect(() => {
      if (position !== "fixed") return;
      const el = barRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const update = () => setSpacerHeight(el.offsetHeight);
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    }, [position]);

    return (
      <>
        {position === "fixed" && (
          <div aria-hidden="true" style={{ height: spacerHeight }} />
        )}
        <div
          ref={setRefs}
          className={cn(
            styles.footer,
            position === "fixed" ? styles.fixed : styles.sticky,
            className
          )}
          {...rest}
        >
          {start != null && <div className={styles.start}>{start}</div>}
          <div className={styles.end}>{children}</div>
        </div>
      </>
    );
  }
);
