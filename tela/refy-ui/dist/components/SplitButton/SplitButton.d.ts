import type { ReactNode } from "react";
export interface SplitButtonOption {
    id?: string;
    label: string;
    /** Sufixo mono à direita (ex.: extensão .csv). */
    hint?: string;
    disabled?: boolean;
    danger?: boolean;
    onSelect?: () => void;
}
export type SplitButtonVariant = "primary" | "secondary";
export interface SplitButtonProps {
    label: string;
    variant?: SplitButtonVariant;
    menuAlign?: "start" | "end";
    leadingIcon?: ReactNode;
    onClick?: () => void;
    onSelect?: (id: string) => void;
    options: SplitButtonOption[];
    size?: "sm" | "md";
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Opção executada inicialmente pelo botão principal. Padrão: primeira habilitada. */
    defaultOptionId?: string;
    className?: string;
}
/** SplitButton — a opção escolhida vira a ação principal visível. Composto sobre Button + Menu. */
export declare function SplitButton({ label, variant, menuAlign, leadingIcon, onClick, onSelect, options, size, disabled, loading, loadingLabel, open, defaultOpen, onOpenChange, defaultOptionId, className, }: SplitButtonProps): import("react").JSX.Element;
