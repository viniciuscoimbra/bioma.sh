import type { ReactNode } from "react";
import type { PopoverAlign, PopoverSide } from "../Popover";
export interface GuidedTourAction {
    label: string;
    onAction: () => void;
    /** Avança depois de executar a ação. */
    advance?: boolean;
}
export interface GuidedTourStep {
    id: string;
    title: string;
    description: ReactNode;
    side?: PopoverSide;
    align?: PopoverAlign;
    action?: GuidedTourAction;
}
export interface GuidedTourProps {
    steps: GuidedTourStep[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    currentStep?: string;
    defaultStep?: string;
    onStepChange?: (id: string) => void;
    onComplete?: () => void;
    children: ReactNode;
}
export interface GuidedTourAnchorProps {
    stepId: string;
    children: ReactNode;
    /** Use block para controles que ocupam toda a largura. */
    block?: boolean;
    className?: string;
}
/** Estado e navegação de um tour; use GuidedTourAnchor nos elementos reais. */
export declare function GuidedTour({ steps, open, defaultOpen, onOpenChange, currentStep, defaultStep, onStepChange, onComplete, children, }: GuidedTourProps): import("react").JSX.Element;
/** Âncora um passo do tour ao controle real que está sendo explicado. */
export declare function GuidedTourAnchor({ stepId, children, block, className }: GuidedTourAnchorProps): import("react").JSX.Element;
