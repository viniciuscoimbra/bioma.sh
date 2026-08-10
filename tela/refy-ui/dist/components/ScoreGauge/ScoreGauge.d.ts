import type { HTMLAttributes, ReactNode } from "react";
export type ScoreGaugeSize = "sm" | "md" | "lg";
export type ScoreBand = "ok" | "warn" | "critical";
/** Props for the ScoreGauge component. */
export interface ScoreGaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Score de 0 a 100 (valores fora da faixa são grampeados). */
    value: number;
    /** Rótulo curto sob o número (ex.: "Editorial"). Oculto no tamanho sm. */
    label?: ReactNode;
    /** Diâmetro: sm 32px (linhas), md 56px (cards, padrão), lg 96px (hero). */
    size?: ScoreGaugeSize;
    /** Score mínimo da banda ok (padrão 70). */
    okAt?: number;
    /** Score mínimo da banda warn (padrão 40; abaixo = critical). */
    warnAt?: number;
    /** Formatação do número central (padrão: inteiro arredondado). */
    formatValue?: (value: number) => ReactNode;
    /** Texto acessível do medidor. Obrigatório se `label` não for string. */
    "aria-label"?: string;
}
/** Deriva a banda de tom a partir do score e dos limiares. */
export declare function scoreBand(value: number, okAt?: number, warnAt?: number): ScoreBand;
/**
 * Medidor circular de score (0–100): arco SVG com progresso animado ao montar
 * e ao mudar de valor (motion tokens; `prefers-reduced-motion` zera a animação),
 * cor por banda de limiar (ok/warn/critical) e rótulo central.
 * `role="meter"` com valuemin/max/now.
 */
export declare const ScoreGauge: import("react").ForwardRefExoticComponent<ScoreGaugeProps & import("react").RefAttributes<HTMLDivElement>>;
