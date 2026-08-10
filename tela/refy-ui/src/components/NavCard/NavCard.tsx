import { forwardRef } from "react";
import type { MouseEventHandler, ReactNode, Ref } from "react";
import { cn } from "../../lib/cn";
import styles from "./NavCard.module.css";

/** Props for the NavCard navigation card. */
export interface NavCardProps {
  /** Título do destino (linha principal). */
  title: ReactNode;
  /** Linha secundária opcional (descrição/metadados do destino). */
  description?: ReactNode;
  /** Meta à direita, antes do chevron (ex.: pill de papel, contador). */
  meta?: ReactNode;
  /** Slot inicial opcional — `Avatar` ou ícone via ReactNode. */
  leading?: ReactNode;
  /** Com `href` renderiza `<a>`; sem `href` renderiza `<button>`. */
  href?: string;
  /** `target` do link (só quando `href` é usado). */
  target?: string;
  /** `rel` do link (só quando `href` é usado). */
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Desabilita o card (sem clique, sem foco por Tab no link). */
  disabled?: boolean;
  /** Marca como destino atual (borda + fundo primários, `aria-current`). */
  current?: boolean;
  /** Variante `dashed` = ação de criação ("criar novo…"), borda tracejada. */
  variant?: "solid" | "dashed";
  /** Esconde o chevron ">" à direita. */
  showChevron?: boolean;
  className?: string;
}

const chevron = (
  <svg
    className={styles.chevron}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * NavCard — card de navegação clicável com chevron ">" (padrão do workspace
 * picker). O card INTEIRO é o alvo: renderiza `<a>` quando há `href`, senão
 * `<button>`. Composição: `leading` recebe `Avatar`/ícone; `meta` recebe
 * `Badge`/pill. Teclado nativo (Tab + Enter/Espaço) e foco visível.
 *
 *   <NavCard leading={<Avatar initials="GE" />} title="Globo Editorial"
 *     description="4 membros · 3 projetos" href="/ws/globo" />
 */
export const NavCard = forwardRef<HTMLAnchorElement | HTMLButtonElement, NavCardProps>(
  function NavCard(
    {
      title,
      description,
      meta,
      leading,
      href,
      target,
      rel,
      onClick,
      disabled = false,
      current = false,
      variant = "solid",
      showChevron = true,
      className,
    },
    ref
  ) {
    const cls = cn(
      styles.card,
      variant === "dashed" && styles.dashed,
      current && styles.current,
      disabled && styles.disabled,
      className
    );

    const body = (
      <>
        {leading != null && <span className={styles.leading}>{leading}</span>}
        <span className={styles.info}>
          <span className={styles.title}>{title}</span>
          {description != null && <span className={styles.description}>{description}</span>}
        </span>
        {meta != null && <span className={styles.meta}>{meta}</span>}
        {showChevron && chevron}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={cls}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          aria-current={current ? "page" : undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
        >
          {body}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        disabled={disabled}
        aria-current={current ? "true" : undefined}
        onClick={onClick}
      >
        {body}
      </button>
    );
  }
);
