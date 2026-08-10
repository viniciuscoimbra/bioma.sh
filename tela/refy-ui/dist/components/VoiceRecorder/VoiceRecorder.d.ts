export type VoiceRecorderState = "idle" | "listening" | "paused" | "error" | "fallback";
export interface VoiceRecorderProps {
    state?: VoiceRecorderState;
    /** Duração atual em segundos. */
    duration?: number;
    /** Nível de entrada entre 0–100. */
    level?: number;
    /** Prévia editável pelo consumidor após a conclusão. */
    transcript?: string;
    errorMessage?: string;
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onCancel?: () => void;
    onFinish?: () => void;
    onRetry?: () => void;
    onUseFallback?: () => void;
    className?: string;
}
/**
 * Captura de voz visual e controlada. A integração com Web Speech/MediaRecorder
 * pertence ao app; esta molécula resolve estados, controles e fallback.
 */
export declare function VoiceRecorder({ state, duration, level, errorMessage, onStart, onPause, onResume, onCancel, onFinish, onRetry, onUseFallback, className, }: VoiceRecorderProps): import("react").JSX.Element;
