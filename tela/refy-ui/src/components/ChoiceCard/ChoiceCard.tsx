import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./ChoiceCard.module.css";

export type ChoiceCardMode = "single" | "multiple";

interface ChoiceCtx {
  mode: ChoiceCardMode;
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
  /** tabIndex do card no roving (modo single). */
  tabIndexFor: (value: string, disabled: boolean) => number;
  noteFirst: (value: string) => void;
}

const Ctx = createContext<ChoiceCtx | null>(null);

/** Props for the ChoiceCardGroup container. */
export interface ChoiceCardGroupProps {
  /** `single` = semântica de radio (default); `multiple` = checkboxes. */
  mode?: ChoiceCardMode;
  /** Valor controlado: string (single) ou string[] (multiple). */
  value?: string | string[];
  /** Valor inicial não-controlado. */
  defaultValue?: string | string[];
  /** Callback: recebe string (single) ou string[] (multiple). */
  onChange?: (value: string | string[]) => void;
  /** Rótulo acessível do grupo (obrigatório sem label visível externo). */
  label?: string;
  /** Colunas do grid (default 3; 1 = lista empilhada). */
  columns?: number;
  children: ReactNode;
  className?: string;
}

function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * ChoiceCardGroup — grupo de cards selecionáveis com semântica de
 * radio/checkbox e navegação por teclado (roving tabindex no modo single:
 * setas movem E selecionam, como radio nativo; Home/End vão às pontas).
 */
export function ChoiceCardGroup({
  mode = "single",
  value,
  defaultValue,
  onChange,
  label,
  columns = 3,
  children,
  className,
}: ChoiceCardGroupProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string[]>(() => toArray(defaultValue));
  const selected = isControlled ? toArray(value) : internal;
  const groupRef = useRef<HTMLDivElement>(null);
  const firstValueRef = useRef<string | null>(null);
  firstValueRef.current = null; // recalculado a cada render, na ordem dos filhos

  const select = useCallback(
    (v: string) => {
      let next: string[];
      if (mode === "single") {
        next = [v];
      } else {
        next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v];
      }
      if (!isControlled) setInternal(next);
      onChange?.(mode === "single" ? next[0] ?? "" : next);
    },
    [mode, selected, isControlled, onChange]
  );

  const isSelected = useCallback((v: string) => selected.includes(v), [selected]);

  const noteFirst = useCallback((v: string) => {
    if (firstValueRef.current == null) firstValueRef.current = v;
  }, []);

  const tabIndexFor = useCallback(
    (v: string, disabled: boolean) => {
      if (disabled) return -1;
      if (mode === "multiple") return 0;
      if (selected.length === 0) return v === firstValueRef.current ? 0 : -1;
      return isSelected(v) ? 0 : -1;
    },
    [mode, selected, isSelected]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const root = groupRef.current;
    if (!root) return;
    const cards = Array.from(
      root.querySelectorAll<HTMLButtonElement>("button[data-choice-card]:not(:disabled)")
    );
    if (cards.length === 0) return;
    e.preventDefault();
    const current = cards.indexOf(e.target as HTMLButtonElement);
    let next: number;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = cards.length - 1;
    else if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = current < 0 ? 0 : (current + 1) % cards.length;
    else next = current < 0 ? 0 : (current - 1 + cards.length) % cards.length;
    const target = cards[next];
    target.focus();
    // Padrão radio nativo: mover a seleção junto com o foco (só no single).
    if (mode === "single") {
      const v = target.getAttribute("data-value");
      if (v != null) select(v);
    }
  };

  const ctx = useMemo<ChoiceCtx>(
    () => ({ mode, isSelected, select, tabIndexFor, noteFirst }),
    [mode, isSelected, select, tabIndexFor, noteFirst]
  );

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={groupRef}
        role={mode === "single" ? "radiogroup" : "group"}
        aria-label={label}
        className={cn(styles.group, className)}
        style={{ "--choice-columns": columns } as CSSProperties}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** Props for a selectable ChoiceCard. */
export interface ChoiceCardProps {
  /** Valor único dentro do grupo. */
  value: string;
  /** Título da opção. */
  title: ReactNode;
  /** Descrição curta abaixo do título. */
  description?: ReactNode;
  /** Ícone pequeno inline antes do título (slot). */
  icon?: ReactNode;
  /** Preview grande acima do texto (slot — ex.: amostra de tema). */
  preview?: ReactNode;
  /** Meta/preço (mono) abaixo ou à direita do texto. */
  meta?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * ChoiceCard — card-como-radio/checkbox: título + descrição + ícone ou
 * preview + meta. Só funciona dentro de `ChoiceCardGroup`. Seleção com anel
 * primário; transição com tokens de motion.
 */
export function ChoiceCard({
  value,
  title,
  description,
  icon,
  preview,
  meta,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ChoiceCard deve estar dentro de ChoiceCardGroup.");
  if (!disabled) ctx.noteFirst(value);
  const checked = ctx.isSelected(value);
  return (
    <button
      type="button"
      role={ctx.mode === "single" ? "radio" : "checkbox"}
      aria-checked={checked}
      data-choice-card=""
      data-value={value}
      tabIndex={ctx.tabIndexFor(value, disabled)}
      disabled={disabled}
      className={cn(styles.card, checked && styles.selected, className)}
      onClick={() => ctx.select(value)}
    >
      {preview != null && <span className={styles.preview}>{preview}</span>}
      <span className={styles.body}>
        <span className={styles.title}>
          {icon != null && <span className={styles.icon}>{icon}</span>}
          {title}
        </span>
        {description != null && <span className={styles.description}>{description}</span>}
        {meta != null && <span className={styles.meta}>{meta}</span>}
      </span>
    </button>
  );
}
