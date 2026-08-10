import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { BrandLogo } from "../BrandLogo";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import { UserMenu } from "../UserMenu";
import type { MenuEntry } from "../Menu";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher";
import type { Workspace } from "../WorkspaceSwitcher";
import styles from "./Sidebar.module.css";

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
  workspace?: { name: string; role?: string; initials: string };
  /** Lista de workspaces — vira um `WorkspaceSwitcher` (combobox). */
  workspaces?: Workspace[];
  /** Id do workspace atual quando `workspaces` é usado. */
  workspaceId?: string;
  onWorkspaceChange?: (workspace: Workspace) => void;
  account?: { name: string; email: string; initials: string; seed?: string };
  /** Itens do menu de conta (abre acima do rodapé). Padrão: Perfil/Configurações/Sair. */
  accountMenu?: MenuEntry[];
  onAccountSelect?: (id: string) => void;
  /** CTA primário no topo (ex.: Nova análise). */
  cta?: { label: string; icon?: ReactNode; onClick?: () => void; href?: string };
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
export function Sidebar({
  groups,
  activeId,
  defaultActiveId,
  workspace,
  workspaces,
  workspaceId,
  onWorkspaceChange,
  account,
  accountMenu,
  onAccountSelect,
  cta,
  brand = "refy",
  defaultCollapsed = false,
  mode,
  defaultMode,
  onModeChange,
  onNavigate,
}: SidebarProps) {
  const [internalMode, setInternalMode] = useState<SidebarMode>(defaultMode ?? (defaultCollapsed ? "compact" : "expanded"));
  const [internalActive, setInternalActive] = useState(defaultActiveId);
  const active = activeId !== undefined ? activeId : internalActive;
  const currentMode = mode ?? internalMode;
  const collapsed = currentMode !== "expanded";
  const showLabels = currentMode !== "compact";

  function setMode(next: SidebarMode) {
    if (mode === undefined) setInternalMode(next);
    onModeChange?.(next);
  }

  return (
    <aside className={cn(styles.sidebar, styles[currentMode], collapsed && styles.collapsed)} data-mode={currentMode}>
      <div className={styles.top}>
        <span className={styles.logo}>
          {typeof brand === "string" && (brand === "refy" || brand === "dommus") ? (
            <BrandLogo brand={brand} size={collapsed ? "xs" : "sm"} markOnly={collapsed} />
          ) : (
            !collapsed && brand
          )}
        </span>
        <IconButton
          className={styles.collapseBtn}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          onClick={() => setMode(collapsed ? "expanded" : "compact")}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>}
        />
      </div>

      {workspaces ? (
        <div className={styles.wsWrap}>
          {collapsed ? (
            /* colapsada: clicar expande a sidebar primeiro; o menu só abre expandida */
            <button
              type="button"
              className={styles.expandTrigger}
              aria-label="Expandir menu para trocar de ambiente"
              onClick={() => setMode("expanded")}
            >
              <Avatar
                size="md"
                initials={workspaces.find((w) => w.id === workspaceId)?.initials ?? workspaces[0].initials}
                style={{ borderRadius: 6 }}
              />
            </button>
          ) : (
            <WorkspaceSwitcher
              workspaces={workspaces}
              value={workspaceId}
              onChange={onWorkspaceChange}
            />
          )}
        </div>
      ) : (
        workspace && (
          <button type="button" className={styles.ws} aria-label="Trocar ambiente">
            <Avatar size="md" initials={workspace.initials} style={{ borderRadius: 6 }} />
            {!collapsed && (
              <span className={styles.wsMeta}>
                <span className={styles.wsName}>{workspace.name}</span>
                {workspace.role && <span className={styles.wsRole}>{workspace.role}</span>}
              </span>
            )}
          </button>
        )
      )}

      {cta && (
        <div className={styles.ctaWrap}>
          <Button
            variant="primary"
            block
            className={styles.cta}
            leadingIcon={cta.icon}
            aria-label={collapsed ? cta.label : undefined}
            data-tip={cta.label}
            onClick={cta.onClick}
          >
            {!collapsed && cta.label}
          </Button>
        </div>
      )}

      <nav className={styles.nav}>
        {groups.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && <div className={styles.section}>{group.section}</div>}
            {group.items.map((item) => {
              const isActive = item.id === active;
              const Tag = item.href ? "a" : "button";
              const navItem = (
                <Tag
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  className={cn(styles.item, isActive && styles.itemActive)}
                  data-tip={item.label}
                  aria-label={currentMode === "compact" ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => {
                    if (activeId === undefined) setInternalActive(item.id);
                    onNavigate?.(item);
                  }}
                >
                  <span className={styles.itemIcon}>{item.icon}</span>
                  {showLabels && <span className={styles.itemLabel}>{item.label}</span>}
                  {item.badge != null && (
                    <Badge tone="danger" className={styles.badge}>
                      {item.badge}
                    </Badge>
                  )}
                </Tag>
              );
              return collapsed ? (
                <Tooltip key={item.id} label={item.label} side="right" delayMs={250} portalled>
                  {navItem}
                </Tooltip>
              ) : navItem;
            })}
          </div>
        ))}
      </nav>

      {account && (
        <div className={styles.footer}>
          {collapsed ? (
            /* colapsada: clicar expande a sidebar primeiro; o menu só abre expandida */
            <button
              type="button"
              className={styles.expandTrigger}
              aria-label={`Expandir menu para abrir a conta de ${account.name}`}
              onClick={() => setMode("expanded")}
            >
              <Avatar size="md" initials={account.initials} seed={account.seed} />
            </button>
          ) : (
            <UserMenu
              user={account}
              entries={accountMenu}
              onSelect={onAccountSelect}
              side="top"
            />
          )}
        </div>
      )}
    </aside>
  );
}
