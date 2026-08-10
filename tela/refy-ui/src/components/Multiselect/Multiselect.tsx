import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Multiselect.module.css";

/** Uma opção selecionável do Multiselect. */
export interface MultiselectOption {
  /** Identificador estável da opção. */
  value: string;
  /** Texto do chip e da lista. */
  label: string;
  disabled?: boolean;
}

export interface MultiselectProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "defaultValue" | "onChange" | "size"
  > {
  /** Opções disponíveis. O texto digitado filtra a lista. */
  options: MultiselectOption[];
  /** Valores selecionados (controlado). */
  value?: string[];
  /** Seleção inicial (não-controlado). */
  defaultValue?: string[];
  /** Disparado a cada mudança com a lista completa de valores. */
  onChange?: (values: string[]) => void;
  /** Rótulo do campo (eyebrow mono acima do input). */
  label?: string;
  /** Colapsa chips além de N num contador "+N". Padrão: 3. */
  maxVisibleChips?: number;
  /** Mensagem quando nenhuma opção casa com a busca. */
  emptyMessage?: string;
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * Multiselect — seleção múltipla com chips removíveis dentro do campo.
 *
 * Altura fixa: mostra até três chips e colapsa o restante num contador `+N`
 * (limite ajustável por `maxVisibleChips`). Digite para filtrar, Enter/clique alterna a opção,
 * Backspace com o input vazio remove o último chip. Padrão ARIA combobox +
 * listbox `aria-multiselectable`. Controlado (`value`/`onChange`) ou
 * não-controlado (`defaultValue`).
 *
 *   <Multiselect label="Áreas de análise" options={areas} onChange={setAreas} />
 */
export const Multiselect = forwardRef<HTMLInputElement, MultiselectProps>(function Multiselect(
  {
    options,
    value,
    defaultValue = [],
    onChange,
    label,
    maxVisibleChips = 3,
    emptyMessage = "Nenhuma opção",
    error,
    hint,
    disabled,
    placeholder = "Adicionar…",
    className,
    id,
    ...rest
  },
  ref
) {
  const uid = useId();
  const inputId = id || `${uid}-input`;
  const listboxId = `${uid}-listbox`;

  // ----- seleção (controlada ou não) -----
  const [selectedInternal, setSelectedInternal] = useState<string[]>(defaultValue);
  const selected = value !== undefined ? value : selectedInternal;
  const selectedOptions = useMemo(
    () => selected.map((v) => options.find((o) => o.value === v)).filter(Boolean) as MultiselectOption[],
    [selected, options]
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [chipsOverflow, setChipsOverflow] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const active = filtered[activeIndex] ?? null;
  const activeId = active ? `${uid}-opt-${activeIndex}` : undefined;

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  // mantém a opção ativa visível ao navegar pelo teclado
  useEffect(() => {
    if (open && activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  // fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // fade só quando os chips realmente transbordam; chip novo rola para o fim
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;
    setChipsOverflow(el.scrollWidth > el.clientWidth);
    el.scrollLeft = el.scrollWidth;
  }, [selectedOptions.length, maxVisibleChips]);

  function setSelected(next: string[]) {
    if (value === undefined) setSelectedInternal(next);
    onChange?.(next);
  }

  function toggle(option: MultiselectOption) {
    if (option.disabled) return;
    setSelected(
      selected.includes(option.value)
        ? selected.filter((v) => v !== option.value)
        : [...selected, option.value]
    );
  }

  function remove(optionValue: string) {
    setSelected(selected.filter((v) => v !== optionValue));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) { e.preventDefault(); setActiveIndex(0); }
        break;
      case "End":
        if (open) { e.preventDefault(); setActiveIndex(filtered.length - 1); }
        break;
      case "Enter":
        if (open && active) { e.preventDefault(); toggle(active); }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Backspace":
        if (!query && selected.length) remove(selected[selected.length - 1]);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const visibleChips = selectedOptions.slice(0, maxVisibleChips);
  const hiddenCount = selectedOptions.length - visibleChips.length;

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div
        ref={wrapRef}
        className={cn(styles.wrap, open && styles.open, error && styles.hasError, disabled && styles.disabled)}
      >
        <div
          className={styles.shell}
          onClick={() => {
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          <div
            ref={chipsRef}
            className={cn(styles.chips, (!chipsOverflow || maxVisibleChips !== undefined) && styles.noMask)}
          >
            {visibleChips.map((option) => (
              <span key={option.value} className={styles.chip}>
                {option.label}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remover ${option.label}`}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(option.value);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </span>
            ))}
            {hiddenCount > 0 && <span className={styles.overflow}>+{hiddenCount}</span>}
          </div>
          <input
            {...rest}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            id={inputId}
            className={styles.input}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={open ? activeId : undefined}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={selected.length ? "" : placeholder}
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className={styles.caret}
            aria-label={open ? "Fechar opções" : "Abrir opções"}
            tabIndex={-1}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
              inputRef.current?.focus();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {open && (
          <div id={listboxId} role="listbox" aria-multiselectable="true" aria-label={label || placeholder} className={styles.pop}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>{emptyMessage}</div>
            ) : (
              filtered.map((option, index) => {
                const isSelected = selected.includes(option.value);
                const isActive = index === activeIndex;
                return (
                  <div
                    key={option.value}
                    id={`${uid}-opt-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={cn(
                      styles.option,
                      isSelected && styles.optionSelected,
                      isActive && styles.optionActive,
                      option.disabled && styles.optionDisabled
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault() /* não rouba o foco do input */}
                    onClick={() => toggle(option)}
                  >
                    <span className={styles.check}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    {option.label}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {(error || hint) && <p className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>}
    </div>
  );
});
