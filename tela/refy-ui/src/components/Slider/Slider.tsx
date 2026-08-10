import { forwardRef, useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Slider.module.css";

/** Props for the Slider control. */
export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  min?: number;
  max?: number;
  /** Incremento do teclado e da grade de valores. Padrão 1. */
  step?: number;
  /** Valor controlado. */
  value?: number;
  /** Valor inicial (não-controlado). Padrão: `min`. */
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** Nome do controle, exibido acima da track. */
  label?: string;
  /** Formata o valor no readout e no `aria-valuetext` (ex.: `(v) => v + "%"`). */
  formatValue?: (value: number) => string;
  /** Pílula mono com o valor atual. Padrão `true` quando há `label`. */
  showValue?: boolean;
  /** Legendas nas extremidades da track (ex.: ["Rasa", "Profunda"]). */
  ticks?: [string, string];
  /** Slider discreto: um rótulo por step — desenha os pontos e a régua de labels. */
  marks?: string[];
  disabled?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Slider — controle contínuo arrastável.
 *
 * Clique na track teleporta o thumb; arraste com pointer capture; setas ←/→
 * ajustam por `step` (Shift = 10×), Home/End vão aos extremos. `marks`
 * transforma em slider discreto com pontos e rótulos por step. Acessível via
 * `role="slider"` + `aria-valuemin/max/now/text`. Controlado (`value`/
 * `onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Slider label="Profundidade" defaultValue={35} formatValue={(v) => `${v}%`} />
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onChange,
    label,
    formatValue = String,
    showValue = true,
    ticks,
    marks,
    disabled,
    className,
    ...rest
  },
  ref
) {
  const uid = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState(defaultValue ?? min);
  const [dragging, setDragging] = useState(false);
  const current = clamp(value !== undefined ? value : internal, min, max);
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;

  function commit(next: number) {
    const snapped = clamp(Math.round((next - min) / step) * step + min, min, max);
    // evita 0.30000000000000004 em steps decimais
    const decimals = (String(step).split(".")[1] ?? "").length;
    const fixed = Number(snapped.toFixed(decimals));
    if (fixed === current) return;
    if (value === undefined) setInternal(fixed);
    onChange?.(fixed);
  }

  function valueFromPointer(e: React.PointerEvent) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    commit(valueFromPointer(e));
    trackRef.current?.querySelector<HTMLElement>("[role=slider]")?.focus();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || disabled) return;
    commit(valueFromPointer(e));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    const big = e.shiftKey ? step * 10 : step;
    switch (e.key) {
      case "ArrowRight": case "ArrowUp": e.preventDefault(); commit(current + big); break;
      case "ArrowLeft": case "ArrowDown": e.preventDefault(); commit(current - big); break;
      case "Home": e.preventDefault(); commit(min); break;
      case "End": e.preventDefault(); commit(max); break;
      case "PageUp": e.preventDefault(); commit(current + step * 10); break;
      case "PageDown": e.preventDefault(); commit(current - step * 10); break;
    }
  }

  const stepCount = marks ? marks.length - 1 : 0;
  const readout = formatValue(current);

  return (
    <div ref={ref} className={cn(styles.block, disabled && styles.disabled, className)} {...rest}>
      {(label || showValue) && (
        <div className={styles.row}>
          {label && (
            <span className={styles.name} id={`${uid}-label`}>
              {label}
            </span>
          )}
          {showValue && <span className={styles.readout}>{readout}</span>}
        </div>
      )}
      <div
        ref={trackRef}
        className={styles.slider}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className={styles.track} />
        <div className={styles.fill} style={{ width: `${pct}%` }} />
        {marks &&
          marks.map((_, i) => (
            <span key={i} className={styles.stepDot} style={{ left: `${(i / stepCount) * 100}%` }} />
          ))}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={label ? `${uid}-label` : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={marks ? marks[Math.round((current - min) / step)] ?? readout : readout}
          aria-disabled={disabled || undefined}
          className={cn(styles.thumb, dragging && styles.dragging)}
          style={{ left: `${pct}%` }}
          onKeyDown={onKeyDown}
        />
      </div>
      {marks ? (
        <div className={styles.stepLabels}>
          {marks.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      ) : (
        ticks && (
          <div className={styles.ticks} aria-hidden="true">
            <span>{ticks[0]}</span>
            <span>{ticks[1]}</span>
          </div>
        )
      )}
    </div>
  );
});
