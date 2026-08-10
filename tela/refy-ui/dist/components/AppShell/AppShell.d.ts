import type { ReactNode } from "react";
import type { SidebarProps } from "../Sidebar";
import type { TopbarProps } from "../Topbar";
/** Props for the authenticated application shell layout. */
export interface AppShellProps {
    /** Props repassadas à Sidebar. */
    sidebar: SidebarProps;
    /** Props repassadas à Topbar. */
    topbar: TopbarProps;
    /** Largura máxima da coluna de conteúdo. Default 1240px. */
    contentMaxWidth?: number;
    /** Tema explícito. Omitido, herda o tema global do Storybook/app. */
    theme?: "light" | "dark" | "dommus" | "dommus-admin" | "dommus-dark";
    children: ReactNode;
    className?: string;
}
/**
 * Layout completo do app autenticado: [Sidebar] [Topbar + conteúdo].
 * É só composição — não duplica estilo dos filhos.
 */
export declare function AppShell({ sidebar, topbar, contentMaxWidth, theme, children, className, }: AppShellProps): import("react").JSX.Element;
