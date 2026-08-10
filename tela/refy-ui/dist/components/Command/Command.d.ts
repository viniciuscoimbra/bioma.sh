import type { ReactNode } from "react";
/** Um comando ou resultado da paleta. */
export interface CommandItem {
    /** Identificador estável. */
    id: string;
    /** Texto exibido (recebe destaque do termo buscado). */
    label: string;
    /** Rótulo de seção — itens com o mesmo `group` ficam juntos. */
    group?: string;
    /** Ícone à esquerda (via prop, nunca bundleado). */
    icon?: ReactNode;
    /** Badge curto tipo avatar (ex.: iniciais de um domínio). */
    lead?: string;
    /** Atalho exibido em `kbd` à direita (ex.: "⌘N"). */
    shortcut?: string;
    /** Termos extras para a busca encontrar este item. */
    keywords?: string;
    disabled?: boolean;
    /** Executado ao selecionar (além do `onSelect` da paleta). */
    onSelect?: () => void;
}
/** Props for the command palette. */
export interface CommandProps {
    /** Paleta visível (controlada — overlay não tem estado interno). */
    open: boolean;
    /** Pedido de fechamento: Esc, clique no backdrop ou seleção. */
    onOpenChange: (open: boolean) => void;
    items: CommandItem[];
    /** Disparado ao escolher qualquer item. */
    onSelect?: (item: CommandItem) => void;
    placeholder?: string;
    emptyMessage?: string;
    className?: string;
}
/**
 * Command — paleta de comandos (⌘K).
 *
 * Busca global com agrupamento por categoria, destaque do termo, atalhos em
 * `kbd` e navegação por teclado (↑/↓, Enter, Esc). Card de 560px sobre
 * backdrop; foco vai direto para o input ao abrir. Controlada por
 * `open`/`onOpenChange` — registre o atalho ⌘K no app:
 *
 *   useEffect(() => {
 *     const h = (e) => { if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(true); } };
 *     window.addEventListener("keydown", h);
 *     return () => window.removeEventListener("keydown", h);
 *   }, []);
 */
export declare function Command({ open, onOpenChange, items, onSelect, placeholder, emptyMessage, className, }: CommandProps): import("react").JSX.Element | null;
