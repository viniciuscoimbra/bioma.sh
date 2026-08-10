import type { HTMLAttributes, ReactNode } from "react";
/** Props for the CodeBlock component. */
export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onCopy"> {
    /** Conteúdo real do bloco — é o que o botão copiar coloca no clipboard. */
    code: string;
    /** Renderização custom (ex.: highlight). Ignorada enquanto `secret` está mascarado. */
    children?: ReactNode;
    /** Rótulo do bloco. Ex.: "API key de produção". */
    label?: ReactNode;
    /** Linguagem/formato, em mono. Ex.: "bash". */
    language?: string;
    /** Mascara o conteúdo (chaves de API) com toggle de revelar. Copiar copia o valor real. */
    secret?: boolean;
    /** Nº de caracteres finais visíveis no modo `secret`. */
    visibleChars?: number;
    /** aria-label do botão copiar. */
    copyLabel?: string;
    /** Feedback visível/anunciado após copiar. */
    copiedLabel?: string;
    /** aria-label do toggle quando mascarado. */
    revealLabel?: string;
    /** aria-label do toggle quando revelado. */
    hideLabel?: string;
    /** Chamado após copiar com sucesso. */
    onCopy?: (code: string) => void;
}
/**
 * Bloco de código copiável, monoespaçado, com scroll horizontal próprio.
 * `secret` mascara o conteúdo (chaves de API) com toggle revelar — copiar
 * sempre copia o valor real. Feedback "Copiado" visível e anunciado
 * (`role="status"` + aria-live).
 */
export declare function CodeBlock({ code, children, label, language, secret, visibleChars, copyLabel, copiedLabel, revealLabel, hideLabel, onCopy, className, ...rest }: CodeBlockProps): import("react").JSX.Element;
