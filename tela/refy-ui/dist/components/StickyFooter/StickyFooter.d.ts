import type { HTMLAttributes, ReactNode } from "react";
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
export declare const StickyFooter: import("react").ForwardRefExoticComponent<StickyFooterProps & import("react").RefAttributes<HTMLDivElement>>;
