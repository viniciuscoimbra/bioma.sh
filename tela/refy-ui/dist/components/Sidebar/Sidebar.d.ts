import type { ReactNode } from "react";
import type { MenuEntry } from "../Menu";
import type { Workspace } from "../WorkspaceSwitcher";
export interface SidebarNavItem {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    target?: string;
    badge?: string | number;
}
export interface SidebarNavGroup {
    /** Título do grupo (some quando colapsado). */
    section?: string;
    items: SidebarNavItem[];
}
export type SidebarMode = "expanded" | "rail" | "compact";
/** Props for the application sidebar. */
export interface SidebarProps {
    /** Grupos de navegação. */
    groups: SidebarNavGroup[];
    /** Id do item ativo (controlado). */
    activeId?: string;
    /** Item ativo inicial (não-controlado) — clicar muda sozinho. */
    defaultActiveId?: string;
    /** Workspace atual (estático). Prefira `workspaces` para o seletor completo. */
    workspace?: {
        name: string;
        role?: string;
        initials: string;
    };
    /** Lista de workspaces — vira um `WorkspaceSwitcher` (combobox). */
    workspaces?: Workspace[];
    /** Id do workspace atual quando `workspaces` é usado. */
    workspaceId?: string;
    onWorkspaceChange?: (workspace: Workspace) => void;
    account?: {
        name: string;
        email: string;
        initials: string;
        seed?: string;
    };
    /** Itens do menu de conta (abre acima do rodapé). Padrão: Perfil/Configurações/Sair. */
    accountMenu?: MenuEntry[];
    onAccountSelect?: (id: string) => void;
    /** CTA primário no topo (ex.: Nova análise). */
    cta?: {
        label: string;
        icon?: ReactNode;
        onClick?: () => void;
        href?: string;
    };
    /** Wordmark/logo exibido no topo. Aceita texto ou markup (ex.: `<img>`). Default `"refy"`. */
    brand?: ReactNode;
    /** Começa colapsada. */
    defaultCollapsed?: boolean;
    /** Modo controlado; `rail` mostra ícone + label e `compact` somente ícone. */
    mode?: SidebarMode;
    defaultMode?: SidebarMode;
    onModeChange?: (mode: SidebarMode) => void;
    onNavigate?: (item: SidebarNavItem) => void;
}
/** Navegação principal do app. Composição: `WorkspaceSwitcher`, `Button` (CTA),
 * `Badge` (contadores) e `UserMenu` (conta, abre para cima). Colapsável para
 * 64px — colapsada, workspace e conta expandem a sidebar antes de abrir.
 * Item ativo controlado via `activeId` ou não-controlado via `defaultActiveId`. */
export declare function Sidebar({ groups, activeId, defaultActiveId, workspace, workspaces, workspaceId, onWorkspaceChange, account, accountMenu, onAccountSelect, cta, brand, defaultCollapsed, mode, defaultMode, onModeChange, onNavigate, }: SidebarProps): import("react").JSX.Element;
