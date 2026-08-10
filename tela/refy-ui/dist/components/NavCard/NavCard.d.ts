import type { MouseEventHandler, ReactNode } from "react";
/** Props for the NavCard navigation card. */
export interface NavCardProps {
    /** Título do destino (linha principal). */
    title: ReactNode;
    /** Linha secundária opcional (descrição/metadados do destino). */
    description?: ReactNode;
    /** Meta à direita, antes do chevron (ex.: pill de papel, contador). */
    meta?: ReactNode;
    /** Slot inicial opcional — `Avatar` ou ícone via ReactNode. */
    leading?: ReactNode;
    /** Com `href` renderiza `<a>`; sem `href` renderiza `<button>`. */
    href?: string;
    /** `target` do link (só quando `href` é usado). */
    target?: string;
    /** `rel` do link (só quando `href` é usado). */
    rel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    /** Desabilita o card (sem clique, sem foco por Tab no link). */
    disabled?: boolean;
    /** Marca como destino atual (borda + fundo primários, `aria-current`). */
    current?: boolean;
    /** Variante `dashed` = ação de criação ("criar novo…"), borda tracejada. */
    variant?: "solid" | "dashed";
    /** Esconde o chevron ">" à direita. */
    showChevron?: boolean;
    className?: string;
}
/**
 * NavCard — card de navegação clicável com chevron ">" (padrão do workspace
 * picker). O card INTEIRO é o alvo: renderiza `<a>` quando há `href`, senão
 * `<button>`. Composição: `leading` recebe `Avatar`/ícone; `meta` recebe
 * `Badge`/pill. Teclado nativo (Tab + Enter/Espaço) e foco visível.
 *
 *   <NavCard leading={<Avatar initials="GE" />} title="Globo Editorial"
 *     description="4 membros · 3 projetos" href="/ws/globo" />
 */
export declare const NavCard: import("react").ForwardRefExoticComponent<NavCardProps & import("react").RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
