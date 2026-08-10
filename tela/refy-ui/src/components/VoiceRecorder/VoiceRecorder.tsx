import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import styles from "./VoiceRecorder.module.css";

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

const micIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
  </svg>
);

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`;
}

/**
 * Captura de voz visual e controlada. A integração com Web Speech/MediaRecorder
 * pertence ao app; esta molécula resolve estados, controles e fallback.
 */
export function VoiceRecorder({
  state = "idle",
  duration = 0,
  level = 0,
  errorMessage = "Revise a permissão do navegador ou continue pelo teclado.",
  onStart,
  onPause,
  onResume,
  onCancel,
  onFinish,
  onRetry,
  onUseFallback,
  className,
}: VoiceRecorderProps) {
  const normalizedLevel = Math.max(0, Math.min(100, level));

  if (state === "error") {
    return (
      <Callout
        className={className}
        tone="danger"
        role="alert"
        icon={micIcon}
        title="Não conseguimos acessar o microfone"
        action={
          <div className={styles.errorActions}>
            <Button size="sm" variant="primary" onClick={onRetry}>Tentar novamente</Button>
            <Button size="sm" variant="secondary" onClick={onUseFallback}>Usar ditado</Button>
          </div>
        }
      >
        {errorMessage}
      </Callout>
    );
  }

  if (state === "fallback") {
    return (
      <Callout
        className={className}
        tone="note"
        icon={micIcon}
        title="Use o ditado do seu celular"
        action={<Button size="sm" variant="secondary" onClick={onUseFallback}>Entendi</Button>}
      >
        Toque no microfone do teclado. O texto aparece no campo e continua editável antes de enviar.
      </Callout>
    );
  }

  if (state === "idle") {
    return (
      <div className={cn(styles.idle, className)}>
        <IconButton aria-label="Começar gravação de voz" variant="solid" size="lg" icon={micIcon} onClick={onStart} />
        <div className={styles.idleCopy}>
          <strong>Prefere falar?</strong>
          <span>Conte do seu jeito. Você revisa o texto antes de continuar.</span>
        </div>
      </div>
    );
  }

  const listening = state === "listening";
  return (
    <section className={cn(styles.panel, !listening && styles.isPaused, className)} aria-label="Gravação de voz">
      <div className={styles.header}>
        <span className={styles.mic} aria-hidden="true">{micIcon}</span>
        <div className={styles.statusCopy}>
          <strong>{listening ? "Escutando você" : "Gravação pausada"}</strong>
          <span>{listening ? "Fale normalmente. O texto aparece enquanto você fala." : "Retome quando estiver pronto."}</span>
        </div>
        <time className={styles.time} dateTime={`PT${Math.floor(duration)}S`}>{formatDuration(duration)}</time>
      </div>

      <div className={styles.meter} style={{ "--voice-level": normalizedLevel } as CSSProperties}>
        <div className={styles.wave} aria-hidden="true">
          {[0.55, 0.85, 1, 0.72, 0.42, 0.7, 0.92, 0.6].map((factor, index) => (
            <i key={index} style={{ "--bar-factor": factor } as CSSProperties} />
          ))}
        </div>
        <ProgressBar
          value={listening ? normalizedLevel : 0}
          size="sm"
          aria-label={listening ? `Nível do microfone: ${Math.round(normalizedLevel)}%` : "Microfone pausado"}
        />
      </div>

      <div className={styles.footer}>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <IconButton
          aria-label={listening ? "Pausar gravação" : "Retomar gravação"}
          variant="outline"
          icon={listening ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>
          )}
          onClick={listening ? onPause : onResume}
        />
        <Button size="sm" variant="primary" onClick={onFinish}>Concluir</Button>
      </div>
    </section>
  );
}
