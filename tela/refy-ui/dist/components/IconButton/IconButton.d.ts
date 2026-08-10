import type { ButtonHTMLAttributes, ReactNode } from "react";
export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";
/** Props for icon-only buttons. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Rótulo acessível obrigatório — o botão não tem texto visível. */
    "aria-label": string;
    icon: ReactNode;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
}
/** Botão só-ícone (toolbar, topbar, ações de linha). Sempre com aria-label. */
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
