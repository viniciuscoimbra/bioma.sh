import type { ReactNode } from "react";
/** Um item plotado na matriz. `x`/`y` em % (0–100). */
export interface MatrixPoint {
    id: string;
    /** Descrição no tooltip (title). */
    label: string;
    /** Posição no eixo X (esforço), 0–100. */
    x: number;
    /** Posição no eixo Y (impacto), 0–100. */
    y: number;
    /** Destaque de item priorizado (anel). */
    prioritized?: boolean;
}
export interface Matrix2x2Props {
    /** Pontos em ordem de prioridade — a cor vai de crítico (1º) a info (último). */
    points: MatrixPoint[];
    xLabel?: string;
    yLabel?: string;
    /** Rótulos dos quadrantes. */
    quadrants?: {
        topLeft?: ReactNode;
        topRight?: ReactNode;
        bottomLeft?: ReactNode;
        bottomRight?: ReactNode;
    };
    /** Legenda da régua de prioridade (ex.: ["Prioridade alta", "baixa"]). */
    legend?: [string, string];
    /** Ponto selecionado (controlado). `null` = nenhum. */
    selectedId?: string | null;
    /** Seleção inicial (não-controlado). */
    defaultSelectedId?: string | null;
    /** Disparado ao clicar num ponto (ou `null` ao desmarcar). */
    onPointClick?: (point: MatrixPoint | null) => void;
    className?: string;
}
/**
 * Matrix2x2 — matriz impacto × esforço com pontos numerados por prioridade.
 *
 * Canvas com mira central e grade pontilhada; pontos posicionados por
 * `x`/`y` (0–100) e coloridos numa régua contínua de `--critical` (1º) a
 * `--info` (último) via `color-mix`. Quadrantes e eixos rotulados, legenda
 * com a régua de cor. Clicar num ponto o seleciona (anel + escala; clicar de
 * novo desmarca) — controlado via `selectedId` ou não-controlado.
 *
 *   <Matrix2x2 points={issues} xLabel="Esforço →" yLabel="Impacto →" />
 */
export declare function Matrix2x2({ points, xLabel, yLabel, quadrants, legend, selectedId, defaultSelectedId, onPointClick, className, }: Matrix2x2Props): import("react").JSX.Element;
