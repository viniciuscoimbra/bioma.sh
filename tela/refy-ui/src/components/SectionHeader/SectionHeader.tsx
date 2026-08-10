import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "../Badge";
import { cn } from "../../lib/cn";
import styles from "./SectionHeader.module.css";

/** Props for the SectionHeader section title. */
export interface SectionHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
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
export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(
  function SectionHeader(
    { title, sub, count, action, id, rule = false, className, ...rest },
    ref
  ) {
    return (
      <header
        ref={ref}
        id={id}
        className={cn(styles.header, rule && styles.rule, className)}
        {...rest}
      >
        <div className={styles.row}>
          <h2 className={styles.title}>
            {title}
            {count != null && (
              <Badge tone="neutral" className={styles.count}>
                {count}
              </Badge>
            )}
          </h2>
          {rule && <span className={styles.ruleLine} aria-hidden="true" />}
          {action != null && <span className={styles.action}>{action}</span>}
        </div>
        {sub != null && <p className={styles.sub}>{sub}</p>}
      </header>
    );
  }
);
