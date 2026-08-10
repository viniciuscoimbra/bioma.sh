import type { ReactNode } from "react";
export type ChoiceCardMode = "single" | "multiple";
/** Props for the ChoiceCardGroup container. */
export interface ChoiceCardGroupProps {
    /** `single` = semântica de radio (default); `multiple` = checkboxes. */
    mode?: ChoiceCardMode;
    /** Valor controlado: string (single) ou string[] (multiple). */
    value?: string | string[];
    /** Valor inicial não-controlado. */
    defaultValue?: string | string[];
    /** Callback: recebe string (single) ou string[] (multiple). */
    onChange?: (value: string | string[]) => void;
    /** Rótulo acessível do grupo (obrigatório sem label visível externo). */
    label?: string;
    /** Colunas do grid (default 3; 1 = lista empilhada). */
    columns?: number;
    children: ReactNode;
    className?: string;
}
/**
 * ChoiceCardGroup — grupo de cards selecionáveis com semântica de
 * radio/checkbox e navegação por teclado (roving tabindex no modo single:
 * setas movem E selecionam, como radio nativo; Home/End vão às pontas).
 */
export declare function ChoiceCardGroup({ mode, value, defaultValue, onChange, label, columns, children, className, }: ChoiceCardGroupProps): import("react").JSX.Element;
/** Props for a selectable ChoiceCard. */
export interface ChoiceCardProps {
    /** Valor único dentro do grupo. */
    value: string;
    /** Título da opção. */
    title: ReactNode;
    /** Descrição curta abaixo do título. */
    description?: ReactNode;
    /** Ícone pequeno inline antes do título (slot). */
    icon?: ReactNode;
    /** Preview grande acima do texto (slot — ex.: amostra de tema). */
    preview?: ReactNode;
    /** Meta/preço (mono) abaixo ou à direita do texto. */
    meta?: ReactNode;
    disabled?: boolean;
    className?: string;
}
/**
 * ChoiceCard — card-como-radio/checkbox: título + descrição + ícone ou
 * preview + meta. Só funciona dentro de `ChoiceCardGroup`. Seleção com anel
 * primário; transição com tokens de motion.
 */
export declare function ChoiceCard({ value, title, description, icon, preview, meta, disabled, className, }: ChoiceCardProps): import("react").JSX.Element;
