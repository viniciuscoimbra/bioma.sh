import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "../Avatar";
import { cn } from "../../lib/cn";
import styles from "./WorkspaceSwitcher.module.css";

export interface Workspace {
  id: string;
  name: string;
  /** Papel/plano exibido em mono (ex.: "Workspace · Pro"). */
  role?: string;
  initials: string;
}

/** Props for the workspace switcher combobox. */
export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  /** Id do workspace atual (controlado). */
  value?: string;
  /** Workspace inicial (não-controlado). Padrão: primeiro. */
  defaultValue?: string;
  onChange?: (workspace: Workspace) => void;
  /** Só o avatar, sem nome (sidebar colapsada). */
  compact?: boolean;
  className?: string;
}

/**
 * WorkspaceSwitcher — seletor de workspace estilo combobox.
 *
 * Trigger com avatar quadrado + nome + papel + caret; abre um painel com
 * busca (quando há 5+ workspaces) e lista com check no atual. ↑/↓ + Enter,
 * Esc/clique fora fecham. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <WorkspaceSwitcher workspaces={list} onChange={switchTo} />
 */
export function WorkspaceSwitcher({
  workspaces,
  value,
  defaultValue,
  onChange,
  compact,
  className,
}: WorkspaceSwitcherProps) {
  const [internal, setInternal] = useState(defaultValue ?? workspaces[0]?.id);
  const currentId = value !== undefined ? value : internal;
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchable = workspaces.length >= 5;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? workspaces.filter((w) => w.name.toLowerCase().includes(q)) : workspaces;
  }, [workspaces, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(Math.max(0, workspaces.findIndex((w) => w.id === currentId)));
    }
  }, [open, workspaces, currentId]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(workspace: Workspace) {
    if (value === undefined) setInternal(workspace.id);
    onChange?.(workspace);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
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
        if (filtered[activeIndex]) { e.preventDefault(); choose(filtered[activeIndex]); }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  if (!current) return null;

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={cn(styles.trigger, compact && styles.triggerCompact)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Ambiente atual: ${current.name}. Trocar ambiente`}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar size="md" initials={current.initials} style={{ borderRadius: 6 }} />
        {!compact && (
          <span className={styles.meta}>
            <span className={styles.name}>{current.name}</span>
            {current.role && <span className={styles.role}>{current.role}</span>}
          </span>
        )}
        {!compact && (
          <svg className={styles.caret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
          </svg>
        )}
      </button>

      {open && (
        <div className={styles.pop}>
          {searchable && (
            <div className={styles.searchRow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                autoFocus
                className={styles.searchInput}
                placeholder="Buscar ambiente…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
              />
            </div>
          )}
          <div role="listbox" aria-label="Ambientes" className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>Nenhum ambiente</div>
            ) : (
              filtered.map((workspace, index) => {
                const isCurrent = workspace.id === currentId;
                return (
                  <div
                    key={workspace.id}
                    role="option"
                    aria-selected={isCurrent}
                    className={cn(styles.option, index === activeIndex && styles.active)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(workspace)}
                  >
                    <Avatar size="sm" initials={workspace.initials} style={{ borderRadius: 5 }} />
                    <span className={styles.optionMeta}>
                      <span className={styles.optionName}>{workspace.name}</span>
                      {workspace.role && <span className={styles.optionRole}>{workspace.role}</span>}
                    </span>
                    {isCurrent && (
                      <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
