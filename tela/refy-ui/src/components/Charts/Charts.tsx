import { useEffect, useId, useRef, useState } from "react";
import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import { arc, area, curveMonotoneX, line } from "d3-shape";
import { cn } from "../../lib/cn";
import styles from "./Charts.module.css";

/* =========================================================
 * Charts — line/bar/donut/sparkline com D3 por trás
 * (d3-scale para escalas/ticks, d3-shape para curvas/arcos)
 * e render 100% React/SVG. Eixos com réguas e títulos,
 * legenda, tooltip e animações de entrada (CSS,
 * respeitando prefers-reduced-motion). Cores via tokens.
 * ========================================================= */

export type ChartTone = "primary" | "info" | "warn" | "critical";

const W = 520;
const H = 260;
const PAD = { left: 52, right: 16, top: 24, bottom: 44 };

/** Uma série do LineChart. */
export interface LineSeries {
  name: string;
  data: number[];
  tone?: ChartTone;
}

/** Props for the line chart. */
export interface LineChartProps {
  /** Título visível do gráfico. */
  title: string;
  /** Série única (atalho)… */
  data?: number[];
  /** …ou múltiplas séries com legenda. */
  series?: LineSeries[];
  /** Rótulos do eixo X, distribuídos pelos pontos (ex.: ["Ago", "Set", "Out", "Hoje"]). */
  xLabels?: string[];
  /** Rótulo de cada ponto no tooltip (padrão: rótulo X mais próximo ou índice). */
  pointLabels?: string[];
  /** Título do eixo Y (unidade — ex.: "Visitas/mês"). */
  yTitle?: string;
  /** Título do eixo X (ex.: "Últimos 90 dias"). */
  xTitle?: string;
  /** Formata valores (eixo Y e tooltip). */
  formatY?: (value: number) => string;
  /** Valor máximo do eixo. Padrão: escala `nice()` do D3. */
  max?: number;
  /** Área em gradiente sob a linha (só com 1 série). Padrão true. */
  area?: boolean;
  /** Legenda com nome + cor de cada série. Padrão: automática com 2+ séries. */
  showLegend?: boolean;
  /** Descrição acessível do gráfico. */
  label: string;
  className?: string;
}

/**
 * LineChart — gráfico de linhas completo: eixos X/Y com réguas (ticks),
 * títulos de eixo, grid, legenda multi-série e tooltip interativo.
 *
 * D3 por trás: `scaleLinear().nice()` para os ticks e `curveMonotoneX`
 * para a suavização. A linha desenha-se na entrada; o hover mostra guia
 * vertical e o valor de cada série no ponto mais próximo.
 */
