import type { HTMLAttributes, ReactNode } from "react";
export type ApprovalWorkbenchItemState = "not-started" | "in-progress" | "attention" | "complete";
export interface ApprovalWorkbenchItem {
    id: string;
    label: string;
    meta?: string;
    state: ApprovalWorkbenchItemState;
}
export interface ApprovalWorkbenchProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> {
    /** Nome acessível e título da lista de trabalho. */
    label?: string;
    /** Itens avaliados nesta análise. */
    items: ApprovalWorkbenchItem[];
    /** Item exibido no painel. */
    activeId: string;
    /** Seleciona outro item sem mudar de página. */
    onActiveChange: (id: string) => void;
    /** Editor do item ativo. */
    children: ReactNode;
}
/**
 * ApprovalWorkbench organiza uma análise manual em dois planos: a fila de
 * itens e o editor do item selecionado. Resultados, solicitações e decisões
 * continuam sob responsabilidade da página que compõe o organismo.
 */
export declare function ApprovalWorkbench({ label, items, activeId, onActiveChange, children, className, ...rest }: ApprovalWorkbenchProps): import("react").JSX.Element;
