import type { ReactNode } from "react";
export interface AccordionItem {
    id: string;
    title: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}
/** Props for the Accordion component. */
export interface AccordionProps {
    items: AccordionItem[];
    /** single = só um aberto por vez; multiple = vários. */
    type?: "single" | "multiple";
    /** IDs abertos (controlado). */
    value?: string[];
    defaultValue?: string[];
    onChange?: (open: string[]) => void;
    className?: string;
}
/**
 * Accordion — seções expansíveis funcionais. Abre/fecha de verdade, com
 * altura animada. `single` (padrão) mantém um aberto; `multiple` permite vários.
 */
export declare function Accordion({ items, type, value, defaultValue, onChange, className, }: AccordionProps): import("react").JSX.Element;
