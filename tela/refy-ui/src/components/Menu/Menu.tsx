import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Kbd } from "../Kbd";
import { cn } from "../../lib/cn";
import styles from "./Menu.module.css";

/** Item acionável, separador ou rótulo de seção. */
export type MenuEntry =
  | {
      type?: "item";
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      /** Atalho exibido em `kbd` à direita. */
      shortcut?: string;
      /** Metadado simples à direita, sem semântica de atalho. */
      meta?: ReactNode;
      /** Item destrutivo (vermelho). */
      danger?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: "separator" }
  | { type: "label"; label: ReactNode };

/** Props for the Menu popover. */
export interface MenuProps {
  /** Menu visível (controlado). */
  open: boolean;
  /** Pedido de fechamento: Esc, clique fora ou seleção. */
  onOpenChange: (open: boolean) => void;
  entries: MenuEntry[];
  /** Disparado ao escolher qualquer item. */
  onSelect?: (id: string) => void;
  /** Elemento âncora (trigger). */
  children: ReactNode;
  /** Borda do menu alinhada ao início ou fim do trigger. Padrão `start`. */
  align?: "start" | "end";
  /** Lado de abertura em relação ao trigger. Padrão `bottom`. */
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Menu — lista de ações pop-up ancorada a um trigger.
 *
 * Suporta ícone, atalho em `kbd`, separadores, rótulos de seção e item
 * destrutivo (vermelho). ↑/↓ navegam, Enter aciona, Esc/clique fora fecham.
 * `role="menu"`/`menuitem` com `aria-activedescendant`. Controlado por
 * `open`/`onOpenChange`. Largura mínima 200px.
 *
 *   <Menu open={open} onOpenChange={setOpen} entries={acoes}>
 *     <IconButton aria-label="Mais" onClick={() => setOpen(!open)}>⋯</IconButton>
 *   </Menu>
 */
export function Menu({
  open,
  onOpenChange,
  entries,
  onSelect,
  children,
  align = "start",
  side = "bottom",
  className,
}: MenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(
    () => entries.filter((e): e is Extract<MenuEntry, { id: string }> => !e.type || e.type === "item"),
    [entries]
  );

  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOpenChange]);

  function choose(item: Extract<MenuEntry, { id: string }>) {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item.id);
    onOpenChange(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        if (items[activeIndex]) { e.preventDefault(); choose(items[activeIndex]); }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  }

  let itemIndex = -1;

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)} onKeyDown={onKeyDown}>
      {children}
      {open && (
        <div
          role="menu"
          aria-activedescendant={items[activeIndex] ? `menu-item-${items[activeIndex].id}` : undefined}
          className={cn(styles.menu, align === "end" && styles.menuEnd, side === "top" && styles.menuTop)}
        >
          {entries.map((entry, i) => {
            if (entry.type === "separator") return <div key={`sep-${i}`} className={styles.sep} role="separator" />;
            if (entry.type === "label")
              return (
                <div key={`label-${i}`} className={styles.label}>
                  {entry.label}
                </div>
              );
            itemIndex += 1;
            const index = itemIndex;
            const isActive = index === activeIndex;
            return (
              <div
                key={entry.id}
                id={`menu-item-${entry.id}`}
                role="menuitem"
                aria-disabled={entry.disabled || undefined}
                className={cn(
                  styles.item,
                  isActive && styles.active,
                  entry.danger && styles.danger,
                  entry.disabled && styles.itemDisabled
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(entry)}
              >
                {entry.icon && <span className={styles.icon}>{entry.icon}</span>}
                <span className={styles.itemLabel}>{entry.label}</span>
                {entry.meta && <span className={styles.meta}>{entry.meta}</span>}
                {entry.shortcut && <Kbd className={styles.kbd}>{entry.shortcut}</Kbd>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
