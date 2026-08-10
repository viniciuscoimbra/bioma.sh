import type { CSSProperties, HTMLAttributes } from "react";
export interface PropertyMediaItem {
    src: string;
    alt: string;
}
export interface PropertyMediaProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    items: PropertyMediaItem[];
    index?: number;
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    aspectRatio?: CSSProperties["aspectRatio"];
    fit?: "cover" | "contain";
    loading?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
}
/** Galeria de imóvel responsiva. Navegação e feedback não dependem da proporção da foto. */
export declare function PropertyMedia({ items, index, defaultIndex, onIndexChange, aspectRatio, fit, loading, errorMessage, onRetry, className, onKeyDown, ...rest }: PropertyMediaProps): import("react").JSX.Element;
