import type { HTMLAttributes } from "react";
export type ProgressTone = "primary" | "neutral" | "warn" | "critical";
/** Props for the ProgressBar component. */
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
    /** 0–100. Ignorado (e opcional) quando `indeterminate`. */
    value?: number;
    /**
     * Cor do preenchimento. `neutral` (tinta/ink) é o tom das barras de cota
     * das telas de settings — informativo, sem julgamento de estado.
     */
    tone?: ProgressTone;
    /** Altura da trilha. */
    size?: "sm" | "md";
    /**
     * Carregando sem progresso conhecido: o preenchimento desliza em loop.
     * Expõe `aria-busy` e omite `aria-valuenow`. Com `prefers-reduced-motion`
     * a animação para (trilha preenchida a meia opacidade).
     */
    indeterminate?: boolean;
}
/** Barra de progresso horizontal (uso de créditos, consumo por projeto). */
export declare function ProgressBar({ value, tone, size, indeterminate, className, ...rest }: ProgressBarProps): import("react").JSX.Element;
