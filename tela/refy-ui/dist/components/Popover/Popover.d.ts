import type { ReactNode } from "react";
export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";
/** Props for the Popover component. */
export interface PopoverProps {
    /** Popover visível (controlado — overlay não tem estado interno). */
    open: boolean;
    /** Pedido de fechamento: Esc ou clique fora. */
    onOpenChange: (open: boolean) => void;
    /** Conteúdo flutuante interativo (form curto, filtros…). */
    content: ReactNode;
    /** Elemento âncora (trigger). */
    children: ReactNode;
    side?: PopoverSide;
    align?: PopoverAlign;
    /** Rótulo acessível do diálogo flutuante. */
    label?: string;
    className?: string;
}
/**
 * Popover — conteúdo flutuante interativo ancorado a um trigger.
 *
 * Diferente do Tooltip, aceita interação (checkboxes, botões, inputs).
 * Fecha com Esc ou clique fora. Controlado por `open`/`onOpenChange`,
 * posicionado por `side` + `align`. Min-width 220px, elevação 3.
 *
 *   <Popover open={open} onOpenChange={setOpen} content={<Filtros />}>
 *     <Button onClick={() => setOpen(!open)}>Filtrar</Button>
 *   </Popover>
 */
export declare function Popover({ open, onOpenChange, content, children, side, align, label, className, }: PopoverProps): import("react").JSX.Element;
