import { useState } from "react";
import { IconButton } from "../IconButton";
import { Menu, type MenuEntry } from "../Menu";
import { cn } from "../../lib/cn";
import styles from "./HelpMenu.module.css";

/** Props for the HelpMenu component. */
export interface HelpMenuProps {
  /** Itens do menu. Padrão: Documentação, Atalhos, ─, Falar com suporte. */
  entries?: MenuEntry[];
  onSelect?: (id: string) => void;
  /** Rótulo acessível. */
  label?: string;
  className?: string;
}

const DEFAULT_ENTRIES: MenuEntry[] = [
  { id: "docs", label: "Documentação" },
  { id: "shortcuts", label: "Atalhos de teclado", shortcut: "⌘K" },
  { type: "separator" },
  { id: "support", label: "Falar com suporte" },
];

/**
 * HelpMenu — botão "?" que abre o menu de ajuda.
 *
 * Compõe `IconButton` (lg, mesmo tamanho do NotificationBell) + `Menu` com
 * itens padrão (Documentação, Atalhos, Suporte), customizáveis via
 * `entries`. Alinhado ao fim (canto da topbar).
 *
 *   <HelpMenu onSelect={(id) => id === "docs" && openDocs()} />
 */
export function HelpMenu({ entries = DEFAULT_ENTRIES, onSelect, label = "Ajuda", className }: HelpMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      align="end"
      className={className}
    >
      <IconButton
        size="lg"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(open && styles.open)}
        onClick={() => setOpen((v) => !v)}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />
    </Menu>
  );
}
