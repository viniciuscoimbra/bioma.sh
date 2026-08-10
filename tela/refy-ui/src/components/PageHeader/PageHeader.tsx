import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./PageHeader.module.css";

/** Props for the PageHeader page hero. */
export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
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
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    { eyebrow, title, lead, actions, breadcrumb, className, ...rest },
    ref
  ) {
    return (
      <header ref={ref} className={cn(styles.header, className)} {...rest}>
        {breadcrumb != null && <div className={styles.breadcrumb}>{breadcrumb}</div>}
        <div className={styles.row}>
          <div className={styles.text}>
            {eyebrow != null && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 className={styles.title}>{title}</h1>
            {lead != null && <p className={styles.lead}>{lead}</p>}
          </div>
          {actions != null && <div className={styles.actions}>{actions}</div>}
        </div>
      </header>
    );
  }
);
