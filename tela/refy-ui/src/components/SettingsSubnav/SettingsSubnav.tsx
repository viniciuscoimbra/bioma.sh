import type { MouseEventHandler, ReactElement, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./SettingsSubnav.module.css";

/** Uma subpágina do menu secundário. */
export interface SettingsSubnavItem {
  href: string;
  label: string;
  /** Linha secundária opcional (ex.: "Perfil, senha, 2FA"). */
  description?: string;
  /** Ícone opcional via ReactNode (não bundleamos ícones). */
  icon?: ReactNode;
}

/** Grupo de subpáginas com título opcional (ex.: "Pessoal", "Workspace"). */
export interface SettingsSubnavGroup {
  title?: string;
  items: SettingsSubnavItem[];
}

/** Props que o link padrão (ou o `renderLink` injetado) recebe prontas. */
export interface SettingsSubnavLinkProps {
  href: string;
  className: string;
  "aria-current"?: "page";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}

/** Props for the SettingsSubnav secondary menu. */
export interface SettingsSubnavProps {
  /** Itens sem agrupamento. Ignorado se `groups` for passado. */
  items?: SettingsSubnavItem[];
  /** Itens agrupados com título de seção. */
  groups?: SettingsSubnavGroup[];
  /** `href` do item ativo (recebe `aria-current="page"`). */
  activeHref?: string;
  /** `aria-label` do `<nav>`. */
  label?: string;
  /**
   * Renderização de link injetável — casa com o Link do router sem acoplar:
   * `renderLink={(item, p) => <Link {...p} href={item.href} />}`.
   * Padrão: `<a {...p} />`.
   */
  renderLink?: (item: SettingsSubnavItem, linkProps: SettingsSubnavLinkProps) => ReactElement;
  /** Disparado no clique de qualquer item (além da navegação). */
  onNavigate?: (item: SettingsSubnavItem) => void;
  className?: string;
}

/**
 * SettingsSubnav — menu secundário vertical de subpáginas do MESMO assunto
 * (ex.: Configurações → Conta/Geral/Time/Projetos), coluna esquerda das telas
 * `settings_*`. Cada item é um link real; o ativo casa com `activeHref` e
 * recebe `aria-current="page"`. Use `renderLink` para integrar com o Link do
 * Next/router sem acoplar a lib.
 *
 *   <SettingsSubnav activeHref="/settings/account" groups={[...]} />
 */
export function SettingsSubnav({
  items,
  groups,
  activeHref,
  label = "Configurações",
  renderLink,
  onNavigate,
  className,
}: SettingsSubnavProps) {
  const resolvedGroups: SettingsSubnavGroup[] = groups ?? (items ? [{ items }] : []);

  function renderItem(item: SettingsSubnavItem) {
    const isActive = item.href === activeHref;
    const linkProps: SettingsSubnavLinkProps = {
      href: item.href,
      className: cn(styles.item, isActive && styles.active),
      "aria-current": isActive ? "page" : undefined,
      onClick: onNavigate ? () => onNavigate(item) : undefined,
      children: (
        <>
          {item.icon != null && (
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className={styles.text}>
            <span className={styles.itemLabel}>{item.label}</span>
            {item.description != null && (
              <span className={styles.itemDesc}>{item.description}</span>
            )}
          </span>
        </>
      ),
    };
    return (
      <li key={item.href}>
        {renderLink ? renderLink(item, linkProps) : <a {...linkProps} />}
      </li>
    );
  }

  return (
    <nav className={cn(styles.subnav, className)} aria-label={label}>
      {resolvedGroups.map((group, gi) => (
        <div className={styles.group} key={group.title ?? gi}>
          {group.title != null && <div className={styles.groupTitle}>{group.title}</div>}
          <ul className={styles.list}>{group.items.map(renderItem)}</ul>
        </div>
      ))}
    </nav>
  );
}
