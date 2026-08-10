/** Props for the Pagination control. */
export interface PaginationProps {
    /** Página atual (1-based, controlada). */
    page: number;
    /** Total de páginas. */
    pageCount: number;
    onPageChange: (page: number) => void;
    /** Vizinhos visíveis de cada lado da página atual. Padrão 1. */
    siblingCount?: number;
    className?: string;
}
/**
 * Pagination — paginação numérica em mono.
 *
 * Página ativa em ink-1 (preto), demais ghost; setas anterior/próximo nas
 * extremidades desabilitam nos limites; reticências colapsam trechos longos.
 * Controlada: `page` + `onPageChange`. `<nav>` com `aria-current="page"`.
 *
 *   <Pagination page={page} pageCount={12} onPageChange={setPage} />
 */
export declare function Pagination({ page, pageCount, onPageChange, siblingCount, className }: PaginationProps): import("react").JSX.Element;
