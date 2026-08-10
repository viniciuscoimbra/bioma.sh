import type { ButtonHTMLAttributes, ReactNode } from "react";
export type FabSize = "md" | "lg";
export type FabVariant = "primary" | "surface";
/** Props for the floating action button. */
export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Ícone (obrigatório — é o sujeito do FAB). */
    icon: ReactNode;
    /** Se presente e `extended`, vira FAB estendido com texto. */
    label?: string;
    extended?: boolean;
    size?: FabSize;
    variant?: FabVariant;
}
/**
 * FAB — floating action button. Redondo por padrão; com `extended` + `label`
 * vira pílula com texto. Fixe você mesmo via wrapper `position: fixed`.
 */
export declare const Fab: import("react").ForwardRefExoticComponent<FabProps & import("react").RefAttributes<HTMLButtonElement>>;
