import { type HTMLAttributes } from "react";
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
export declare function BrandLogo({ brand, size, tone, mode, variant, animated, markOnly, className, ...rest }: BrandLogoProps): import("react").JSX.Element;
