export type ChartTone = "primary" | "info" | "warn" | "critical";
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
export declare function LineChart({ title, data, series: seriesProp, xLabels, pointLabels, yTitle, xTitle, formatY, max: maxProp, area: showArea, showLegend, label, className, }: LineChartProps): import("react").JSX.Element;
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
export declare function BarChart({ title, items, formatValue, valueTitle, label, className }: BarChartProps): import("react").JSX.Element;
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
/**
 * DonutChart — anel de progresso (ou distribuição) com valor central e
 * legenda lateral (swatch + rótulo + valor por segmento).
 *
 * D3 por trás: `arc()` com cantos arredondados. No modo progresso o arco
 * varre do zero até o valor na entrada.
 */
export declare function DonutChart({ value, segments, centerLabel, caption, showLegend, formatValue, size, label, className, }: DonutChartProps): import("react").JSX.Element;
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
export declare function Sparkline({ data, tone, width, height, label, className }: SparklineProps): import("react").JSX.Element;
