import type { InputHTMLAttributes, ReactNode } from "react";
/** Avatar de uma opção "pessoa" (corretor, imobiliária…). */
export interface ComboboxOptionAvatar {
    /** Nome — origem das iniciais quando não há foto. */
    name: string;
    /** URL da foto. */
    src?: string;
    /** Cor de fundo das iniciais (repassada ao Avatar). */
    color?: string;
}
/** Uma opção sugerida pelo Combobox. */
export interface ComboboxOption {
    /** Identificador estável da opção. */
    value: string;
    /** Texto exibido (recebe destaque do trecho digitado). */
    label: string;
    /** Badge curto à esquerda (iniciais, "/", etc.). */
    lead?: string;
    /** Texto mono à direita (ex.: "DA 78", "2.3k/mês"). */
    meta?: string;
    /** Avatar (foto/iniciais) à esquerda — variante "pessoas". Tem precedência sobre `lead`. */
    avatar?: ComboboxOptionAvatar;
    /** Linha secundária sob o label (ex.: "CRECI 34.512"). */
    description?: string;
    /** Rótulo de seção — opções com o mesmo `group` ficam juntas. */
    group?: string;
    disabled?: boolean;
}
/** Props for the Combobox field. */
export interface ComboboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onSelect" | "size"> {
    /** Opções sugeridas. Com `filter` (padrão) são filtradas pelo texto digitado. */
    options: ComboboxOption[];
    /** `value` da opção selecionada (controlado). `null` = nada selecionado. */
    value?: string | null;
    /** Seleção inicial (não-controlado). */
    defaultValue?: string | null;
    /** Disparado ao selecionar uma opção (ou `null` ao limpar). */
    onChange?: (option: ComboboxOption | null) => void;
    /** Texto do input controlado (para suggest assíncrono, filtre fora e passe `filter={false}`). */
    inputValue?: string;
    onInputValueChange?: (text: string) => void;
    /** Rótulo do campo (eyebrow mono acima do input). */
    label?: string;
    /** Filtra opções pelo texto digitado. `false` = a lista já vem filtrada de fora. */
    filter?: boolean | ((option: ComboboxOption, query: string) => boolean);
    /** Ícone à esquerda do input (padrão: lupa). */
    icon?: ReactNode;
    /** Mensagem quando nenhuma opção casa com a busca. */
    emptyMessage?: string;
    /** Mostra o botão de limpar quando há texto. Padrão `true`. */
    clearable?: boolean;
    error?: string;
    hint?: string;
    className?: string;
}
/**
 * Combobox — input com sugestões ancoradas (padrão ARIA 1.2 combobox).
 *
 * O popover compartilha borda e fundo do input: uma única superfície que
 * expande, sem gap. Filtro com destaque do trecho digitado, seções por
 * `group`, teclado completo (setas, Enter, Escape, Home/End) e
 * `aria-activedescendant`. Controlado (`value`/`onChange`) ou não-controlado
 * (`defaultValue`); texto também pode ser controlado via `inputValue`.
 *
 *   <Combobox label="Concorrente" options={domains} onChange={setCompetitor} />
 */
export declare const Combobox: import("react").ForwardRefExoticComponent<ComboboxProps & import("react").RefAttributes<HTMLInputElement>>;
