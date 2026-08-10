import { useId, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./BrandLogo.module.css";
import { DOMUZ_LOCKUP, DOMUZ_SOLID_GESTALT_PATH, DOMUZ_SOLID_LOCKUP, DOMUZ_SOLID_MARK, DOMUZ_SYMBOL, DOMUZ_WORDMARK } from "./domuzLogo.generated";

export type BrandLogoBrand = "refy" | "domuz" | "dommus";
export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";
export type BrandLogoMode = "line" | "solid";
export type BrandLogoVariant = "default" | "theme" | "black" | "white" | "mono" | "inverse" | "orange" | "pride" | "trans" | "copa";

export interface BrandLogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Marca exibida; `dommus` fica como alias legado de `domuz`. */
  brand?: BrandLogoBrand;
  /** Escala proporcional do wordmark, símbolo e ponto vivo da Refy. */
  size?: BrandLogoSize;
  /** Usa tinta clara para fundos de marca ou superfícies escuras. */
  tone?: "default" | "inverse";
  /** Anatomia da assinatura Domuz: linha ou sólido/gestalt. */
  mode?: BrandLogoMode;
  /** Variação vetorial da assinatura Domuz. */
  variant?: BrandLogoVariant;
  /** Desliga apenas o pulso; `prefers-reduced-motion` sempre prevalece. */
  animated?: boolean;
  /** Símbolo para rail/ícone; preserva o nome acessível completo. */
  markOnly?: boolean;
}

/** Lockup canônico: cada marca preserva sua própria tipografia e anatomia. */
export function BrandLogo({
  brand = "refy",
  size = "sm",
  tone = "default",
  mode = "solid",
  variant,
  animated = true,
  markOnly = false,
  className,
  ...rest
}: BrandLogoProps) {
  const isDomuz = brand === "domuz" || brand === "dommus";
  const label = isDomuz ? "Domuz.app" : "refy.";
  const gradientId = useId().replace(/:/g, "");
  const domuzVariant = normalizeVariant(variant ?? (tone === "inverse" ? "white" : "theme"));
  const gradientFill = isSeasonal(domuzVariant) ? `url(#domuz-${gradientId})` : undefined;
  const solidGradientFill = domuzVariant === "theme" || isSeasonal(domuzVariant) ? `url(#domuz-${gradientId})` : undefined;
  const symbolFill = gradientFill ?? logoFill(domuzVariant, "symbol");
  const wordmarkFill = gradientFill ?? logoFill(domuzVariant, "wordmark");
  const solidSymbolFill = solidGradientFill ?? solidFill(domuzVariant, "symbol");
  const solidWordmarkFill = solidGradientFill ?? solidFill(domuzVariant, "wordmark");

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(styles.logo, isDomuz ? styles.domuz : styles.refy, styles[size], styles[tone], markOnly && styles.markOnly, !animated && styles.static, className)}
      {...rest}
    >
      {isDomuz && markOnly && mode === "line" && (
        <svg aria-hidden="true" className={styles.domuzMark} viewBox={`0 0 ${DOMUZ_SYMBOL.width} ${DOMUZ_SYMBOL.height}`}>
          <DomuzGradient id={`domuz-${gradientId}`} variant={domuzVariant} />
          <path fill={symbolFill} fillRule="evenodd" d={DOMUZ_SYMBOL.path} />
        </svg>
      )}
      {isDomuz && markOnly && mode === "solid" && (
        <svg aria-hidden="true" className={styles.domuzMark} viewBox={`0 0 ${DOMUZ_SOLID_MARK.size} ${DOMUZ_SOLID_MARK.size}`}>
          <DomuzGradient id={`domuz-${gradientId}`} variant={domuzVariant} />
          <g transform={`translate(${DOMUZ_SOLID_MARK.symbolX} ${DOMUZ_SOLID_MARK.symbolY}) scale(${DOMUZ_SOLID_MARK.symbolScale})`}>
            <path fill={solidSymbolFill} fillRule="evenodd" d={DOMUZ_SOLID_GESTALT_PATH} />
          </g>
        </svg>
      )}
      {isDomuz && !markOnly && mode === "line" && (
        <svg aria-hidden="true" className={styles.domuzLockup} viewBox={`0 0 ${DOMUZ_LOCKUP.width} ${DOMUZ_LOCKUP.height}`}>
          <DomuzGradient id={`domuz-${gradientId}`} variant={domuzVariant} />
          <path fill={symbolFill} fillRule="evenodd" d={DOMUZ_SYMBOL.path} transform={`translate(0 ${DOMUZ_LOCKUP.symbolY}) scale(${DOMUZ_LOCKUP.symbolScale})`} />
          <path fill={wordmarkFill} d={DOMUZ_WORDMARK.path} transform={`translate(${DOMUZ_LOCKUP.wordmarkX} ${DOMUZ_LOCKUP.wordmarkY}) translate(${-DOMUZ_WORDMARK.minX} ${-DOMUZ_WORDMARK.minY})`} />
        </svg>
      )}
      {isDomuz && !markOnly && mode === "solid" && (
        <svg aria-hidden="true" className={styles.domuzLockup} viewBox={`0 0 ${DOMUZ_SOLID_LOCKUP.width} ${DOMUZ_SOLID_LOCKUP.height}`}>
          <DomuzGradient id={`domuz-${gradientId}`} variant={domuzVariant} />
          <g transform={`translate(${DOMUZ_SOLID_LOCKUP.symbolShiftX} 0)`}>
            <g transform={`translate(${DOMUZ_SOLID_MARK.symbolX} ${DOMUZ_SOLID_MARK.symbolY}) scale(${DOMUZ_SOLID_MARK.symbolScale})`}>
              <path fill={solidSymbolFill} fillRule="evenodd" d={DOMUZ_SOLID_GESTALT_PATH} />
            </g>
          </g>
          <path fill={solidWordmarkFill} d={DOMUZ_WORDMARK.path} transform={`translate(${DOMUZ_SOLID_LOCKUP.wordmarkX} ${DOMUZ_SOLID_LOCKUP.wordmarkY}) translate(${-DOMUZ_WORDMARK.minX} ${-DOMUZ_WORDMARK.minY})`} />
        </svg>
      )}
      {!isDomuz && (markOnly ? <span aria-hidden="true" className={styles.monogram}>r</span> : <span aria-hidden="true" className={styles.word}>{label}</span>)}
      {!isDomuz && !markOnly && <span aria-hidden="true" className={styles.dot} />}
    </span>
  );
}

