import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "../../lib/cn";
import styles from "./TableOfContents.module.css";

/** Uma âncora do sumário. `id` é o id do elemento-alvo na página. */
export interface TocItem {
  id: string;
  label: string;
  /** Nível de indentação (1 = raiz). */
  level?: 1 | 2 | 3;
}

/** Props for the TableOfContents rail. */
export interface TableOfContentsProps {
  /** Âncoras, na ordem em que aparecem na página. */
  items: TocItem[];
  /** Rótulo do trilho (visível + `aria-label` do `<nav>`). */
  label?: string;
  /** Item ativo controlado — desliga o scrollspy. */
  activeId?: string;
  /** Item ativo inicial (não-controlado). Padrão: primeiro item. */
  defaultActiveId?: string;
  /** Disparado quando o ativo muda (scrollspy ou clique). */
  onActiveChange?: (id: string) => void;
  /** Liga o scrollspy via IntersectionObserver (ignorado se `activeId` for passado). */
  scrollSpy?: boolean;
  /** `rootMargin` do IntersectionObserver do scrollspy. */
  rootMargin?: string;
  /**
   * Contêiner rolável observado pelo scrollspy (`root` do
   * IntersectionObserver). Padrão: `null` (viewport). Passe o elemento com
   * `overflow-y: auto` quando a rolagem NÃO é a da página.
   */
  root?: Element | null;
  /** Cola o trilho na rolagem (`position: sticky`). */
  sticky?: boolean;
  className?: string;
}

/**
 * TableOfContents — trilho lateral de sumário de página longa ("Nesta
 * página"). Lista âncoras `{id, label}` e destaca a seção visível via
 * scrollspy (IntersectionObserver). Clique rola suave até a âncora
 * (instantâneo com `prefers-reduced-motion`). Para controlar por fora,
 * passe `activeId`/`onActiveChange` — o scrollspy é desligado.
 *
 *   <TableOfContents items={[{ id: "perfil", label: "Perfil" }]} />
 */
export function TableOfContents({
  items,
  label = "Nesta página",
  activeId,
  defaultActiveId,
  onActiveChange,
  scrollSpy = true,
  rootMargin = "-80px 0px -60% 0px",
  root = null,
  sticky = false,
  className,
}: TableOfContentsProps) {
  const [internal, setInternal] = useState<string | undefined>(
    defaultActiveId ?? items[0]?.id
  );
  const controlled = activeId !== undefined;
  const active = controlled ? activeId : internal;

  const changeRef = useRef(onActiveChange);
  changeRef.current = onActiveChange;

  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    if (controlled || !scrollSpy || typeof IntersectionObserver === "undefined") return;
    const sections = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pega a seção visível mais próxima do topo.
        // exige área de interseção real (> 0): uma seção que só ENCOSTA na
        // borda da zona reporta isIntersecting com área zero e roubaria o foco.
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRect.height > 0)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          const id = visible[0].target.id;
          setInternal((prev) => {
            if (prev !== id) changeRef.current?.(id);
            return id;
          });
        }
      },
      { root, rootMargin, threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids, controlled, scrollSpy, rootMargin, root]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>, item: TocItem) {
    const el = document.getElementById(item.id);
    if (!el) return; // deixa o hash nativo agir
    e.preventDefault();
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    if (!controlled) setInternal(item.id);
    onActiveChange?.(item.id);
  }

  return (
    <nav className={cn(styles.toc, sticky && styles.sticky, className)} aria-label={label}>
      <div className={styles.label} aria-hidden="true">
        {label}
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  styles.item,
                  item.level === 2 && styles.l2,
                  item.level === 3 && styles.l3,
                  isActive && styles.active
                )}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => handleClick(e, item)}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
