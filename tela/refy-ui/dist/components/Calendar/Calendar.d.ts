export type CalendarMode = "single" | "range";
/** Intervalo de datas (modo `range`). */
export interface DateRange {
    start: Date | null;
    end: Date | null;
}
/** Props for the Calendar date picker. */
export interface CalendarProps {
    /** `single` (uma data) ou `range` (início → fim, ex.: ida/volta). */
    mode?: CalendarMode;
    /** Valor controlado. `Date | null` no modo single; `DateRange` no modo range. */
    value?: Date | null | DateRange;
    /** Valor inicial (não-controlado). */
    defaultValue?: Date | null | DateRange;
    /** Disparado a cada seleção. `Date` no single, `DateRange` no range. */
    onChange?: (value: Date | DateRange) => void;
    /** Quantos meses lado a lado (útil no range). Padrão 1. */
    numberOfMonths?: 1 | 2;
    /** Mês visível controlado (1º dia do mês). */
    month?: Date;
    defaultMonth?: Date;
    onMonthChange?: (month: Date) => void;
    /** Limites de seleção. */
    min?: Date;
    max?: Date;
    /** 0 = domingo (padrão), 1 = segunda. */
    weekStartsOn?: 0 | 1;
    locale?: string;
    className?: string;
}
/**
 * Calendar — date picker funcional e isolado (átomo composto → molécula).
 *
 * Modo `single`: clique seleciona um dia. Modo `range`: 1º clique fixa o início,
 * 2º clique ≥ início fixa o fim (com preview no hover). Navegação por mês
 * (botões + PageUp/Down), teclado (setas + Enter/Espaço) e limites min/max.
 * Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.
 *
 *   <Calendar mode="range" numberOfMonths={2} onChange={setPeriodo} />
 */
export declare function Calendar({ mode, value, defaultValue, onChange, numberOfMonths, month, defaultMonth, onMonthChange, min, max, weekStartsOn, locale, className, }: CalendarProps): import("react").JSX.Element;
