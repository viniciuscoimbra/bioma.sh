import type { HTMLAttributes, ReactNode } from "react";
export type BadgeTone = "success" | "info" | "warn" | "danger" | "neutral";
/** Props for the Badge status label. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
    /** Ponto colorido à esquerda (status). */
    dot?: boolean;
    children: ReactNode;
}
/** Chip/badge de status. Fundo soft + texto na cor semântica. Mono, uppercase. */
export declare function Badge({ tone, dot, className, children, ...rest }: BadgeProps): import("react").JSX.Element;
