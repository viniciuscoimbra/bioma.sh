import type { HTMLAttributes, ReactNode } from "react";
export type CardTone = "default" | "inverted";
/** Props for the Card surface component. */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Elevação da sombra (0–4). 0 = plano; 4 = overlay. */
    elevation?: 0 | 1 | 2 | 3 | 4;
    padding?: "none" | "sm" | "md";
    /**
     * Tom da superfície. `inverted` = superfície escura (tinta) com gradiente
     * radial da marca e tokens de texto invertidos no escopo do card — base dos
     * heróis de billing/uso (plan-summary, usage-hero).
     */
    tone?: CardTone;
    children: ReactNode;
}
/** Props for the optional Card header. */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: ReactNode;
    count?: ReactNode;
    action?: ReactNode;
}
/** Superfície-base do app. Caixa branca, borda fria, cantos suaves. */
export declare function Card({ elevation, padding, tone, className, children, ...rest }: CardProps): import("react").JSX.Element;
/** Cabeçalho opcional do card: título + contador + ação à direita. */
export declare function CardHeader({ title, count, action, className, ...rest }: CardHeaderProps): import("react").JSX.Element;
