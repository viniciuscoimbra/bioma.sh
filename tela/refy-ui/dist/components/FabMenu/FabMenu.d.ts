import type { ReactNode } from "react";
export interface FabMenuAction {
    id: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    danger?: boolean;
    onSelect?: () => void;
}
export interface FabMenuProps {
    /** Entre três e cinco ações curtas é o uso recomendado. */
    actions: FabMenuAction[];
    /** Nome acessível do gatilho fechado. */
    label?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSelect?: (id: string) => void;
    align?: "start" | "end";
    className?: string;
}
/**
 * FabMenu — ação flutuante que revela um Menu canônico acima do gatilho.
 * Menu continua dono dos itens, teclado, foco ativo, Escape e clique externo.
 */
export declare function FabMenu({ actions, label, open, defaultOpen, onOpenChange, onSelect, align, className, }: FabMenuProps): import("react").JSX.Element;
