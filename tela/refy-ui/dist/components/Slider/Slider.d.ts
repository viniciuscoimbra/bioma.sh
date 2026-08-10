import type { HTMLAttributes } from "react";
/** Props for the Slider control. */
export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    min?: number;
    max?: number;
    /** Incremento do teclado e da grade de valores. Padrão 1. */
    step?: number;
    /** Valor controlado. */
    value?: number;
    /** Valor inicial (não-controlado). Padrão: `min`. */
    defaultValue?: number;
    onChange?: (value: number) => void;
    /** Nome do controle, exibido acima da track. */
    label?: string;
    /** Formata o valor no readout e no `aria-valuetext` (ex.: `(v) => v + "%"`). */
    formatValue?: (value: number) => string;
    /** Pílula mono com o valor atual. Padrão `true` quando há `label`. */
    showValue?: boolean;
    /** Legendas nas extremidades da track (ex.: ["Rasa", "Profunda"]). */
    ticks?: [string, string];
    /** Slider discreto: um rótulo por step — desenha os pontos e a régua de labels. */
    marks?: string[];
    disabled?: boolean;
}
/**
 * Slider — controle contínuo arrastável.
 *
 * Clique na track teleporta o thumb; arraste com pointer capture; setas ←/→
 * ajustam por `step` (Shift = 10×), Home/End vão aos extremos. `marks`
 * transforma em slider discreto com pontos e rótulos por step. Acessível via
 * `role="slider"` + `aria-valuemin/max/now/text`. Controlado (`value`/
 * `onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Slider label="Profundidade" defaultValue={35} formatValue={(v) => `${v}%`} />
 */
export declare const Slider: import("react").ForwardRefExoticComponent<SliderProps & import("react").RefAttributes<HTMLDivElement>>;
