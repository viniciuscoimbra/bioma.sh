import type { HTMLAttributes } from "react";
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
/** Props for the Avatar component. */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    /** Iniciais (1–2 letras) quando não há imagem. */
    initials?: string;
    /** URL da foto; se presente, sobrepõe as iniciais. */
    src?: string;
    alt?: string;
    size?: AvatarSize;
    /**
     * Forma: `circle` (pessoa, default) ou `square` (workspace/projeto/logo,
     * cantos arredondados proporcionais ao tamanho).
     */
    shape?: AvatarShape;
    /** Cor de fundo (para iniciais). Default = cor da marca ativa. */
    color?: string;
    /**
     * Semente p/ gradiente determinístico de marca (ex.: nome do workspace).
     * A mesma string sempre gera o mesmo gradiente. Ignorada com `src`/`color`.
     */
    seed?: string;
}
/**
 * Avatar de pessoa (`circle`) ou de entidade — workspace, projeto, logo
 * (`shape="square"`). Iniciais ou imagem; com `seed`, gradiente de marca
 * determinístico por string (mesmo nome → mesma cor, em qualquer tela).
 */
export declare function Avatar({ initials, src, alt, size, shape, color, seed, className, style, ...rest }: AvatarProps): import("react").JSX.Element;
