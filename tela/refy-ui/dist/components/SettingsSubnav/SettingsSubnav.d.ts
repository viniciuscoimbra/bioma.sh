import type { MouseEventHandler, ReactElement, ReactNode } from "react";
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
export declare function SettingsSubnav({ items, groups, activeHref, label, renderLink, onNavigate, className, }: SettingsSubnavProps): import("react").JSX.Element;
