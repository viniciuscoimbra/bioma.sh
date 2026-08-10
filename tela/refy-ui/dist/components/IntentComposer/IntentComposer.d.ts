import type { VoiceRecorderProps } from "../VoiceRecorder";
export type IntentComposerState = "idle" | "listening" | "processing" | "understood" | "error";
export interface IntentFilterOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface IntentFilterGroup {
    id: string;
    label: string;
    mode: "single" | "multiple";
    options: IntentFilterOption[];
}
export interface IntentComposerProps {
    state?: IntentComposerState;
    filters?: IntentFilterGroup[];
    filterValues?: Record<string, string[]>;
    defaultFilterValues?: Record<string, string[]>;
    onFilterValuesChange?: (values: Record<string, string[]>) => void;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    label?: string;
    placeholder?: string;
    examples?: string[];
    submitLabel?: string;
    understoodSummary?: string;
    errorMessage?: string;
    onSubmit?: () => void;
    onVoiceStart?: () => void;
    onEditRequest?: () => void;
    onEditDetails?: () => void;
    voiceRecorderProps?: VoiceRecorderProps;
    className?: string;
}
/**
 * Composer de intenção. Filtros ficam acima; exemplos e ações pertencem ao
 * rodapé interno; voz usa VoiceRecorder; não inclui anexos no v1.
 */
export declare function IntentComposer({ state, filters, filterValues, defaultFilterValues, onFilterValuesChange, value, defaultValue, onChange, label, placeholder, examples, submitLabel, understoodSummary, errorMessage, onSubmit, onVoiceStart, onEditRequest, onEditDetails, voiceRecorderProps, className, }: IntentComposerProps): import("react").JSX.Element;
