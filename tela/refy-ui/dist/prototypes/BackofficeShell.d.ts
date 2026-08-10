import type { ReactNode } from "react";
import type { SidebarProps } from "../components/Sidebar";
import type { Crumb } from "../components/Topbar";
interface BackofficeShellProps {
    sidebar: SidebarProps;
    crumbs: Crumb[];
    children: ReactNode;
}
export declare function BackofficeShell({ sidebar, crumbs, children }: BackofficeShellProps): import("react").JSX.Element;
export {};
