import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import { Menu, type MenuEntry } from "../Menu";
import styles from "./SplitButton.module.css";

export interface SplitButtonOption {
  id?: string;
  label: string;
  /** Sufixo mono à direita (ex.: extensão .csv). */
  hint?: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

export type SplitButtonVariant = "primary" | "secondary";

export interface SplitButtonProps {
  label: string;
  variant?: SplitButtonVariant;
  menuAlign?: "start" | "end";
  leadingIcon?: ReactNode;
  onClick?: () => void;
  onSelect?: (id: string) => void;
  options: SplitButtonOption[];
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Opção executada inicialmente pelo botão principal. Padrão: primeira habilitada. */
  defaultOptionId?: string;
  className?: string;
}

const CaretIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/** SplitButton — a opção escolhida vira a ação principal visível. Composto sobre Button + Menu. */
export function SplitButton({
  label,
  variant = "secondary",
  menuAlign = "end",
  leadingIcon,
  onClick,
  onSelect,
  options,
  size = "md",
  disabled = false,
  loading = false,
  loadingLabel = "Processando…",
  open,
  defaultOpen = false,
  onOpenChange,
  defaultOptionId,
  className,
}: SplitButtonProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const optionId = (option: SplitButtonOption, index: number) => option.id ?? `${index}-${option.label}`;
  const firstEnabledIndex = options.findIndex((option) => !option.disabled);
  const firstEnabledId = firstEnabledIndex >= 0 ? optionId(options[firstEnabledIndex], firstEnabledIndex) : undefined;
  const [selectedId, setSelectedId] = useState(defaultOptionId ?? firstEnabledId);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  const selected = options.find((option, index) => optionId(option, index) === selectedId || option.label === selectedId);
  const entries: MenuEntry[] = options.map((option, index) => ({
    id: optionId(option, index),
    label: option.label,
    meta: option.hint,
    disabled: option.disabled,
    danger: option.danger,
    onSelect: option.onSelect,
  }));

  return (
    <Menu
      open={isOpen}
      onOpenChange={setOpen}
      onSelect={(id) => {
        setSelectedId(id);
        onSelect?.(id);
      }}
      entries={entries}
      align={menuAlign}
      className={cn(styles.menuHost, className)}
    >
      <div className={cn(styles.split, isOpen && styles.isOpen)}>
        <Button
          variant={variant}
          size={size}
          leadingIcon={leadingIcon}
          loading={loading}
          loadingLabel={loadingLabel}
          disabled={disabled}
          className={styles.main}
          onClick={() => {
            if (selected) selected.onSelect?.();
            onClick?.();
          }}
        >
          {selected ? `${label} ${selected.label}` : label}
        </Button>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading}
          className={styles.caret}
          aria-label="Mais opções"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
        >
          <span className={styles.caretIcon}>{CaretIcon}</span>
        </Button>
      </div>
    </Menu>
  );
}
