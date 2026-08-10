import type { HTMLAttributes, ReactNode } from "react";
export type StatusDotTone = "good" | "ok" | "warn" | "critical" | "info" | "neutral";
/** Props for the StatusDot indicator. */
export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
    /** Tom semântico do estado. Default `good` (verde). */
    tone?: StatusDotTone;
    /** Pulso "ao vivo" (halo animado). Desligado sob `prefers-reduced-motion`. */
    pulse?: boolean;
    /** Rótulo mono uppercase à direita do dot (ex.: "Conectado · primário"). */
    children?: ReactNode;
}
/**
 * StatusDot — dot de estado 6px com halo, rótulo mono uppercase opcional e
 * variante `pulse` ("ao vivo"). Sem rótulo visível, passe `aria-label`;
 * é indicador estático, não é botão.
 */
export declare function StatusDot({ tone, pulse, className, children, ...rest }: StatusDotProps): import("react").JSX.Element;
