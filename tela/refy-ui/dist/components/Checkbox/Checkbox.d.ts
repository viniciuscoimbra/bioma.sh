import type { InputHTMLAttributes, ReactNode } from "react";
/** Props for the accessible Checkbox control. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Rótulo à direita da caixa. */
    label?: ReactNode;
    /** Texto de apoio abaixo do rótulo. */
    description?: ReactNode;
    /**
     * Etiqueta inline após o rótulo (ex.: `<Badge tone="danger">destrutivo</Badge>`
     * numa permissão perigosa). Slot — o átomo não bundleia texto.
     */
    tag?: ReactNode;
    /** Meta mono à direita da linha (ex.: "42 mil cliques / 28d"). */
    meta?: ReactNode;
    /**
     * Variante em caixa: linha com borda selecionável (lista de propriedades,
     * escolhas em modal). Borda acende com o estado marcado.
     */
    boxed?: boolean;
}
/** Caixa de seleção com check customizado, mantendo o input nativo no DOM. */
export declare const Checkbox: import("react").ForwardRefExoticComponent<CheckboxProps & import("react").RefAttributes<HTMLInputElement>>;
