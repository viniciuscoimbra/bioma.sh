import type { HTMLAttributes, ReactNode } from "react";
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down";
export type StatDeltaSentiment = "positive" | "negative" | "neutral";
/** Delta/variação exibida ao lado do valor. */
export interface StatDelta {
    /** Texto do delta. Ex.: "+12%" ou "-3 pts". */
    value: ReactNode;
    /** Direção da seta. */
    trend: StatTrend;
    /**
     * Cor semântica. Padrão derivado da direção: up → positive, down → negative.
     * Use "neutral" (ou inverta) quando subir NÃO é bom (ex.: custo).
     */
    sentiment?: StatDeltaSentiment;
}
/** Props for the Stat component. */
export interface StatProps extends HTMLAttributes<HTMLDivElement> {
    /** Rótulo mono uppercase acima do número. Ex.: "Rate limit". */
    label: ReactNode;
    /** Valor principal (número grande tabular). Ex.: "3.700" ou "60 req/min". */
    value: ReactNode;
    /** Sufixo menor ao lado do valor. Ex.: "créditos", "/ 2.500". */
    unit?: ReactNode;
    /** Linha secundária sob o valor. Ex.: "por API key, 429 após exceder". */
    description?: ReactNode;
    /** Variação com seta up/down e cor semântica. */
    delta?: StatDelta;
    /** Slot de mini-gráfico (ex.: `<Sparkline />` do Charts) sob o conteúdo. */
    chart?: ReactNode;
    /** Escala do valor (padrão: "md"). */
    size?: StatSize;
}
/** Props for the StatGroup grid wrapper. */
export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
/**
 * Indicador numérico: label mono uppercase + valor grande tabular + delta e
 * descrição opcionais. Funciona em superfície clara e invertida (as cores vêm
 * dos tokens do tema do ancestral — em painel escuro, use `data-theme="dark"`).
 */
export declare const Stat: import("react").ForwardRefExoticComponent<StatProps & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Grid responsivo de `Stat` (tiles de limites da API, hero de uso,
 * resumo do plano). Colunas automáticas com mínimo confortável de leitura.
 */
export declare const StatGroup: import("react").ForwardRefExoticComponent<StatGroupProps & import("react").RefAttributes<HTMLDivElement>>;
