import type { HTMLAttributes, ReactNode } from "react";
/** Props for the PersonCell display cell. */
export interface PersonCellProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Slot inicial — `Avatar` (circle p/ pessoa, `shape="square"` p/ entidade:
     * projeto, workspace, imobiliária). Composição: o átomo vem de fora.
     */
    avatar?: ReactNode;
    /** Nome (linha principal). */
    name: ReactNode;
    /** Sufixo inline após o nome (ex.: "você" mono, `Badge` de papel). */
    tag?: ReactNode;
    /** Linha secundária (email, descrição, meta da entidade). */
    secondary?: ReactNode;
    /** Densidade: `sm` p/ células de tabela compactas, `md` p/ listas. */
    size?: "sm" | "md";
}
/**
 * PersonCell — célula padrão de pessoa/entidade: `Avatar` + nome (+ tag
 * inline) + linha secundária. Display puro (não clicável); vive dentro de
 * `Table`, listas e menus.
 */
export declare function PersonCell({ avatar, name, tag, secondary, size, className, ...rest }: PersonCellProps): import("react").JSX.Element;
