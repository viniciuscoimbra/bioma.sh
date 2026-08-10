import type { HTMLAttributes } from "react";
import type { AvatarSize } from "../Avatar";
/** Uma pessoa (ou workspace) dentro do AvatarGroup. */
export interface AvatarGroupItem {
    /** Nome completo — vira tooltip e origem das iniciais. */
    name: string;
    /** URL da foto; se ausente, mostra iniciais derivadas do nome. */
    src?: string;
    /** Iniciais explícitas (sobrepõem as derivadas de `name`). */
    initials?: string;
    /** Cor de fundo das iniciais (repassada ao Avatar). */
    color?: string;
}
/** Props for the AvatarGroup component. */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Pessoas, na ordem em que devem aparecer (ordem estável, primeira por cima). */
    items: AvatarGroupItem[];
    /** Máximo de avatares visíveis; o excedente vira "+N" com tooltip. Padrão 4. */
    max?: number;
    /** Tamanho herdado do átomo Avatar. Padrão "md". */
    size?: AvatarSize;
    /** Se presente, cada avatar vira botão (foco + Enter/Espaço). */
    onItemClick?: (item: AvatarGroupItem, index: number) => void;
    /** Se presente, o "+N" vira botão (ex.: abrir lista completa de membros). */
    onOverflowClick?: () => void;
}
/**
 * AvatarGroup — avatares empilhados com sobreposição e overflow "+N".
 *
 * Composição sobre o átomo `Avatar`: cada item é um Avatar com anel da
 * superfície; o excedente (`items.length - max`) vira um chip "+N" cujo
 * tooltip lista os nomes restantes. Com `onItemClick`/`onOverflowClick`
 * os itens viram botões reais (tab, Enter/Espaço, foco visível).
 *
 *   <AvatarGroup items={membros} max={4} size="md" />
 */
export declare const AvatarGroup: import("react").ForwardRefExoticComponent<AvatarGroupProps & import("react").RefAttributes<HTMLDivElement>>;
