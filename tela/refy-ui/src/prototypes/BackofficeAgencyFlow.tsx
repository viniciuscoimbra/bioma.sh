import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Accordion } from "../components/Accordion";
import {
  ApprovalWorkbench,
  type ApprovalWorkbenchItem,
} from "../components/ApprovalWorkbench";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { Combobox } from "../components/Combobox";
import { Command, type CommandItem } from "../components/Command";
import { DangerZone, DangerZoneRow } from "../components/DangerZone";
import { Drawer } from "../components/Drawer";
import { EmptyState } from "../components/EmptyState";
import { EventTimeline, type TimelineEvent } from "../components/EventTimeline";
import { IconButton } from "../components/IconButton";
import { Input } from "../components/Input";
import { Menu, type MenuEntry } from "../components/Menu";
import { Modal } from "../components/Modal";
import { Multiselect } from "../components/Multiselect";
import { NavCard } from "../components/NavCard";
import { NotificationBell, type NotificationItem } from "../components/NotificationBell";
import { Otp } from "../components/Otp";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { PersonCell } from "../components/PersonCell";
import { PhoneInput } from "../components/PhoneInput";
import { SectionHeader } from "../components/SectionHeader";
import { Select } from "../components/Select";
import { SettingRow, SettingRowGroup } from "../components/SettingRow";
import { SettingsSubnav } from "../components/SettingsSubnav";
import { StickyBar } from "../components/StickyBar";
import { StickyFooter } from "../components/StickyFooter";
import { Table, type Column } from "../components/Table";
import { TableOfContents } from "../components/TableOfContents";
import { Textarea } from "../components/Textarea";
import { ToastRegion, type ToastData } from "../components/Toast";
import { Icons } from "../_demo/icons";
import { backofficeSidebar } from "./BackofficeAgencies";
import { BackofficeShell } from "./BackofficeShell";
import { agencyAccessProfileOptions, platformAccessProfileOptions } from "./BackofficeProfiles";
import agencyStyles from "./BackofficeHome.module.css";
import styles from "./BackofficeAgencyFlow.module.css";

export interface FlowScopeProps {
  id: string;
  title: string;
  entry: string;
  purpose: string;
  requirements: string[];
  result: string;
}

