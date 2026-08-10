import type { RefObject } from "react";
/** Mantém foco e Escape dentro de overlays modais e restaura o gatilho ao fechar. */
export declare function useDialogFocusTrap(open: boolean, containerRef: RefObject<HTMLElement | null>, onClose: () => void): void;
