import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Sidebar } from "../Sidebar";
import type { SidebarProps } from "../Sidebar";
import { Topbar } from "../Topbar";
import type { TopbarProps } from "../Topbar";
import styles from "./AppShell.module.css";

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
export function AppShell({
  sidebar,
  topbar,
  contentMaxWidth = 1240,
  theme,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn(styles.shell, className)} data-theme={theme}>
      <Sidebar {...sidebar} />
      <main className={styles.main}>
        <Topbar {...topbar} />
        <div className={styles.body}>
          <div className={styles.content} style={{ maxWidth: contentMaxWidth }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
