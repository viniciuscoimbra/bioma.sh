import type { TextareaHTMLAttributes } from "react";
/** Props for the Textarea field. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
    block?: boolean;
}
/** Área de texto multi-linha. Mesmo chrome do Input, altura ajustável. */
export declare const Textarea: import("react").ForwardRefExoticComponent<TextareaProps & import("react").RefAttributes<HTMLTextAreaElement>>;
