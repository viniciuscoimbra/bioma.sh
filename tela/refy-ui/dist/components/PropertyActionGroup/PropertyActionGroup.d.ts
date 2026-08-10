import type { HTMLAttributes, ReactNode } from "react";
export type PropertyAction = "reject" | "save" | "visit";
export type PropertyActionGroupState = "idle" | "processing" | "completed" | "unavailable";
export interface PropertyActionGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    state?: PropertyActionGroupState;
    activeAction?: PropertyAction;
    onAction?: (action: PropertyAction) => void;
    orientation?: "auto" | "horizontal" | "vertical";
    disabledActions?: PropertyAction[];
    statusMessage?: ReactNode;
}
/** Ações principais do imóvel. Cada ação inicia um fluxo próprio no consumidor. */
export declare function PropertyActionGroup({ state, activeAction, onAction, orientation, disabledActions, statusMessage, className, ...rest }: PropertyActionGroupProps): import("react").JSX.Element;
