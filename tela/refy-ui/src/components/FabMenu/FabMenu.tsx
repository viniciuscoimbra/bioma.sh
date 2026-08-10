import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Fab } from "../Fab";
import { Menu, type MenuEntry } from "../Menu";
import styles from "./FabMenu.module.css";

export interface FabMenuAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

export interface FabMenuProps {
  /** Entre três e cinco ações curtas é o uso recomendado. */
  actions: FabMenuAction[];
  /** Nome acessível do gatilho fechado. */
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (id: string) => void;
  align?: "start" | "end";
  className?: string;
}

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/**
 * FabMenu — ação flutuante que revela um Menu canônico acima do gatilho.
 * Menu continua dono dos itens, teclado, foco ativo, Escape e clique externo.
 */
export function FabMenu({
  actions,
  label = "Abrir ações",
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  align = "end",
  className,
}: FabMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  const entries: MenuEntry[] = actions.map((action) => ({
    type: "item",
    id: action.id,
    label: action.label,
    icon: action.icon,
    disabled: action.disabled,
    danger: action.danger,
    onSelect: action.onSelect,
  }));

  return (
    <div className={cn(styles.host, className)} data-open={isOpen || undefined}>
      {isOpen && <div className={styles.scrim} aria-hidden="true" />}
      <Menu
        open={isOpen}
        onOpenChange={setOpen}
        onSelect={onSelect}
        entries={entries}
        align={align}
        side="top"
        className={styles.menuHost}
      >
        <Fab
          icon={PlusIcon}
          label={isOpen ? "Fechar ações" : label}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={() => setOpen(!isOpen)}
          className={cn(styles.trigger, isOpen && styles.triggerOpen)}
        />
      </Menu>
    </div>
  );
}
