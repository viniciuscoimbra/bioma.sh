export interface Workspace {
    id: string;
    name: string;
    /** Papel/plano exibido em mono (ex.: "Workspace · Pro"). */
    role?: string;
    initials: string;
}
/** Props for the workspace switcher combobox. */
export interface WorkspaceSwitcherProps {
    workspaces: Workspace[];
    /** Id do workspace atual (controlado). */
    value?: string;
    /** Workspace inicial (não-controlado). Padrão: primeiro. */
    defaultValue?: string;
    onChange?: (workspace: Workspace) => void;
    /** Só o avatar, sem nome (sidebar colapsada). */
    compact?: boolean;
    className?: string;
}
/**
 * WorkspaceSwitcher — seletor de workspace estilo combobox.
 *
 * Trigger com avatar quadrado + nome + papel + caret; abre um painel com
 * busca (quando há 5+ workspaces) e lista com check no atual. ↑/↓ + Enter,
 * Esc/clique fora fecham. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <WorkspaceSwitcher workspaces={list} onChange={switchTo} />
 */
export declare function WorkspaceSwitcher({ workspaces, value, defaultValue, onChange, compact, className, }: WorkspaceSwitcherProps): import("react").JSX.Element | null;
