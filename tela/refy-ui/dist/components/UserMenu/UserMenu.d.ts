import { type MenuEntry } from "../Menu";
export interface UserMenuUser {
    name: string;
    email?: string;
    initials: string;
    /** Identificador estável usado para manter a mesma cor de avatar em qualquer tela. */
    seed?: string;
    /** URL da foto (sobrepõe as iniciais). */
    src?: string;
}
export interface UserMenuProps {
    user: UserMenuUser;
    /** Itens do menu. Padrão: Perfil, Configurações, ─, Sair. */
    entries?: MenuEntry[];
    onSelect?: (id: string) => void;
    /** Só o avatar (topbar); padrão mostra nome + e-mail (sidebar). */
    compact?: boolean;
    /** Menu abre acima do trigger (rodapé da sidebar). */
    side?: "top" | "bottom";
    /** Borda do menu alinhada ao início ou fim do trigger. Padrão: largura total
     * no modo padrão; `end` no compacto. */
    align?: "start" | "end";
    className?: string;
}
/**
 * UserMenu — bloco de usuário que abre um menu de conta.
 *
 * Compõe `Avatar` + `Menu`: avatar (+ nome/e-mail no modo padrão) como
 * trigger; itens padrão Perfil/Configurações/Sair, customizáveis via
 * `entries`. `compact` para a topbar (só avatar), `side="top"` para o
 * rodapé da sidebar.
 *
 *   <UserMenu user={{ name: "João", email: "joao@…", initials: "JM" }} onSelect={go} />
 */
export declare function UserMenu({ user, entries, onSelect, compact, side, align, className, }: UserMenuProps): import("react").JSX.Element;
