import type { HTMLAttributes, ReactNode } from "react";
export interface StickyBarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    title: ReactNode;
    meta?: ReactNode;
    status?: ReactNode;
    actions?: ReactNode;
    visible?: boolean;
}
/** Contexto e ações que permanecem disponíveis depois que o cabeçalho sai da tela. */
export declare const StickyBar: import("react").ForwardRefExoticComponent<StickyBarProps & import("react").RefAttributes<HTMLElement>>;
