import type { SelectHTMLAttributes, ReactNode } from "react";
/** Props for the Select field. */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    hint?: string;
    error?: string;
    block?: boolean;
    children: ReactNode;
}
/** Select nativo estilizado. Use <option>/<optgroup> como filhos. */
export declare const Select: import("react").ForwardRefExoticComponent<SelectProps & import("react").RefAttributes<HTMLSelectElement>>;
