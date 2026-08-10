import type { HTMLAttributes } from "react";
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Eixo visual do conjunto de ações. */
    orientation?: "horizontal" | "vertical";
    /** Nome acessível do grupo de ações. */
    label?: string;
    /** Índice ativo inicial. O grupo mantém uma única opção ativa. */
    defaultActiveIndex?: number;
    /** Índice ativo controlado. */
    activeIndex?: number;
    onActiveIndexChange?: (index: number) => void;
}
/** Grupo de seleção única com bordas contíguas. */
export declare function ButtonGroup({ orientation, label, defaultActiveIndex, activeIndex, onActiveIndexChange, className, children, ...rest }: ButtonGroupProps): import("react").JSX.Element;