export function LineChart({
  title,
  data,
  series: seriesProp,
  xLabels,
  pointLabels,
  yTitle,
  xTitle,
  formatY,
  max: maxProp,
  area: showArea = true,
  showLegend,
  label,
  className,
}: LineChartProps) {
  const gradId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const series: LineSeries[] =
    seriesProp ?? (data ? [{ name: label, data, tone: "primary" }] : []);
  const pointCount = max(series, (s) => s.data.length) ?? 0;
  const maxValue = maxProp ?? (max(series.flatMap((s) => s.data)) ?? 0);

  const xScale = scaleLinear()
    .domain([0, pointCount - 1])
    .range([PAD.left, W - PAD.right]);
  const yScale = scaleLinear().domain([0, maxValue]).nice(4).range([H - PAD.bottom, PAD.top]);

  const lineGen = line<number>()
    .x((_, i) => xScale(i))
    .y((v) => yScale(v))
    .curve(curveMonotoneX);
  const areaGen = area<number>()
    .x((_, i) => xScale(i))
    .y0(H - PAD.bottom)
    .y1((v) => yScale(v))
    .curve(curveMonotoneX);

  const yTicks = yScale.ticks(4);
  const fmt = formatY ?? ((v: number) => Math.round(v).toLocaleString("pt-BR"));
  // posição real dos rótulos X: distribuídos pelos índices dos dados
  const xTickAt = (i: number) =>
    xLabels && xLabels.length > 1 ? (i * (pointCount - 1)) / (xLabels.length - 1) : i;

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const index = Math.round(xScale.invert(px));
    setHover(Math.max(0, Math.min(pointCount - 1, index)));
  }

  const legendOn = showLegend ?? series.length > 1;
  const tipW = 116;
  const tipH = 18 + series.length * 14;
  const tipX =
    hover !== null ? Math.max(PAD.left, Math.min(W - PAD.right - tipW, xScale(hover) + 10)) : 0;

  return (
    <figure className={cn(styles.frame, className)}>
      <h3 className={styles.title}>{title}</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        className={cn(styles.chart, styles.stretch, styles.lineChart)}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.gradTop} />
            <stop offset="100%" className={styles.gradBottom} />
          </linearGradient>
        </defs>

        {/* eixo Y: linha + réguas + labels + título */}
        <line className={styles.axis} x1={PAD.left} y1={PAD.top - 6} x2={PAD.left} y2={H - PAD.bottom} />
        {yTicks.map((v) => (
          <g key={v}>
            {v > 0 && <line className={styles.grid} x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} />}
            <line className={styles.tick} x1={PAD.left - 4} y1={yScale(v)} x2={PAD.left} y2={yScale(v)} />
            <text className={styles.tickLabel} x={PAD.left - 8} y={yScale(v) + 3.5} textAnchor="end">
              {fmt(v)}
            </text>
          </g>
        ))}
        {yTitle && (
          <text className={styles.axisTitle} x={6} y={PAD.top - 10}>
            {yTitle}
          </text>
        )}

        {/* eixo X: linha + réguas + labels + título */}
        <line className={styles.axis} x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} />
        {xLabels?.map((t, i) => {
          const x = xScale(xTickAt(i));
          return (
            <g key={`${t}-${i}`}>
              <line className={styles.tick} x1={x} y1={H - PAD.bottom} x2={x} y2={H - PAD.bottom + 4} />
              <text className={styles.tickLabel} x={x} y={H - PAD.bottom + 16} textAnchor="middle">
                {t}
              </text>
            </g>
          );
        })}
        {xTitle && (
          <text className={styles.axisTitle} x={(PAD.left + W - PAD.right) / 2} y={H - 6} textAnchor="middle">
            {xTitle}
          </text>
        )}

        {/* séries */}
        {showArea && series.length === 1 && (
          <path className={styles.areaIn} d={areaGen(series[0].data) ?? ""} fill={`url(#${gradId})`} />
        )}
        {series.map((s, si) => (
          <g key={s.name}>
            <path
              className={cn(styles.line, styles[`stroke_${s.tone ?? "primary"}`], styles.drawIn)}
              style={{ animationDelay: `${si * 120}ms` }}
              pathLength={1}
              d={lineGen(s.data) ?? ""}
            />
            <circle
              className={cn(styles.endpoint, styles[`fill_${s.tone ?? "primary"}`], styles.fadeIn)}
              cx={xScale(s.data.length - 1)}
              cy={yScale(s.data[s.data.length - 1])}
              r="4.5"
            />
          </g>
        ))}

        {/* tooltip */}
        {hover !== null && (
          <g className={styles.tooltipLayer}>
            <line className={styles.guide} x1={xScale(hover)} y1={PAD.top} x2={xScale(hover)} y2={H - PAD.bottom} />
            {series.map((s) => (
              <circle
                key={s.name}
                className={cn(styles.hoverDot, styles[`fill_${s.tone ?? "primary"}`])}
                cx={xScale(hover)}
                cy={yScale(s.data[hover] ?? 0)}
                r="4.5"
              />
            ))}
            <g transform={`translate(${tipX}, ${PAD.top + 4})`}>
              <rect className={styles.tipBox} width={tipW} height={tipH} rx="7" />
              <text className={styles.tipLabel} x={10} y={14}>
                {pointLabels?.[hover] ?? xLabels?.[Math.round((hover / Math.max(1, pointCount - 1)) * ((xLabels?.length ?? 1) - 1))] ?? `Ponto ${hover + 1}`}
              </text>
              {series.map((s, si) => (
                <g key={s.name} transform={`translate(10, ${26 + si * 14})`}>
                  <circle className={styles[`fill_${s.tone ?? "primary"}`]} cx={3} cy={-3} r="3" />
                  <text className={styles.tipValue} x={11} y={0}>
                    {fmt(s.data[hover] ?? 0)}
                  </text>
                </g>
              ))}
            </g>
          </g>
        )}
      </svg>

      {legendOn && (
        <figcaption className={styles.legend}>
          {series.map((s) => (
            <span key={s.name} className={styles.legendItem}>
              <span className={cn(styles.swatch, styles[`bg_${s.tone ?? "primary"}`])} />
              {s.name}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

export interface BarChartItem {
  label: string;
  value: number;
  /** Tom da barra. Padrão `primary`. */
  tone?: ChartTone;
}

export interface BarChartProps {
  /** Título visível do gráfico. */
  title: string;
  items: BarChartItem[];
  /** Formata os valores (régua e fim da barra). */
  formatValue?: (value: number) => string;
  /** Título do eixo de valores (unidade). */
  valueTitle?: string;
  label: string;
  className?: string;
}

/**
 * BarChart — compara uma medida quantitativa entre categorias. Estados,
 * falhas e ausência de dados devem ficar fora da série. Inclui gridlines,
 * réguas com medidas embaixo (escala `nice()` do D3) e título de unidade.
 * Rótulo mono à esquerda, valor no fim da barra; entrada em stagger.
 */
export function BarChart({ title, items, formatValue = (v) => String(v), valueTitle, label, className }: BarChartProps) {
  const barX = 118;
  const axisY = H - PAD.bottom;
  const plotTop = PAD.top;
  const rowH = (axisY - plotTop) / Math.max(1, items.length);
  const barHeight = Math.min(20, Math.max(10, rowH - 10));
  const maxValue = Math.max(1, max(items, (d) => d.value) ?? 0);
  const widthScale = scaleLinear()
    .domain([0, maxValue])
    .nice(4)
    .range([0, W - barX - 24]);
  const ticks = widthScale.ticks(4);

  return (
    <figure className={cn(styles.frame, className)}>
      <h3 className={styles.title}>{title}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={cn(styles.chart, styles.stretch)}>
        {/* gridlines verticais + réguas de medida */}
        {ticks.map((t) => (
          <g key={t}>
            <line className={styles.grid} x1={barX + widthScale(t)} y1={plotTop} x2={barX + widthScale(t)} y2={axisY} />
            <line className={styles.tick} x1={barX + widthScale(t)} y1={axisY} x2={barX + widthScale(t)} y2={axisY + 4} />
            <text className={styles.tickLabel} x={barX + widthScale(t)} y={axisY + 16} textAnchor="middle">
              {formatValue(t)}
            </text>
          </g>
        ))}
        <line className={styles.axis} x1={barX} y1={plotTop} x2={barX} y2={axisY} />
        <line className={styles.axis} x1={barX} y1={axisY} x2={W - 24 + barX > W ? W - 16 : barX + widthScale(ticks[ticks.length - 1] ?? 0)} y2={axisY} />

        {items.map((item, i) => {
          const width = widthScale(item.value);
          const visibleWidth = item.value === 0 ? 4 : width;
          const y = plotTop + i * rowH + (rowH - barHeight) / 2;
          const tone = item.tone ?? "primary";
          return (
            <g key={item.label} className={styles.barRow}>
              <text className={styles.tickLabel} x={barX - 8} y={y + barHeight / 2 + 3.5} textAnchor="end">
                {item.label}
              </text>
              <rect
                className={cn(styles[`fill_${tone}`], styles.bar)}
                style={{ animationDelay: `${i * 70}ms` }}
                x={barX}
                y={y}
                width={visibleWidth}
                height={barHeight}
                rx="3"
              >
                <title>{`${item.label}: ${formatValue(item.value)}`}</title>
              </rect>
              <text
                className={cn(styles.value, styles.fadeIn)}
                style={{ animationDelay: `${i * 70 + 250}ms` }}
                x={barX + visibleWidth + 8}
                y={y + barHeight / 2 + 3.5}
              >
                {formatValue(item.value)}
              </text>
            </g>
          );
        })}

        {valueTitle && (
          <text className={styles.axisTitle} x={barX + (W - barX - 24) / 2} y={H - 6} textAnchor="middle">
            {valueTitle}
          </text>
        )}
      </svg>
    </figure>
  );
}

export interface DonutSegment {
  /** Fração do anel, na mesma unidade dos demais segmentos. */
  value: number;
  tone?: ChartTone | "muted";
  label?: string;
}

/** Props for the donut chart. */
export interface DonutChartProps {
  /** Fração preenchida, 0–100 (modo progresso)… */
  value?: number;
  /** …ou segmentos múltiplos (modo distribuição). */
  segments?: DonutSegment[];
  /** Texto central grande (padrão: o valor). */
  centerLabel?: string;
  /** Linha menor sob o texto central. */
  caption?: string;
  /** Legenda lateral com valor por segmento. Padrão: automática com `segments`. */
  showLegend?: boolean;
  /** Formata os valores da legenda. */
  formatValue?: (value: number) => string;
  /** Diâmetro em px. Padrão 220. */
  size?: number;
  label: string;
  className?: string;
}

const R_OUTER = 89;
const R_INNER = 67;

/**
 * DonutChart — anel de progresso (ou distribuição) com valor central e
 * legenda lateral (swatch + rótulo + valor por segmento).
 *
 * D3 por trás: `arc()` com cantos arredondados. No modo progresso o arco
 * varre do zero até o valor na entrada.
 */
export function DonutChart({
  value,
  segments,
  centerLabel,
  caption,
  showLegend,
  formatValue = (v) => String(v),
  size = 220,
  label,
  className,
}: DonutChartProps) {
  const filled = Math.max(0, Math.min(100, value ?? 0));
  const [sweep, setSweep] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSweep(filled));
    return () => cancelAnimationFrame(raf);
  }, [filled]);

  const arcGen = arc<{ start: number; end: number }>()
    .innerRadius(R_INNER)
    .outerRadius(R_OUTER)
    .cornerRadius(6)
    .startAngle((d) => d.start)
    .endAngle((d) => d.end);

  const TAU = 2 * Math.PI;
  const track = arcGen({ start: 0, end: TAU }) ?? "";

  let paths: Array<{ d: string; tone: string }> = [];
  if (segments) {
    const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
    let acc = 0;
    paths = segments.map((s) => {
      const start = (acc / total) * TAU;
      acc += s.value;
      const end = (acc / total) * TAU - 0.03; // gap fino entre segmentos
      return { d: arcGen({ start, end: Math.max(start, end) }) ?? "", tone: s.tone ?? "primary" };
    });
  } else {
    paths = [{ d: arcGen({ start: 0, end: (sweep / 100) * TAU }) ?? "", tone: "primary" }];
  }

  const center = centerLabel ?? (segments ? "" : `${filled}%`);
  const legendOn = showLegend ?? Boolean(segments);

  return (
    <figure className={cn(styles.frame, styles.donutFrame, className)}>
      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        role="img"
        aria-label={segments ? label : `${label}: ${filled}%`}
        className={cn(styles.chart, styles.donutSvg)}
      >
        <g transform="translate(110 110)">
          <path className={styles.donutTrackArc} d={track} />
          {paths.map((p, i) => (
            <path key={i} className={cn(styles.donutSeg, styles[`fill_${p.tone}` as keyof typeof styles])} d={p.d} />
          ))}
        </g>
        {center && (
          <text className={styles.donutValue} x="110" y="108" textAnchor="middle">
            {center}
          </text>
        )}
        {caption && (
          <text className={styles.donutCaption} x="110" y="132" textAnchor="middle">
            {caption}
          </text>
        )}
      </svg>
      {legendOn && segments && (
        <figcaption className={cn(styles.legend, styles.legendColumn)}>
          {segments.map((s, i) => (
            <span key={s.label ?? i} className={styles.legendItem}>
              <span className={cn(styles.swatch, styles[`bg_${s.tone ?? "primary"}` as keyof typeof styles])} />
              <span className={styles.legendLabel}>{s.label}</span>
              <span className={styles.legendValue}>{formatValue(s.value)}</span>
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

/** Props for the compact sparkline chart. */
export interface SparklineProps {
  data: number[];
  /** `good` (esmeralda, padrão) ou `bad` (crítico). */
  tone?: "good" | "bad";
  width?: number;
  height?: number;
  label: string;
  className?: string;
}

/** Sparkline — mini-linha de tendência (100×28), sem eixos por definição. */
export function Sparkline({ data, tone = "good", width = 100, height = 28, label, className }: SparklineProps) {
  const xScale = scaleLinear().domain([0, data.length - 1]).range([1, width - 1]);
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const yScale = scaleLinear()
    .domain([lo, hi === lo ? lo + 1 : hi])
    .range([height - 4, 4]);
  const path =
    line<number>()
      .x((_, i) => xScale(i))
      .y((v) => yScale(v))
      .curve(curveMonotoneX)(data) ?? "";

  return (
    <svg width={width} height={height} role="img" aria-label={label} className={cn(styles.chart, className)}>
      <path className={cn(styles.line, styles[tone === "bad" ? "stroke_critical" : "stroke_primary"], styles.drawIn)} pathLength={1} d={path} />
    </svg>
  );
}
