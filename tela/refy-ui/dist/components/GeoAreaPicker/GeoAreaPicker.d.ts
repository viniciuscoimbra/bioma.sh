import type { ReactNode } from "react";
export interface GeoNeighborhood {
    id: string;
    label: string;
    /** Distância em km a partir do bairro principal. */
    distance: number;
}
export interface GeoAreaPickerProps {
    neighborhoods: GeoNeighborhood[];
    baseId: string;
    radius?: number;
    defaultRadius?: number;
    minRadius?: number;
    maxRadius?: number;
    radiusStep?: number;
    onRadiusChange?: (radius: number) => void;
    includedIds?: string[];
    defaultIncludedIds?: string[];
    onIncludedIdsChange?: (ids: string[]) => void;
    /** Slot do provedor de mapa. A seleção textual continua sendo do DS. */
    map?: ReactNode;
    mapLabel?: string;
    error?: string;
    className?: string;
}
/**
 * Seleção geográfica com contrato textual completo. O mapa é um slot visual;
 * raio, bairros alcançados e inclusão explícita permanecem no design system.
 */
export declare function GeoAreaPicker({ neighborhoods, baseId, radius, defaultRadius, minRadius, maxRadius, radiusStep, onRadiusChange, includedIds, defaultIncludedIds, onIncludedIdsChange, map, mapLabel, error, className, }: GeoAreaPickerProps): import("react").JSX.Element;
