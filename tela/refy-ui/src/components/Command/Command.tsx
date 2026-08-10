import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Kbd } from "../Kbd";
import { cn } from "../../lib/cn";
import styles from "./Command.module.css";

/** Um comando ou resultado da paleta. */
export interface CommandItem {
  /** Identificador estável. */
  id: string;
  /** Texto exibido (recebe destaque do termo buscado). */
  label: string;
  /** Rótulo de seção — itens com o mesmo `group` ficam juntos. */
  group?: string;
  /** Ícone à esquerda (via prop, nunca bundleado). */
  icon?: ReactNode;
  /** Badge curto tipo avatar (ex.: iniciais de um domínio). */
  lead?: string;
  /** Atalho exibido em `kbd` à direita (ex.: "⌘N"). */
  shortcut?: string;
  /** Termos extras para a busca encontrar este item. */
  keywords?: string;
  disabled?: boolean;
  /** Executado ao selecionar (além do `onSelect` da paleta). */
  onSelect?: () => void;
}

/** Props for the command palette. */
export interface CommandProps {
  /** Paleta visível (controlada — overlay não tem estado interno). */
  open: boolean;
  /** Pedido de fechamento: Esc, clique no backdrop ou seleção. */
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /** Disparado ao escolher qualquer item. */
  onSelect?: (item: CommandItem) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function highlight(label: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return label;
  const at = label.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at)}
      <b className={styles.mark}>{label.slice(at, at + q.length)}</b>
      {label.slice(at + q.length)}
    </>
  );
}

/**
 * Command — paleta de comandos (⌘K).
 *
 * Busca global com agrupamento por categoria, destaque do termo, atalhos em
 * `kbd` e navegação por teclado (↑/↓, Enter, Esc). Card de 560px sobre
 * backdrop; foco vai direto para o input ao abrir. Controlada por
 * `open`/`onOpenChange` — registre o atalho ⌘K no app:
 *
 *   useEffect(() => {
 *     const h = (e) => { if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(true); } };
 *     window.addEventListener("keydown", h);
 *     return () => window.removeEventListener("keydown", h);
 *   }, []);
 */
export function Command({
  open,
  onOpenChange,
  items,
  onSelect,
  placeholder = "Buscar comandos…",
  emptyMessage = "Nenhum resultado",
  className,
}: CommandProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // reset e foco a cada abertura
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.label.toLowerCase().includes(q) || it.keywords?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const sections = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const key = item.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map, ([group, list]) => ({ group, list }));
  }, [filtered]);

  const active = filtered[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function choose(item: CommandItem) {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item);
    onOpenChange(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (active) { e.preventDefault(); choose(active); }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className={styles.backdrop} onClick={() => onOpenChange(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        className={cn(styles.command, className)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className={styles.inputRow}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-autocomplete="list"
            aria-activedescendant={active ? `cmd-opt-${activeIndex}` : undefined}
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
          <Kbd>esc</Kbd>
        </div>
        <div id="command-list" ref={listRef} role="listbox" aria-label="Resultados" className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>{emptyMessage}</div>
          ) : (
            sections.map(({ group, list }) => (
              <div key={group || "__default"}>
                {group && <div className={styles.groupLabel}>{group}</div>}
                {list.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={`cmd-opt-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={isActive}
                      aria-disabled={item.disabled || undefined}
                      className={cn(styles.item, isActive && styles.active, item.disabled && styles.itemDisabled)}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(item)}
                    >
                      {item.icon && <span className={styles.icon}>{item.icon}</span>}
                      {item.lead && <span className={styles.lead}>{item.lead}</span>}
                      <span className={styles.label}>{highlight(item.label, query)}</span>
                      {item.shortcut && <Kbd className={styles.shortcut}>{item.shortcut}</Kbd>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
