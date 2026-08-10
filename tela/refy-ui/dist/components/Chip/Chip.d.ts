import type { ButtonHTMLAttributes, ReactNode } from "react";
export type ChipTone = "neutral" | "critical" | "warning" | "success" | "info";
export type ChipSelectionMode = "toggle" | "radio";
/** Props for the selectable Chip control. */
export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
    /** Estado selecionado (filtro ativo). */
    selected?: boolean;
    /** Contador à direita (ex.: número de itens no filtro). */
    count?: number;
    /** Ponto semântico opcional para filtros de severidade/status. */
    tone?: ChipTone;
    /** Toggle usa `aria-pressed`; radio usa `role=radio` + `aria-checked`. */
    selectionMode?: ChipSelectionMode;
    /** Revela o check animado quando selecionado. */
    showCheck?: boolean;
    /** Ícone de fechar — dispara onRemove. */
    removable?: boolean;
    onRemove?: () => void;
    leadingIcon?: ReactNode;
    children: ReactNode;
}
/**
 * Chip / filter-chip. Clicável para alternar seleção; opcionalmente removível.
 * Selecionado usa a superfície suave da marca, sem depender de uma cor fixa.
 */
export declare const Chip: import("react").ForwardRefExoticComponent<ChipProps & import("react").RefAttributes<HTMLButtonElement>>;
