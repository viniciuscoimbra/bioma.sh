import type { ReactNode } from "react";
/** Props for the Snackbar notification. */
export interface SnackbarProps {
    /** Mensagem de uma linha. */
    children: ReactNode;
    /** Ação inline (ex.: "Desfazer", "Ver"). */
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}
/**
 * Snackbar — toast minimalista de uma linha com ação inline.
 *
 * Use para confirmar ações reversíveis ("Issue movida · Desfazer").
 * É um elemento de apresentação: posicione-o você mesmo (ou dentro de
 * `ToastRegion` via `Toast` para pilha com auto-dismiss).
 *
 *   <Snackbar action={{ label: "Desfazer", onClick: undo }}>Issue movida para Backlog</Snackbar>
 */
export declare function Snackbar({ children, action, className }: SnackbarProps): import("react").JSX.Element;
