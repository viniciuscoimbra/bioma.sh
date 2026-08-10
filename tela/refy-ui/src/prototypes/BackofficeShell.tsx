import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AppShell } from "../components/AppShell";
import type { SidebarProps } from "../components/Sidebar";
import type { Crumb } from "../components/Topbar";
import { Command, type CommandItem } from "../components/Command";
import { NotificationBell, type NotificationItem } from "../components/NotificationBell";
import { Icons } from "../_demo/icons";

const searchPlaceholder = "Buscar imobiliária, corretor, imóvel ou execução";

const notifications: NotificationItem[] = [
  { id: "source-viva", title: "Viva Lar parou de coletar", description: "A fonte retornou zero imóveis em três execuções seguidas.", time: "há 18min", unread: true },
  { id: "pipeline-transform", title: "Transformação interrompida", description: "A execução das 10:42 falhou ao normalizar 27 registros.", time: "há 31min", unread: true },
  { id: "agency-review", title: "Cadastro pronto para revisão", description: "Andrade Imóveis enviou os documentos solicitados.", time: "há 2h", unread: true },
];

const storyHref = (id: string) => `/?path=/story/${id}`;
const openStory = (id: string) => { window.parent.location.href = storyHref(id); };

const commands: CommandItem[] = [
  { id: "agencies", label: "Abrir imobiliárias", group: "Plataforma", icon: Icons.projects, keywords: "clientes inventário cadastro", onSelect: () => openStory("produto-backoffice-imobiliárias--index") },
  { id: "brokers", label: "Abrir corretores", group: "Plataforma", icon: Icons.backlog, keywords: "creci vínculo", onSelect: () => openStory("produto-backoffice-corretores--t-01-c-brokers") },
  { id: "sources", label: "Abrir fontes e crawlers", group: "Operação", icon: Icons.monitor, keywords: "captação coleta falha", onSelect: () => openStory("produto-backoffice-fontes-e-crawlers--sources") },
  { id: "pipeline", label: "Abrir pipeline", group: "Operação", icon: Icons.competitors, keywords: "execuções transformação python", onSelect: () => openStory("produto-backoffice-pipeline--pipeline") },
  { id: "reviews", label: "Abrir revisões de dados", group: "Operação", icon: Icons.backlog, keywords: "duplicidade qualidade", onSelect: () => openStory("produto-backoffice-revisões-de-dados--data-reviews") },
  { id: "analytics", label: "Abrir analítica da base", group: "Operação", icon: Icons.competitors, keywords: "imóveis cidade bairro fonte", onSelect: () => openStory("produto-backoffice-analítica--analytics") },
];

interface BackofficeShellProps {
  sidebar: SidebarProps;
  crumbs: Crumb[];
  children: ReactNode;
}

export function BackofficeShell({ sidebar, crumbs, children }: BackofficeShellProps) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationItems, setNotificationItems] = useState(notifications);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AppShell
        theme="dommus-admin"
        contentMaxWidth={9999}
        sidebar={sidebar}
        topbar={{
          showBrand: false,
          crumbs,
          searchPlaceholder,
          onSearchClick: () => setCommandOpen(true),
          actions: (
            <NotificationBell
              items={notificationItems}
              onItemClick={(item) => setNotificationItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry))}
              onMarkAllRead={() => setNotificationItems((current) => current.map((entry) => ({ ...entry, unread: false })))}
            />
          ),
        }}
      >
        {children}
      </AppShell>
      <Command open={commandOpen} onOpenChange={setCommandOpen} items={commands} placeholder="Buscar na Plataforma" />
    </>
  );
}
