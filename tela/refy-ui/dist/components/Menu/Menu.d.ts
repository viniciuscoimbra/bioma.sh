import type { ReactNode } from "react";
/** Item acionável, separador ou rótulo de seção. */
export type MenuEntry = {
    type?: "item";
    id: string;
    label: ReactNode;
    icon?: ReactNode;
    /** Atalho exibido em `kbd` à direita. */
    shortcut?: string;
    /** Metadado simples à direita, sem semântica de atalho. */
    meta?: ReactNode;
    /** Item destrutivo (vermelho). */
    danger?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
} | {
    type: "separator";
} | {
    type: "label";
    label: ReactNode;
};
/** Props for the Menu popover. */
export interface MenuProps {
    /** Menu visível (controlado). */
    open: boolean;
    /** Pedido de fechamento: Esc, clique fora ou seleção. */
    onOpenChange: (open: boolean) => void;
    entries: MenuEntry[];
    /** Disparado ao escolher qualquer item. */
    onSelect?: (id: string) => void;
    /** Elemento âncora (trigger). */
    children: ReactNode;
    /** Borda do menu alinhada ao início ou fim do trigger. Padrão `start`. */
    align?: "start" | "end";
    /** Lado de abertura em relação ao trigger. Padrão `bottom`. */
    side?: "top" | "bottom";
    className?: string;
}
/**
 * Menu — lista de ações pop-up ancorada a um trigger.
 *
 * Suporta ícone, atalho em `kbd`, separadores, rótulos de seção e item
 * destrutivo (vermelho). ↑/↓ navegam, Enter aciona, Esc/clique fora fecham.
 * `role="menu"`/`menuitem` com `aria-activedescendant`. Controlado por
 * `open`/`onOpenChange`. Largura mínima 200px.
 *
 *   <Menu open={open} onOpenChange={setOpen} entries={acoes}>
 *     <IconButton aria-label="Mais" onClick={() => setOpen(!open)}>⋯</IconButton>
 *   </Menu>
 */
export declare function Menu({ open, onOpenChange, entries, onSelect, children, align, side, className, }: MenuProps): import("react").JSX.Element;
