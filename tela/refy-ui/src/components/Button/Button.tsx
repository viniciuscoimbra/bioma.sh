import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";
export type ButtonStatus = "idle" | "loading" | "success" | "error";
export type ButtonProgressEffect =
  | "spinner" | "fill-horizontal" | "fill-vertical" | "shrink-horizontal" | "shrink-vertical"
  | "rotate-angle-bottom" | "rotate-angle-top" | "rotate-angle-left" | "rotate-angle-right"
  | "rotate-side-down" | "rotate-side-up" | "rotate-side-left" | "rotate-side-right"
  | "rotate-back" | "flip-open" | "slide-down" | "move-up" | "top-line" | "lateral-lines";

/** Props for the base Refy button. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Hierarquia visual. Primário = cor sólida da marca + texto branco. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ícone à esquerda do label (16px recomendado). */
  leadingIcon?: ReactNode;
  /** Ícone à direita do label. */
  trailingIcon?: ReactNode;
  /** Mostra spinner e bloqueia cliques. */
  loading?: boolean;
  /** Estado explícito para apresentar conclusão ou erro; `loading` continua compatível. */
  status?: ButtonStatus;
  /** Efeito visual usado durante loading. */
  progressEffect?: ButtonProgressEffect;
  /** Label acessível/visível durante processamento. */
  loadingLabel?: ReactNode;
  /** Ocupa 100% da largura do container. */
  block?: boolean;
}

/**
 * Botão base do Refy. Texto de ação curto, em português, sem hype.
 * O primário usa a cor sólida da marca com texto branco, preservando contraste em todos os temas.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    status = "idle",
    progressEffect = "spinner",
    loadingLabel,
    block = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref
) {
  const currentStatus: ButtonStatus = loading ? "loading" : status;
  const isLoading = currentStatus === "loading";
  const hasFeedback = currentStatus === "success" || currentStatus === "error";

  return (
    <button
      ref={ref}
      className={cn(
        styles.btn,
        styles[variant],
        styles[size],
        block && styles.block,
        styles[currentStatus],
        isLoading && styles[`effect-${progressEffect}`],
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      data-status={currentStatus}
      {...rest}
    >
      {isLoading && progressEffect !== "spinner" && <><span className={styles.progress} aria-hidden="true" /><span className={styles.progressAlt} aria-hidden="true" /></>}
      {isLoading && progressEffect === "spinner" && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && !hasFeedback && leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      {hasFeedback && <span className={styles.feedbackIcon} aria-hidden="true">{currentStatus === "success" ? "✓" : "×"}</span>}
      {children && <span className={styles.label}>{isLoading ? (loadingLabel ?? children) : children}</span>}
      {!isLoading && !hasFeedback && trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
    </button>
  );
});
