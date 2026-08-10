import type { ReactNode } from "react";
export type DrawerSide = "left" | "right" | "bottom";
/** Props for the Drawer and bottom sheet component. */
export interface DrawerProps {
    /** Painel visível (controlado — overlay não tem estado interno). */
    open: boolean;
    /** Pedido de fechamento: Esc, scrim ou botão ×. */
    onOpenChange: (open: boolean) => void;
    /** `left`/`right` = drawer lateral (320px); `bottom` = sheet com alça. */
    side?: DrawerSide;
    /** Título no cabeçalho. */
    title?: ReactNode;
    /** Rodapé fixo (ações). */
    footer?: ReactNode;
    /** Largura do drawer lateral. Ignorada no bottom sheet. */
    width?: number | string;
    children: ReactNode;
    /** Esconde o botão × do cabeçalho. */
    hideClose?: boolean;
    className?: string;
}
/**
 * Drawer — painel lateral deslizante; `side="bottom"` vira um sheet.
 *
 * Scrim atrás (clique fecha), Esc fecha, botão × no cabeçalho. Estrutura
 * head/body/foot com o body rolável. `role="dialog"` + `aria-modal`.
 * Controlado por `open`/`onOpenChange` — sem estado global.
 *
 *   <Drawer open={open} onOpenChange={setOpen} side="right" title="Detalhes">…</Drawer>
 */
export declare function Drawer({ open, onOpenChange, side, title, footer, width, children, hideClose, className, }: DrawerProps): import("react").JSX.Element | null;
