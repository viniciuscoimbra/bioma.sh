import type { ReactNode } from "react";
/** Props for the Modal dialog. */
export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    /** Nome acessível quando não há título visível. */
    ariaLabel?: string;
    /** Ações do rodapé (botões). Sem rodapé se ausente. */
    footer?: ReactNode;
    /** Largura máxima em px. Default 520. */
    width?: number;
    children: ReactNode;
    className?: string;
}
/** Modal centralizado com scrim, fecha no Esc / clique fora / botão ✕. */
export declare function Modal({ open, onClose, title, ariaLabel, footer, width, children, className }: ModalProps): import("react").JSX.Element | null;
