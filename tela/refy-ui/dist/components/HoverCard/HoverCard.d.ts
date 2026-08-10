import type { ReactNode } from "react";
export type HoverCardSide = "top" | "bottom";
/** Props for the HoverCard component. */
export interface HoverCardProps {
    /** Preview rico exibido ao pairar sobre o trigger. */
    content: ReactNode;
    /** Referência que dispara o card (link, mention, avatar). */
    children: ReactNode;
    /** Delay para abrir, em ms. Padrão 500. */
    openDelay?: number;
    /** Delay para fechar ao sair, em ms. Padrão 200. */
    closeDelay?: number;
    side?: HoverCardSide;
    className?: string;
}
/**
 * HoverCard — preview rico ao passar o mouse sobre uma referência.
 *
 * Abre com delay (padrão 500ms) e fecha com tolerância de 200ms, então dá
 * para mover o cursor até o card sem ele sumir. Também abre no foco por
 * teclado. Card de 280px, elevação 3. Não é interativo-modal: para conteúdo
 * clicável complexo, use `Popover`.
 *
 *   <HoverCard content={<PerfilDominio />}> <a href="…">rdstation.com</a> </HoverCard>
 */
export declare function HoverCard({ content, children, openDelay, closeDelay, side, className, }: HoverCardProps): import("react").JSX.Element;
