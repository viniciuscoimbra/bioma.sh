import { forwardRef, useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Range.module.css";

/** Intervalo selecionado: [mínimo, máximo]. */
export type RangeValue = [number, number];

/** Props for the dual-value range slider. */
export interface RangeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  min?: number;
  max?: number;
  /** Incremento do teclado e da grade de valores. Padrão 1. */
  step?: number;
  /** Intervalo controlado. */
  value?: RangeValue;
  /** Intervalo inicial (não-controlado). Padrão: [min, max]. */
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  /** Nome do controle, exibido acima da track. */
  label?: string;
  /** Formata cada extremo no readout/aria (ex.: `(v) => v + "k"`). */
  formatValue?: (value: number) => string;
  /** Pílula mono "lo — hi". Padrão `true`. */
  showValue?: boolean;
  /** Fixa o mínimo e expõe apenas o handle final (ex.: raio 0 → 2 km). */
  fixedMinimum?: boolean;
  /** Legendas distribuídas sob a track (ex.: ["0", "25", "50", "75", "100"]). */
  ticks?: string[];
  /** Mini-distribuição acima da track; barras dentro do intervalo acendem. */
  histogram?: number[];
  disabled?: boolean;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Range — slider de intervalo com dois handles.
 *
 * Arraste cada handle (pointer capture); clique na track teleporta o handle
 * mais próximo; ←/→ ajustam por `step` (Shift = 10×) e Home/End vão ao limite
 * disponível. O mínimo nunca cruza o máximo. `histogram` desenha a
 * distribuição e acende as barras dentro do intervalo. Cada handle é um
 * `role="slider"` (Mínimo/Máximo) com `aria-valuemin/max/now/text`.
 * Controlado (`value`/`onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Range label="Faixa de DA" defaultValue={[30, 80]} ticks={["0","25","50","75","100"]} />
 */
export const Range = forwardRef<HTMLDivElement, RangeProps>(function Range(
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
    fixedMinimum = false,
    ticks,
    histogram,
    disabled,
    className,
    ...rest
  },
  ref
) {
  const uid = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [internal, setInternal] = useState<RangeValue>(defaultValue ?? [min, max]);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

  const raw = value !== undefined ? value : internal;
  const low = fixedMinimum ? min : clamp(Math.min(raw[0], raw[1]), min, max);
  const high = clamp(Math.max(raw[0], raw[1]), min, max);
  const pctLow = max === min ? 0 : ((low - min) / (max - min)) * 100;
  const pctHigh = max === min ? 0 : ((high - min) / (max - min)) * 100;

  function snap(v: number) {
    const snapped = clamp(Math.round((v - min) / step) * step + min, min, max);
    const decimals = (String(step).split(".")[1] ?? "").length;
    return Number(snapped.toFixed(decimals));
  }

  function commit(which: "low" | "high", next: number) {
    if (fixedMinimum && which === "low") return;
    // um handle nunca cruza o outro
    const fixed = which === "low" ? Math.min(snap(next), high) : Math.max(snap(next), low);
    const pair: RangeValue = which === "low" ? [fixed, high] : [low, fixed];
    if (pair[0] === low && pair[1] === high) return;
    if (value === undefined) setInternal(pair);
    onChange?.(pair);
  }

  function valueFromPointer(e: React.PointerEvent) {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return min + ratio * (max - min);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled) return;
    e.preventDefault();
    const v = valueFromPointer(e);
    // teleporta o handle mais próximo (empate → o de cima, high)
    const which = fixedMinimum ? "high" : Math.abs(v - low) < Math.abs(v - high) ? "low" : "high";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(which);
    commit(which, v);
    trackRef.current
      ?.querySelector<HTMLElement>(`[data-thumb="${which}"]`)
      ?.focus();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || disabled) return;
    commit(dragging, valueFromPointer(e));
  }

  function keyHandler(which: "low" | "high") {
    return (e: React.KeyboardEvent) => {
      if (disabled) return;
      const current = which === "low" ? low : high;
      const big = e.shiftKey ? step * 10 : step;
      switch (e.key) {
        case "ArrowRight": case "ArrowUp": e.preventDefault(); commit(which, current + big); break;
        case "ArrowLeft": case "ArrowDown": e.preventDefault(); commit(which, current - big); break;
        case "Home": e.preventDefault(); commit(which, which === "low" ? min : low); break;
        case "End": e.preventDefault(); commit(which, which === "low" ? high : max); break;
        case "PageUp": e.preventDefault(); commit(which, current + step * 10); break;
        case "PageDown": e.preventDefault(); commit(which, current - step * 10); break;
      }
    };
  }

  function thumb(which: "low" | "high") {
    const isLow = which === "low";
    const current = isLow ? low : high;
    return (
      <div
        data-thumb={which}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${label ? `${label} — ` : ""}${fixedMinimum ? "valor" : isLow ? "mínimo" : "máximo"}`}
        aria-valuemin={isLow ? min : low}
        aria-valuemax={isLow ? high : max}
        aria-valuenow={current}
        aria-valuetext={formatValue(current)}
        aria-disabled={disabled || undefined}
        className={cn(styles.thumb, dragging === which && styles.dragging)}
        style={{ left: `${isLow ? pctLow : pctHigh}%` }}
        onKeyDown={keyHandler(which)}
      />
    );
  }

  return (
    <div ref={ref} className={cn(styles.block, disabled && styles.disabled, className)} {...rest}>
      {(label || showValue) && (
        <div className={styles.row}>
          {label && (
            <span className={styles.name} id={`${uid}-label`}>
              {label}
            </span>
          )}
          {showValue && (
            <span className={styles.readout}>
              {fixedMinimum ? formatValue(high) : `${formatValue(low)} — ${formatValue(high)}`}
            </span>
          )}
        </div>
      )}
      {histogram && histogram.length > 0 && (
        <div className={styles.hist} aria-hidden="true">
          {histogram.map((h, i) => {
            const center = min + ((i + 0.5) / histogram.length) * (max - min);
            const peak = Math.max(...histogram);
            return (
              <span
                key={i}
                className={cn(center >= low && center <= high && styles.histIn)}
                style={{ height: `${peak ? (h / peak) * 100 : 0}%` }}
              />
            );
          })}
        </div>
      )}
      <div
        ref={trackRef}
        className={styles.range}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
      >
        <div className={styles.track} />
        <div className={styles.fill} style={{ left: `${pctLow}%`, width: `${pctHigh - pctLow}%` }} />
        {!fixedMinimum && thumb("low")}
        {thumb("high")}
      </div>
      {ticks && (
        <div className={styles.ticks} aria-hidden="true">
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
});
