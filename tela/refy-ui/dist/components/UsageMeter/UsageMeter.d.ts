import type { HTMLAttributes, ReactNode } from "react";
import type { ProgressTone } from "../ProgressBar";
/** Props for the UsageMeter component. */
export interface UsageMeterProps extends HTMLAttributes<HTMLDivElement> {
    /** Nome do recurso medido. Ex.: "Créditos do ciclo". */
    label: ReactNode;
    /** Quantidade consumida. */
    used: number;
    /** Limite do recurso. */
    limit: number;
    /** Unidade exibida após os números. Ex.: "créditos". */
    unit?: ReactNode;
    /** Linha secundária. Ex.: "8 análises padrão · 0 sínteses". */
    meta?: ReactNode;
    /** Formatação dos números (padrão: pt-BR, ex. 2.500). */
    formatValue?: (value: number) => string;
    /** % a partir do qual o tom vira atenção (padrão 80). */
    warnAt?: number;
    /** % a partir do qual o tom vira crítico (padrão 100). */
    criticalAt?: number;
    /** Altura da barra (repassado ao ProgressBar). */
    size?: "sm" | "md";
}
/** Props for the UsageMeterGroup list wrapper. */
export interface UsageMeterGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
/** Deriva o tom da barra a partir do % consumido e dos limiares. */
export declare function usageTone(percent: number, warnAt?: number, criticalAt?: number): ProgressTone;
/**
 * Consumo vs limite: label, "usado / limite" e barra (composição sobre
 * `ProgressBar`). O tom muda por limiar: ok → atenção (≥80%) → crítico (≥100%).
 */
export declare function UsageMeter({ label, used, limit, unit, meta, formatValue, warnAt, criticalAt, size, className, ...rest }: UsageMeterProps): import("react").JSX.Element;
/**
 * Lista de medidores (ex.: consumo por projeto) — empilha `UsageMeter`
 * com divisores, como na tela de Uso.
 */
export declare function UsageMeterGroup({ children, className, ...rest }: UsageMeterGroupProps): import("react").JSX.Element;
