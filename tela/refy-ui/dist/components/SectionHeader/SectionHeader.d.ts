import type { HTMLAttributes, ReactNode } from "react";
/** Props for the SectionHeader section title. */
export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** Título da seção (vira `<h2>`). */
    title: ReactNode;
    /** Subtítulo/descrição sob o título (máx. 62ch, cor secundária). */
    sub?: ReactNode;
    /** Contador da seção — renderizado como `Badge` neutro (ex.: "3 projetos"). */
    count?: ReactNode;
    /** Ação inline à direita (link "Gerenciar →", `Button` sm, etc.). */
    action?: ReactNode;
    /**
     * `id` de âncora da seção — casa com o `TableOfContents` (scrollspy).
     * O componente já aplica `scroll-margin-top` para o header fixo.
     */
    id?: string;
    /** Variante compacta com régua até a borda (padrão do dashboard): título 12px uppercase + linha preenchendo o espaço. */
    rule?: boolean;
}
/**
 * SectionHeader — cabeçalho de seção dentro de uma página (padrão
 * `.shell-section-h`/`.section-h` das telas de referência). `<h2>` + sub
 * opcional + count (`Badge`) + ação inline à direita + `id` de âncora para o
 * `TableOfContents`.
 *
 * Variantes: padrão (título 18px + sub, settings) e `rule` (título 12px
 * uppercase com régua até a borda, dashboard).
 *
 *   <SectionHeader id="sessoes" title="Sessões ativas"
 *     sub="Dispositivos conectados à sua conta."
 *     count="3" action={<Button size="sm" variant="ghost">Encerrar todas</Button>} />
 */
export declare const SectionHeader: import("react").ForwardRefExoticComponent<SectionHeaderProps & import("react").RefAttributes<HTMLElement>>;
