import type { HTMLAttributes } from "react";
/** Props for the keyboard shortcut token. */
export interface KbdProps extends HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}
/**
 * Kbd — tecla/atalho de teclado ("⌘K", "esc").
 *
 * Mono, borda inferior de 2px simulando a tecla. Átomo usado por
 * Command, Menu e Topbar — sempre componha em vez de recriar o estilo.
 *
 *   <Kbd>⌘K</Kbd>
 */
export declare function Kbd({ className, children, ...rest }: KbdProps): import("react").JSX.Element;
