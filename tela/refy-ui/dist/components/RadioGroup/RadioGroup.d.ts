import type { InputHTMLAttributes } from "react";
export interface RadioOption {
    value: string;
    label: string;
    hint?: string;
    disabled?: boolean;
}
/** Props for the RadioGroup control. */
export interface RadioGroupProps {
    name: string;
    options: RadioOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Rótulo mono uppercase acima do grupo. */
    label?: string;
    className?: string;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
}
/** Grupo de rádio — escolha única. Cada opção é uma linha clicável. */
export declare const RadioGroup: import("react").ForwardRefExoticComponent<RadioGroupProps & import("react").RefAttributes<HTMLDivElement>>;
