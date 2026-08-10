import type { ReactNode } from "react";
/** Props for the HelpField form-row wrapper. */
export interface HelpFieldProps {
    /** Rótulo simples do campo (nunca o nome técnico interno). */
    label: string;
    /** Explicação curta mostrada na ajuda rica do ícone. */
    helpText: string;
    /** O campo em si (Input, Select, Combobox…). Recebe `aria-describedby` do texto de ajuda. */
    children: ReactNode;
    /** Gancho do link "Saber mais" — o app abre a Drawer de ajuda (o componente não a traz). */
    onLearnMore?: () => void;
    /** Texto do link. Padrão "Saber mais". */
    learnMoreLabel?: string;
    /** `id` do campo, para ligar o `<label>` (htmlFor). */
    htmlFor?: string;
    /** Lado do tooltip. Padrão "top". */
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}
/**
 * HelpField — padrão para campo técnico inevitável.
 *
 * Form-row com rótulo simples + ícone de ajuda (`IconButton` sm). No
 * hover/foco o ícone mostra um `HoverCard` com o `helpText` e, dentro dele,
 * "Saber mais" chama `onLearnMore` — o app decide o que abrir
 * (tipicamente a Drawer de ajuda). O campo (children) recebe
 * `aria-describedby` apontando para o texto de ajuda.
 *
 *   <HelpField label="Participação na comissão" helpText="…" onLearnMore={abrirAjuda}>
 *     <Input id="share" suffix="%" />
 *   </HelpField>
 */
export declare function HelpField({ label, helpText, children, onLearnMore, learnMoreLabel, htmlFor, side, className, }: HelpFieldProps): import("react").JSX.Element;
