import type { PropertyAction } from "../PropertyActionGroup";
import type { PropertyCardProps } from "../PropertyCard";
export interface SwipeDeckItem extends PropertyCardProps {
    id: string;
}
export interface SwipeDeckProps {
    items: SwipeDeckItem[];
    index?: number;
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    onAction?: (action: PropertyAction, item: SwipeDeckItem) => void;
    onReset?: () => void;
    gestureEnabled?: boolean;
    motion?: "auto" | "reduced";
    className?: string;
}
/** Fila Tinder-like: botões são o caminho principal; gesto e teclado são atalhos equivalentes. */
export declare function SwipeDeck({ items, index, defaultIndex, onIndexChange, onAction, onReset, gestureEnabled, motion, className, }: SwipeDeckProps): import("react").JSX.Element;
