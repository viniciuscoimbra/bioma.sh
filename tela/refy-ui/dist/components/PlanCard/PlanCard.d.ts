import type { HTMLAttributes, ReactNode } from "react";
/** Props for the PlanCard component. */
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Nome do plano. Ex.: "Pro". */
    name: ReactNode;
    /** Preço formatado. Ex.: "R$ 199". */
    price: ReactNode;
    /** Sufixo do preço. Ex.: "/mês". */
    period?: ReactNode;
    /** Nota abaixo do preço. Ex.: "R$ 2.388 cobrados anualmente". */
    priceNote?: ReactNode;
    /** Lista de features (um nó por linha). */
    features?: ReactNode[];
    /** Ícone de check das features (via prop — o DS não bundleia ícones). Tem fallback interno. */
    checkIcon?: ReactNode;
    /** CTA do plano — slot para `Button`. Ignorada quando `current` (vira botão desabilitado). */
    cta?: ReactNode;
    /** Plano atual do workspace: tag + CTA desabilitada. */
    current?: boolean;
    /** Texto da tag/CTA quando `current`. */
    currentLabel?: string;
    /** Destaque visual do plano recomendado. */
    highlighted?: boolean;
    /** Texto da tag quando `highlighted` (e não `current`). */
    highlightLabel?: string;
}
/**
 * Card de plano (pricing): nome, preço/período, features com check e CTA.
 * `current` marca o plano vigente (tag + CTA desabilitada);
 * `highlighted` destaca o recomendado. A grade 2–4 colunas é do consumidor
 * (ver story "Grade de planos").
 */
export declare function PlanCard({ name, price, period, priceNote, features, checkIcon, cta, current, currentLabel, highlighted, highlightLabel, className, ...rest }: PlanCardProps): import("react").JSX.Element;
