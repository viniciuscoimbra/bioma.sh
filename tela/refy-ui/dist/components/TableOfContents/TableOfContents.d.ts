/** Uma âncora do sumário. `id` é o id do elemento-alvo na página. */
export interface TocItem {
    id: string;
    label: string;
    /** Nível de indentação (1 = raiz). */
    level?: 1 | 2 | 3;
}
/** Props for the TableOfContents rail. */
export interface TableOfContentsProps {
    /** Âncoras, na ordem em que aparecem na página. */
    items: TocItem[];
    /** Rótulo do trilho (visível + `aria-label` do `<nav>`). */
    label?: string;
    /** Item ativo controlado — desliga o scrollspy. */
    activeId?: string;
    /** Item ativo inicial (não-controlado). Padrão: primeiro item. */
    defaultActiveId?: string;
    /** Disparado quando o ativo muda (scrollspy ou clique). */
    onActiveChange?: (id: string) => void;
    /** Liga o scrollspy via IntersectionObserver (ignorado se `activeId` for passado). */
    scrollSpy?: boolean;
    /** `rootMargin` do IntersectionObserver do scrollspy. */
    rootMargin?: string;
    /**
     * Contêiner rolável observado pelo scrollspy (`root` do
     * IntersectionObserver). Padrão: `null` (viewport). Passe o elemento com
     * `overflow-y: auto` quando a rolagem NÃO é a da página.
     */
    root?: Element | null;
    /** Cola o trilho na rolagem (`position: sticky`). */
    sticky?: boolean;
    className?: string;
}
/**
 * TableOfContents — trilho lateral de sumário de página longa ("Nesta
 * página"). Lista âncoras `{id, label}` e destaca a seção visível via
 * scrollspy (IntersectionObserver). Clique rola suave até a âncora
 * (instantâneo com `prefers-reduced-motion`). Para controlar por fora,
 * passe `activeId`/`onActiveChange` — o scrollspy é desligado.
 *
 *   <TableOfContents items={[{ id: "perfil", label: "Perfil" }]} />
 */
export declare function TableOfContents({ items, label, activeId, defaultActiveId, onActiveChange, scrollSpy, rootMargin, root, sticky, className, }: TableOfContentsProps): import("react").JSX.Element;
