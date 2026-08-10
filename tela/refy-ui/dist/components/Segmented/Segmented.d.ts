import type { ReactNode } from "react";
export interface SegmentedOption {
    value: string;
    label: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
}
/** Props for the single-select segmented control. */
export interface SegmentedProps {
    options: SegmentedOption[];
    /** Valor selecionado (controlado). */
    value?: string;
    /** Seleção inicial (não-controlado). Padrão: primeira opção. */
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Rótulo acessível do grupo. */
    label?: string;
    disabled?: boolean;
    className?: string;
}
/**
 * Segmented — seleção única em pílula (switch de visões).
 *
 * Trilho com fundo rebaixado; o segmento ativo ganha superfície elevada.
 * Semântica de `radiogroup`: ←/→ movem a seleção, cada segmento é um
 * `role="radio"`. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <Segmented options={[{ value: "lista", label: "Lista" }, { value: "kanban", label: "Kanban" }]} />
 */
export declare function Segmented({ options, value, defaultValue, onChange, label, disabled, className, }: SegmentedProps): import("react").JSX.Element;
