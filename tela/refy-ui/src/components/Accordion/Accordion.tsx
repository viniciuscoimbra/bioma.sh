import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

/** Props for the Accordion component. */
export interface AccordionProps {
  items: AccordionItem[];
  /** single = só um aberto por vez; multiple = vários. */
  type?: "single" | "multiple";
  /** IDs abertos (controlado). */
  value?: string[];
  defaultValue?: string[];
  onChange?: (open: string[]) => void;
  className?: string;
}

/**
 * Accordion — seções expansíveis funcionais. Abre/fecha de verdade, com
 * altura animada. `single` (padrão) mantém um aberto; `multiple` permite vários.
 */
export function Accordion({
  items,
  type = "single",
  value,
  defaultValue = [],
  onChange,
  className,
}: AccordionProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const open = value ?? internal;

  function toggle(id: string) {
    const isOpen = open.includes(id);
    let next: string[];
    if (type === "single") next = isOpen ? [] : [id];
    else next = isOpen ? open.filter((x) => x !== id) : [...open, id];
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className={cn(styles.wrap, className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={cn(styles.item, isOpen && styles.itemOpen)}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              disabled={it.disabled}
              onClick={() => toggle(it.id)}
            >
              <span className={styles.title}>{it.title}</span>
              <svg className={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className={styles.panel} role="region" hidden={!isOpen}>
              <div className={styles.panelInner}>{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