export function FlowScope({ id, title, entry, purpose, requirements, result }: FlowScopeProps) {
  return (
    <main className={styles.page}>
      <PageHeader
        title={title}
        lead={<span className={styles.lead}><Badge tone="warn">Escopo registrado</Badge><span>{id}</span></span>}
        actions={<Button size="sm" onClick={() => window.parent.history.back()}>Voltar ao fluxo</Button>}
      />
      <div className={styles.scope}>
        <section>
          <SectionHeader title="O que esta página resolve" />
          <p>{purpose}</p>
        </section>
        <section>
          <SectionHeader title="Entrada" />
          <p>{entry}</p>
        </section>
        <section>
          <SectionHeader title="O que precisa ser desenhado" />
          <ul>{requirements.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <SectionHeader title="Saída" />
          <p>{result}</p>
        </section>
      </div>
    </main>
  );
}

export function AgencyLifecycle() {
  const transitions = [
    ["Aprovação", "Rascunho", "Cadastro enviado", "Em análise", "Imobiliária"],
    ["Aprovação", "Em análise", "Informação solicitada", "Aguardando informações", "Domuz"],
    ["Aprovação", "Aguardando informações", "Resposta recebida", "Em análise", "Imobiliária"],
    ["Aprovação", "Em análise", "Cadastro aprovado", "Aprovada", "Domuz"],
    ["Aprovação", "Em análise", "Cadastro recusado", "Recusada", "Domuz"],
    ["Operação", "Inativa", "Requisitos de ativação concluídos", "Ativa", "Domuz"],
    ["Operação", "Ativa", "Acesso suspenso", "Suspensa", "Domuz"],
    ["Operação", "Suspensa", "Acesso reativado", "Ativa", "Domuz"],
  ];

  return (
    <AppShell
      theme="dommus-admin"
      contentMaxWidth={9999}
      sidebar={backofficeSidebar}
      topbar={{
        showBrand: false,
        crumbs: [
          { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
          { label: "Imobiliárias", onClick: () => openStory(agencyIndexStory) },
          { label: "Horizonte Negócios", onClick: () => openStory(agencyReviewStory) },
          { label: "Situações" },
        ],
        searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
      }}
    >
      <main className={styles.lifecyclePage}>
        <PageHeader
          title="Situações da imobiliária"
          lead="A aprovação do cadastro e o acesso à operação mudam de forma independente."
          actions={<Button size="sm" onClick={() => openStory(agencyReviewStory)}>Voltar à imobiliária</Button>}
        />
        <div className={styles.lifecycleAxes}>
          <Card>
            <SectionHeader title="Aprovação" sub="Situação da análise manual do cadastro." />
            <SettingRowGroup aria-label="Situações da aprovação">
              <SettingRow title="Rascunho" description="A imobiliária ainda pode alterar o cadastro antes do envio." actions={<Badge tone="neutral">Inicial</Badge>} />
              <SettingRow title="Em análise" description="A Domuz confere os dados, documentos e o responsável." actions={<Badge tone="info">Atual</Badge>} />
              <SettingRow title="Aguardando informações" description="A imobiliária precisa responder a uma solicitação aberta na análise." actions={<Badge tone="warn">Alternativa</Badge>} />
              <SettingRow title="Aprovada" description="A análise terminou sem impedimentos para a ativação." actions={<Badge tone="success">Conclusão</Badge>} />
              <SettingRow title="Recusada" description="A decisão encerrou a análise e registrou os motivos." actions={<Badge tone="danger">Exceção</Badge>} />
            </SettingRowGroup>
          </Card>
          <Card>
            <SectionHeader title="Operação" sub="Acesso da imobiliária depois da decisão sobre o cadastro." />
            <SettingRowGroup aria-label="Situações da operação">
              <SettingRow title="Inativa" description="O cadastro pode estar aprovado, mas ainda falta um requisito de ativação." actions={<Badge tone="neutral">Sem acesso</Badge>} />
              <SettingRow title="Ativa" description="A imobiliária pode entrar e operar na plataforma." actions={<Badge tone="success">Com acesso</Badge>} />
              <SettingRow title="Suspensa" description="O acesso operacional está bloqueado, e o histórico continua disponível." actions={<Badge tone="danger">Bloqueada</Badge>} />
            </SettingRowGroup>
          </Card>
        </div>

        <section className={styles.transitionSection} aria-labelledby="transition-title">
          <SectionHeader id="transition-title" title="Mudanças permitidas" sub="Cada mudança registra quem agiu, quando e sobre qual versão do cadastro." />
          <div className={styles.transitionTable} role="table" aria-label="Mudanças de situação da imobiliária">
            <div role="row" className={styles.transitionHeader}><span>Eixo</span><span>De</span><span>Evento</span><span>Para</span><span>Quem age</span></div>
            {transitions.map(([axis, from, event, to, owner]) => <div role="row" key={`${axis}-${from}-${event}`}><span>{axis}</span><span>{from}</span><span>{event}</span><strong>{to}</strong><span>{owner}</span></div>)}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export function AndradeAgencyAccessPage() {
  const accessEvent: TimelineEvent[] = [{
    id: "agency-access-event-1",
    timestamp: "2026-07-26T05:42:00-03:00",
    title: "Permissão individual concedida",
    description: "Ana Lima recebeu permissão para atribuir clientes. O perfil Corretor e as outras permissões não mudaram.",
    actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
    status: { label: "Ativo", tone: "good" },
  }];

  return (
    <BackofficeShell
      sidebar={backofficeSidebar}
      crumbs={[
        { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
        { label: "Imobiliárias", onClick: () => openStory(agencyIndexStory) },
        { label: "Andrade Imóveis" },
      ]}
    >
      <div className={styles.userDetailPage}>
        <PageHeader
          title="Andrade Imóveis"
          lead={<span className={styles.userDetailLead}><Badge tone="success">Ativa</Badge><span className={styles.userId}>TNT-001</span></span>}
          actions={<Button size="sm" onClick={() => openStory(agencyIndexStory)}>Voltar para imobiliárias</Button>}
        />
        <div className={styles.counterpartContent}>
          <section className={styles.userDetailSection} aria-labelledby="agency-linked-people">
            <SectionHeader id="agency-linked-people" title="Pessoas e permissões" sub="Vínculos e permissões individuais que afetam esta imobiliária." count={1} />
            <NavCard
              href="/?path=/story/produto-backoffice-usu%C3%A1rios--t-01-b-user-access&globals=theme:dommus-admin;viewport:desktop1440"
              target="_top"
              leading={<Avatar size="lg" initials="AL" seed="USR-004" />}
              title="Ana Lima"
              description="1 permissão individual"
              meta={<span className={styles.userBadges}><Badge tone="info">Corretora associada</Badge><Badge tone="success">Ativo</Badge></span>}
            />
          </section>
          <section className={styles.userDetailSection} aria-labelledby="agency-access-event">
            <EventTimeline
              title="Alteração correspondente"
              context="O mesmo evento aparece no usuário e na imobiliária."
              events={accessEvent}
            />
            <Callout tone="note" title="Histórico compartilhado">
              A mesma alteração aparece no histórico da pessoa e no histórico da imobiliária.
            </Callout>
          </section>
        </div>
      </div>
    </BackofficeShell>
  );
}

const agencyIndexStory = "produto-backoffice-imobili%C3%A1rias--index";
const agencyReviewStory = "produto-backoffice-imobili%C3%A1rias-detalhes-da-imobili%C3%A1ria--index";
const backofficeHomeStory = "produto-backoffice-vis%C3%A3o-geral--index";
const usersStory = "produto-backoffice-usu%C3%A1rios--t-01-b-users";
const userDetailStory = "produto-backoffice-usu%C3%A1rios--t-01-b-user-detail";
const brokersStory = "produto-backoffice-corretores--t-01-c-brokers";
const brokerDetailStory = "produto-backoffice-corretores--t-01-c-broker-detail";
const brokerAccountStory = "produto-backoffice-usu%C3%A1rios--t-01-b-ana-account";
const andradeAgencyStory = agencyReviewStory;
const affiliationRequestsStory = "produto-imobili%C3%A1ria-corretores--t-09-a-affiliation-requests";
const personalOperationStory = "produto-corretor-vis%C3%A3o-geral--h-03-personal-operation";

function openStory(storyId: string) {
  window.parent.location.assign(`/?path=/story/${storyId}&globals=viewport:desktop1440`);
}

type PlatformUserStatus = "Ativo" | "Convite pendente" | "Bloqueado";

interface PlatformUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  roles: string[];
  links: string[];
  signIn: string;
  status: PlatformUserStatus;
  lastAccess: string;
}

export const platformUsers: PlatformUser[] = [
  { id: "USR-001", name: "André Martins", initials: "AM", email: "andre@domuz.app", roles: ["Admin da Plataforma"], links: ["Plataforma"], signIn: "Google + OTP", status: "Ativo", lastAccess: "hoje, 11:48" },
  { id: "USR-002", name: "Marina Torres", initials: "MT", email: "marina@horizonteimoveis.com.br", roles: ["Imobiliária", "Cliente"], links: ["Horizonte Negócios"], signIn: "Senha + OTP", status: "Ativo", lastAccess: "hoje, 09:12" },
  { id: "USR-003", name: "Paulo Mendes", initials: "PM", email: "paulo@horizonteimoveis.com.br", roles: ["Imobiliária"], links: ["Horizonte Negócios"], signIn: "Google + OTP", status: "Ativo", lastAccess: "ontem, 18:06" },
  { id: "USR-004", name: "Ana Lima", initials: "AL", email: "ana@andradeimoveis.com.br", roles: ["Corretor", "Cliente"], links: ["Andrade Imóveis", "Minha operação"], signIn: "Senha + OTP", status: "Ativo", lastAccess: "ontem, 16:40" },
  { id: "USR-005", name: "Fernanda Lopes", initials: "FL", email: "fernanda@horizonteimoveis.com.br", roles: ["Imobiliária"], links: ["Horizonte Negócios"], signIn: "Convite por e-mail", status: "Convite pendente", lastAccess: "Nunca entrou" },
  { id: "USR-006", name: "Bruno Alves", initials: "BA", email: "bruno@casanorte.com.br", roles: ["Corretor"], links: ["Casa Norte"], signIn: "Senha + OTP", status: "Bloqueado", lastAccess: "20 jul., 14:22" },
  { id: "USR-007", name: "Carla Souza", initials: "CS", email: "carla.souza@email.com", roles: ["Cliente"], links: ["Conta de cliente"], signIn: "Google + OTP", status: "Ativo", lastAccess: "19 jul., 20:15" },
  { id: "USR-008", name: "Diego Rocha", initials: "DR", email: "diego@verticeimobiliaria.com.br", roles: ["Corretor", "Imobiliária"], links: ["Vértice Imobiliária"], signIn: "Senha + OTP", status: "Ativo", lastAccess: "18 jul., 10:02" },
];

const userStatusTone: Record<PlatformUserStatus, "success" | "warn" | "danger"> = {
  Ativo: "success",
  "Convite pendente": "warn",
  Bloqueado: "danger",
};

function UserRowActions({ user }: { user: PlatformUser }) {
  const [open, setOpen] = useState(false);
  const entries: MenuEntry[] = [
    { id: "user", label: "Ver usuário", onSelect: () => openStory(userDetailStory) },
    ...(user.links.some((link) => link.includes("Imóveis") || link.includes("Negócios") || link.includes("Norte") || link.includes("Vértice"))
      ? [{ id: "agency", label: "Abrir imobiliária", onSelect: () => openStory(agencyReviewStory) }]
      : []),
    ...(user.roles.includes("Corretor")
      ? [{ id: "broker", label: "Ver corretor", onSelect: () => openStory(brokerDetailStory) }]
      : []),
  ];
  return (
    <Menu open={open} onOpenChange={setOpen} entries={entries} align="end">
      <IconButton
        size="sm"
        aria-label={`Ações de ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<span aria-hidden="true">•••</span>}
        onClick={() => setOpen((current) => !current)}
      />
    </Menu>
  );
}

const userColumns: Column<PlatformUser>[] = [
  { key: "id", header: "ID", sortable: true, cell: (user) => <span className={styles.userId}>{user.id}</span> },
  { key: "name", header: "Usuário", width: "25%", sortable: true, sortValue: (user) => user.name, cell: (user) => <PersonCell size="sm" avatar={<Avatar size="sm" initials={user.initials} seed={user.id} />} name={user.name} secondary={user.email} /> },
  { key: "roles", header: "Papéis", filterable: true, filterValue: (user) => user.roles, cell: (user) => <span className={styles.userBadges}>{user.roles.map((role) => <Badge key={role} tone="neutral">{role}</Badge>)}</span> },
  { key: "links", header: "Vínculos", filterable: true, filterValue: (user) => user.links, cell: (user) => <span className={styles.userLinks}>{user.links.join(" · ")}</span> },
  { key: "signIn", header: "Entrada", sortable: true, cell: (user) => user.signIn },
  { key: "status", header: "Situação", sortable: true, filterable: true, cell: (user) => <Badge tone={userStatusTone[user.status]} dot>{user.status}</Badge> },
  { key: "lastAccess", header: "Último acesso", sortable: true, cell: (user) => user.lastAccess },
  { key: "actions", header: "Ações", align: "right", cell: (user) => <UserRowActions user={user} /> },
];

const userNotifications: NotificationItem[] = [
  { id: "pending-invite", title: "Convite ainda não aceito", description: "Fernanda Lopes não concluiu o primeiro acesso.", time: "há 3h", unread: true },
  { id: "blocked-user", title: "Acesso bloqueado", description: "Bruno Alves teve o acesso bloqueado em 20 de julho.", time: "20 jul.", unread: false },
];

const userCommands: CommandItem[] = [
  { id: "users", label: "Abrir usuários", group: "Plataforma", onSelect: () => openStory(usersStory) },
  { id: "agencies", label: "Abrir imobiliárias", group: "Plataforma", onSelect: () => openStory(agencyIndexStory) },
  { id: "brokers", label: "Abrir corretores", group: "Plataforma", onSelect: () => openStory(brokersStory) },
];

export function PlatformUsersPage() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState(userNotifications);
  return (
    <>
      <AppShell
        theme="dommus-admin"
        contentMaxWidth={9999}
        sidebar={{ ...backofficeSidebar, defaultActiveId: "users" }}
        topbar={{
          showBrand: false,
          crumbs: [{ label: "Plataforma", onClick: () => openStory(backofficeHomeStory) }, { label: "Usuários" }],
          searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
          onSearchClick: () => setCommandOpen(true),
          actions: <NotificationBell items={notifications} onItemClick={(item) => setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry))} onMarkAllRead={() => setNotifications((current) => current.map((entry) => ({ ...entry, unread: false })))} />,
        }}
      >
        <main className={styles.usersPage}>
          <PageHeader title="Usuários" />
          <Table
            caption="Usuários da plataforma"
            searchable
            searchPlaceholder="Buscar por nome, e-mail ou ID"
            searchMatch={(user, query) => `${user.id} ${user.name} ${user.email} ${user.roles.join(" ")} ${user.links.join(" ")}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))}
            columns={userColumns}
            rows={platformUsers}
            rowKey={(user) => user.id}
            onRowClick={() => openStory(userDetailStory)}
            rowLabel={(user) => `Abrir ${user.name}`}
            pagination={{ pageSize: 6, pageSizeOptions: [6, 10, 20] }}
            minTableWidth={1040}
          />
        </main>
      </AppShell>
      <Command open={commandOpen} onOpenChange={setCommandOpen} items={userCommands} placeholder="Buscar na Plataforma" />
    </>
  );
}

type UserDetailView = "general" | "roles" | "access" | "security" | "history" | "administration";
type UserAccountStatus = "Ativo" | "Bloqueado" | "Excluído";
type AccessSaveMode = "success" | "error" | "readonly";
type AccessSystemId = "backoffice" | "agency" | "broker" | "client";
type UserAdministrativeAction = "block" | "delete";

interface AccessAction {
  id: string;
  label: string;
  checked: boolean;
  origin: string;
  locked?: boolean;
}

interface AccessModule {
  id: string;
  label: string;
  actions: AccessAction[];
}

interface AccessSystem {
  id: AccessSystemId;
  label: string;
  context: string;
  status: "Ativo" | "Sem acesso" | "Aguardando aprovação";
  profiles: string[];
  modules: AccessModule[];
}

interface UserActionCriterion {
  id: string;
  title: string;
  description: string;
  subcriteria: string[];
}

const accessSystems: AccessSystem[] = [
  {
    id: "backoffice",
    label: "Backoffice Domuz",
    context: "Plataforma",
    status: "Sem acesso",
    profiles: [],
    modules: [
      { id: "dashboard", label: "Visão geral", actions: [
        { id: "platform.dashboard.view", label: "Ver", checked: false, origin: "Sem concessão" },
      ] },
      { id: "agencies", label: "Imobiliárias", actions: [
        { id: "platform.agencies.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.agencies.create", label: "Criar", checked: false, origin: "Sem concessão" },
        { id: "platform.agencies.review", label: "Revisar", checked: false, origin: "Sem concessão" },
        { id: "platform.agencies.update_status", label: "Alterar situação", checked: false, origin: "Sem concessão" },
        { id: "platform.agencies.delete", label: "Excluir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "brokers", label: "Corretores", actions: [
        { id: "platform.brokers.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.brokers.review", label: "Revisar", checked: false, origin: "Sem concessão" },
        { id: "platform.brokers.update_status", label: "Alterar situação", checked: false, origin: "Sem concessão" },
      ] },
      { id: "clients", label: "Clientes e buscas", actions: [
        { id: "platform.clients.view", label: "Ver clientes", checked: false, origin: "Sem concessão" },
        { id: "platform.intents.view", label: "Ver buscas", checked: false, origin: "Sem concessão" },
      ] },
      { id: "users", label: "Usuários", actions: [
        { id: "platform.users.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.users.update_identity", label: "Alterar identidade", checked: false, origin: "Sem concessão" },
        { id: "platform.users.manage_security", label: "Gerenciar segurança", checked: false, origin: "Sem concessão" },
        { id: "platform.users.block", label: "Bloquear", checked: false, origin: "Sem concessão" },
        { id: "platform.users.delete", label: "Excluir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "access", label: "Permissões", actions: [
        { id: "platform.access.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.access.create_profile", label: "Criar perfil", checked: false, origin: "Sem concessão" },
        { id: "platform.access.publish_profile", label: "Publicar perfil", checked: false, origin: "Sem concessão" },
        { id: "platform.access.assign", label: "Atribuir", checked: false, origin: "Sem concessão" },
        { id: "platform.access.revoke", label: "Revogar", checked: false, origin: "Sem concessão" },
        { id: "platform.access.view_audit", label: "Ver histórico", checked: false, origin: "Sem concessão" },
      ] },
      { id: "properties", label: "Imóveis", actions: [
        { id: "data.properties.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "data.properties.update", label: "Alterar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "sources", label: "Fontes e crawlers", actions: [
        { id: "data.sources.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "data.sources.create", label: "Criar", checked: false, origin: "Sem concessão" },
        { id: "data.sources.update", label: "Alterar", checked: false, origin: "Sem concessão" },
        { id: "data.sources.run", label: "Executar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "pipeline", label: "Pipeline", actions: [
        { id: "data.pipeline.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "data.pipeline.run", label: "Executar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "reviews", label: "Revisões de dados", actions: [
        { id: "data.reviews.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "data.reviews.decide", label: "Decidir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "analytics", label: "Analítica", actions: [
        { id: "data.analytics.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "data.analytics.export", label: "Exportar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "parameters", label: "Parâmetros", actions: [
        { id: "platform.parameters.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.parameters.update", label: "Alterar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "versions", label: "Versões", actions: [
        { id: "platform.versions.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.versions.publish", label: "Publicar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "audit", label: "Auditoria", actions: [
        { id: "platform.audit.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "platform.audit.export", label: "Exportar", checked: false, origin: "Sem concessão" },
      ] },
    ],
  },
  {
    id: "agency",
    label: "Imobiliária",
    context: "Andrade Imóveis · TNT-001",
    status: "Ativo",
    profiles: ["Corretor", "Atendimento comercial"],
    modules: [
      { id: "dashboard", label: "Visão geral", actions: [
        { id: "agency.dashboard.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
      ] },
      { id: "profile", label: "Cadastro", actions: [
        { id: "agency.profile.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.profile.update", label: "Alterar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "clients", label: "Clientes", actions: [
        { id: "agency.clients.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.clients.create", label: "Criar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.clients.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.clients.archive", label: "Arquivar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.clients.assign", label: "Atribuir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "intents", label: "Buscas", actions: [
        { id: "agency.intents.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.intents.create", label: "Criar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.intents.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.intents.delete", label: "Excluir", checked: true, origin: "Perfil Corretor" },
      ] },
      { id: "leads", label: "Leads e carteira", actions: [
        { id: "agency.leads.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.leads.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.leads.assign", label: "Atribuir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "agenda", label: "Agenda", actions: [
        { id: "agency.agenda.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.agenda.create", label: "Criar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.agenda.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.agenda.delete", label: "Excluir", checked: true, origin: "Perfil Corretor" },
      ] },
      { id: "selections", label: "Seleções", actions: [
        { id: "agency.selections.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.selections.create", label: "Criar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.selections.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.selections.send", label: "Enviar", checked: true, origin: "Perfil Corretor" },
      ] },
      { id: "opportunities", label: "Oportunidades", actions: [
        { id: "agency.opportunities.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.opportunities.update", label: "Alterar", checked: true, origin: "Perfil Corretor" },
        { id: "agency.opportunities.assign", label: "Atribuir", checked: false, origin: "Sem concessão" },
      ] },
      { id: "members", label: "Pessoas", actions: [
        { id: "agency.members.view", label: "Ver pessoas", checked: true, origin: "Concessão individual" },
        { id: "agency.members.invite", label: "Convidar", checked: false, origin: "Sem concessão" },
        { id: "agency.members.update", label: "Alterar", checked: false, origin: "Sem concessão" },
        { id: "agency.members.remove", label: "Remover", checked: false, origin: "Sem concessão" },
      ] },
      { id: "access", label: "Permissões", actions: [
        { id: "agency.access.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "agency.access.assign", label: "Atribuir", checked: false, origin: "Sem concessão" },
        { id: "agency.access.revoke", label: "Revogar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "links", label: "Vínculos de corretores", actions: [
        { id: "agency.links.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.links.decide", label: "Decidir vínculo", checked: false, origin: "Sem concessão" },
        { id: "agency.links.suspend", label: "Suspender", checked: false, origin: "Sem concessão" },
        { id: "agency.links.end", label: "Encerrar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "payouts", label: "Repasses", actions: [
        { id: "agency.payouts.view", label: "Ver", checked: true, origin: "Perfil Corretor" },
        { id: "agency.payouts.update", label: "Alterar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "billing", label: "Plano e cobrança", actions: [
        { id: "agency.billing.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "agency.billing.update", label: "Alterar", checked: false, origin: "Sem concessão" },
      ] },
      { id: "audit", label: "Auditoria", actions: [
        { id: "agency.audit.view", label: "Ver", checked: false, origin: "Sem concessão" },
        { id: "agency.audit.export", label: "Exportar", checked: false, origin: "Sem concessão" },
      ] },
    ],
  },
  {
    id: "broker",
    label: "Corretor",
    context: "Minha operação · OPR-004",
    status: "Ativo",
    profiles: ["Responsável pela operação"],
    modules: [
      { id: "personal-clients", label: "Clientes", actions: [
        { id: "personal.clients.view", label: "Ver", checked: true, origin: "Obrigatória", locked: true },
        { id: "personal.clients.create", label: "Criar", checked: true, origin: "Perfil do sistema" },
        { id: "personal.clients.update", label: "Alterar", checked: true, origin: "Perfil do sistema" },
        { id: "personal.clients.archive", label: "Arquivar", checked: true, origin: "Perfil do sistema" },
      ] },
      { id: "personal-agenda", label: "Agenda", actions: [
        { id: "personal.agenda.view", label: "Ver", checked: true, origin: "Perfil do sistema" },
        { id: "personal.agenda.create", label: "Criar", checked: true, origin: "Perfil do sistema" },
        { id: "personal.agenda.update", label: "Alterar", checked: true, origin: "Perfil do sistema" },
      ] },
    ],
  },
  {
    id: "client",
    label: "Cliente",
    context: "Conta cliente de Ana Lima · CLI-041",
    status: "Ativo",
    profiles: ["Membro da conta"],
    modules: [
      { id: "intents", label: "Buscas", actions: [
        { id: "account.intents.view", label: "Ver", checked: true, origin: "Obrigatória", locked: true },
        { id: "account.intents.create", label: "Criar", checked: true, origin: "Perfil do sistema" },
        { id: "account.intents.update", label: "Alterar", checked: true, origin: "Perfil do sistema" },
      ] },
      { id: "favorites", label: "Favoritos", actions: [
        { id: "account.favorites.view", label: "Ver", checked: true, origin: "Perfil do sistema" },
        { id: "account.favorites.create", label: "Adicionar", checked: true, origin: "Perfil do sistema" },
        { id: "account.favorites.delete", label: "Remover", checked: true, origin: "Perfil do sistema" },
      ] },
    ],
  },
];

const userActionCriteria: Record<UserAdministrativeAction, {
  title: string;
  description: string;
  criteria: UserActionCriterion[];
}> = {
  block: {
    title: "Bloquear conta",
    description: "Use quando a pessoa precisa sair de todas as áreas enquanto a equipe apura ou corrige um risco.",
    criteria: [
      {
        id: "account-risk",
        title: "Suspeita de acesso indevido",
        description: "Há indício de entrada fora do padrão, tentativa de tomada da conta ou uso por pessoa não autorizada.",
        subcriteria: ["Registrar o indício analisado", "Encerrar sessões abertas", "Definir quem libera a conta depois da revisão"],
      },
      {
        id: "formal-request",
        title: "Pedido formal da pessoa ou responsável",
        description: "A pessoa, a imobiliária responsável ou o representante legal pediu uma pausa temporária da conta.",
        subcriteria: ["Guardar o pedido recebido", "Confirmar quem solicitou", "Registrar a condição para liberar a conta"],
      },
      {
        id: "operational-risk",
        title: "Risco em vínculo profissional",
        description: "Um vínculo com imobiliária ou operação profissional precisa ser pausado antes de novos atendimentos.",
        subcriteria: ["Informar o vínculo afetado", "Preservar dados e histórico da relação", "Definir quem revisa a retomada"],
      },
    ],
  },
  delete: {
    title: "Excluir conta",
    description: "Use quando esta conta não deve voltar para a operação. A exclusão é lógica e preserva o histórico necessário.",
    criteria: [
      {
        id: "duplicate-account",
        title: "Conta duplicada consolidada",
        description: "A pessoa já opera por outra conta e os vínculos foram levados para o cadastro correto.",
        subcriteria: ["Indicar a conta que permanece", "Confirmar migração de vínculos", "Registrar por que esta conta sai"],
      },
      {
        id: "owner-request",
        title: "Pedido de exclusão atendido",
        description: "A pessoa pediu a exclusão e os dados que precisam ficar por auditoria já foram separados.",
        subcriteria: ["Guardar a solicitação", "Confirmar dados preservados por obrigação", "Registrar quem aprovou a exclusão"],
      },
      {
        id: "confirmed-abuse",
        title: "Uso indevido confirmado",
        description: "A análise confirmou falsidade, representação indevida ou tentativa de uso irregular da plataforma.",
        subcriteria: ["Citar a evidência confirmada", "Bloquear novas entradas e convites", "Registrar quem aprovou a exclusão"],
      },
    ],
  },
};

function createAccessSystems() {
  return createAccessSystemsFrom(accessSystems);
}

function createAccessSystemsFrom(systems: AccessSystem[]) {
  return systems.map((system) => ({
    ...system,
    profiles: [...system.profiles],
    modules: system.modules.map((module) => ({
      ...module,
      actions: module.actions.map((action) => ({ ...action })),
    })),
  }));
}

function createUserAccessSystems(isAna: boolean): AccessSystem[] {
  const systems = createAccessSystems();
  if (isAna) return systems;
  return systems.map((system) => {
    if (system.id === "client") return { ...system, context: "Conta cliente de Marina Torres · CLI-019" };
    const status: AccessSystem["status"] = system.id === "agency" ? "Aguardando aprovação" : "Sem acesso";
    return {
      ...system,
      context: system.id === "agency" ? "Horizonte Negócios · TNT-002" : system.context,
      status,
      profiles: [],
      modules: system.modules.map((module) => ({
        ...module,
        actions: module.actions.map((action) => ({ ...action, checked: false, origin: "Sem concessão", locked: false })),
      })),
    };
  });
}

const profileCapabilities: Record<string, string[]> = {
  "Identidades e acessos": [
    "platform.users.view",
    "platform.users.update_identity",
    "platform.users.manage_security",
    "platform.users.block",
    "platform.users.delete",
    "platform.access.view",
    "platform.access.create_profile",
    "platform.access.publish_profile",
    "platform.access.assign",
    "platform.access.revoke",
    "platform.access.view_audit",
  ],
  "Análise cadastral": [
    "platform.agencies.view",
    "platform.agencies.create",
    "platform.agencies.review",
    "platform.agencies.update_status",
    "platform.brokers.view",
    "platform.brokers.review",
    "platform.brokers.update_status",
  ],
  "Operação de dados": [
    "data.properties.view",
    "data.properties.update",
    "data.sources.view",
    "data.sources.create",
    "data.sources.update",
    "data.sources.run",
    "data.pipeline.view",
    "data.pipeline.run",
    "data.reviews.view",
    "data.reviews.decide",
    "data.analytics.view",
    "data.analytics.export",
  ],
  Suporte: [
    "platform.dashboard.view",
    "platform.agencies.view",
    "platform.brokers.view",
    "platform.clients.view",
    "platform.intents.view",
    "platform.users.view",
    "platform.users.manage_security",
    "platform.access.view_audit",
    "platform.audit.view",
  ],
  Auditor: [
    "platform.dashboard.view",
    "platform.agencies.view",
    "platform.brokers.view",
    "platform.clients.view",
    "platform.intents.view",
    "platform.users.view",
    "platform.access.view",
    "data.properties.view",
    "data.sources.view",
    "data.pipeline.view",
    "data.reviews.view",
    "data.analytics.view",
    "platform.parameters.view",
    "platform.versions.view",
    "platform.audit.view",
    "platform.audit.export",
  ],
  Corretor: [
    "agency.dashboard.view",
    "agency.profile.view",
    "agency.clients.view",
    "agency.clients.create",
    "agency.clients.update",
    "agency.clients.archive",
    "agency.intents.view",
    "agency.intents.create",
    "agency.intents.update",
    "agency.intents.delete",
    "agency.leads.view",
    "agency.leads.update",
    "agency.agenda.view",
    "agency.agenda.create",
    "agency.agenda.update",
    "agency.agenda.delete",
    "agency.selections.view",
    "agency.selections.create",
    "agency.selections.update",
    "agency.selections.send",
    "agency.opportunities.view",
    "agency.opportunities.update",
    "agency.links.view",
    "agency.payouts.view",
  ],
  "Atendimento comercial": [
    "agency.dashboard.view",
    "agency.clients.view",
    "agency.clients.create",
    "agency.clients.update",
    "agency.leads.view",
    "agency.leads.update",
    "agency.leads.assign",
    "agency.agenda.view",
    "agency.agenda.create",
    "agency.agenda.update",
    "agency.selections.view",
    "agency.selections.create",
    "agency.selections.update",
    "agency.selections.send",
  ],
  "Administrador da equipe": [
    "agency.dashboard.view",
    "agency.profile.view",
    "agency.clients.view",
    "agency.clients.create",
    "agency.clients.update",
    "agency.clients.archive",
    "agency.clients.assign",
    "agency.intents.view",
    "agency.intents.create",
    "agency.intents.update",
    "agency.intents.delete",
    "agency.leads.view",
    "agency.leads.update",
    "agency.leads.assign",
    "agency.agenda.view",
    "agency.agenda.create",
    "agency.agenda.update",
    "agency.agenda.delete",
    "agency.selections.view",
    "agency.selections.create",
    "agency.selections.update",
    "agency.selections.send",
    "agency.opportunities.view",
    "agency.opportunities.update",
    "agency.opportunities.assign",
    "agency.members.view",
    "agency.members.invite",
    "agency.members.update",
    "agency.members.remove",
    "agency.access.view",
    "agency.access.assign",
    "agency.access.revoke",
    "agency.links.view",
    "agency.links.decide",
    "agency.links.suspend",
    "agency.links.end",
    "agency.payouts.view",
    "agency.audit.view",
  ],
  Financeiro: [
    "agency.dashboard.view",
    "agency.clients.view",
    "agency.leads.view",
    "agency.payouts.view",
    "agency.payouts.update",
    "agency.billing.view",
    "agency.billing.update",
  ],
  Consulta: [
    "agency.dashboard.view",
    "agency.profile.view",
    "agency.clients.view",
    "agency.intents.view",
    "agency.leads.view",
    "agency.agenda.view",
    "agency.selections.view",
    "agency.opportunities.view",
    "agency.members.view",
    "agency.access.view",
    "agency.links.view",
    "agency.payouts.view",
    "agency.billing.view",
    "agency.audit.view",
  ],
};

const profileDescriptions: Record<string, string> = {
  "Identidades e acessos": "Gerencia usuários, segurança da conta e perfis de permissão no Backoffice Domuz.",
  "Análise cadastral": "Analisa cadastros de imobiliárias e perfis profissionais de corretores.",
  "Operação de dados": "Acompanha imóveis, fontes, revisões e publicação de dados da base.",
  Suporte: "Consulta cadastros e ajuda pessoas sem alterar decisões sensíveis.",
  Auditor: "Consulta dados e históricos para conferência, sem mudar cadastros.",
  "Administrador da equipe": "Administra a imobiliária, a equipe e os vínculos com corretores.",
  Corretor: "Atende clientes, cria buscas, agenda visitas e acompanha oportunidades.",
  Financeiro: "Consulta e ajusta repasses, plano e cobrança da imobiliária.",
  Consulta: "Entra para consultar dados da imobiliária sem alterar a operação.",
  "Atendimento comercial": "Atende leads, clientes, buscas, agenda e seleções da imobiliária.",
  "Responsável pela operação": "Administra a operação pessoal da corretora.",
  "Membro da conta": "Usa a conta de cliente para buscas e favoritos.",
};

function permissionTitle(module: AccessModule, action: AccessAction) {
  if (action.label.toLocaleLowerCase("pt-BR").includes(module.label.toLocaleLowerCase("pt-BR"))) return action.label;
  return `${action.label} ${module.label.toLocaleLowerCase("pt-BR")}`;
}

function permissionExample(action: AccessAction) {
  const label = action.label.toLocaleLowerCase("pt-BR");
  if (label.startsWith("ver")) return "abrir listas e detalhes";
  if (label.startsWith("criar") || label.startsWith("cadastrar") || label.startsWith("adicionar")) return "registrar um novo item";
  if (label.startsWith("alterar") || label.startsWith("editar")) return "editar dados existentes";
  if (label.startsWith("revisar") || label.startsWith("decidir")) return "concluir uma análise ou solicitação";
  if (label.startsWith("atribuir")) return "passar um item para outra pessoa da equipe";
  if (label.startsWith("revogar") || label.startsWith("remover")) return "retirar uma liberação anterior";
  if (label.startsWith("bloquear") || label.startsWith("suspender")) return "bloquear uma operação";
  if (label.startsWith("excluir") || label.startsWith("arquivar")) return "tirar o item da operação sem apagar o histórico";
  if (label.startsWith("executar")) return "iniciar uma rotina operacional";
  if (label.startsWith("exportar") || label.startsWith("baixar")) return "gerar arquivo para conferência";
  if (label.startsWith("publicar")) return "liberar a versão para uso";
  if (label.startsWith("convidar")) return "chamar uma pessoa para entrar";
  if (label.startsWith("enviar")) return "mandar a seleção para o cliente";
  return "usar esta função";
}

function permissionDescription(module: AccessModule, action: AccessAction) {
  const scope = module.label.toLocaleLowerCase("pt-BR");
  if (!action.checked) return `Não libera ${permissionExample(action)} em ${scope}.`;
  return `${action.origin}. Libera ${permissionExample(action)} em ${scope}.`;
}

function applyProfiles(system: AccessSystem, profiles: string[]): AccessSystem {
  return {
    ...system,
    profiles,
    status: profiles.length ? "Ativo" : system.id === "agency" ? system.status : "Sem acesso",
    modules: system.modules.map((module) => ({
      ...module,
      actions: module.actions.map((action) => {
        if (action.locked || action.origin.toLocaleLowerCase("pt-BR").includes("individual")) return action;
        const source = profiles.find((profile) => profileCapabilities[profile]?.includes(action.id));
        return {
          ...action,
          checked: Boolean(source),
          origin: source ? `Perfil ${source}` : "Sem concessão",
        };
      }),
    })),
  };
}

const userDetailSubnav = [
  { href: "#general", label: "Geral", description: "Identidade e origem" },
  { href: "#roles", label: "Vínculos", description: "Onde a pessoa atua" },
  { href: "#access", label: "Permissões", description: "O que pode fazer" },
  { href: "#security", label: "Segurança", description: "Entrada e sessões" },
  { href: "#history", label: "Histórico", description: "Eventos da conta" },
  { href: "#administration", label: "Administração", description: "Bloqueio e exclusão" },
];

const userDetailSections: Record<UserDetailView, Array<{ id: string; label: string }>> = {
  general: [{ id: "user-identity", label: "Identidade" }, { id: "user-origin", label: "Origem da conta" }],
  roles: [{ id: "user-links", label: "Vínculos" }],
  access: [{ id: "user-access", label: "Permissões" }],
  security: [{ id: "user-signin", label: "Métodos de entrada" }, { id: "user-sessions", label: "Sessões recentes" }],
  history: [{ id: "user-history", label: "Histórico da conta" }],
  administration: [{ id: "user-block", label: "Bloquear conta" }, { id: "user-delete", label: "Excluir conta" }],
};

const initialUserEvents: TimelineEvent[] = [
  { id: "user-event-5", timestamp: "2026-07-24T10:10:00-03:00", title: "Responsável da Horizonte atualizado", description: "A troca ficou registrada no cadastro da imobiliária. O histórico da conta mostra quem fez a alteração.", actor: { name: "André Martins", initials: "AM", seed: "USR-001" }, status: { label: "Ativo", tone: "good" } },
  { id: "user-event-4", timestamp: "2026-07-23T09:12:00-03:00", title: "Entrada confirmada", description: "Senha e código do celular foram confirmados.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002" }, status: { label: "Ativo", tone: "good" } },
  { id: "user-event-3", timestamp: "2026-07-20T14:30:00-03:00", title: "Papel Cliente incluído", description: "Marina também passou a usar a Domuz.app para buscar um imóvel.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002" }, status: { label: "Ativo", tone: "good" } },
  { id: "user-event-2", timestamp: "2026-07-18T10:18:00-03:00", title: "Telefone confirmado", description: "O número +55 (31) 99999-1234 foi confirmado por código.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002" }, status: { label: "Ativo", tone: "good" } },
  { id: "user-event-1", timestamp: "2026-07-18T10:04:00-03:00", title: "Conta criada", description: "Marina criou a conta para iniciar o cadastro da Horizonte Negócios. A administração da imobiliária depende da aprovação do cadastro.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002" }, status: { label: "Ativo", tone: "good" } },
];

const initialAnaEvents: TimelineEvent[] = [
  { id: "ana-event-4", timestamp: "2026-07-24T16:40:00-03:00", title: "Entrada confirmada", description: "Senha e código do celular foram confirmados.", actor: { name: "Ana Lima", initials: "AL", seed: "USR-004" }, status: { label: "Ativo", tone: "good" } },
  { id: "ana-event-3", timestamp: "2026-07-22T15:20:00-03:00", title: "Vínculo aceito", description: "A Andrade Imóveis aceitou o vínculo com o perfil profissional COR-021.", actor: { name: "Andrade Imóveis", initials: "AI", seed: "TNT-001" }, status: { label: "Ativo", tone: "good" } },
  { id: "ana-event-2", timestamp: "2026-07-20T11:15:00-03:00", title: "Perfil profissional aprovado", description: "A equipe Domuz concluiu a verificação do perfil COR-021.", actor: { name: "André Martins", initials: "AM", seed: "USR-001" }, status: { label: "Ativo", tone: "good" } },
  { id: "ana-event-1", timestamp: "2026-07-18T09:40:00-03:00", title: "Conta criada", description: "Ana criou a conta para cadastrar seu perfil profissional.", actor: { name: "Ana Lima", initials: "AL", seed: "USR-004" }, status: { label: "Ativo", tone: "good" } },
];

const serviceLogoUrls = {
  google: "https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png",
  chrome: "https://www.google.com/chrome/static/images/chrome-logo-m100.svg",
  safari: "https://www.apple.com/favicon.ico",
};

function ServiceLogo({ src, label }: { src: string; label: string }) {
  return <img className={styles.serviceLogo} src={src} alt="" aria-label={label} referrerPolicy="no-referrer" />;
}

const userEventCategories = ["Conta", "Vínculo", "Permissões", "Segurança"] as const;
type UserEventCategory = (typeof userEventCategories)[number];

function eventText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function userEventCategory(event: TimelineEvent): UserEventCategory {
  const text = `${eventText(event.title)} ${eventText(event.description)} ${event.actor?.name ?? ""} ${event.status?.label ?? ""}`.toLocaleLowerCase("pt-BR");
  if (text.includes("permiss")) return "Permissões";
  if (text.includes("vínculo") || text.includes("responsável") || text.includes("papel") || text.includes("perfil profissional")) return "Vínculo";
  if (text.includes("entrada") || text.includes("telefone") || text.includes("celular") || text.includes("sessão") || text.includes("senha") || text.includes("google")) return "Segurança";
  return "Conta";
}

export function PlatformUserDetailPage({
  user = platformUsers[1],
  initialView = "general",
  accessSaveMode = "success",
}: {
  user?: PlatformUser;
  initialView?: UserDetailView;
  accessSaveMode?: AccessSaveMode;
}) {
  const isAna = user.id === "USR-004";
  const [activeView, setActiveView] = useState<UserDetailView>(initialView);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(isAna ? "(31) 98888-2041" : "(31) 99999-1234");
  const [country, setCountry] = useState("BR");
  const [committedAccess, setCommittedAccess] = useState<AccessSystem[]>(() => createUserAccessSystems(isAna));
  const [draftAccess, setDraftAccess] = useState<AccessSystem[]>(() => createUserAccessSystems(isAna));
  const [activeAccessSystem, setActiveAccessSystem] = useState<AccessSystemId>(isAna ? "agency" : "backoffice");
  const [accessEditing, setAccessEditing] = useState(false);
  const [accessReviewOpen, setAccessReviewOpen] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [accessError, setAccessError] = useState("");
  const [profileChoice, setProfileChoice] = useState("");
  const [googleConnected, setGoogleConnected] = useState(isAna);
  const [phoneChangeStep, setPhoneChangeStep] = useState<"closed" | "phone" | "code">("closed");
  const [nextPhone, setNextPhone] = useState(phone);
  const [nextCountry, setNextCountry] = useState(country);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sessions, setSessions] = useState([
    { id: "current", title: "Chrome no macOS", location: "Belo Horizonte, MG", meta: "Hoje, 09:12 · sessão atual", current: true },
    { id: "iphone", title: "Safari no iPhone", location: "Nova Lima, MG", meta: "22 jul. 2026, 18:46", current: false },
  ]);
  const [accountStatus, setAccountStatus] = useState<UserAccountStatus>("Ativo");
  const [adminAction, setAdminAction] = useState<UserAdministrativeAction | null>(null);
  const [adminCriterion, setAdminCriterion] = useState("");
  const [adminChecks, setAdminChecks] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [events, setEvents] = useState<TimelineEvent[]>(isAna ? initialAnaEvents : initialUserEvents);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState<UserEventCategory | "Todos">("Todos");
  const [eventActor, setEventActor] = useState("Todos");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(5);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState(userNotifications);
  const [stickyVisible, setStickyVisible] = useState(false);
  const pageHeaderRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = pageHeaderRef.current;
    if (!header || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { rootMargin: "-60px 0px 0px" });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const statusTone = accountStatus === "Ativo" ? "success" : "danger";
  const activeAdminConfig = adminAction ? userActionCriteria[adminAction] : null;
  const selectedAdminCriterion = activeAdminConfig?.criteria.find((criterion) => criterion.id === adminCriterion);
  const selectedAdminChecks = selectedAdminCriterion?.subcriteria.filter((item) => adminChecks[item]) ?? [];
  const adminActionReady = Boolean(adminCriterion)
    && selectedAdminChecks.length === (selectedAdminCriterion?.subcriteria.length ?? 0)
    && Boolean(reason.trim())
    && confirmation === email;
  const notify = (title: string, description?: string) => setToasts([{ id: title, title, description, tone: "success", duration: 4000 }]);
  const addEvent = (title: string, description: string, status = accountStatus) => {
    setEvents((current) => [{
      id: `user-event-${current.length + 1}`,
      timestamp: "2026-07-23T18:30:00-03:00",
      title,
      description,
      actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
      status: { label: status, tone: status === "Ativo" ? "good" : "critical" },
    }, ...current]);
  };

  const changeView = (href: string) => setActiveView(href.slice(1) as UserDetailView);
  const saveIdentity = () => {
    setEditing(false);
    addEvent("Dados da conta atualizados", "Nome, e-mail ou telefone foram revisados pelo administrador Domuz.");
    notify("Dados salvos", `As alterações já aparecem na conta de ${name}.`);
  };
  const beginAccessEditing = () => {
    setDraftAccess(createAccessSystemsFrom(committedAccess));
    setAccessError("");
    setAccessEditing(true);
  };
  const cancelAccessEditing = () => {
    setDraftAccess(createAccessSystemsFrom(committedAccess));
    setAccessError("");
    setAccessEditing(false);
  };
  const toggleAccessAction = (systemId: AccessSystemId, moduleId: string, actionId: string) => {
    setDraftAccess((current) => current.map((system) => system.id !== systemId ? system : {
      ...system,
      modules: system.modules.map((module) => module.id !== moduleId ? module : {
        ...module,
        actions: module.actions.map((action) => action.id !== actionId || action.locked ? action : {
          ...action,
          checked: !action.checked,
          origin: action.checked ? "Revogação individual pendente" : "Concessão individual pendente",
        }),
      }),
    }));
  };
  const setAccessModuleActions = (systemId: AccessSystemId, moduleId: string, checked: boolean) => {
    setDraftAccess((current) => current.map((system) => system.id !== systemId ? system : {
      ...system,
      modules: system.modules.map((module) => module.id !== moduleId ? module : {
        ...module,
        actions: module.actions.map((action) => action.locked || action.checked === checked ? action : {
          ...action,
          checked,
          origin: checked ? "Concessão individual pendente" : "Revogação individual pendente",
        }),
      }),
    }));
  };
  const addAccessProfile = (systemId: AccessSystemId) => {
    if (!profileChoice) return;
    setDraftAccess((current) => current.map((system) => {
      if (system.id !== systemId || system.profiles.includes(profileChoice)) return system;
      return applyProfiles(system, [...system.profiles, profileChoice]);
    }));
    setProfileChoice("");
  };
  const removeAccessProfile = (systemId: AccessSystemId, profile: string) => {
    setDraftAccess((current) => current.map((system) => {
      if (system.id !== systemId) return system;
      return applyProfiles(system, system.profiles.filter((item) => item !== profile));
    }));
  };
  const saveAccessChanges = () => {
    if (accessSaveMode === "error") {
      setAccessReviewOpen(false);
      setAccessError("Não foi possível salvar. Nenhuma permissão mudou. Confira sua conexão e tente de novo.");
      return;
    }
    const savedAccess = createAccessSystemsFrom(draftAccess).map((system) => ({
      ...system,
      modules: system.modules.map((module) => ({
        ...module,
        actions: module.actions.map((action) => ({
          ...action,
          origin: action.origin.replace(" pendente", ""),
        })),
      })),
    }));
    setCommittedAccess(savedAccess);
    setDraftAccess(savedAccess);
    setAccessReviewOpen(false);
    setAccessEditing(false);
    setAccessError("");
    const changedSystem = savedAccess.find((system) => system.id === activeAccessSystem) ?? savedAccess[0];
    addEvent(
      `Permissões em ${changedSystem.label} atualizadas`,
      `André Martins alterou perfis e permissões em ${changedSystem.context}. Motivo: ${accessReason}.`,
    );
    notify("Permissões salvas", `A mudança já aparece no usuário em ${changedSystem.context}.`);
    setAccessReason("");
  };
  const confirmPhoneChange = () => {
    if (otpCode !== "123456") {
      setOtpError("Código incorreto. Confira os seis dígitos e tente novamente.");
      return;
    }
    setPhone(nextPhone);
    setCountry(nextCountry);
    setPhoneChangeStep("closed");
    setOtpCode("");
    setOtpError("");
    addEvent("Celular confirmado", `O telefone de confirmação foi alterado para +55 ${nextPhone}.`);
    notify("Celular alterado", "As próximas entradas usarão o novo número.");
  };
  const closePhoneChange = () => {
    setNextPhone(phone);
    setNextCountry(country);
    setOtpCode("");
    setOtpError("");
    setPhoneChangeStep("closed");
  };
  const endSessions = (id?: string) => {
    const ended = id == null ? sessions.filter((session) => !session.current) : sessions.filter((session) => session.id === id);
    setSessions((current) => id == null ? current.filter((session) => session.current) : current.filter((session) => session.id !== id));
    if (!ended.length) return;
    addEvent(ended.length === 1 ? "Sessão encerrada" : "Outras sessões encerradas", ended.map((session) => session.title).join(", "));
    notify(ended.length === 1 ? "Sessão encerrada" : "Outras sessões encerradas");
  };
  const resetAdminAction = () => {
    setAdminAction(null);
    setAdminCriterion("");
    setAdminChecks({});
    setReason("");
    setConfirmation("");
  };
  const confirmAdminAction = () => {
    if (!selectedAdminCriterion) return;
    const adminReason = `${selectedAdminCriterion.title}: ${selectedAdminChecks.join("; ")}. ${reason.trim()}`;
    if (adminAction === "block") {
      setAccountStatus("Bloqueado");
      addEvent("Conta bloqueada", adminReason, "Bloqueado");
      notify("Acesso bloqueado", `${name} não consegue entrar até a conta ser liberada.`);
    } else {
      setAccountStatus("Excluído");
      addEvent("Conta excluída logicamente", adminReason, "Excluído");
      notify("Conta excluída", "Os dados e o histórico foram preservados.");
    }
    resetAdminAction();
  };
  const reactivate = () => {
    setAccountStatus("Ativo");
    addEvent("Acesso liberado", "André Martins liberou uma nova entrada da conta.", "Ativo");
    notify("Acesso liberado", `${name} já pode entrar novamente.`);
  };
  const filteredUserEvents = useMemo(() => {
    const query = eventSearch.trim().toLocaleLowerCase("pt-BR");
    return events.filter((event) => {
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(event.timestamp));
      const category = userEventCategory(event);
      const text = `${eventText(event.title)} ${eventText(event.description)} ${event.actor?.name ?? ""} ${category} ${event.status?.label ?? ""}`.toLocaleLowerCase("pt-BR");
      return (!query || text.includes(query))
        && (eventCategory === "Todos" || category === eventCategory)
        && (eventActor === "Todos" || event.actor?.name === eventActor)
        && (!eventStart || day >= eventStart)
        && (!eventEnd || day <= eventEnd);
    });
  }, [eventActor, eventCategory, eventEnd, eventSearch, eventStart, events]);
  const userEventPageCount = Math.max(1, Math.ceil(filteredUserEvents.length / eventPageSize));
  const visibleUserEvents = filteredUserEvents.slice((eventPage - 1) * eventPageSize, eventPage * eventPageSize);

  useEffect(() => {
    if (eventPage > userEventPageCount) setEventPage(userEventPageCount);
  }, [eventPage, userEventPageCount]);

  return (
    <>
      <AppShell
        theme="dommus-admin"
        contentMaxWidth={9999}
        sidebar={{ ...backofficeSidebar, defaultActiveId: "users" }}
        topbar={{
          showBrand: false,
          crumbs: [
            { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
            { label: "Usuários", onClick: () => openStory(usersStory) },
            { label: name },
          ],
          searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
          onSearchClick: () => setCommandOpen(true),
          actions: <NotificationBell items={notifications} onItemClick={(item) => setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry))} onMarkAllRead={() => setNotifications((current) => current.map((entry) => ({ ...entry, unread: false })))} />,
        }}
      >
        <StickyBar
          visible={stickyVisible}
          title={<span className={styles.userDetailTitle}><Avatar size="sm" initials={user.initials} seed={user.id} /><span>{name}</span></span>}
          meta={user.id}
          status={<Badge tone={statusTone} dot>{accountStatus}</Badge>}
        />
        <main className={styles.userDetailPage}>
          <PageHeader
            ref={pageHeaderRef}
            title={<span className={styles.userDetailTitle}><Avatar size="md" initials={user.initials} seed={user.id} /><span>{name}</span></span>}
            lead={<span className={styles.userDetailLead}><Badge tone={statusTone} dot>{accountStatus}</Badge><span className={styles.userId}>{user.id}</span><span>{email}</span></span>}
          />

          <div className={styles.userDetailLayout}>
            <SettingsSubnav
              className={styles.userDetailSubnav}
              label="Áreas do usuário"
              items={userDetailSubnav}
              activeHref={`#${activeView}`}
              renderLink={(item, linkProps) => <a {...linkProps} onClick={(event) => { event.preventDefault(); changeView(item.href); }} />}
            />

            <div className={styles.userDetailContent}>
              {activeView === "general" && (
                <>
                  <section className={styles.userDetailSection} aria-labelledby="user-identity">
                    <SectionHeader id="user-identity" title="Identidade" sub="Dados da pessoa usados em todos os papéis e vínculos." action={<Button size="sm" onClick={() => setEditing((current) => !current)}>{editing ? "Cancelar edição" : "Editar dados"}</Button>} />
                    <Card className={styles.userDetailCard}>
                      <div className={styles.userAvatarEditor}>
                        <Avatar size="xl" initials={user.initials} seed={user.id} />
                        <div><strong>Avatar da pessoa</strong><span>{name} pode trocar a imagem na própria conta.</span><Button size="sm">Trocar avatar</Button></div>
                      </div>
                      <div className={styles.userDetailForm}>
                        <Input label="Nome completo" value={name} disabled={!editing} onChange={(event) => setName(event.target.value)} />
                        <Input label="ID da conta" value={user.id} disabled />
                        <Input label="E-mail" type="email" value={email} disabled={!editing} onChange={(event) => setEmail(event.target.value)} />
                        <PhoneInput label="Telefone confirmado" country={country} onCountryChange={(next) => setCountry(next.code)} value={phone} disabled={!editing} onChange={(event) => setPhone(event.target.value)} />
                      </div>
                      {editing && <div className={styles.userDetailActions}><Button size="sm" variant="primary" onClick={saveIdentity}>Salvar alterações</Button></div>}
                    </Card>
                  </section>

                  <section className={styles.userDetailSection} aria-labelledby="user-origin">
                    <SectionHeader
                      id="user-origin"
                      title="Origem da conta"
                      sub={isAna
                        ? "Ana criou esta conta quando iniciou o perfil profissional. A verificação acontece no cadastro da corretora."
                        : "Marina criou esta conta no cadastro da Horizonte Negócios. O status abaixo é da análise da imobiliária."}
                    />
                    <div className={styles.userNavCards}>
                      {isAna ? (
                        <NavCard
                          href={`/?path=/story/${brokerDetailStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar size="lg" initials="AL" seed="USR-004" />}
                          title="Perfil profissional de Ana Lima"
                          description="COR-021 · verificação cadastral da corretora"
                          meta={<Badge tone="success">Verificação aprovada</Badge>}
                        />
                      ) : (
                        <NavCard
                          href={`/?path=/story/${agencyReviewStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar shape="square" size="lg" initials="HN" seed="TNT-002" />}
                          title="Imobiliária Horizonte Negócios"
                          description="TNT-002 · análise da imobiliária"
                          meta={<Badge tone="warn">Cadastro em análise</Badge>}
                        />
                      )}
                    </div>
                  </section>
                </>
              )}

              {activeView === "roles" && (
                <section className={styles.userDetailSection} aria-labelledby="user-links">
                  <SectionHeader id="user-links" title="Vínculos" sub="Vínculo é a relação da pessoa com uma imobiliária, operação ou conta. O tipo diz qual papel ela exerce nessa relação." />
                  <div className={styles.userNavCards} aria-label="Vínculos do usuário">
                    {isAna ? (
                      <>
                        <NavCard
                          href={`/?path=/story/${brokerDetailStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar size="lg" initials="AL" seed="USR-004" />}
                          title="Minha operação"
                          description="COR-021 · operação pessoal"
                          meta={<span className={styles.userBadges}><Badge tone="info">Responsável pela operação</Badge><Badge tone="success">Ativo</Badge></span>}
                        />
                        <NavCard
                          href={`/?path=/story/${affiliationRequestsStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar shape="square" size="lg" initials="AI" seed="TNT-001" />}
                          title="Andrade Imóveis"
                          description="Vínculo aprovado pela imobiliária"
                          meta={<span className={styles.userBadges}><Badge tone="info">Corretora associada</Badge><Badge tone="success">Ativo</Badge></span>}
                        />
                        <NavCard
                          href={`/?path=/story/${brokerAccountStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar size="lg" initials="AL" seed="CLI-041" />}
                          title="Conta cliente de Ana Lima"
                          description="CLI-041 · conta de busca"
                          meta={<span className={styles.userBadges}><Badge tone="info">Membro da conta</Badge><Badge tone="success">Ativo</Badge></span>}
                        />
                      </>
                    ) : (
                      <>
                        <NavCard
                          href={`/?path=/story/${agencyReviewStory}&globals=viewport:desktop1440`}
                          target="_top"
                          leading={<Avatar shape="square" size="lg" initials="HN" seed="TNT-002" />}
                          title="Horizonte Negócios"
                          description="TNT-002 · análise da imobiliária"
                          meta={<span className={styles.userBadges}><Badge tone="info">Responsável pela imobiliária</Badge><Badge tone="warn">Cadastro em análise</Badge></span>}
                        />
                      </>
                    )}
                  </div>
                </section>
              )}

              {activeView === "access" && (() => {
                const visibleSystems = draftAccess;
                const selectedSystem = visibleSystems.find((system) => system.id === activeAccessSystem) ?? visibleSystems[0];
                const enabledCount = selectedSystem.modules.flatMap((module) => module.actions).filter((action) => action.checked).length;
                return (
                  <>
                    <section className={styles.userDetailSection} id="user-access" aria-labelledby="user-access-title">
                      <SectionHeader
                        id="user-access-title"
                        title="Permissões"
                        sub="Escolha o contexto e revise perfis e ações liberadas no mesmo lugar."
                        action={!accessEditing && accessSaveMode !== "readonly" ? <Button size="sm" onClick={beginAccessEditing}>Gerenciar permissões</Button> : undefined}
                      />
                      {accountStatus !== "Ativo" && (
                        <Callout tone="danger" title="A conta está bloqueada">
                          As permissões continuam registradas, mas não dão acesso enquanto a conta estiver bloqueada.
                        </Callout>
                      )}
                      {accessSaveMode === "readonly" && (
                        <Callout tone="warn" title="Você pode consultar, mas não alterar">
                          Seu acesso não permite conceder ou retirar permissões desta pessoa.
                        </Callout>
                      )}
                      {accessError && <Callout tone="danger" title="As permissões não foram salvas">{accessError}</Callout>}
                      <div className={styles.permissionsWorkspace}>
                        <Card padding="none" className={styles.permissionContextPanel}>
                          <SettingRowGroup aria-label="Contextos de permissão">
                            {visibleSystems.map((system) => (
                              <SettingRow
                                key={system.id}
                                className={system.id === selectedSystem.id ? styles.accessSystemSelected : undefined}
                                title={system.label}
                                description={system.context}
                                meta={system.profiles.length ? `${system.profiles.length} perfil${system.profiles.length > 1 ? "s" : ""} atribuído${system.profiles.length > 1 ? "s" : ""}` : "Nenhum perfil atribuído"}
                                actions={<Badge tone={system.status === "Ativo" ? "success" : system.status === "Aguardando aprovação" ? "warn" : "neutral"}>{system.status}</Badge>}
                                onClick={() => { setActiveAccessSystem(system.id); setProfileChoice(""); }}
                                showChevron={false}
                                aria-pressed={system.id === selectedSystem.id}
                              />
                            ))}
                          </SettingRowGroup>
                        </Card>
                        <div className={styles.permissionDetail}>
                          <SectionHeader
                            title={selectedSystem.context}
                            sub={`${selectedSystem.label} · perfis e concessões individuais`}
                            count={enabledCount}
                          />
                          <Card padding="none">
                            <SettingRowGroup aria-label={`Perfis em ${selectedSystem.label}`}>
                              {selectedSystem.profiles.map((profile) => (
                                <SettingRow
                                  key={profile}
                                  title={profile}
                                  description={profileDescriptions[profile] ?? "Perfil atribuído neste contexto."}
                                  actions={accessEditing && selectedSystem.id !== "broker" && selectedSystem.id !== "client"
                                    ? <Button size="sm" variant="danger" onClick={() => removeAccessProfile(selectedSystem.id, profile)}>Remover</Button>
                                    : <Badge tone="success">Ativo</Badge>}
                                />
                              ))}
                              {!selectedSystem.profiles.length && <SettingRow title="Sem perfil neste contexto" description="A pessoa não recebeu um perfil de acesso aqui." />}
                            </SettingRowGroup>
                          </Card>
                          {accessEditing && selectedSystem.id !== "broker" && selectedSystem.id !== "client" && (
                            <Card className={styles.permissionProfileAdd}>
                              <Select label="Adicionar perfil" value={profileChoice} onChange={(event) => setProfileChoice(event.target.value)}>
                                <option value="">Escolha um perfil</option>
                                {(selectedSystem.id === "backoffice" ? platformAccessProfileOptions : agencyAccessProfileOptions)
                                  .filter((profile) => !selectedSystem.profiles.includes(profile))
                                  .map((profile) => <option key={profile}>{profile}</option>)}
                              </Select>
                              <Button size="sm" disabled={!profileChoice} onClick={() => addAccessProfile(selectedSystem.id)}>Adicionar perfil</Button>
                            </Card>
                          )}
                          <Card>
                            <Accordion
                              key={selectedSystem.id}
                              type="multiple"
                              defaultValue={selectedSystem.modules[0] ? [selectedSystem.modules[0].id] : []}
                              items={selectedSystem.modules.map((module) => {
                                const checkedCount = module.actions.filter((action) => action.checked).length;
                                const unlockedActions = module.actions.filter((action) => !action.locked);
                                const allUnlockedChecked = unlockedActions.length > 0 && unlockedActions.every((action) => action.checked);
                                return {
                                  id: module.id,
                                  title: <span className={styles.accessAccordionTitle}><span>{module.label}</span><Badge tone={checkedCount ? "success" : "neutral"}>{checkedCount} de {module.actions.length}</Badge></span>,
                                  content: (
                                    <div className={styles.accessActions}>
                                      {accessEditing && (
                                        <div className={styles.accessModuleBulk}>
                                          <span>{checkedCount} permissão{checkedCount === 1 ? "" : "ões"} liberada{checkedCount === 1 ? "" : "s"}</span>
                                          <Button size="sm" variant="ghost" disabled={!unlockedActions.length} onClick={() => setAccessModuleActions(selectedSystem.id, module.id, !allUnlockedChecked)}>
                                            {allUnlockedChecked ? "Desmarcar todas" : "Marcar todas"}
                                          </Button>
                                        </div>
                                      )}
                                      {module.actions.map((action) => (
                                        <Checkbox
                                          key={action.id}
                                          id={`${selectedSystem.id}-${action.id}`}
                                          label={permissionTitle(module, action)}
                                          description={permissionDescription(module, action)}
                                          checked={action.checked}
                                          disabled={!accessEditing || action.locked}
                                          onChange={() => toggleAccessAction(selectedSystem.id, module.id, action.id)}
                                          boxed
                                        />
                                      ))}
                                    </div>
                                  ),
                                };
                              })}
                            />
                          </Card>
                        </div>
                      </div>
                      {accessEditing && (
                        <StickyFooter
                          start={`Você está alterando somente ${selectedSystem.label}. Os outros sistemas não mudam.`}
                        >
                          <Button size="sm" onClick={cancelAccessEditing}>Cancelar</Button>
                          <Button size="sm" variant="primary" onClick={() => setAccessReviewOpen(true)}>Revisar alterações</Button>
                        </StickyFooter>
                      )}
                    </section>
                  </>
                );
              })()}

              {activeView === "security" && (
                <>
                  <section className={styles.userDetailSection} aria-labelledby="user-signin">
                    <SectionHeader id="user-signin" title="Métodos de entrada" sub="Estas credenciais pertencem à conta global. Elas não criam papel, perfil de acesso nem vínculo." />
                    <Card className={styles.userDetailCard}>
                      <SettingRowGroup aria-label="Métodos de entrada">
                        <SettingRow title="E-mail e senha" description={email} meta="Credencial principal · senha alterada em 18 jul. 2026" actions={<Button size="sm" onClick={() => { notify("E-mail enviado", `${name} recebeu o link para criar uma nova senha.`); addEvent("Recuperação de senha enviada", "O administrador enviou um link de recuperação para o e-mail principal."); }}>Enviar redefinição</Button>} />
                        <SettingRow title="Confirmação por WhatsApp" description={`+55 ${phone}`} meta="Confirma novas entradas · verificado em 18 jul. 2026" actions={<Button size="sm" onClick={() => setPhoneChangeStep("phone")}>Trocar celular</Button>} />
                        <SettingRow
                          leading={<ServiceLogo src={serviceLogoUrls.google} label="Google" />}
                          leadingFrame
                          title="Google"
                          description={googleConnected ? email : "Nenhuma conta Google está vinculada."}
                          meta={googleConnected ? "Credencial opcional vinculada" : "A pessoa conclui a conexão pela própria conta"}
                          actions={googleConnected
                            ? <Button size="sm" variant="danger" onClick={() => { setGoogleConnected(false); addEvent("Google desvinculado", "A conta continua entrando com e-mail, senha e confirmação pelo celular."); notify("Google desvinculado"); }}>Desvincular</Button>
                            : <Button size="sm" onClick={() => { addEvent("Vínculo com Google solicitado", "A pessoa recebeu o link para vincular a própria conta Google."); notify("Solicitação enviada", `${name} recebeu o link por e-mail.`); }}>Vincular conta</Button>}
                        />
                      </SettingRowGroup>
                    </Card>
                  </section>

                  <section className={styles.userDetailSection} aria-labelledby="user-sessions">
                    <SectionHeader
                      id="user-sessions"
                      title="Sessões recentes"
                      sub="Dispositivos com entrada confirmada nesta conta."
                      count={sessions.length}
                      action={sessions.some((session) => !session.current) ? <Button size="sm" variant="danger" onClick={() => endSessions()}>Encerrar outras sessões</Button> : undefined}
                    />
                    <Card className={styles.userDetailCard}>
                      {sessions.length ? (
                        <SettingRowGroup aria-label="Sessões recentes">
                          {sessions.map((session) => (
                            <SettingRow
                              key={session.id}
                              leading={<ServiceLogo src={session.id === "current" ? serviceLogoUrls.chrome : serviceLogoUrls.safari} label={session.id === "current" ? "Chrome" : "Safari"} />}
                              leadingFrame
                              title={session.title}
                              description={session.location}
                              meta={session.meta}
                              actions={<><Badge tone={session.current ? "success" : "neutral"}>{session.current ? "Atual" : "Aberta"}</Badge><Button size="sm" variant="danger" onClick={() => endSessions(session.id)}>Encerrar sessão</Button></>}
                            />
                          ))}
                        </SettingRowGroup>
                      ) : (
                        <EmptyState bordered={false} title="Nenhuma sessão aberta" message="A conta não tem entrada ativa neste momento." />
                      )}
                    </Card>
                  </section>
                </>
              )}

              {activeView === "history" && (
                <section className={styles.userDetailSection} aria-labelledby="user-history">
                  <SectionHeader id="user-history" title="Histórico da conta" count={filteredUserEvents.length} sub="Eventos de identidade, vínculos, segurança e permissões." />
                  <div className={styles.eventFilters}>
                    <Input
                      label="Buscar"
                      type="search"
                      value={eventSearch}
                      placeholder="Evento, pessoa ou situação"
                      onChange={(event) => { setEventSearch(event.target.value); setEventPage(1); }}
                    />
                    <Select label="Tipo de evento" value={eventCategory} onChange={(event) => { setEventCategory(event.target.value as UserEventCategory | "Todos"); setEventPage(1); }}>
                      <option>Todos</option>
                      {userEventCategories.map((category) => <option key={category}>{category}</option>)}
                    </Select>
                    <Select label="Responsável" value={eventActor} onChange={(event) => { setEventActor(event.target.value); setEventPage(1); }}>
                      <option>Todos</option>
                      {Array.from(new Set(events.map((event) => event.actor?.name).filter(Boolean))).map((actor) => <option key={actor} value={actor}>{actor}</option>)}
                    </Select>
                    <Input label="De" type="date" value={eventStart} onChange={(event) => { setEventStart(event.target.value); setEventPage(1); }} />
                    <Input label="Até" type="date" value={eventEnd} onChange={(event) => { setEventEnd(event.target.value); setEventPage(1); }} />
                  </div>
                  {(eventSearch || eventCategory !== "Todos" || eventActor !== "Todos" || eventStart || eventEnd) && (
                    <div className={styles.eventFilterSummary}>
                      <span>{filteredUserEvents.length} evento{filteredUserEvents.length === 1 ? "" : "s"} encontrado{filteredUserEvents.length === 1 ? "" : "s"}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setEventSearch(""); setEventCategory("Todos"); setEventActor("Todos"); setEventStart(""); setEventEnd(""); setEventPage(1); }}>Limpar filtros</Button>
                    </div>
                  )}
                  <EventTimeline
                    events={visibleUserEvents}
                    density="compact"
                    showHeader={false}
                    emptyTitle="Nenhum evento encontrado"
                    emptyMessage="Altere os filtros para consultar outros eventos."
                  />
                  {filteredUserEvents.length > 0 && (
                    <div className={styles.eventPagination}>
                      <Select block={false} aria-label="Eventos por página" value={eventPageSize} onChange={(event) => { setEventPageSize(Number(event.target.value)); setEventPage(1); }}>
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                      </Select>
                      <Pagination page={eventPage} pageCount={userEventPageCount} onPageChange={setEventPage} />
                    </div>
                  )}
                </section>
              )}

              {activeView === "administration" && (
                <section className={styles.userDetailSection} aria-label="Administração da conta">
                  {accountStatus === "Bloqueado" && <div className={styles.userRestore}><p>{name} está impedida de entrar em qualquer área da Domuz.app.</p><Button size="sm" variant="primary" onClick={reactivate}>Liberar acesso</Button></div>}
                  <DangerZone title="Ações restritas">
                    <DangerZoneRow id="user-block" title={userActionCriteria.block.title} description={userActionCriteria.block.description} actionLabel="Abrir decisão" disabled={accountStatus !== "Ativo"} onConfirm={() => setAdminAction("block")} />
                    <DangerZoneRow id="user-delete" title={userActionCriteria.delete.title} description={userActionCriteria.delete.description} actionLabel="Abrir decisão" disabled={accountStatus === "Excluído"} onConfirm={() => setAdminAction("delete")} />
                  </DangerZone>
                </section>
              )}
            </div>

            <TableOfContents className={styles.userDetailToc} items={userDetailSections[activeView]} sticky />
          </div>
        </main>
      </AppShell>

      <Modal
        open={accessReviewOpen}
        onClose={() => setAccessReviewOpen(false)}
        title="Revisar alterações de permissões"
        footer={<><Button size="sm" onClick={() => setAccessReviewOpen(false)}>Voltar</Button><Button size="sm" variant="primary" disabled={!accessReason.trim()} onClick={saveAccessChanges}>Salvar permissões</Button></>}
      >
        <div className={styles.userModalFields}>
          <p className={styles.userModalText}>Você está alterando os perfis e as permissões de {name} em {(draftAccess.find((system) => system.id === activeAccessSystem) ?? draftAccess[0]).context}. Os outros sistemas não mudam.</p>
          {activeAccessSystem === "agency" ? (
            <Callout tone="note" title="Impacto">
              A mudança afeta uma pessoa dentro de uma imobiliária. Ela também aparece no histórico da imobiliária.
            </Callout>
          ) : (
            <Callout tone="note" title="Impacto">
              A mudança fica neste contexto e será registrada no histórico da conta.
            </Callout>
          )}
          <Textarea label="Motivo da alteração" value={accessReason} onChange={(event) => setAccessReason(event.target.value)} />
        </div>
      </Modal>

      <Modal
        open={phoneChangeStep !== "closed"}
        onClose={closePhoneChange}
        title={phoneChangeStep === "code" ? "Confirmar novo celular" : "Trocar celular de confirmação"}
        footer={phoneChangeStep === "code"
          ? <><Button size="sm" onClick={() => { setOtpCode(""); setOtpError(""); setPhoneChangeStep("phone"); }}>Voltar</Button><Button size="sm" variant="primary" disabled={otpCode.length !== 6} onClick={confirmPhoneChange}>Confirmar celular</Button></>
          : <><Button size="sm" onClick={closePhoneChange}>Cancelar</Button><Button size="sm" variant="primary" disabled={!nextPhone.trim()} onClick={() => { setPhoneChangeStep("code"); notify("Código enviado", `Enviamos seis dígitos para +55 ${nextPhone}.`); }}>Enviar código</Button></>}
      >
        {phoneChangeStep === "code" ? (
          <div className={styles.userModalFields}>
            <p className={styles.userModalText}>Digite o código enviado para +55 {nextPhone}. O número atual continua válido até a confirmação.</p>
            <Otp value={otpCode} onChange={(code) => { setOtpCode(code); setOtpError(""); }} error={otpError || undefined} length={6} groupSize={3} label="Código enviado por WhatsApp" autoFocus />
            <Button size="sm" variant="ghost" onClick={() => { setOtpCode(""); setOtpError(""); notify("Novo código enviado", `Enviamos seis dígitos para +55 ${nextPhone}.`); }}>Reenviar código</Button>
          </div>
        ) : (
          <div className={styles.userModalFields}>
            <p className={styles.userModalText}>A próxima entrada será confirmada neste número depois que {name} informar o código recebido.</p>
            <PhoneInput label="Novo celular" country={nextCountry} onCountryChange={(next) => setNextCountry(next.code)} value={nextPhone} onChange={(event) => setNextPhone(event.target.value)} />
          </div>
        )}
      </Modal>

      <Modal
        open={adminAction != null}
        onClose={resetAdminAction}
        title={activeAdminConfig?.title ?? "Administrar conta"}
        footer={<><Button size="sm" onClick={resetAdminAction}>Cancelar</Button><Button size="sm" variant="danger" disabled={!adminActionReady} onClick={confirmAdminAction}>{adminAction === "delete" ? "Excluir conta" : "Bloquear conta"}</Button></>}
      >
        {activeAdminConfig && (
          <div className={styles.userModalFields}>
            <p className={styles.userModalText}>{activeAdminConfig.description} A Domuz.app registra seu usuário nessa decisão.</p>
            <Select
              label={adminAction === "delete" ? "Motivo da exclusão" : "Motivo do bloqueio"}
              value={adminCriterion}
              onChange={(event) => {
                setAdminCriterion(event.target.value);
                setAdminChecks({});
              }}
            >
              <option value="">Escolha o motivo</option>
              {activeAdminConfig.criteria.map((criterion) => <option key={criterion.id} value={criterion.id}>{criterion.title}</option>)}
            </Select>
            {selectedAdminCriterion && (
              <div className={styles.userActionChecklist}>
                <strong>{selectedAdminCriterion.title}</strong>
                <p>{selectedAdminCriterion.description}</p>
                {selectedAdminCriterion.subcriteria.map((item) => (
                  <Checkbox
                    key={item}
                    boxed
                    label={item}
                    checked={adminChecks[item] === true}
                    onChange={(event) => setAdminChecks((current) => ({ ...current, [item]: event.target.checked }))}
                  />
                ))}
              </div>
            )}
            <Textarea label="Registro da decisão" value={reason} onChange={(event) => setReason(event.target.value)} />
            <p className={styles.userConfirmationHint}>Digite <strong>{email}</strong> para confirmar.</p>
            <Input label="Confirmação" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </div>
        )}
      </Modal>

      <Command open={commandOpen} onOpenChange={setCommandOpen} items={userCommands} placeholder="Buscar na Plataforma" />
      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </>
  );
}

type BrokerDetailView = "general" | "verification" | "relationships" | "history" | "administration";
type BrokerProfileStatus = "Ativo" | "Suspenso" | "Excluído";

const brokerDetailSubnav = [
  { href: "#general", label: "Geral", description: "Perfil profissional" },
  { href: "#verification", label: "Verificação", description: "Documentos e decisão" },
  { href: "#relationships", label: "Operações e vínculos", description: "Onde a corretora atua" },
  { href: "#history", label: "Histórico", description: "Todos os eventos" },
  { href: "#administration", label: "Administração", description: "Suspensão e exclusão" },
];

const brokerDetailSections: Record<BrokerDetailView, Array<{ id: string; label: string }>> = {
  general: [{ id: "broker-profile", label: "Perfil profissional" }, { id: "broker-account", label: "Conta de origem" }],
  verification: [{ id: "broker-verification", label: "Resultado" }, { id: "broker-verification-data", label: "Dados conferidos" }, { id: "broker-documents", label: "Documentos" }],
  relationships: [{ id: "broker-operations", label: "Operações e vínculos" }],
  history: [{ id: "broker-history", label: "Histórico de eventos" }],
  administration: [{ id: "broker-administration", label: "Estado do perfil" }],
};

type BrokerEventCategory = "Perfil" | "Verificação" | "Documento" | "Vínculo" | "Acesso";
type BrokerEvent = TimelineEvent & { category: BrokerEventCategory };

interface BrokerDocument {
  id: string;
  title: string;
  meta: string;
  status: "Conferido";
  analysis: string;
}

const brokerDocuments: BrokerDocument[] = [
  { id: "DOC-041", title: "Documento do CRECI", meta: "PDF · 1,2 MB · enviado em 19 jul. 2026", status: "Conferido", analysis: "Nome, número do CRECI e situação do registro conferidos manualmente." },
  { id: "DOC-042", title: "Documento de identificação", meta: "PDF · 840 KB · enviado em 19 jul. 2026", status: "Conferido", analysis: "Nome e documento conferem com os dados informados no perfil." },
];

const initialBrokerEvents: BrokerEvent[] = [
  {
    id: "broker-event-8",
    timestamp: "2026-07-24T00:35:00-03:00",
    title: "Perfil profissional acessado",
    description: "André Martins abriu o cadastro COR-021 no Backoffice Domuz.",
    actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
    status: { label: "Ativo", tone: "good" },
    category: "Acesso",
  },
  {
    id: "broker-event-7",
    timestamp: "2026-07-23T14:20:00-03:00",
    title: "Solicitação de vínculo enviada",
    description: "Ana Lima pediu para atuar pela Casa Norte.",
    actor: { name: "Ana Lima", initials: "AL", seed: "USR-004" },
    status: { label: "Aguardando imobiliária", tone: "warn" },
    category: "Vínculo",
  },
  {
    id: "broker-event-6",
    timestamp: "2026-07-22T17:05:00-03:00",
    title: "Operação pessoal ativada",
    description: "A operação OPR-004 foi liberada após a aprovação do perfil.",
    actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
    status: { label: "Ativo", tone: "good" },
    category: "Perfil",
  },
  {
    id: "broker-event-4",
    timestamp: "2026-07-22T16:40:00-03:00",
    title: "Vínculo com Andrade Imóveis aceito",
    description: "A imobiliária liberou o contexto profissional sem exclusividade.",
    actor: { name: "Beatriz Andrade", initials: "BA", seed: "USR-019" },
    status: { label: "Ativo", tone: "good" },
    category: "Vínculo",
  },
  {
    id: "broker-event-5",
    timestamp: "2026-07-20T11:20:00-03:00",
    title: "Documento de identificação conferido",
    description: "André Martins registrou a conferência do arquivo DOC-042.",
    actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
    status: { label: "Conferido", tone: "good" },
    category: "Documento",
  },
  {
    id: "broker-event-3",
    timestamp: "2026-07-20T11:15:00-03:00",
    title: "Perfil profissional aprovado",
    description: "André Martins concluiu a conferência manual dos dados, CRECI e documentos.",
    actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
    status: { label: "Aprovado", tone: "good" },
    category: "Verificação",
  },
  {
    id: "broker-event-2",
    timestamp: "2026-07-19T18:32:00-03:00",
    title: "Verificação enviada",
    description: "Ana Lima enviou o perfil profissional e dois documentos para análise.",
    actor: { name: "Ana Lima", initials: "AL", seed: "USR-004" },
    status: { label: "Em análise", tone: "warn" },
    category: "Verificação",
  },
  {
    id: "broker-event-1",
    timestamp: "2026-07-19T17:58:00-03:00",
    title: "Perfil profissional criado",
    description: "O perfil COR-021 foi associado à conta USR-004.",
    actor: { name: "Ana Lima", initials: "AL", seed: "USR-004" },
    status: { label: "Rascunho", tone: "neutral" },
    category: "Perfil",
  },
];

export function PlatformBrokerDetailPage() {
  const [activeView, setActiveView] = useState<BrokerDetailView>("general");
  const [profileStatus, setProfileStatus] = useState<BrokerProfileStatus>("Ativo");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publicName, setPublicName] = useState("Ana Lima");
  const [creci, setCreci] = useState("MG 42.817-F");
  const [email, setEmail] = useState("ana@andradeimoveis.com.br");
  const [phone, setPhone] = useState("(31) 98888-2041");
  const [country, setCountry] = useState("BR");
  const [events, setEvents] = useState<BrokerEvent[]>(initialBrokerEvents);
  const [previewDocument, setPreviewDocument] = useState<BrokerDocument | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [eventCategory, setEventCategory] = useState<BrokerEventCategory | "Todos">("Todos");
  const [eventActor, setEventActor] = useState("Todos");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(5);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState(userNotifications);
  const [stickyVisible, setStickyVisible] = useState(false);
  const pageHeaderRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = pageHeaderRef.current;
    if (!header || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { rootMargin: "-60px 0px 0px" });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const statusTone = profileStatus === "Ativo" ? "success" : "danger";
  const notify = (title: string, description?: string) => setToasts([{ id: title, title, description, tone: "success", duration: 4000 }]);
  const changeView = (view: BrokerDetailView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const addEvent = (title: string, description: string, status = profileStatus, category: BrokerEventCategory = "Perfil") => {
    setEvents((current) => [{
      id: `broker-event-${current.length + 1}`,
      timestamp: "2026-07-24T00:55:00-03:00",
      title,
      description,
      actor: { name: "André Martins", initials: "AM", seed: "USR-001" },
      status: { label: status, tone: status === "Ativo" ? "good" : "critical" },
      category,
    }, ...current]);
  };

  const filteredEvents = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    return events.filter((event) => {
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(event.timestamp));
      const text = [event.title, event.description, event.actor?.name, event.category, event.status?.label].join(" ").toLowerCase();
      return (!query || text.includes(query))
        && (eventCategory === "Todos" || event.category === eventCategory)
        && (eventActor === "Todos" || event.actor?.name === eventActor)
        && (!eventStart || day >= eventStart)
        && (!eventEnd || day <= eventEnd);
    });
  }, [eventActor, eventCategory, eventEnd, eventSearch, eventStart, events]);
  const eventPageCount = Math.max(1, Math.ceil(filteredEvents.length / eventPageSize));
  const visibleEvents = filteredEvents.slice((eventPage - 1) * eventPageSize, eventPage * eventPageSize);

  useEffect(() => {
    if (eventPage > eventPageCount) setEventPage(eventPageCount);
  }, [eventPage, eventPageCount]);

  const saveProfile = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setEditing(false);
      addEvent("Perfil profissional atualizado", "Nome público, CRECI ou contatos profissionais foram alterados.");
      notify("Perfil salvo", "As alterações já aparecem no cadastro profissional de Ana.");
    }, 500);
  };

  const suspendProfile = () => {
    setProfileStatus("Suspenso");
    addEvent("Perfil profissional suspenso", "A operação pessoal e os contextos profissionais foram bloqueados.", "Suspenso");
    notify("Perfil suspenso", "Ana continua com a conta ativa, mas não entra em contextos profissionais.");
  };

  const reactivateProfile = () => {
    setProfileStatus("Ativo");
    addEvent("Perfil profissional reativado", "A operação pessoal e os vínculos ativos voltaram a permitir entrada.", "Ativo");
    notify("Perfil reativado", "Ana já pode entrar nos contextos profissionais ativos.");
  };

  return (
    <>
      <AppShell
        theme="dommus-admin"
        contentMaxWidth={9999}
        sidebar={{ ...backofficeSidebar, defaultActiveId: "brokers" }}
        topbar={{
          showBrand: false,
          crumbs: [
            { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
            { label: "Corretores", onClick: () => openStory(brokersStory) },
            { label: publicName },
          ],
          searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
          onSearchClick: () => setCommandOpen(true),
          actions: <NotificationBell items={notifications} onItemClick={(item) => setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry))} onMarkAllRead={() => setNotifications((current) => current.map((entry) => ({ ...entry, unread: false })))} />,
        }}
      >
        <StickyBar
          visible={stickyVisible}
          title={<span className={styles.userDetailTitle}><Avatar size="sm" initials="AL" seed="USR-004" /><span>{publicName}</span></span>}
          meta="COR-021"
          status={<Badge tone={statusTone} dot>{profileStatus}</Badge>}
        />

        <main className={styles.userDetailPage}>
          <PageHeader
            ref={pageHeaderRef}
            title={<span className={styles.userDetailTitle}><Avatar size="md" initials="AL" seed="USR-004" /><span>{publicName}</span></span>}
            lead={<span className={styles.userDetailLead}><Badge tone={statusTone} dot>{profileStatus}</Badge><span className={styles.userId}>COR-021</span><span>CRECI {creci}</span></span>}
          />

          <div className={styles.userDetailLayout}>
            <SettingsSubnav
              className={styles.userDetailSubnav}
              label="Áreas do corretor"
              items={brokerDetailSubnav}
              activeHref={`#${activeView}`}
              renderLink={(item, linkProps) => <a {...linkProps} onClick={(event) => { event.preventDefault(); changeView(item.href.slice(1) as BrokerDetailView); }} />}
            />

            <div className={styles.userDetailContent}>
              {activeView === "general" && (
                <>
                  <section className={styles.userDetailSection} aria-labelledby="broker-profile">
                    <SectionHeader id="broker-profile" title="Perfil profissional" sub="Dados usados na operação pessoal e nos vínculos com imobiliárias." action={<Button size="sm" disabled={saving} onClick={() => setEditing((current) => !current)}>{editing ? "Cancelar edição" : "Editar perfil"}</Button>} />
                    <Card className={styles.userDetailCard} aria-busy={saving || undefined}>
                      <div className={styles.userAvatarEditor}>
                        <Avatar size="xl" initials="AL" seed="USR-004" />
                        <div><strong>Avatar profissional</strong><span>A imagem acompanha o perfil da conta USR-004.</span></div>
                      </div>
                      <div className={styles.userDetailForm}>
                        <Input label="Nome público" value={publicName} disabled={!editing || saving} onChange={(event) => setPublicName(event.target.value)} />
                        <Input label="ID do corretor" value="COR-021" disabled />
                        <Input label="CRECI" value={creci} disabled={!editing || saving} onChange={(event) => setCreci(event.target.value)} />
                        <Input label="E-mail profissional" type="email" value={email} disabled={!editing || saving} onChange={(event) => setEmail(event.target.value)} />
                        <PhoneInput label="Telefone profissional" country={country} onCountryChange={(next) => setCountry(next.code)} value={phone} disabled={!editing || saving} onChange={(event) => setPhone(event.target.value)} />
                      </div>
                      {editing && <div className={styles.userDetailActions}><Button size="sm" variant="primary" loading={saving} loadingLabel="Salvando" onClick={saveProfile}>Salvar alterações</Button></div>}
                    </Card>
                  </section>

                  <section className={styles.userDetailSection} aria-labelledby="broker-account">
                    <SectionHeader id="broker-account" title="Conta de origem" sub="O perfil profissional pertence a uma conta global." />
                    <div className={styles.userNavCards}>
                      <NavCard
                        href={`/?path=/story/${brokerAccountStory}&globals=viewport:desktop1440`}
                        target="_top"
                        leading={<Avatar size="lg" initials="AL" seed="USR-004" />}
                        title="Ana Lima"
                        description="USR-004 · ana@andradeimoveis.com.br"
                        meta={<Badge tone="success">Conta ativa</Badge>}
                      />
                    </div>
                  </section>
                </>
              )}

              {activeView === "verification" && (
                <>
                  <section className={styles.userDetailSection} aria-labelledby="broker-verification">
                    <SectionHeader id="broker-verification" title="Resultado da verificação" sub="A equipe Domuz concluiu a conferência manual em 20 jul. 2026." />
                    <Card className={styles.userDetailCard}>
                      <SettingRowGroup aria-label="Situação da verificação profissional">
                        <SettingRow title="Perfil profissional" description="Aprovado para operar na Domuz." meta="Analisado por André Martins · USR-001" actions={<Badge tone="success" dot>Aprovado</Badge>} />
                        <SettingRow title="Decisão registrada" description="20 jul. 2026, às 11:15" meta="O evento e os documentos conferidos continuam disponíveis no histórico." actions={<Button size="sm" onClick={() => changeView("history")}>Ver evento</Button>} />
                      </SettingRowGroup>
                    </Card>
                  </section>

                  <section className={styles.userDetailSection} aria-labelledby="broker-verification-data">
                    <SectionHeader id="broker-verification-data" title="Dados conferidos" sub="Informações usadas na decisão do perfil profissional." />
                    <Card className={styles.userDetailCard}>
                      <SettingRowGroup aria-label="Dados conferidos">
                        <SettingRow title="Nome no registro" description="Ana Lima" meta="Confere com o documento de identificação" actions={<Badge tone="success">Conforme</Badge>} />
                        <SettingRow title="CRECI" description={creci} meta="Registro ativo na data da análise" actions={<Badge tone="success">Conforme</Badge>} />
                        <SettingRow title="Contato profissional" description={`${email} · +55 ${phone}`} meta="Dados informados no perfil COR-021" actions={<Badge tone="success">Conforme</Badge>} />
                      </SettingRowGroup>
                    </Card>
                  </section>

                  <section className={styles.userDetailSection} aria-labelledby="broker-documents">
                    <SectionHeader id="broker-documents" title="Documentos" count={brokerDocuments.length} sub="Arquivos usados na verificação manual." />
                    <Card className={styles.userDetailCard}>
                      <SettingRowGroup aria-label="Documentos da verificação profissional">
                        {brokerDocuments.map((document) => (
                          <SettingRow
                            key={document.id}
                            leading={<span className={agencyStyles.agencyFileType}>PDF</span>}
                            leadingFrame
                            title={document.title}
                            description={document.id}
                            meta={<span className={agencyStyles.agencyDocumentMeta}>{document.meta}<Badge tone="success" dot>{document.status}</Badge></span>}
                            actions={<Button size="sm" onClick={() => { setPreviewDocument(document); addEvent("Documento aberto", `${document.title} (${document.id}) foi aberto no leitor.`, profileStatus, "Acesso"); }}>Ver documento</Button>}
                          />
                        ))}
                      </SettingRowGroup>
                    </Card>
                  </section>
                </>
              )}

              {activeView === "relationships" && (
                <section className={styles.userDetailSection} aria-labelledby="broker-operations">
                  <SectionHeader id="broker-operations" title="Operações e vínculos" sub="Cada destino possui situação e histórico próprios." count="3" />
                  <div className={styles.userNavCards} aria-label="Operações e vínculos do corretor">
                    <NavCard
                      href={`/?path=/story/${personalOperationStory}&globals=viewport:desktop1440`}
                      target="_top"
                      leading={<Avatar shape="square" size="lg" initials="MO" seed="OPR-004" />}
                      title="Minha operação"
                      description="OPR-004 · operação pessoal sem exclusividade"
                      meta={<Badge tone="success">Ativa</Badge>}
                    />
                    <NavCard
                      href={`/?path=/story/${andradeAgencyStory}&globals=viewport:desktop1440`}
                      target="_top"
                      leading={<Avatar shape="square" size="lg" initials="AI" seed="TNT-001" />}
                      title="Andrade Imóveis"
                      description="VNC-009 · vínculo aceito em 22 jul. 2026"
                      meta={<Badge tone="success">Ativo</Badge>}
                    />
                    <NavCard
                      href={`/?path=/story/${affiliationRequestsStory}&globals=viewport:desktop1440`}
                      target="_top"
                      leading={<Avatar shape="square" size="lg" initials="CN" seed="TNT-003" />}
                      title="Solicitação para Casa Norte"
                      description="VNC-014 · enviada em 23 jul. 2026"
                      meta={<Badge tone="warn">Aguardando imobiliária</Badge>}
                    />
                  </div>
                </section>
              )}

              {activeView === "history" && (
                <section className={styles.userDetailSection} aria-labelledby="broker-history">
                  <SectionHeader id="broker-history" title="Histórico de eventos" count={filteredEvents.length} sub="Alterações, verificações, documentos, vínculos e acessos deste perfil." />
                  <div className={styles.eventFilters}>
                    <Input
                      label="Buscar"
                      type="search"
                      value={eventSearch}
                      placeholder="Evento, pessoa ou situação"
                      onChange={(event) => { setEventSearch(event.target.value); setEventPage(1); }}
                    />
                    <Select label="Tipo de evento" value={eventCategory} onChange={(event) => { setEventCategory(event.target.value as BrokerEventCategory | "Todos"); setEventPage(1); }}>
                      <option>Todos</option>
                      <option>Perfil</option>
                      <option>Verificação</option>
                      <option>Documento</option>
                      <option>Vínculo</option>
                      <option>Acesso</option>
                    </Select>
                    <Select label="Responsável" value={eventActor} onChange={(event) => { setEventActor(event.target.value); setEventPage(1); }}>
                      <option>Todos</option>
                      {Array.from(new Set(events.map((event) => event.actor?.name).filter(Boolean))).map((actor) => <option key={actor} value={actor}>{actor}</option>)}
                    </Select>
                    <Input label="De" type="date" value={eventStart} onChange={(event) => { setEventStart(event.target.value); setEventPage(1); }} />
                    <Input label="Até" type="date" value={eventEnd} onChange={(event) => { setEventEnd(event.target.value); setEventPage(1); }} />
                  </div>
                  {(eventSearch || eventCategory !== "Todos" || eventActor !== "Todos" || eventStart || eventEnd) && (
                    <div className={styles.eventFilterSummary}>
                      <span>{filteredEvents.length} evento{filteredEvents.length === 1 ? "" : "s"} encontrado{filteredEvents.length === 1 ? "" : "s"}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setEventSearch(""); setEventCategory("Todos"); setEventActor("Todos"); setEventStart(""); setEventEnd(""); setEventPage(1); }}>Limpar filtros</Button>
                    </div>
                  )}
                  <EventTimeline
                    events={visibleEvents}
                    density="compact"
                    showHeader={false}
                    emptyTitle="Nenhum evento encontrado"
                    emptyMessage="Altere os filtros para consultar outros eventos."
                  />
                  {filteredEvents.length > 0 && (
                    <div className={styles.eventPagination}>
                      <Select block={false} aria-label="Eventos por página" value={eventPageSize} onChange={(event) => { setEventPageSize(Number(event.target.value)); setEventPage(1); }}>
                        <option value={5}>5 por página</option>
                        <option value={10}>10 por página</option>
                        <option value={20}>20 por página</option>
                      </Select>
                      <Pagination page={eventPage} pageCount={eventPageCount} onPageChange={setEventPage} />
                    </div>
                  )}
                </section>
              )}

              {activeView === "administration" && (
                <section className={styles.userDetailSection} aria-labelledby="broker-administration">
                  <SectionHeader id="broker-administration" title="Estado do perfil profissional" sub="A conta global continua separada deste perfil." />
                  {profileStatus === "Suspenso" && <div className={styles.userRestore}><p>Ana não entra na operação pessoal nem nos contextos profissionais enquanto o perfil estiver suspenso.</p><Button size="sm" variant="primary" onClick={reactivateProfile}>Reativar perfil</Button></div>}
                  <DangerZone title="Ações restritas">
                    <DangerZoneRow title="Suspender perfil profissional" description="Bloqueia a operação pessoal e os contextos profissionais. A conta e o histórico continuam ativos." actionLabel="Suspender" disabled={profileStatus !== "Ativo"} onConfirm={suspendProfile} />
                    <DangerZoneRow title="Excluir perfil profissional" description="Faz uma exclusão lógica. A conta, os vínculos e os eventos permanecem disponíveis para auditoria." actionLabel="Excluir" disabled={profileStatus === "Excluído"} onConfirm={() => { setProfileStatus("Excluído"); addEvent("Perfil profissional excluído logicamente", "O cadastro deixou de permitir operações, sem apagar vínculos ou eventos.", "Excluído"); notify("Perfil excluído", "O histórico de eventos foi preservado."); }} />
                  </DangerZone>
                </section>
              )}
            </div>

            <TableOfContents className={styles.userDetailToc} items={brokerDetailSections[activeView]} sticky />
          </div>
        </main>
      </AppShell>

      <Drawer
        open={previewDocument != null}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        title={previewDocument?.title}
        className={agencyStyles.agencyDocumentDrawer}
        width={1080}
      >
        <div className={agencyStyles.agencyDocumentReview}>
          <div className={agencyStyles.agencyDocumentPreview}>
            <div className={agencyStyles.agencyDocumentToolbar}>
              <div><span>Página 1 de 2</span><span>100%</span></div>
              <IconButton
                size="sm"
                variant="outline"
                aria-label="Baixar documento"
                icon={Icons.download}
                onClick={() => {
                  if (!previewDocument) return;
                  addEvent("Documento baixado", `${previewDocument.title} (${previewDocument.id}) foi baixado.`, profileStatus, "Acesso");
                  notify("Download iniciado", previewDocument.title);
                }}
              />
            </div>
            <div className={agencyStyles.agencyDocumentCanvas}>
              <aside aria-label="Páginas do documento">
                <button type="button" aria-current="page"><span>1</span><i>IDENTIFICAÇÃO</i></button>
                <button type="button"><span>2</span><i>VALIDADE</i></button>
              </aside>
              <article className={agencyStyles.agencyDocumentPage} aria-label={`Pré-visualização de ${previewDocument?.title}`}>
                <small>{previewDocument?.id === "DOC-041" ? "CONSELHO REGIONAL DE CORRETORES DE IMÓVEIS" : "DOCUMENTO DE IDENTIFICAÇÃO"}</small>
                <h3>Ana Lima</h3>
                <p>{previewDocument?.id === "DOC-041" ? "CRECI MG 42.817-F" : "Documento 12.345.678-9"}</p>
                <hr />
                <h4>{previewDocument?.id === "DOC-041" ? "Registro profissional" : "Identificação da titular"}</h4>
                <p>{previewDocument?.id === "DOC-041" ? "Registro ativo na data da análise manual realizada pela equipe Domuz." : "Nome e fotografia disponíveis para conferência com os dados do perfil profissional."}</p>
                <div className={agencyStyles.agencyDocumentSeal}>Documento conferido<br />20 JUL 2026</div>
                <footer><span>Documento de demonstração</span><span>Página 1/2</span></footer>
              </article>
            </div>
          </div>
          <aside className={agencyStyles.agencyDocumentAnalysis} aria-label="Análise do documento">
            <div><span>Situação</span><Badge tone="success" dot>{previewDocument?.status}</Badge></div>
            <section className={agencyStyles.agencyDocumentTimeline} aria-labelledby="broker-document-analysis-history">
              <h3 id="broker-document-analysis-history">Análise registrada</h3>
              <ol>
                <li>
                  <Avatar size="sm" initials="AM" seed="USR-001" />
                  <div>
                    <p><strong>André Martins</strong><span>20 jul. 2026, 11:10</span></p>
                    <Badge tone="success" dot>Conferido</Badge>
                    <span>{previewDocument?.analysis}</span>
                  </div>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </Drawer>

      <Command open={commandOpen} onOpenChange={setCommandOpen} items={userCommands} placeholder="Buscar na Plataforma" />
      <ToastRegion toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </>
  );
}

type CheckResult = "" | "conform" | "nonconform" | "not-applicable";

interface ReviewCriterion {
  id: string;
  label: string;
  source: string;
  file?: string;
  result: CheckResult;
  requestSent?: boolean;
}

interface ReviewSection {
  id: string;
  label: string;
  description: string;
  status: "not-started" | "in-progress" | "complete";
  note: string;
  checks: ReviewCriterion[];
}

const initialReviewSections: ReviewSection[] = [
  {
    id: "contract",
    label: "Contrato social",
    description: "Confira a identificação da empresa, a versão do contrato e os poderes da responsável.",
    status: "in-progress",
    note: "",
    checks: [
      { id: "company-name", label: "A razão social confere com o cartão do CNPJ", source: "Cartão do CNPJ · versão 1", file: "Cartão do CNPJ · PDF · 340 KB", result: "" },
      { id: "latest-version", label: "O contrato corresponde à versão mais recente enviada", source: "Contrato social · versão 1", file: "Contrato social · versão 1 · PDF · 2,4 MB", result: "" },
      { id: "authority", label: "O documento identifica os poderes da responsável", source: "Contrato social · versão 1", file: "Contrato social · versão 1 · PDF · 2,4 MB", result: "" },
    ],
  },
  {
    id: "address",
    label: "Comprovante de endereço",
    description: "Confira o envio, a data de emissão e o endereço declarado.",
    status: "not-started",
    note: "",
    checks: [
      { id: "received", label: "O comprovante de endereço foi enviado", source: "Documentos do cadastro", result: "" },
      { id: "validity", label: "O documento foi emitido nos últimos 90 dias", source: "Comprovante de endereço", result: "" },
      { id: "same-address", label: "O endereço confere com o cadastro", source: "Dados cadastrais e comprovante de endereço", result: "" },
    ],
  },
  {
    id: "creci",
    label: "CRECI PJ",
    description: "Confira o número, a razão social e a situação do registro.",
    status: "not-started",
    note: "",
    checks: [
      { id: "number", label: "O número confere com o cadastro", source: "Comprovante do CRECI PJ", file: "Comprovante do CRECI PJ · PDF · 680 KB", result: "" },
      { id: "company", label: "A razão social confere com o registro", source: "Comprovante do CRECI PJ", file: "Comprovante do CRECI PJ · PDF · 680 KB", result: "" },
      { id: "active", label: "O CRECI PJ está ativo", source: "Consulta manual ao CRECI-MG", result: "" },
    ],
  },
];

function sectionIsComplete(section: ReviewSection) {
  return section.status === "complete";
}

function EvidenceDrawer({ open, onClose, title, source, file }: { open: boolean; onClose: () => void; title: string; source: string; file?: string }) {
  const [showDocument, setShowDocument] = useState(false);
  return (
    <Drawer open={open} onOpenChange={(next) => { if (!next) { setShowDocument(false); onClose(); } }} title={showDocument ? file : title} width={720}>
      {showDocument ? (
        <div className={styles.evidenceFile}>
          <Button size="sm" onClick={() => setShowDocument(false)}>Voltar à análise</Button>
          <article><span>JUNTA COMERCIAL DO ESTADO DE MINAS GERAIS</span><h3>Horizonte Negócios Imobiliários Ltda.</h3><p>Pré-visualização do arquivo preservado na versão analisada.</p><strong>{file}</strong></article>
        </div>
      ) : (
        <div className={styles.evidence}>
          <div><span>Fonte da conferência</span><strong>{source}</strong></div>
          {file ? (
            <div className={styles.evidenceDocument}>
              <span>Arquivo enviado por Marina Torres em 22 de julho de 2026, às 09:12</span>
              <strong>{file}</strong>
              <Button size="sm" onClick={() => setShowDocument(true)}>Abrir arquivo</Button>
            </div>
          ) : (
            <p className={styles.missingSource}>Não há arquivo enviado para este critério. Confira o cadastro ou a fonte indicada.</p>
          )}
        </div>
      )}
    </Drawer>
  );
}

export function InformationRequestPage() {
  const [sections, setSections] = useState(initialReviewSections);
  const [current, setCurrent] = useState(initialReviewSections[0].id);
  const [evidence, setEvidence] = useState<ReviewCriterion | null>(null);
  const [requestingCheck, setRequestingCheck] = useState<string | null>(null);
  const [requestText, setRequestText] = useState("");
  const [feedback, setFeedback] = useState<ToastData | null>(null);
  const [analysisFinished, setAnalysisFinished] = useState(false);
  const section = sections.find((entry) => entry.id === current) ?? sections[0];
  const remainingCount = sections.filter((entry) => !sectionIsComplete(entry)).length;
  const completedCount = sections.length - remainingCount;
  const requestCount = sections.flatMap((entry) => entry.checks).filter((check) => check.requestSent).length;
  const selectedCheck = section.checks.find((check) => check.id === requestingCheck);
  const readyToComplete = section.checks.every((check) => check.result) && Boolean(section.note.trim());
  const workbenchItems: ApprovalWorkbenchItem[] = sections.map((entry) => ({
    id: entry.id,
    label: entry.label,
    meta: sectionIsComplete(entry)
      ? `${entry.checks.length} de ${entry.checks.length} avaliados`
      : `${entry.checks.filter((check) => check.result).length} de ${entry.checks.length} avaliados`,
    state: entry.status,
  }));

  function updateSection(next: ReviewSection) {
    setSections((currentSections) => currentSections.map((entry) => entry.id === next.id ? next : entry));
  }

  function selectSection(id: string) {
    setCurrent(id);
    setRequestingCheck(null);
    setSections((currentSections) => currentSections.map((entry) => (
      entry.id === id && entry.status === "not-started"
        ? { ...entry, status: "in-progress" }
        : entry
    )));
  }

  function completeSection() {
    const next = sections.find((entry) => entry.id !== section.id && !sectionIsComplete(entry));
    updateSection({ ...section, status: "complete" });
    setFeedback({ id: "review-saved", title: "Análise salva", description: section.label, tone: "success", duration: 4000 });
    if (next) selectSection(next.id);
  }

  return (
    <>
      <AppShell
        theme="dommus-admin"
        contentMaxWidth={9999}
        sidebar={backofficeSidebar}
        topbar={{
          showBrand: false,
          crumbs: [
            { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
            { label: "Imobiliárias", onClick: () => openStory(agencyIndexStory) },
            { label: "Horizonte Negócios", onClick: () => openStory(agencyReviewStory) },
            { label: requestingCheck ? "Solicitar informação" : "Análise" },
          ],
          searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
        }}
      >
        <main className={styles.workPage}>
          <PageHeader
            title={requestingCheck ? "Solicitar informação" : "Análise do cadastro"}
            lead={(
              <span className={styles.lead}>
                <Badge tone="info">Em análise</Badge>
                {requestCount > 0 && <Badge tone="warn">{requestCount} {requestCount === 1 ? "solicitação aberta" : "solicitações abertas"}</Badge>}
                <span>Horizonte Negócios · TNT-002</span>
              </span>
            )}
            actions={!requestingCheck && <Button size="sm" variant="danger" onClick={() => openStory("produto-backoffice-imobili%C3%A1rias-detalhes-da-imobili%C3%A1ria--recusar-cadastro")}>Recusar cadastro</Button>}
          />
          {analysisFinished ? (
            <EmptyState
              className={styles.noIssues}
              title={requestCount > 0 ? "Informações solicitadas" : "Análise concluída"}
              message={requestCount > 0
                ? `A imobiliária recebeu ${requestCount} ${requestCount === 1 ? "pedido" : "pedidos"} por e-mail. O cadastro fica aguardando resposta.`
                : "Todos os itens de Horizonte Negócios foram conferidos e registrados."}
              action={<Button size="sm" onClick={() => openStory(agencyReviewStory)}>Voltar à imobiliária</Button>}
            />
          ) : (
            <ApprovalWorkbench
              items={workbenchItems}
              activeId={current}
              onActiveChange={selectSection}
            >
                {requestingCheck && selectedCheck ? (
                  <Card className={styles.requestForm}>
                    <SectionHeader title="Solicitar informação" sub={`${section.label}: ${selectedCheck.label}`} />
                    <p>A imobiliária receberá este pedido por e-mail e responderá com a correção indicada.</p>
                    <Textarea label="O que a imobiliária precisa enviar ou corrigir" value={requestText} onChange={(event) => setRequestText(event.target.value)} />
                    <Input label="Prazo para resposta" type="date" defaultValue="2026-07-30" />
                  </Card>
                ) : (
                  <Card className={styles.issueCard}>
                    <div className={styles.issueCardHeader}>
                      <div><h2>{section.label}</h2><p>{section.description}</p></div>
                      <Badge tone={sectionIsComplete(section) ? "success" : "info"}>{sectionIsComplete(section) ? "Concluído" : "Em análise"}</Badge>
                    </div>
                    <div className={styles.checkList}>
                      {section.checks.map((check) => (
                        <div className={styles.checkRow} key={check.id}>
                          <div className={styles.checkSource}>
                            <strong>{check.label}</strong>
                            <span>{check.source}</span>
                            <Button size="sm" onClick={() => setEvidence(check)}>{check.file ? "Abrir fonte" : "Ver origem"}</Button>
                          </div>
                          <Select
                            id={`result-${section.id}-${check.id}`}
                            label="Resultado"
                            value={check.result}
                            disabled={sectionIsComplete(section)}
                            onChange={(event) => updateSection({ ...section, checks: section.checks.map((entry) => entry.id === check.id ? { ...entry, result: event.target.value as CheckResult } : entry) })}
                          >
                            <option value="">Selecione</option>
                            <option value="conform">Conforme</option>
                            <option value="nonconform">Não conforme</option>
                            <option value="not-applicable">Não se aplica</option>
                          </Select>
                          {check.result === "nonconform" && (
                            check.requestSent
                              ? <Badge tone="warn">Solicitação enviada</Badge>
                              : <Button className={styles.checkAction} onClick={() => { setRequestingCheck(check.id); setRequestText(""); }}>Solicitar informação</Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Textarea
                      label="Registro da análise"
                      hint="Descreva o que você conferiu e onde encontrou a informação."
                      value={section.note}
                      disabled={sectionIsComplete(section)}
                      onChange={(event) => updateSection({ ...section, note: event.target.value })}
                    />
                  </Card>
                )}
            </ApprovalWorkbench>
          )}
          {!analysisFinished && (
            <StickyFooter
              position="fixed"
              className={styles.workFooter}
              start={requestingCheck ? "O pedido será enviado por e-mail" : `${completedCount} de ${sections.length} itens concluídos`}
            >
              {requestingCheck ? (
                <>
                  <Button size="sm" onClick={() => setRequestingCheck(null)}>Voltar à análise</Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!requestText.trim()}
                    onClick={() => {
                      updateSection({
                        ...section,
                        checks: section.checks.map((check) => (
                          check.id === selectedCheck?.id ? { ...check, requestSent: true } : check
                        )),
                      });
                      setFeedback({ id: "request-sent", title: "Solicitação enviada", description: selectedCheck?.label, tone: "success", duration: 4000 });
                      setRequestingCheck(null);
                    }}
                  >
                    Enviar por e-mail
                  </Button>
                </>
              ) : remainingCount === 0 ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setAnalysisFinished(true);
                    setFeedback({ id: "analysis-finished", title: "Análise concluída", tone: "success", duration: 4000 });
                  }}
                >
                  Concluir análise
                </Button>
              ) : (
                <Button size="sm" variant="primary" disabled={!readyToComplete || sectionIsComplete(section)} onClick={completeSection}>
                  Salvar análise do item
                </Button>
              )}
            </StickyFooter>
          )}
        </main>
      </AppShell>
      <EvidenceDrawer open={evidence != null} onClose={() => setEvidence(null)} title={evidence?.label ?? "Fonte"} source={evidence?.source ?? ""} file={evidence?.file} />
      <ToastRegion position="top-right" toasts={feedback ? [feedback] : []} onDismiss={() => setFeedback(null)} />
    </>
  );
}

const refusalDocuments = [
  { value: "contract", label: "Contrato social" },
  { value: "cnpj", label: "Cartão do CNPJ" },
  { value: "creci", label: "Comprovante do CRECI PJ" },
  { value: "address", label: "Comprovante de endereço" },
  { value: "authority", label: "Poderes da responsável" },
];

const refusalReasons = [
  { value: "missing-documents", label: "Documentação obrigatória incompleta" },
  { value: "invalid-documents", label: "Documentação inválida ou ilegível" },
  { value: "divergent-data", label: "Dados cadastrais divergentes" },
  { value: "invalid-creci", label: "CRECI PJ inválido ou inativo" },
  { value: "unproven-authority", label: "Poderes da responsável não comprovados" },
  { value: "duplicate", label: "Imobiliária já cadastrada" },
  { value: "other", label: "Outro" },
];

export function RejectionPage() {
  const [reasons, setReasons] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [justification, setJustification] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [recipient, setRecipient] = useState("marina");
  const recipients = [
    {
      value: "marina",
      label: "Marina Torres",
      description: "Conta pendente · marina@horizonteimoveis.com.br",
      group: "Responsável pelo cadastro",
      avatar: { name: "Marina Torres" },
    },
    {
      value: "fernanda",
      label: "Fernanda Lopes",
      description: "Conta ativa · fernanda@horizonteimoveis.com.br",
      group: "Pessoas da imobiliária",
      avatar: { name: "Fernanda Lopes" },
    },
  ];
  const complete = Boolean(reasons.length && justification.trim() && recipient && confirmed);

  return (
    <AppShell
      theme="dommus-admin"
      contentMaxWidth={9999}
      sidebar={backofficeSidebar}
      topbar={{
        showBrand: false,
        crumbs: [
          { label: "Plataforma", onClick: () => openStory(backofficeHomeStory) },
          { label: "Imobiliárias", onClick: () => openStory(agencyIndexStory) },
          { label: "Horizonte Negócios", onClick: () => openStory(agencyReviewStory) },
          { label: "Recusar cadastro" },
        ],
        searchPlaceholder: "Buscar imobiliária, corretor, imóvel ou execução",
      }}
    >
      <main className={styles.workPage}>
        <PageHeader title="Recusar cadastro" lead={<span className={styles.lead}><Badge tone="danger">Decisão em elaboração</Badge><span>Horizonte Negócios · TNT-002</span></span>} />
        <div className={styles.deliveryBar}>
          <div><strong>Envio por e-mail</strong><span>A decisão será enviada para a pessoa selecionada.</span></div>
          <Combobox
            className={styles.recipientField}
            label="Destinatária"
            hint="Quem iniciou o cadastro aparece aqui mesmo com a conta pendente. Sem e-mail, o envio fica bloqueado."
            options={recipients}
            value={recipient}
            onChange={(option) => setRecipient(option?.value ?? "")}
          />
        </div>
        <section className={styles.rejectionContent}>
          <SectionHeader title="Motivo da recusa" sub="Registre por que o cadastro não pode ser aprovado." />
          <Card className={styles.refusalForm}>
            <Multiselect
              label="Motivos"
              options={refusalReasons}
              value={reasons}
              onChange={setReasons}
              placeholder="Selecionar motivos"
            />
            <Multiselect
              label="Documentos relacionados"
              hint="Opcional. Selecione os arquivos que ajudam a identificar o motivo."
              options={refusalDocuments}
              value={documents}
              onChange={setDocuments}
              placeholder="Selecionar documentos"
            />
            <Textarea
              label={reasons.includes("other") ? "Justificativa e outros motivos" : "Justificativa"}
              hint="Explique a decisão de forma suficiente para o registro e para o e-mail."
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
            />
          </Card>
          <Checkbox boxed checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} label="Confirmo que revisei o motivo e a justificativa da recusa." />
        </section>
        <StickyFooter position="fixed" className={styles.workFooter} start="A recusa será registrada na linha do tempo">
          <Button size="sm" onClick={() => openStory(agencyReviewStory)}>Cancelar</Button>
          <Button size="sm" variant="danger" disabled={!complete}>Confirmar recusa e enviar e-mail</Button>
        </StickyFooter>
      </main>
    </AppShell>
  );
}
