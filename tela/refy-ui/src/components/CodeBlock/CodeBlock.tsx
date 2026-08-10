import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "../IconButton";
import styles from "./CodeBlock.module.css";

/** Props for the CodeBlock component. */
export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onCopy"> {
  /** Conteúdo real do bloco — é o que o botão copiar coloca no clipboard. */
  code: string;
  /** Renderização custom (ex.: highlight). Ignorada enquanto `secret` está mascarado. */
  children?: ReactNode;
  /** Rótulo do bloco. Ex.: "API key de produção". */
  label?: ReactNode;
  /** Linguagem/formato, em mono. Ex.: "bash". */
  language?: string;
  /** Mascara o conteúdo (chaves de API) com toggle de revelar. Copiar copia o valor real. */
  secret?: boolean;
  /** Nº de caracteres finais visíveis no modo `secret`. */
  visibleChars?: number;
  /** aria-label do botão copiar. */
  copyLabel?: string;
  /** Feedback visível/anunciado após copiar. */
  copiedLabel?: string;
  /** aria-label do toggle quando mascarado. */
  revealLabel?: string;
  /** aria-label do toggle quando revelado. */
  hideLabel?: string;
  /** Chamado após copiar com sucesso. */
  onCopy?: (code: string) => void;
}

const copyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7" />
  </svg>
);
const eyeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const eyeOffIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

function maskSecret(code: string, visibleChars: number): string {
  const bullets = "•".repeat(16);
  if (visibleChars <= 0 || code.length <= visibleChars) return bullets;
  return bullets + code.slice(-visibleChars);
}

/** Copia via Clipboard API com fallback de textarea (contextos sem `navigator.clipboard`). */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* cai no fallback */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

/**
 * Bloco de código copiável, monoespaçado, com scroll horizontal próprio.
 * `secret` mascara o conteúdo (chaves de API) com toggle revelar — copiar
 * sempre copia o valor real. Feedback "Copiado" visível e anunciado
 * (`role="status"` + aria-live).
 */
export function CodeBlock({
  code,
  children,
  label,
  language,
  secret = false,
  visibleChars = 4,
  copyLabel = "Copiar código",
  copiedLabel = "Copiado",
  revealLabel = "Revelar valor",
  hideLabel = "Ocultar valor",
  onCopy,
  className,
  ...rest
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    await copyText(code);
    onCopy?.(code);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const masked = secret && !revealed;
  const display: ReactNode = masked ? maskSecret(code, visibleChars) : children ?? code;
  const hasHead = label != null || language != null || secret;

  const actions = (
    <div className={styles.actions}>
      <span className={styles.copied} role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
      {secret && (
        <IconButton
          className={styles.action}
          size="sm"
          icon={revealed ? eyeOffIcon : eyeIcon}
          aria-label={revealed ? hideLabel : revealLabel}
          aria-pressed={revealed}
          onClick={() => setRevealed((r) => !r)}
        />
      )}
      <IconButton
        className={cn(styles.action, copied && styles.actionCopied)}
        size="sm"
        icon={copied ? checkIcon : copyIcon}
        aria-label={copyLabel}
        onClick={handleCopy}
      />
    </div>
  );

  return (
    <div className={cn(styles.block, className)} {...rest}>
      {hasHead && (
        <div className={styles.head}>
          <span className={styles.headInfo}>
            {label && <span className={styles.label}>{label}</span>}
            {language && <span className={styles.language}>{language}</span>}
          </span>
          {actions}
        </div>
      )}
      <div className={styles.body}>
        <pre
          className={styles.pre}
          tabIndex={0}
          aria-label={typeof label === "string" ? label : language}
        >
          <code className={styles.code}>{display}</code>
        </pre>
        {!hasHead && <div className={styles.overlay}>{actions}</div>}
      </div>
    </div>
  );
}
