import type { ReactNode } from "react";
export interface TooltipProps {
    /** Rótulo curto e não interativo. */
    label: string;
    /** Segunda linha opcional, somente texto. */
    description?: string;
    /** Atalho opcional, renderizado com Kbd. */
    shortcut?: string;
    side?: "top" | "bottom" | "left" | "right";
    /** Atraso de abertura por hover/foco. */
    delayMs?: number;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Renderiza a bolha no body para escapar de containers com overflow. */
    portalled?: boolean;
    children: ReactNode;
    className?: string;
}
/** Tooltip textual acessível. Conteúdo interativo não faz parte desta API. */
export declare function Tooltip({ label, description, shortcut, side, delayMs, open, defaultOpen, onOpenChange, portalled, children, className, }: TooltipProps): import("react").JSX.Element;
