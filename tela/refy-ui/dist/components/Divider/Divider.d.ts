import type { HTMLAttributes, ReactNode } from "react";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerSpacing = "none" | "sm" | "md" | "lg";
/** Props for the Divider component. */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
    /** Direção do separador (padrão: horizontal). */
    orientation?: DividerOrientation;
    /**
     * Rótulo central opcional (ex.: "ou"). Só faz sentido na horizontal;
     * na vertical é ignorado.
     */
    label?: ReactNode;
    /** Margem externa no eixo do fluxo (padrão: "md"). */
    spacing?: DividerSpacing;
}
/**
 * Separador visual entre blocos: linha horizontal (com rótulo central
 * opcional, como o "ou" do workspace picker) ou linha vertical entre
 * itens inline. Sempre `role="separator"`.
 */
export declare const Divider: import("react").ForwardRefExoticComponent<DividerProps & import("react").RefAttributes<HTMLDivElement>>;
