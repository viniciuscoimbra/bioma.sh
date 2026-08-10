import type { ReactNode } from "react";
export interface TabItem {
    id: string;
    label: string;
    badge?: string | number;
    /** Estado da parte representada pela aba. */
    status?: "complete" | "warning";
    content?: ReactNode;
    disabled?: boolean;
}
/** Props for the Tabs component. */
export interface TabsProps {
    items: TabItem[];
    /** Aba ativa controlada. */
    value?: string;
    defaultValue?: string;
    onChange?: (id: string) => void;
    /** underline (padrão) ou pill. */
    variant?: "underline" | "pill";
    orientation?: "horizontal" | "vertical";
    className?: string;
}
/** Abas com indicador. Renderiza o conteúdo da aba ativa se `content` for fornecido. */
export declare function Tabs({ items, value, defaultValue, onChange, variant, orientation, className, }: TabsProps): import("react").JSX.Element;