function normalizeVariant(variant: BrandLogoVariant): BrandLogoVariant {
  if (variant === "default" || variant === "theme") return "theme";
  if (variant === "black") return "mono";
  if (variant === "white") return "inverse";
  return variant;
}

function isSeasonal(variant: BrandLogoVariant) {
  return variant === "pride" || variant === "trans" || variant === "copa";
}

function logoFill(variant: BrandLogoVariant, part: "symbol" | "wordmark") {
  if (variant === "inverse") return "var(--brand-logo-line-white, var(--brand-logo-inverse, var(--legacy-white)))";
  if (variant === "orange") return "var(--brand-logo-orange, var(--brand-primary-container))";
  if (variant === "mono") return "var(--brand-logo-line-black, var(--brand-logo-mono, var(--ink-1)))";
  return part === "symbol" ? "var(--brand-logo-line-theme, var(--brand-logo-symbol, var(--brand-primary-container)))" : "var(--brand-logo-wordmark, var(--ink-1))";
}

function solidFill(variant: BrandLogoVariant, part: "symbol" | "wordmark") {
  if (variant === "inverse") {
    return "var(--brand-logo-solid-white, var(--brand-logo-inverse, var(--legacy-white)))";
  }
  if (variant === "mono") {
    return "var(--brand-logo-solid-black, var(--brand-logo-mono, var(--ink-1)))";
  }
  if (variant === "orange") {
    return "var(--brand-logo-orange, var(--brand-primary-container))";
  }
  if (part === "wordmark") return "var(--brand-logo-solid-wordmark, var(--brand-logo-solid-theme, var(--brand-logo-wordmark, var(--ink-1))))";
  return "var(--brand-logo-solid-theme, var(--brand-logo-symbol, var(--brand-primary-container)))";
}

function DomuzGradient({ id, variant }: { id: string; variant: BrandLogoVariant }) {
  const stops = variant === "theme" ? themeStops : variant === "pride" ? prideStops : variant === "trans" ? transStops : variant === "copa" ? copaStops : null;
  if (!stops) return null;
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        {stops.map(([offset, color]) => (
          <stop key={offset} offset={offset} stopColor={color} />
        ))}
      </linearGradient>
    </defs>
  );
}

const themeStops = [
  ["0%", "var(--brand-logo-solid-theme-start, #ff8a32)"],
  ["56%", "var(--brand-logo-solid-theme, #f15a24)"],
  ["100%", "var(--brand-logo-solid-theme-end, #c94322)"],
] as const;

const prideStops = [
  ["0%", "var(--brand-pride-red, #e62418)"],
  ["18%", "var(--brand-pride-orange, #ff7a00)"],
  ["36%", "var(--brand-pride-yellow, #ffd400)"],
  ["54%", "var(--brand-pride-green, #008a3d)"],
  ["72%", "var(--brand-pride-blue, #0057b8)"],
  ["90%", "var(--brand-pride-purple, #7a1fa2)"],
  ["100%", "var(--brand-pride-pink, #f43f7a)"],
] as const;

const transStops = [
  ["0%", "var(--brand-trans-blue, #6ec6ea)"],
  ["34%", "var(--brand-trans-pink, #f7a8b8)"],
  ["50%", "var(--brand-trans-white, #fff8f5)"],
  ["66%", "var(--brand-trans-pink, #f7a8b8)"],
  ["100%", "var(--brand-trans-blue, #6ec6ea)"],
] as const;

const copaStops = [
  ["0%", "var(--brand-copa-yellow, #f7d117)"],
  ["38%", "var(--brand-copa-green, #169b45)"],
  ["72%", "var(--brand-copa-blue, #0057b8)"],
  ["100%", "var(--brand-copa-yellow, #f7d117)"],
] as const;
