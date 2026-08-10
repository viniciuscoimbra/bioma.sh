import type { HTMLAttributes, ReactNode } from "react";
/** Props for the PageHeader page hero. */
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** Eyebrow mono uppercase acima do título (ex.: "Workspace · Globo Editorial"). */
    eyebrow?: ReactNode;
    /** Título da página (vira o `<h1>` — só existe um por página). */
    title: ReactNode;
    /** Lead/descrição sob o título (máx. 62ch, cor secundária). */
    lead?: ReactNode;
    /** Ações à direita (`Button`/`SplitButton`), alinhadas à base do bloco de texto. */
    actions?: ReactNode;
    /** Slot de trilha acima do eyebrow — passe o átomo `Breadcrumb`. Regra do PO: breadcrumb sempre com volta ao pai. */
    breadcrumb?: ReactNode;
}
/**
 * PageHeader — cabeçalho de página do app (padrão `.ph`/`.shell-page-*` das
 * telas de referência). Eyebrow mono opcional + `<h1>` + lead + slot de ações
 * à direita; variante com `Breadcrumb` em cima via slot `breadcrumb`.
 *
 * Composição: `actions` recebe `Button`/`SplitButton`; `breadcrumb` recebe o
 * átomo `Breadcrumb` (sempre com volta ao pai — regra do PO); dentro do
 * `eyebrow` cabe um StatusDot/indicador "ao vivo".
 *
 *   <PageHeader
 *     eyebrow="Workspace · última análise há 14min"
 *     title="Visão geral"
 *     lead="3 projetos · 12 análises este mês"
 *     actions={<Button>Nova análise</Button>}
 *   />
 */
export declare const PageHeader: import("react").ForwardRefExoticComponent<PageHeaderProps & import("react").RefAttributes<HTMLElement>>;
