import { useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import styles from "./Calendar.module.css";

export type CalendarMode = "single" | "range";

/** Intervalo de datas (modo `range`). */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** Props for the Calendar date picker. */
export interface CalendarProps {
  /** `single` (uma data) ou `range` (início → fim, ex.: ida/volta). */
  mode?: CalendarMode;
  /** Valor controlado. `Date | null` no modo single; `DateRange` no modo range. */
  value?: Date | null | DateRange;
  /** Valor inicial (não-controlado). */
  defaultValue?: Date | null | DateRange;
  /** Disparado a cada seleção. `Date` no single, `DateRange` no range. */
  onChange?: (value: Date | DateRange) => void;
  /** Quantos meses lado a lado (útil no range). Padrão 1. */
  numberOfMonths?: 1 | 2;
  /** Mês visível controlado (1º dia do mês). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Limites de seleção. */
  min?: Date;
  max?: Date;
  /** 0 = domingo (padrão), 1 = segunda. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isRange = (v: unknown): v is DateRange =>
  !!v && typeof v === "object" && "start" in (v as object);

/**
 * Calendar — date picker funcional e isolado (átomo composto → molécula).
 *
 * Modo `single`: clique seleciona um dia. Modo `range`: 1º clique fixa o início,
 * 2º clique ≥ início fixa o fim (com preview no hover). Navegação por mês
 * (botões + PageUp/Down), teclado (setas + Enter/Espaço) e limites min/max.
 * Controlado via `value`/`onChange` ou não-controlado via `defaultValue`.
 *
 *   <Calendar mode="range" numberOfMonths={2} onChange={setPeriodo} />
 */
export function Calendar({
  mode = "single",
  value,
  defaultValue,
  onChange,
  numberOfMonths = 1,
  month,
  defaultMonth,
  onMonthChange,
  min,
  max,
  weekStartsOn = 0,
  locale = "pt-BR",
  className,
}: CalendarProps) {
  const emptyRange: DateRange = { start: null, end: null };

  // ----- estado de seleção (single ou range) -----
  const [singleInternal, setSingleInternal] = useState<Date | null>(
    mode === "single" && defaultValue instanceof Date ? defaultValue : null
  );
  const [rangeInternal, setRangeInternal] = useState<DateRange>(
    mode === "range" && isRange(defaultValue) ? defaultValue : emptyRange
  );
  const single = value !== undefined && value instanceof Date ? value : value === null ? null : singleInternal;
  const range = value !== undefined && isRange(value) ? value : rangeInternal;

  const [hover, setHover] = useState<Date | null>(null);

  // ----- mês visível -----
  const anchor = mode === "range" ? range.start : single;
  const [viewInternal, setViewInternal] = useState<Date>(
    firstOfMonth(defaultMonth ?? anchor ?? new Date())
  );
  const view = month ? firstOfMonth(month) : viewInternal;

  const [focused, setFocused] = useState<Date>(anchor ?? new Date());

  const today = startOfDay(new Date());
  const minD = min ? startOfDay(min) : null;
  const maxD = max ? startOfDay(max) : null;
  const isDisabled = (d: Date) => (minD && d < minD) || (maxD && d > maxD) || false;

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 7); // domingo
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + ((i + weekStartsOn) % 7));
      return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d);
    });
  }, [locale, weekStartsOn]);

  function setView(next: Date) {
    if (!month) setViewInternal(next);
    onMonthChange?.(next);
  }

  function select(d: Date) {
    if (isDisabled(d)) return;
    const day = startOfDay(d);
    setFocused(day);

    if (mode === "single") {
      if (value === undefined) setSingleInternal(day);
      onChange?.(day);
      return;
    }
    // range
    let next: DateRange;
    if (!range.start || (range.start && range.end)) {
      next = { start: day, end: null }; // (re)inicia
    } else if (day < range.start) {
      next = { start: day, end: null }; // clicou antes → novo início
    } else {
      next = { start: range.start, end: day }; // fecha intervalo
    }
    if (value === undefined) setRangeInternal(next);
    onChange?.(next);
  }

  function moveFocus(deltaDays: number) {
    const next = new Date(focused);
    next.setDate(focused.getDate() + deltaDays);
    setFocused(next);
    if (next < firstOfMonth(view) || next >= addMonths(view, numberOfMonths)) {
      setView(firstOfMonth(next));
    }
  }
  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowLeft": e.preventDefault(); moveFocus(-1); break;
      case "ArrowRight": e.preventDefault(); moveFocus(1); break;
      case "ArrowUp": e.preventDefault(); moveFocus(-7); break;
      case "ArrowDown": e.preventDefault(); moveFocus(7); break;
      case "PageUp": e.preventDefault(); setView(addMonths(view, -1)); break;
      case "PageDown": e.preventDefault(); setView(addMonths(view, 1)); break;
      case "Enter": case " ": e.preventDefault(); select(focused); break;
    }
  }

  // preview do fim do intervalo enquanto passa o mouse
  const previewEnd = mode === "range" && range.start && !range.end ? hover : null;

  function dayState(d: Date) {
    if (mode === "single") {
      return { isSel: sameDay(d, single), isStart: false, isEnd: false, inBand: false };
    }
    const { start, end } = range;
    const effEnd = end ?? previewEnd;
    const lo = start;
    const hi = effEnd && start && effEnd < start ? start : effEnd;
    const isStart = sameDay(d, start);
    const isEnd = sameDay(d, end) || (!end && sameDay(d, previewEnd));
    const inBand = !!lo && !!hi && d > startOfDay(lo) && d < startOfDay(hi);
    return { isSel: isStart || isEnd, isStart, isEnd, inBand };
  }

  function renderMonth(base: Date, mi: number) {
    const monthLabel = (() => {
      const s = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(base);
      return s.charAt(0).toUpperCase() + s.slice(1);
    })();
    const first = firstOfMonth(base);
    const offset = (first.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });

    return (
      <div className={styles.month} key={mi}>
        <div className={styles.head}>
          {mi === 0 ? (
            <button type="button" className={styles.nav} aria-label="Mês anterior" onClick={() => setView(addMonths(view, -1))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
          ) : <span className={styles.navSpacer} />}
          <span className={styles.monthLabel}>{monthLabel}</span>
          {mi === numberOfMonths - 1 ? (
            <button type="button" className={styles.nav} aria-label="Próximo mês" onClick={() => setView(addMonths(view, 1))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          ) : <span className={styles.navSpacer} />}
        </div>

        <div className={styles.weekRow} aria-hidden="true">
          {weekdays.map((w, i) => <span key={i} className={styles.weekday}>{w}</span>)}
        </div>

        <div className={styles.grid} role="grid" onKeyDown={onKeyDown}>
          {cells.map((d) => {
            const outside = d.getMonth() !== base.getMonth();
            const disabled = isDisabled(d);
            const isToday = sameDay(d, today);
            const isFocused = sameDay(d, focused);
            const { isSel, isStart, isEnd, inBand } = dayState(d);
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                tabIndex={isFocused ? 0 : -1}
                aria-selected={isSel}
                aria-current={isToday ? "date" : undefined}
                disabled={disabled}
                className={cn(
                  styles.day,
                  outside && styles.outside,
                  inBand && styles.inBand,
                  isSel && styles.selected,
                  isStart && mode === "range" && styles.rangeStart,
                  isEnd && mode === "range" && styles.rangeEnd,
                  isToday && !isSel && styles.today,
                  disabled && styles.disabled
                )}
                onClick={() => select(d)}
                onMouseEnter={() => mode === "range" && setHover(d)}
                onFocus={() => setFocused(d)}
              >
                <span className={styles.dayNum}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const months = Array.from({ length: numberOfMonths }, (_, i) => addMonths(view, i));

  return (
    <div
      className={cn(styles.wrap, numberOfMonths > 1 && styles.wrapMulti, className)}
      onMouseLeave={() => setHover(null)}
    >
      {months.map((m, i) => renderMonth(m, i))}
    </div>
  );
}
