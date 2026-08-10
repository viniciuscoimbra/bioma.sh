import type { InputHTMLAttributes } from "react";
/** Props for the Switch control. */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    /** Rótulo acessível quando não há <label> visível associado. */
    "aria-label"?: string;
}
/** Toggle on/off com semântica de switch; usa a cor primary do tema quando ligado. */
export declare const Switch: import("react").ForwardRefExoticComponent<SwitchProps & import("react").RefAttributes<HTMLInputElement>>;
