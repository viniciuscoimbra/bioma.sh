import type { InputHTMLAttributes } from "react";
/** Uma opção selecionável do Multiselect. */
export interface MultiselectOption {
    /** Identificador estável da opção. */
    value: string;
    /** Texto do chip e da lista. */
    label: string;
    disabled?: boolean;
}
export interface MultiselectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
    /** Opções disponíveis. O texto digitado filtra a lista. */
    options: MultiselectOption[];
    /** Valores selecionados (controlado). */
    value?: string[];
    /** Seleção inicial (não-controlado). */
    defaultValue?: string[];
    /** Disparado a cada mudança com a lista completa de valores. */
    onChange?: (values: string[]) => void;
    /** Rótulo do campo (eyebrow mono acima do input). */
    label?: string;
    /** Colapsa chips além de N num contador "+N". Padrão: 3. */
    maxVisibleChips?: number;
    /** Mensagem quando nenhuma opção casa com a busca. */
    emptyMessage?: string;
    error?: string;
    hint?: string;
    className?: string;
}
/**
 * Multiselect — seleção múltipla com chips removíveis dentro do campo.
 *
 * Altura fixa: mostra até três chips e colapsa o restante num contador `+N`
 * (limite ajustável por `maxVisibleChips`). Digite para filtrar, Enter/clique alterna a opção,
 * Backspace com o input vazio remove o último chip. Padrão ARIA combobox +
 * listbox `aria-multiselectable`. Controlado (`value`/`onChange`) ou
 * não-controlado (`defaultValue`).
 *
 *   <Multiselect label="Áreas de análise" options={areas} onChange={setAreas} />
 */
export declare const Multiselect: import("react").ForwardRefExoticComponent<MultiselectProps & import("react").RefAttributes<HTMLInputElement>>;
