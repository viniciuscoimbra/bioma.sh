export interface WizardStep {
    id: string;
    label: string;
    /** Impede retorno/navegação direta para esta etapa. */
    disabled?: boolean;
}
export interface WizardStepperProps {
    steps: WizardStep[];
    /** ID da etapa atual. */
    current: string;
    /** Título da jornada, anunciado junto do progresso. */
    label?: string;
    /** `auto` fica compacto por container query; as outras opções forçam o layout. */
    variant?: "auto" | "horizontal" | "compact";
    /** Por padrão só etapas concluídas e a atual podem ser abertas. */
    allowFutureNavigation?: boolean;
    onStepChange?: (id: string) => void;
    /** Ação de retorno; usa o IconButton canônico. */
    onBack?: () => void;
    backLabel?: string;
    className?: string;
}
/**
 * Progresso navegável de wizard. Compõe ProgressBar e IconButton, deriva os
 * estados concluído/atual/futuro e mantém etapas futuras bloqueadas por padrão.
 */
export declare function WizardStepper({ steps, current, label, variant, allowFutureNavigation, onStepChange, onBack, backLabel, className, }: WizardStepperProps): import("react").JSX.Element;
