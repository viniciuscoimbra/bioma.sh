import type { HTMLAttributes } from "react";
/** Intervalo selecionado: [mínimo, máximo]. */
export type RangeValue = [number, number];
/** Props for the dual-value range slider. */
export interface RangeProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    min?: number;
    max?: number;
    /** Incremento do teclado e da grade de valores. Padrão 1. */
    step?: number;
    /** Intervalo controlado. */
    value?: RangeValue;
    /** Intervalo inicial (não-controlado). Padrão: [min, max]. */
    defaultValue?: RangeValue;
    onChange?: (value: RangeValue) => void;
    /** Nome do controle, exibido acima da track. */
    label?: string;
    /** Formata cada extremo no readout/aria (ex.: `(v) => v + "k"`). */
    formatValue?: (value: number) => string;
    /** Pílula mono "lo — hi". Padrão `true`. */
    showValue?: boolean;
    /** Fixa o mínimo e expõe apenas o handle final (ex.: raio 0 → 2 km). */
    fixedMinimum?: boolean;
    /** Legendas distribuídas sob a track (ex.: ["0", "25", "50", "75", "100"]). */
    ticks?: string[];
    /** Mini-distribuição acima da track; barras dentro do intervalo acendem. */
    histogram?: number[];
    disabled?: boolean;
}
/**
 * Range — slider de intervalo com dois handles.
 *
 * Arraste cada handle (pointer capture); clique na track teleporta o handle
 * mais próximo; ←/→ ajustam por `step` (Shift = 10×) e Home/End vão ao limite
 * disponível. O mínimo nunca cruza o máximo. `histogram` desenha a
 * distribuição e acende as barras dentro do intervalo. Cada handle é um
 * `role="slider"` (Mínimo/Máximo) com `aria-valuemin/max/now/text`.
 * Controlado (`value`/`onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Range label="Faixa de DA" defaultValue={[30, 80]} ticks={["0","25","50","75","100"]} />
 */
export declare const Range: import("react").ForwardRefExoticComponent<RangeProps & import("react").RefAttributes<HTMLDivElement>>;
