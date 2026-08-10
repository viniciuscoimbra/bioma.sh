import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "../Menu";
import { cn } from "../../lib/cn";
import styles from "./Breadcrumb.module.css";

/** Um nível da trilha. Sem `href` (ou o último) renderiza como página atual. */
export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  /** Clique (SPA); usado quando não há `href`. */
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Destino opcional do ícone de início. */
  root?: BreadcrumbItem;
  /** Separador entre níveis. Padrão "/". */
  separator?: ReactNode;
  /** A partir desta quantidade, o miolo vira um Menu. Padrão 5. */
  collapseAfter?: number;
  className?: string;
}

/**
 * Breadcrumb — trilha de navegação mono uppercase.
 *
 * Níveis anteriores são links (hover escurece); o último é a página atual
 * (`aria-current="page"`, em ink-1). `<nav aria-label="Trilha de navegação">`
 * com lista ordenada semântica.
 *
 *   <Breadcrumb items={[{ label: "Projetos", href: "/p" }, { label: "refy.com.br" }]} />
 */
export function Breadcrumb({ items, root, separator = "/", collapseAfter = 5, className }: BreadcrumbProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const uid = useId().replace(/:/g, "");
  const collapsed = items.length >= collapseAfter;
  const hidden = collapsed ? items.slice(1, -2) : [];
  const visible = collapsed ? [items[0], ...items.slice(-2)] : items;

  function navigate(item: BreadcrumbItem) {
    if (item.onClick) item.onClick();
    else if (item.href && typeof window !== "undefined") window.location.assign(item.href);
  }

  function control(item: BreadcrumbItem, current = false, className?: string) {
    const title = typeof item.label === "string" ? item.label : undefined;
    if (current) return <b className={cn(styles.current, className)} aria-current="page" title={title}>{item.label}</b>;
    if (item.href) return <a className={cn(styles.link, className)} href={item.href} onClick={item.onClick} title={title}>{item.label}</a>;
    return <button type="button" className={cn(styles.link, className)} onClick={item.onClick} title={title}>{item.label}</button>;
  }

  const homeIcon = (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" />
    </svg>
  );

  return (
    <nav aria-label="Trilha de navegação" className={cn(styles.breadcrumb, className)}>
      <ol className={styles.list}>
        {root && (
          <li className={styles.item}>
            {root.href ? <a className={styles.root} href={root.href} onClick={root.onClick} aria-label={typeof root.label === "string" ? root.label : "Início"}>{homeIcon}</a> : <button type="button" className={styles.root} onClick={root.onClick} aria-label={typeof root.label === "string" ? root.label : "Início"}>{homeIcon}</button>}
            <span className={styles.sep} aria-hidden="true">{separator}</span>
          </li>
        )}
        {visible.map((item, i) => {
          const isLast = i === visible.length - 1;
          return (
            <li key={i} className={styles.item}>
              {control(item, isLast)}
              {!isLast && (
                <span className={styles.sep} aria-hidden="true">{separator}</span>
              )}
              {collapsed && i === 0 && <>
                <Menu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  entries={hidden.map((entry, hiddenIndex) => ({ id: `${uid}-${hiddenIndex}`, label: entry.label, onSelect: () => navigate(entry) }))}
                >
                  <button type="button" className={styles.collapsed} aria-label="Mostrar caminho oculto" aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((open) => !open)}>
                    <i /><i /><i />
                  </button>
                </Menu>
                <span className={styles.sep} aria-hidden="true">{separator}</span>
              </>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
