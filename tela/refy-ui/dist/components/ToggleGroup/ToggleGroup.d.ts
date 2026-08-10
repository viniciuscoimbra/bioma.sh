import type { ReactNode } from "react";
export interface ToggleOption {
    value: string;
    label: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}
/** Props for the multi-select ToggleGroup. */
export interface ToggleGroupProps {
    options: ToggleOption[];
    /** Valores ligados (controlado). */
    value?: string[];
    /** Estado inicial (não-controlado). */
    defaultValue?: string[];
    onChange?: (values: string[]) => void;
    /** Rótulo acessível do grupo. */
    label?: string;
    disabled?: boolean;
    className?: string;
}
/**
 * ToggleGroup — botões liga/desliga independentes (seleção múltipla).
 *
 * Cada toggle é um botão com `aria-pressed`; ligado ganha fundo
 * primary-soft e texto na tinta da marca. Para seleção única use
 * `Segmented`. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <ToggleGroup options={visoes} defaultValue={["grid"]} onChange={setVisoes} />
 */
export declare function ToggleGroup({ options, value, defaultValue, onChange, label, disabled, className, }: ToggleGroupProps): import("react").JSX.Element;
