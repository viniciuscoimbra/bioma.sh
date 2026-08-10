import { type MenuEntry } from "../Menu";
/** Props for the HelpMenu component. */
export interface HelpMenuProps {
    /** Itens do menu. Padrão: Documentação, Atalhos, ─, Falar com suporte. */
    entries?: MenuEntry[];
    onSelect?: (id: string) => void;
    /** Rótulo acessível. */
    label?: string;
    className?: string;
}
/**
 * HelpMenu — botão "?" que abre o menu de ajuda.
 *
 * Compõe `IconButton` (lg, mesmo tamanho do NotificationBell) + `Menu` com
 * itens padrão (Documentação, Atalhos, Suporte), customizáveis via
 * `entries`. Alinhado ao fim (canto da topbar).
 *
 *   <HelpMenu onSelect={(id) => id === "docs" && openDocs()} />
 */
export declare function HelpMenu({ entries, onSelect, label, className }: HelpMenuProps): import("react").JSX.Element;
