import { useState } from "react";
import { Avatar } from "../Avatar";
import { Menu, type MenuEntry } from "../Menu";
import { cn } from "../../lib/cn";
import styles from "./UserMenu.module.css";

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

const UserIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  </svg>
);
const GearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10 2.8 2.8M1 12h4m14 0h4M4.2 19.8 7 17m10-10 2.8-2.8" />
  </svg>
);
const LogoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DEFAULT_ENTRIES: MenuEntry[] = [
  { id: "profile", label: "Perfil", icon: UserIcon },
  { id: "settings", label: "Configurações", icon: GearIcon },
  { type: "separator" },
  { id: "logout", label: "Sair", icon: LogoutIcon, danger: true },
];

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
export function UserMenu({
  user,
  entries = DEFAULT_ENTRIES,
  onSelect,
  compact,
  side = "bottom",
  align,
  className,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      align={align ?? (compact ? "end" : "start")}
      className={cn(
        styles.wrap,
        side === "top" && styles.sideTop,
        !compact && styles.fullWidthMenu,
        className
      )}
    >
      <button
        type="button"
        className={cn(styles.trigger, compact && styles.triggerCompact)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Conta de ${user.name}`}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar size="md" initials={user.initials} src={user.src} seed={user.seed} />
        {!compact && (
          <span className={styles.meta}>
            <span className={styles.name}>{user.name}</span>
            {user.email && <span className={styles.email}>{user.email}</span>}
          </span>
        )}
        {!compact && (
          <svg className={styles.caret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
    </Menu>
  );
}
