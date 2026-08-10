import { Children, forwardRef, useId } from "react";
import type { HTMLAttributes, MouseEventHandler, ReactNode, Ref } from "react";
import { Switch } from "../Switch";
import type { SwitchProps } from "../Switch";
import { cn } from "../../lib/cn";
import styles from "./SettingRow.module.css";

/** Props for the SettingRow list/settings line. */
export interface SettingRowProps
  extends Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> {
  /** Título da linha. Cabem `Badge`/`Chip` inline (ex.: status "Conectado"). */
  title: ReactNode;
  /** Descrição em texto corrido sob o título. */
  description?: ReactNode;
  /** Meta mono sob a descrição (e-mail, IP, data, chave mascarada…). */
  meta?: ReactNode;
  /** Slot inicial — ícone ou `Avatar`. */
  leading?: ReactNode;
  /** Moldura 36px em volta do `leading` (padrão `.oauth-icon` — logos de provedor/bandeira). */
  leadingFrame?: boolean;
  /** Ações à direita (`Button`/`IconButton`/`Badge`/texto mono). Em linha clicável use só conteúdo NÃO interativo. */
  actions?: ReactNode;
  /** Com `href` a linha inteira vira `<a>` (como o `NavCard`). */
  href?: string;
  /** `target` do link (só com `href`). */
  target?: string;
  /** `rel` do link (só com `href`). */
  rel?: string;
  /** Sem `href`, torna a linha inteira um `<button>`. */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Desabilita a linha clicável (sem clique, sem foco por Tab no link). */
  disabled?: boolean;
  /** Chevron ">" à direita nas linhas clicáveis. Padrão `true`. */
  showChevron?: boolean;
  /**
   * `Switch` acoplado à direita (padrão `.pref-row`). O componente liga
   * `aria-labelledby`/`aria-describedby` ao título/descrição automaticamente.
   */
  switchProps?: SwitchProps;
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
 * SettingRow — linha de lista/configuração (padrão `.shell-card-row`,
 * `.oauth-row`, `.session-row`, `.pref-row`, `.key-row`, `.activity-row`…
 * das telas de referência). Slot `leading` (ícone/`Avatar`) + título +
 * descrição + meta mono + ações à direita.
 *
 * Variantes: estática (padrão, `<div>`); clicável — com `href` vira `<a>`,
 * com `onClick` vira `<button>` (linha inteira é o alvo, como o `NavCard`);
 * com `Switch` acoplado via `switchProps` (rótulo ligado por aria).
 * Agrupe linhas com `SettingRowGroup` (lista semântica + divisores).
 *
 *   <SettingRow leading={<GoogleIcon />} leadingFrame
 *     title={<>Google <Badge tone="success" dot>Conectado</Badge></>}
 *     meta="joao@globoeditorial.com · conectado em 12 jan. 2026"
 *     actions={<Button size="sm" variant="ghost">Desconectar</Button>} />
 */
export const SettingRow = forwardRef<HTMLElement, SettingRowProps>(
  function SettingRow(
    {
      title,
      description,
      meta,
      leading,
      leadingFrame = false,
      actions,
      href,
      target,
      rel,
      onClick,
      disabled = false,
      showChevron = true,
      switchProps,
      className,
      ...rest
    },
    ref
  ) {
    const titleId = useId();
    const descId = useId();
    const clickable = !switchProps && (href != null || onClick != null);

    const cls = cn(
      styles.row,
      clickable && styles.clickable,
      disabled && styles.disabled,
      className
    );

    const body = (
      <>
        {leading != null && (
          <span className={cn(styles.leading, leadingFrame && styles.leadingFrame)}>
            {leading}
          </span>
        )}
        <span className={styles.body}>
          <span id={titleId} className={styles.title}>
            {title}
          </span>
          {description != null && (
            <span id={descId} className={styles.description}>
              {description}
            </span>
          )}
          {meta != null && <span className={styles.meta}>{meta}</span>}
        </span>
        {actions != null && <span className={styles.actions}>{actions}</span>}
        {switchProps != null && (
          <span className={styles.actions}>
            <Switch
              aria-labelledby={titleId}
              aria-describedby={description != null ? descId : undefined}
              disabled={disabled || switchProps.disabled}
              {...switchProps}
            />
          </span>
        )}
        {clickable && showChevron && chevron}
      </>
    );

    if (clickable && href != null) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={cls}
          href={disabled ? undefined : href}
          target={target}
          rel={rel}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            onClick?.(e);
          }}
          {...(rest as HTMLAttributes<HTMLAnchorElement>)}
        >
          {body}
        </a>
      );
    }

    if (clickable) {
      return (
        <button
          ref={ref as Ref<HTMLButtonElement>}
          type="button"
          className={cls}
          disabled={disabled}
          onClick={onClick}
          {...(rest as HTMLAttributes<HTMLButtonElement>)}
        >
          {body}
        </button>
      );
    }

    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cls} {...rest}>
        {body}
      </div>
    );
  }
);

/** Props for the SettingRowGroup list wrapper. */
export interface SettingRowGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** `SettingRow`s (ou qualquer linha) — cada filho vira um `listitem` com divisor. */
  children: ReactNode;
  /** Rótulo acessível da lista (ex.: "Sessões ativas"). */
  "aria-label"?: string;
}

/**
 * SettingRowGroup — agrupa `SettingRow`s numa lista semântica
 * (`role="list"`/`role="listitem"`) com divisores por token entre as linhas.
 * É o miolo típico de um `Card` de configurações.
 *
 *   <SettingRowGroup aria-label="Preferências">
 *     <SettingRow title="Análise concluída" switchProps={{ defaultChecked: true }} />
 *     <SettingRow title="Resumo semanal" switchProps={{}} />
 *   </SettingRowGroup>
 */
export const SettingRowGroup = forwardRef<HTMLDivElement, SettingRowGroupProps>(
  function SettingRowGroup({ children, className, ...rest }, ref) {
    return (
      <div ref={ref} role="list" className={cn(styles.group, className)} {...rest}>
        {Children.map(children, (child) =>
          child == null ? child : (
            <div role="listitem" className={styles.item}>
              {child}
            </div>
          )
        )}
      </div>
    );
  }
);
