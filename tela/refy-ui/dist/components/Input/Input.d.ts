import type { InputHTMLAttributes, ReactNode } from "react";
/** Props for the text Input field. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
    /** Rótulo mono uppercase acima do campo. */
    label?: string;
    /** Texto de apoio abaixo do campo. */
    hint?: string;
    /** Mensagem de erro (substitui hint e pinta a borda). */
    error?: string;
    /** Conteúdo fixo à esquerda (ícone ou prefixo tipo "refy.app/"). */
    prefix?: ReactNode;
    /** Conteúdo fixo à direita (ícone ou sufixo). */
    suffix?: ReactNode;
    block?: boolean;
}
/**
 * Campo de texto do Refy. Rótulo mono uppercase e foco na cor da marca ativa.
 * Números/URLs devem usar a família mono via a prop `mono`… ou classe utilitária.
 */
export declare const Input: import("react").ForwardRefExoticComponent<InputProps & import("react").RefAttributes<HTMLInputElement>>;
