import type { ReactNode } from "react";
/** Um nível da trilha. Sem `href` (ou o último) renderiza como página atual. */
export interface BreadcrumbItem {
    label: ReactNode;
    href?: string;
    /** Clique (SPA); usado quando não há `href`. */
    onClick?: () => void;
}
export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    /** Destino opcional do ícone de início. */
    root?: BreadcrumbItem;
    /** Separador entre níveis. Padrão "/". */
    separator?: ReactNode;
    /** A partir desta quantidade, o miolo vira um Menu. Padrão 5. */
    collapseAfter?: number;
    className?: string;
}
/**
 * Breadcrumb — trilha de navegação mono uppercase.
 *
 * Níveis anteriores são links (hover escurece); o último é a página atual
 * (`aria-current="page"`, em ink-1). `<nav aria-label="Trilha de navegação">`
 * com lista ordenada semântica.
 *
 *   <Breadcrumb items={[{ label: "Projetos", href: "/p" }, { label: "refy.com.br" }]} />
 */
export declare function Breadcrumb({ items, root, separator, collapseAfter, className }: BreadcrumbProps): import("react").JSX.Element;
