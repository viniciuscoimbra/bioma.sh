import type { ReactNode } from "react";
export interface KanbanCardItem {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    meta?: ReactNode;
    leading?: ReactNode;
    footer?: ReactNode;
}
export interface KanbanColumnItem {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    items: KanbanCardItem[];
}
export interface KanbanBoardProps {
    columns: KanbanColumnItem[];
    ariaLabel?: string;
    className?: string;
}
/** Quadro horizontal para acompanhar itens entre etapas explícitas de um fluxo. */
export declare function KanbanBoard({ columns, ariaLabel, className }: KanbanBoardProps): import("react").JSX.Element;
