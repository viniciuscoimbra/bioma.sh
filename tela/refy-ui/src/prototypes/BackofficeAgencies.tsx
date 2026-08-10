import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { AvatarGroup, type AvatarGroupItem } from "../components/AvatarGroup";
import {
  ApprovalWorkbench,
  type ApprovalWorkbenchItem,
} from "../components/ApprovalWorkbench";
import { Badge, type BadgeTone } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { Combobox } from "../components/Combobox";
import { DangerZone, DangerZoneRow } from "../components/DangerZone";
import { Drawer } from "../components/Drawer";
import { EventTimeline, type TimelineEvent } from "../components/EventTimeline";
import { FileUpload } from "../components/FileUpload";
import { Input } from "../components/Input";
import { IconButton } from "../components/IconButton";
import { Menu, type MenuEntry } from "../components/Menu";
import { Modal } from "../components/Modal";
import { NavCard } from "../components/NavCard";
import { PageHeader } from "../components/PageHeader";
import { PersonCell } from "../components/PersonCell";
import { PhoneInput } from "../components/PhoneInput";
import { SectionHeader } from "../components/SectionHeader";
import { Select } from "../components/Select";
import { SettingRow, SettingRowGroup } from "../components/SettingRow";
import { SettingsSubnav } from "../components/SettingsSubnav";
import { Snackbar } from "../components/Snackbar";
import { StickyBar } from "../components/StickyBar";
import { Table, type Column } from "../components/Table";
import { TableOfContents } from "../components/TableOfContents";
import { Tabs } from "../components/Tabs";
import { Textarea } from "../components/Textarea";
import { ToastRegion, type ToastData } from "../components/Toast";
import { Icons } from "../_demo/icons";
import { BackofficeShell } from "./BackofficeShell";
import {
  agencyDocumentAccept,
  agencyDocumentHint,
  agencyRegistrationDocuments,
  type AgencyRegistrationDocumentId,
} from "./agencyRegistrationConfig";
import styles from "./BackofficeHome.module.css";

export type AgenciesState = "default" | "loading" | "empty" | "error";
export type AgencyReviewState = "pending-review" | "active" | "under-review" | "needs-information" | "rejected" | "suspended" | "deleted";
export type AgencyReviewView = "general" | "analysis" | "responsible" | "history" | "administration";
type AgencyStatus = "Ativa" | "Pendente de análise" | "Em análise" | "Informações pendentes" | "Suspensa";

const userStoryHref = "/?path=/story/produto-backoffice-usu%C3%A1rios--t-01-b-users";
export const storyHref = (id: string) => `/?path=/story/${id}`;
export const openStory = (id: string) => { window.parent.location.href = storyHref(id); };
const backofficeHomeStoryId = "produto-backoffice-visão-geral--index";
export const agencyIndexStoryId = "produto-backoffice-imobiliárias--index";
const agencyCreateStoryId = "produto-backoffice-imobiliárias-cadastrar-imobiliária--index";
const agencyDetailStoryId = "produto-backoffice-imobiliárias-detalhes-da-imobiliária--index";
const agencyAreaStoryId = "produto-imobili%C3%A1ria-vis%C3%A3o-geral--h-02-agency-area";
const agencyBrokersStoryId = "produto-backoffice-corretores--t-01-c-brokers";
const agencyLifecycleStoryId = "produto-backoffice-imobiliárias-detalhes-da-imobiliária--ciclo-do-cadastro";
const agencyDetailStories: Record<AgencyReviewView, string> = {
  general: agencyDetailStoryId,
  analysis: agencyDetailStoryId,
  responsible: "produto-backoffice-imobiliárias-detalhes-da-imobiliária--responsavel",
  history: "produto-backoffice-imobiliárias-detalhes-da-imobiliária--historico",
  administration: "produto-backoffice-imobiliárias-detalhes-da-imobiliária--administracao",
};

interface Agency {
  id: string;
  slug: string;
  name: string;
  initials: string;
  document: string;
  city: string;
  state: string;
  status: AgencyStatus;
  brokers: number;
  clients: number;
  updated: string;
  updatedOrder: string;
}

const agencies: Agency[] = [
  { id: "TNT-001", slug: "andrade-imoveis", name: "Andrade Imóveis", initials: "AI", document: "12.345.678/0001-90", city: "Belo Horizonte", state: "MG", status: "Ativa", brokers: 18, clients: 146, updated: "hoje, 10:24", updatedOrder: "2026-07-22T10:24" },
  { id: "TNT-002", slug: "horizonte-negocios", name: "Horizonte Negócios", initials: "HN", document: "23.456.789/0001-01", city: "Nova Lima", state: "MG", status: "Pendente de análise", brokers: 0, clients: 0, updated: "hoje, 09:12", updatedOrder: "2026-07-22T09:12" },
  { id: "TNT-003", slug: "casa-norte", name: "Casa Norte", initials: "CN", document: "34.567.890/0001-12", city: "Contagem", state: "MG", status: "Ativa", brokers: 12, clients: 98, updated: "ontem, 17:40", updatedOrder: "2026-07-21T17:40" },
  { id: "TNT-004", slug: "pampulha-imoveis", name: "Pampulha Imóveis", initials: "PI", document: "45.678.901/0001-23", city: "Belo Horizonte", state: "MG", status: "Informações pendentes", brokers: 0, clients: 0, updated: "ontem, 15:06", updatedOrder: "2026-07-21T15:06" },
  { id: "TNT-005", slug: "vertice-imobiliaria", name: "Vértice Imobiliária", initials: "VI", document: "56.789.012/0001-34", city: "São Paulo", state: "SP", status: "Ativa", brokers: 31, clients: 284, updated: "21 jul, 12:18", updatedOrder: "2026-07-21T12:18" },
  { id: "TNT-006", slug: "orla-casas", name: "Orla Casas", initials: "OC", document: "67.890.123/0001-45", city: "Rio de Janeiro", state: "RJ", status: "Suspensa", brokers: 9, clients: 72, updated: "20 jul, 16:33", updatedOrder: "2026-07-20T16:33" },
  { id: "TNT-007", slug: "leste-lar", name: "Leste Lar", initials: "LL", document: "78.901.234/0001-56", city: "Vitória", state: "ES", status: "Ativa", brokers: 14, clients: 121, updated: "19 jul, 11:02", updatedOrder: "2026-07-19T11:02" },
  { id: "TNT-008", slug: "serra-prime", name: "Serra Prime", initials: "SP", document: "89.012.345/0001-67", city: "Petrópolis", state: "RJ", status: "Em análise", brokers: 0, clients: 0, updated: "18 jul, 14:47", updatedOrder: "2026-07-18T14:47" },
  { id: "TNT-009", slug: "eixo-sul", name: "Eixo Sul", initials: "ES", document: "90.123.456/0001-78", city: "Curitiba", state: "PR", status: "Ativa", brokers: 22, clients: 193, updated: "17 jul, 09:30", updatedOrder: "2026-07-17T09:30" },
  { id: "TNT-010", slug: "plano-a-imoveis", name: "Plano A Imóveis", initials: "PA", document: "01.234.567/0001-89", city: "Goiânia", state: "GO", status: "Ativa", brokers: 16, clients: 137, updated: "16 jul, 18:08", updatedOrder: "2026-07-16T18:08" },
];

const brokerNames = ["Ana Lima", "Bruno Alves", "Carla Souza", "Diego Rocha", "Elisa Martins", "Fábio Nunes", "Gabriela Melo", "Hugo Reis"];

function brokerItems(agency: Agency): AvatarGroupItem[] {
  return Array.from({ length: agency.brokers }, (_, index) => ({
    name: index < brokerNames.length ? brokerNames[index] : `${brokerNames[index % brokerNames.length]} ${Math.floor(index / brokerNames.length) + 1}`,
  }));
}

const statusTone: Record<AgencyStatus, BadgeTone> = {
  "Ativa": "success",
  "Pendente de análise": "info",
  "Em análise": "warn",
  "Informações pendentes": "danger",
  "Suspensa": "neutral",
};

function AgencyRowActions({ agency }: { agency: Agency }) {
  const [open, setOpen] = useState(false);
  const entries: MenuEntry[] = [
    { id: "details", label: "Ver detalhes", onSelect: () => openHarnessStory(agencyDetailStoryId) },
    ...(agency.status === "Ativa" ? [{ id: "area", label: "Abrir área da imobiliária", onSelect: () => openHarnessStory(agencyAreaStoryId) }] : []),
    ...(agency.brokers > 0 ? [{ id: "brokers", label: "Ver corretores", onSelect: () => openHarnessStory(agencyBrokersStoryId) }] : []),
  ];

  return (
    <div className={styles.agencyRowActions}>
      {agency.status === "Pendente de análise" && (
        <Button
          size="sm"
          variant="primary"
          onClick={(event) => {
            event.stopPropagation();
            openHarnessStory(agencyDetailStoryId, "args=initialState:under-review;initialView:analysis");
          }}
        >
          Iniciar análise
        </Button>
      )}
      <Menu open={open} onOpenChange={setOpen} entries={entries} align="end">
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={`Ações de ${agency.name}`}
          aria-haspopup="menu"
          aria-expanded={open}
          icon={<span aria-hidden="true">•••</span>}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
        />
      </Menu>
    </div>
  );
}

const columns: Column<Agency>[] = [
  { key: "id", header: "ID", sortable: true, cell: (agency) => <span className={styles.agencyId}>{agency.id}</span> },
  {
    key: "name",
    header: "Imobiliária",
    sortable: true,
    width: "28%",
    cell: (agency) => (
      <PersonCell
        size="sm"
        avatar={<Avatar shape="square" size="sm" initials={agency.initials} seed={agency.name} />}
        name={agency.name}
        secondary={agency.document}
      />
    ),
  },
  { key: "city", header: "Localidade", sortable: true, filterable: true, filterValue: (agency) => agency.state, cell: (agency) => `${agency.city} · ${agency.state}` },
  { key: "status", header: "Situação", sortable: true, filterable: true, cell: (agency) => <Badge tone={statusTone[agency.status]} dot>{agency.status}</Badge> },
  { key: "brokers", header: "Corretores", sortable: true, cell: (agency) => agency.brokers > 0 ? <AvatarGroup items={brokerItems(agency)} max={3} size="sm" aria-label={`${agency.brokers} corretores de ${agency.name}`} /> : "0" },
  { key: "clients", header: "Clientes", align: "num", sortable: true, cell: (agency) => agency.clients.toLocaleString("pt-BR") },
  { key: "updated", header: "Atualização", sortable: true, sortValue: (agency) => agency.updatedOrder, cell: (agency) => agency.updated },
  { key: "actions", header: "Ações", align: "right", cell: (agency) => <AgencyRowActions agency={agency} /> },
];

export const backofficeSidebar = {
  brand: "dommus" as const,
  defaultActiveId: "agencies",
  account: { name: "André Martins", email: "andre@domuz.app", initials: "AM", seed: "USR-001" },
  groups: [
    {
      section: "Plataforma",
      items: [
        { id: "overview", label: "Visão geral", icon: Icons.dashboard, href: storyHref(backofficeHomeStoryId), target: "_top" },
        { id: "agencies", label: "Imobiliárias", icon: Icons.projects, href: storyHref(agencyIndexStoryId), target: "_top" },
        { id: "brokers", label: "Corretores", icon: Icons.backlog, href: storyHref("produto-backoffice-corretores--t-01-c-brokers"), target: "_top" },
        { id: "clients", label: "Clientes e buscas", icon: Icons.monitor, href: storyHref("produto-backoffice-clientes-e-buscas--clients"), target: "_top" },
      ],
    },
    {
      section: "Dados e operação",
      items: [
        { id: "properties", label: "Imóveis", icon: Icons.projects, href: storyHref("produto-backoffice-imóveis--properties"), target: "_top" },
        { id: "sources", label: "Fontes e crawlers", icon: Icons.monitor, badge: 2, href: storyHref("produto-backoffice-fontes-e-crawlers--sources"), target: "_top" },
        { id: "pipeline", label: "Pipeline", icon: Icons.competitors, badge: 1, href: storyHref("produto-backoffice-pipeline--pipeline"), target: "_top" },
        { id: "reviews", label: "Revisões de dados", icon: Icons.backlog, badge: 14, href: storyHref("produto-backoffice-revisões-de-dados--data-reviews"), target: "_top" },
        { id: "analytics", label: "Analítica", icon: Icons.competitors, href: storyHref("produto-backoffice-analítica--analytics"), target: "_top" },
      ],
    },
    {
      section: "Administração",
      items: [
        { id: "users", label: "Usuários", icon: Icons.backlog, href: userStoryHref, target: "_top" },
        { id: "parameters", label: "Parâmetros", icon: Icons.settings, href: storyHref("produto-backoffice-parâmetros--parameters"), target: "_top" },
        { id: "versions", label: "Versões", icon: Icons.download, href: storyHref("produto-backoffice-versões--versions"), target: "_top" },
        { id: "audit", label: "Auditoria", icon: Icons.backlog, href: storyHref("produto-backoffice-auditoria--audit"), target: "_top" },
      ],
    },
  ],
};

export function BackofficeAgencies({ state = "default" }: { state?: AgenciesState }) {
  const [recovered, setRecovered] = useState(false);

  const failed = state === "error" && !recovered;
  const rows = state === "empty" ? [] : agencies;

  return (
    <BackofficeShell sidebar={backofficeSidebar} crumbs={[{ label: "Plataforma" }, { label: "Imobiliárias" }]}>
        <div className={styles.page}>
          <PageHeader
            className={styles.pageHeader}
            title="Imobiliárias"
            actions={<Button variant="primary" leadingIcon={Icons.plus} onClick={() => openHarnessStory(agencyCreateStoryId)}>Cadastrar imobiliária</Button>}
          />
          <Table
            caption="Imobiliárias da plataforma"
            searchable
            searchPlaceholder="Buscar por nome, CNPJ ou cidade"
            searchMatch={(agency, query) => `${agency.id} ${agency.name} ${agency.document} ${agency.city} ${agency.state} ${agency.slug}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))}
            columns={columns}
            rows={rows}
            rowKey={(agency) => agency.id}
            onRowClick={() => openHarnessStory(agencyDetailStoryId)}
            rowLabel={(agency) => `Abrir detalhes de ${agency.name}`}
            loading={state === "loading"}
            error={failed ? "Não foi possível carregar as imobiliárias." : undefined}
            empty="Nenhuma imobiliária cadastrada."
            pagination={{ pageSize: 6, pageSizeOptions: [6, 10, 20] }}
            minTableWidth={960}
          />
          {failed && <Button className={styles.retry} size="sm" onClick={() => setRecovered(true)}>Tentar novamente</Button>}
        </div>
    </BackofficeShell>
  );
}

const reviewStatus: Record<AgencyReviewState, { label: AgencyStatus | "Recusada" | "Excluída"; tone: BadgeTone; note: string }> = {
  "pending-review": { label: "Pendente de análise", tone: "info", note: "Cadastro enviado e ainda não atribuído." },
  "active": { label: "Ativa", tone: "success", note: "Cadastro aprovado em 18 de julho de 2026." },
  "under-review": { label: "Em análise", tone: "warn", note: "Análise atribuída a André Martins." },
  "needs-information": { label: "Informações pendentes", tone: "danger", note: "A imobiliária precisa enviar um comprovante de endereço atualizado." },
  "rejected": { label: "Recusada", tone: "danger", note: "Cadastro recusado em 21 de julho de 2026." },
  "suspended": { label: "Suspensa", tone: "neutral", note: "A área da imobiliária está bloqueada desde 20 de julho de 2026." },
  "deleted": { label: "Excluída", tone: "danger", note: "Cadastro excluído logicamente. Dados e histórico foram preservados para auditoria." },
};

type AnalysisResult = "" | "conform" | "pending";

interface AgencyAnalysisCriterion {
  id: string;
  label: string;
  source: string;
  result: AnalysisResult;
  note: string;
}

interface AgencyAnalysisSection {
  id: string;
  label: string;
  description: string;
  criteria: AgencyAnalysisCriterion[];
}

const initialAgencyAnalysis: AgencyAnalysisSection[] = [
  {
    id: "company",
    label: "Empresa",
    description: "Confira a identificação e a regularidade cadastral da imobiliária.",
    criteria: [
      { id: "cnpj", label: "CNPJ ativo e compatível com a razão social", source: "Receita Federal e cadastro enviado", result: "", note: "" },
      { id: "creci", label: "CRECI PJ ativo e vinculado ao CNPJ", source: "Conselho Regional de Corretores de Imóveis", result: "", note: "" },
      { id: "duplicate", label: "Não existe outra imobiliária com o mesmo CNPJ", source: "Base da Domuz.app", result: "", note: "" },
    ],
  },
  {
    id: "address",
    label: "Endereço",
    description: "Confira se o endereço declarado corresponde aos comprovantes enviados.",
    criteria: [
      { id: "postal-code", label: "CEP e localidade conferem", source: "Cadastro enviado e consulta de CEP", result: "", note: "" },
      { id: "proof", label: "Comprovante de endereço válido", source: "Comprovante de endereço", result: "", note: "" },
    ],
  },
  {
    id: "documents",
    label: "Documentos",
    description: "Confira a leitura, a validade e a consistência dos arquivos.",
    criteria: agencyRegistrationDocuments.map((document) => ({
      id: `document-${document.id}`,
      label: document.reviewCheck,
      source: document.label,
      result: "",
      note: "",
    })),
  },
];

function analysisSectionState(section: AgencyAnalysisSection): ApprovalWorkbenchItem["state"] {
  const answered = section.criteria.filter((criterion) => criterion.result).length;
  const hasPending = section.criteria.some((criterion) => criterion.result === "pending");
  if (hasPending) return "attention";
  if (answered === section.criteria.length) return "complete";
  return answered > 0 ? "in-progress" : "not-started";
}

function AgencyAnalysisWorkbench() {
  const [sections, setSections] = useState(initialAgencyAnalysis);
  const [activeId, setActiveId] = useState(initialAgencyAnalysis[0].id);
  const [feedback, setFeedback] = useState<ToastData | null>(null);
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];
  const reviewed = sections.flatMap((section) => section.criteria).filter((criterion) => criterion.result).length;
  const total = sections.flatMap((section) => section.criteria).length;
  const pending = sections.flatMap((section) => section.criteria).filter((criterion) => criterion.result === "pending").length;
  const pendingReview = total - reviewed;
  const analysisBadgeLabel = pending > 0
    ? `${pending} ${pending === 1 ? "pendência" : "pendências"}`
    : pendingReview > 0
      ? `${pendingReview} ${pendingReview === 1 ? "item sem análise" : "itens sem análise"}`
      : "Nenhuma pendência";
  const items: ApprovalWorkbenchItem[] = sections.map((section) => {
    const answered = section.criteria.filter((criterion) => criterion.result).length;
    return {
      id: section.id,
      label: section.label,
      meta: `${answered} de ${section.criteria.length} analisados`,
      state: analysisSectionState(section),
    };
  });

  function updateCriterion(id: string, patch: Partial<AgencyAnalysisCriterion>) {
    setSections((current) => current.map((section) => (
      section.id === activeSection.id
        ? { ...section, criteria: section.criteria.map((criterion) => criterion.id === id ? { ...criterion, ...patch } : criterion) }
        : section
    )));
  }

  return (
    <>
      <div className={styles.agencyAnalysisSummary}>
        <div>
          <strong>Análise cadastral</strong>
          <span>{reviewed} de {total} itens analisados</span>
        </div>
        <Badge tone={pending > 0 || pendingReview > 0 ? "warn" : "neutral"}>{analysisBadgeLabel}</Badge>
      </div>
      <ApprovalWorkbench className={styles.agencyAnalysisWorkbench} items={items} activeId={activeId} onActiveChange={setActiveId}>
        <Card className={styles.agencyAnalysisCard}>
          <SectionHeader title={activeSection.label} sub={activeSection.description} />
          <div className={styles.agencyAnalysisCriteria}>
            {activeSection.criteria.map((criterion) => (
              <div className={styles.agencyAnalysisCriterion} key={criterion.id}>
                <div>
                  <strong>{criterion.label}</strong>
                  <span>{criterion.source}</span>
                </div>
                <Select
                  label="Resultado"
                  value={criterion.result}
                  onChange={(event) => {
                    const result = event.target.value as AnalysisResult;
                    updateCriterion(criterion.id, { result, note: result === "pending" ? criterion.note : "" });
                    setFeedback({
                      id: `analysis-${criterion.id}`,
                      title: "Resultado salvo",
                      description: criterion.label,
                      tone: "success",
                      duration: 4000,
                    });
                  }}
                >
                  <option value="">Selecione</option>
                  <option value="conform">Conforme</option>
                  <option value="pending">Com pendência</option>
                </Select>
                {criterion.result === "pending" && (
                  <Textarea
                    className={styles.agencyAnalysisNote}
                    label="O que precisa ser corrigido"
                    value={criterion.note}
                    onChange={(event) => updateCriterion(criterion.id, { note: event.target.value })}
                    onBlur={() => {
                      if (!criterion.note.trim()) return;
                      setFeedback({
                        id: `pending-${criterion.id}`,
                        title: "Pendência salva",
                        description: criterion.label,
                        tone: "success",
                        duration: 4000,
                      });
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </ApprovalWorkbench>
      <ToastRegion position="top-right" toasts={feedback ? [feedback] : []} onDismiss={() => setFeedback(null)} />
    </>
  );
}

const reviewSubnav = [
  { href: "#general", label: "Geral", description: "Cadastro e documentos", icon: Icons.projects },
  { href: "#responsible", label: "Responsável", description: "Titular e alterações", icon: Icons.settings },
  { href: "#history", label: "Histórico", description: "Eventos do cadastro", icon: Icons.backlog },
  { href: "#administration", label: "Administração", description: "Desativação e exclusão", icon: Icons.settings },
];

const reviewSections: Record<AgencyReviewView, Array<{ id: string; label: string }>> = {
  general: [
    { id: "agency-registration", label: "Dados cadastrais" },
    { id: "agency-address", label: "Endereço" },
    { id: "agency-contacts", label: "Contatos" },
    { id: "agency-documents", label: "Documentos" },
  ],
  responsible: [
    { id: "agency-responsible", label: "Responsável atual" },
    { id: "agency-responsible-history", label: "Alterações" },
  ],
  history: [{ id: "agency-event-history", label: "Linha do tempo" }],
  administration: [
    { id: "agency-suspend", label: "Desativar imobiliária" },
    { id: "agency-delete", label: "Excluir imobiliária" },
  ],
  analysis: [],
};

interface ReviewDocument {
  id: AgencyRegistrationDocumentId;
  title: string;
  description: string;
  meta: string;
  status: "Pendente" | "Aprovado" | "Reprovado";
  analyses: Array<{
    id: string;
    status: "Aprovado" | "Reprovado";
    finding: string;
    actor: { name: string; initials: string };
    timestamp: string;
  }>;
}

const submittedDocumentMeta: Record<AgencyRegistrationDocumentId, string> = {
  contract: "PDF · 2,4 MB · enviado em 22 jul. 2026",
  cnpj: "PDF · 340 KB · enviado em 22 jul. 2026",
  creci: "PDF · 680 KB · enviado em 22 jul. 2026",
  address: "PDF · 520 KB · enviado em 22 jul. 2026",
};

const initialDocuments: ReviewDocument[] = agencyRegistrationDocuments.map((document) => ({
  id: document.id,
  title: document.label,
  description: document.purpose,
  meta: submittedDocumentMeta[document.id],
  status: "Pendente",
  analyses: [],
}));

const replacementOptions = [
  { value: "fernanda-lopes", label: "Fernanda Lopes", description: "Diretora · Horizonte Negócios", avatar: { name: "Fernanda Lopes" }, email: "fernanda@horizonteimoveis.com.br", role: "Diretora" },
  { value: "paulo-mendes", label: "Paulo Mendes", description: "Gerente administrativo · Horizonte Negócios", avatar: { name: "Paulo Mendes" }, email: "paulo@horizonteimoveis.com.br", role: "Gerente administrativo" },
];

const platformReplacementOptions = [
  ...replacementOptions,
  { value: "larissa-gomes", label: "Larissa Gomes", description: "Responsável legal · Domuz.app", avatar: { name: "Larissa Gomes" }, email: "larissa@domuz.app", role: "Responsável legal" },
];

const roleOptions = ["Sócia administradora", "Responsável legal", "Diretora", "Gerente administrativo"];

type AgencyAdministrativeAction = "suspend" | "delete";

interface AgencyActionCriterion {
  id: string;
  title: string;
  description: string;
  subcriteria: string[];
}

const agencyActionCriteria: Record<AgencyAdministrativeAction, {
  title: string;
  description: string;
  criteria: AgencyActionCriterion[];
}> = {
  suspend: {
    title: "Desativar imobiliária",
    description: "Use quando a imobiliária precisa sair da operação enquanto a equipe corrige um risco reversível.",
    criteria: [
      {
        id: "expired-registration",
        title: "Documento ou registro vencido",
        description: "CRECI PJ, contrato social ou poderes do responsável deixaram de sustentar a operação.",
        subcriteria: ["Identificar o documento vencido", "Registrar onde a divergência apareceu", "Informar o responsável pelo ajuste"],
      },
      {
        id: "service-risk",
        title: "Risco no atendimento ao cliente",
        description: "Há reclamação, conduta em apuração ou falha operacional que exige pausa antes de novos atendimentos.",
        subcriteria: ["Citar o caso ou protocolo", "Bloquear novos contatos enquanto a apuração corre", "Definir quem revisa a retomada"],
      },
      {
        id: "formal-request",
        title: "Pedido formal da imobiliária",
        description: "A própria imobiliária pediu pausa temporária da operação ou troca de responsável antes de voltar.",
        subcriteria: ["Anexar o pedido recebido", "Registrar quem solicitou a pausa", "Definir condição de reativação"],
      },
    ],
  },
  delete: {
    title: "Excluir imobiliária",
    description: "Use quando este cadastro não deve voltar para a operação. A exclusão é lógica e preserva histórico.",
    criteria: [
      {
        id: "closed-company",
        title: "Empresa encerrada ou sem autorização",
        description: "O CNPJ foi baixado, a autorização foi revogada ou não existe responsável com poder para manter a operação.",
        subcriteria: ["Guardar a fonte da baixa ou revogação", "Confirmar ausência de atendimento ativo", "Registrar ciência do responsável"],
      },
      {
        id: "confirmed-duplicate",
        title: "Cadastro duplicado consolidado",
        description: "A imobiliária já existe em outro cadastro e os vínculos foram migrados para o registro correto.",
        subcriteria: ["Indicar o cadastro que permanece", "Confirmar migração de usuários e documentos", "Registrar por que este cadastro sai"],
      },
      {
        id: "confirmed-fraud",
        title: "Fraude confirmada",
        description: "A análise confirmou falsidade documental, representação indevida ou tentativa de uso irregular da plataforma.",
        subcriteria: ["Citar a evidência confirmada", "Bloquear convites e acessos pendentes", "Registrar quem aprovou a exclusão"],
      },
    ],
  },
};

function openHarnessStory(storyId: string, query?: string) {
  window.parent.location.assign(`/?path=/story/${storyId}${query ? `&${query}` : ""}&globals=viewport:desktop1440`);
}

const initialAgencyEvents: TimelineEvent[] = [
  { id: "contract-reviewed", timestamp: "2026-07-23T11:42:00-03:00", title: "Contrato social reprovado", description: "A versão enviada não inclui a alteração contratual registrada em junho de 2026.", actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" }, badge: { label: "Reprovado", tone: "danger" }, status: { label: "Em análise", tone: "warn" } },
  { id: "analysis-started", timestamp: "2026-07-23T11:30:00-03:00", title: "Análise do cadastro iniciada", description: "André Martins assumiu a revisão dos dados e documentos.", actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" }, status: { label: "Em análise", tone: "warn" } },
  { id: "documents-sent", timestamp: "2026-07-22T09:12:00-03:00", title: "Quatro documentos enviados", description: "Contrato social, cartão do CNPJ, comprovante do CRECI PJ e comprovante de endereço.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Enviado", tone: "info" } },
  { id: "registration-updated", timestamp: "2026-07-22T09:04:00-03:00", title: "Dados cadastrais atualizados", description: "Nome fantasia, site e CRECI PJ foram alterados.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Rascunho", tone: "neutral" } },
  { id: "address-updated", timestamp: "2026-07-22T08:58:00-03:00", title: "Endereço comercial atualizado", description: "Rua das Acácias, 240, Vila da Serra, Nova Lima, MG.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Rascunho", tone: "neutral" } },
  { id: "email-confirmed", timestamp: "2026-07-22T08:54:00-03:00", title: "E-mail confirmado", description: "marina@horizonteimoveis.com.br", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Rascunho", tone: "neutral" } },
  { id: "responsible-set", timestamp: "2026-07-21T18:42:00-03:00", title: "Responsável definida", description: "Marina Torres, Sócia administradora.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Rascunho", tone: "neutral" } },
  { id: "registration-started", timestamp: "2026-07-21T18:20:00-03:00", title: "Cadastro iniciado", description: "Horizonte Negócios Imobiliários Ltda.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" }, status: { label: "Rascunho", tone: "neutral" } },
];

const agencyTimelineStatus: Record<AgencyReviewState, NonNullable<TimelineEvent["status"]>> = {
  "pending-review": { label: "Pendente de análise", tone: "info" },
  active: { label: "Ativa", tone: "good" },
  "under-review": { label: "Em análise", tone: "warn" },
  "needs-information": { label: "Informações pendentes", tone: "critical" },
  rejected: { label: "Recusada", tone: "critical" },
  suspended: { label: "Suspensa", tone: "neutral" },
  deleted: { label: "Excluída", tone: "critical" },
};

export interface BackofficeAgencyReviewProps {
  initialView?: AgencyReviewView;
  initialState?: AgencyReviewState;
  initialAgencyAction?: AgencyAdministrativeAction | null;
}

export function BackofficeAgencyReview({
  initialView = "general",
  initialState = "pending-review",
  initialAgencyAction = null,
}: BackofficeAgencyReviewProps = {}) {
  const [currentState, setCurrentState] = useState<AgencyReviewState>(initialState);
  const [activeView, setActiveView] = useState<AgencyReviewView>(initialView);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(false);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [postalCode, setPostalCode] = useState("34006-042");
  const [registration, setRegistration] = useState({ legalName: "Horizonte Negócios Imobiliários Ltda.", tradeName: "Horizonte Negócios", document: "23.456.789/0001-01", creci: "MG 12.345-J", site: "horizonteimoveis.com.br", slug: "horizonte-negocios" });
  const [agencyAvatar, setAgencyAvatar] = useState<string>();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editingContacts, setEditingContacts] = useState(false);
  const [agencyContacts, setAgencyContacts] = useState({ email: "contato@horizonteimoveis.com.br", commercialPhone: "(31) 3541-8200", whatsapp: "(31) 9 9123-0042" });
  const [commercialCountry, setCommercialCountry] = useState("BR");
  const [whatsappCountry, setWhatsappCountry] = useState("BR");
  const [documents, setDocuments] = useState(initialDocuments);
  const [previewDocument, setPreviewDocument] = useState<ReviewDocument | null>(null);
  const [documentFinding, setDocumentFinding] = useState("");
  const [reviewingDocument, setReviewingDocument] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<ReviewDocument | null>(null);
  const [responsibleFlow, setResponsibleFlow] = useState<"replace" | "disable" | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null);
  const [responsibleSearchScope, setResponsibleSearchScope] = useState<"agency" | "platform">("agency");
  const [currentResponsible, setCurrentResponsible] = useState({ name: "Marina Torres", email: "marina@horizonteimoveis.com.br", role: "Sócia administradora", initials: "MT" });
  const [editingResponsible, setEditingResponsible] = useState(false);
  const [savingResponsible, setSavingResponsible] = useState(false);
  const [responsibleCountry, setResponsibleCountry] = useState("BR");
  const [responsiblePhone, setResponsiblePhone] = useState("(31) 9 8123-4567");
  const [responsibleEvents, setResponsibleEvents] = useState<TimelineEvent[]>([
    { id: "responsible-created", timestamp: "2026-07-21T18:42:00-03:00", title: "Marina Torres foi definida como responsável", description: "Função cadastrada: Sócia administradora.", actor: { name: "Marina Torres", initials: "MT", seed: "USR-002", href: userStoryHref, target: "_top" } },
  ]);
  const [agencyEvents, setAgencyEvents] = useState<TimelineEvent[]>(initialAgencyEvents);
  const [decision, setDecision] = useState<"approve" | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);
  const [inviteMode, setInviteMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [pendingTransfer, setPendingTransfer] = useState<{ email: string; requestedAt: string } | null>(null);
  const [agencyAction, setAgencyAction] = useState<AgencyAdministrativeAction | null>(initialAgencyAction);
  const [agencyActionCriterion, setAgencyActionCriterion] = useState("");
  const [agencyActionChecks, setAgencyActionChecks] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const pageHeaderRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = pageHeaderRef.current;
    if (!header || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 60),
      { rootMargin: "-60px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const status = reviewStatus[currentState];
  const currentSections = reviewSections[activeView];
  const activeActionConfig = agencyAction ? agencyActionCriteria[agencyAction] : null;
  const selectedActionCriterion = activeActionConfig?.criteria.find((criterion) => criterion.id === agencyActionCriterion);
  const selectedActionChecks = selectedActionCriterion?.subcriteria.filter((item) => agencyActionChecks[item]) ?? [];
  const agencyActionReady = deleteConfirmation === registration.slug
    && Boolean(agencyActionCriterion)
    && selectedActionChecks.length === (selectedActionCriterion?.subcriteria.length ?? 0)
    && Boolean(decisionReason.trim());

  const stateActions = currentState === "pending-review" ? (
    <Button size="sm" variant="primary" onClick={startAnalysis}>Iniciar análise</Button>
  ) : currentState === "active" ? (
    <Button size="sm" variant="primary" onClick={() => openHarnessStory("produto-imobili%C3%A1ria-vis%C3%A3o-geral--h-02-agency-area")}>Abrir área da imobiliária</Button>
  ) : currentState === "suspended" ? (
    <Button size="sm" variant="primary" onClick={() => { setCurrentState("active"); addAgencyEvent("Imobiliária reativada", "Os acessos e a área pública foram liberados.", { state: "active" }); }}>Reativar imobiliária</Button>
  ) : currentState === "needs-information" || currentState === "rejected" ? (
    <Button size="sm" variant="primary" onClick={() => { setCurrentState("under-review"); addAgencyEvent("Análise retomada", "O cadastro voltou para a fila de análise.", { state: "under-review" }); }}>Retomar análise</Button>
  ) : undefined;
  const reviewActions = stateActions;

  function addAgencyEvent(title: string, description: string, options: { badge?: TimelineEvent["badge"]; state?: AgencyReviewState } = {}) {
    const state = options.state ?? currentState;
    setAgencyEvents((events) => [{ id: `event-${events.length + 1}`, timestamp: "2026-07-23T11:50:00-03:00", title, description, actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" }, badge: options.badge, status: agencyTimelineStatus[state] }, ...events]);
  }

  function notify(message: string) {
    setSnackbarMessage(message);
    window.setTimeout(() => setSnackbarMessage(null), 4000);
  }

  function resetAgencyAction() {
    setAgencyAction(null);
    setAgencyActionCriterion("");
    setAgencyActionChecks({});
    setDecisionReason("");
    setDeleteConfirmation("");
  }

  function openAgencyAction(action: AgencyAdministrativeAction) {
    setAgencyAction(action);
    setAgencyActionCriterion("");
    setAgencyActionChecks({});
    setDecisionReason("");
    setDeleteConfirmation("");
  }

  function startAnalysis() {
    setCurrentState("under-review");
    setActiveView("analysis");
    addAgencyEvent("Análise do cadastro iniciada", "André Martins assumiu a análise dos dados e documentos.", { state: "under-review" });
    notify("Análise iniciada. Este cadastro está atribuído a você.");
  }

  function updateAgencyAvatar(files: File[]) {
    const file = files[0];
    if (!file) {
      setAgencyAvatar(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAgencyAvatar(reader.result);
        addAgencyEvent("Avatar da imobiliária atualizado", file.name);
        notify("Avatar da imobiliária salvo");
      }
    };
    reader.readAsDataURL(file);
  }

  function saveRegistration() {
    setSavingRegistration(true);
    window.setTimeout(() => {
      setSavingRegistration(false);
      setEditingRegistration(false);
      addAgencyEvent("Dados cadastrais atualizados", "Razão social, nome fantasia, registros e endereços públicos foram salvos.");
      notify("Dados cadastrais salvos");
    }, 600);
  }

  function saveResponsible() {
    setSavingResponsible(true);
    window.setTimeout(() => {
      setSavingResponsible(false);
      setEditingResponsible(false);
      setCurrentResponsible((responsible) => ({ ...responsible, initials: responsible.name.split(" ").map((part) => part[0]).join("").slice(0, 2) }));
      addAgencyEvent("Dados do responsável atualizados", `${currentResponsible.name}: nome, função, e-mail ou telefone foram revisados.`);
      notify("Dados do responsável salvos");
    }, 600);
  }

  function saveDocumentAnalysis(status: "Aprovado" | "Reprovado") {
    if (!previewDocument || !documentFinding.trim()) return;
    const analysis = {
      id: `${previewDocument.id}-analysis-${previewDocument.analyses.length + 1}`,
      status,
      finding: documentFinding.trim(),
      actor: { name: "André Martins", initials: "AM" },
      timestamp: "23 jul. 2026, 11:50",
    };
    const updated = { ...previewDocument, status, analyses: [analysis, ...previewDocument.analyses] };
    setDocuments((current) => current.map((document) => document.id === updated.id ? updated : document));
    setPreviewDocument(updated);
    setDocumentFinding("");
    setReviewingDocument(false);
    addAgencyEvent(`Documento ${status.toLocaleLowerCase("pt-BR")}`, `${updated.title}: ${analysis.finding}`, { badge: { label: status, tone: status === "Aprovado" ? "success" : "danger" } });
    notify(`Análise de ${updated.title} salva`);
  }

  function changeView(href: string) {
    openHarnessStory(agencyDetailStories[href.slice(1) as AgencyReviewView]);
  }

  function applyReplacement() {
    const availableOptions = responsibleSearchScope === "agency" ? replacementOptions : platformReplacementOptions;
    const next = availableOptions.find((option) => option.value === selectedReplacement);
    if (!next) return;
    const previous = currentResponsible.name;
    setCurrentResponsible({ name: next.label, email: next.email, role: next.role, initials: next.label.split(" ").map((part) => part[0]).join("").slice(0, 2) });
    const timestamp = "2026-07-22T11:30:00-03:00";
    const activationEvent: TimelineEvent = { id: `responsible-activation-${responsibleEvents.length + 1}`, timestamp, title: `${next.label} foi ativado como responsável`, description: `Função cadastrada: ${next.role}.`, actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" }, badge: { label: "Atual", tone: "success" } };
    const events: TimelineEvent[] = responsibleFlow === "disable"
      ? [
          activationEvent,
          { id: `responsible-deactivation-${responsibleEvents.length + 2}`, timestamp, title: `${previous} foi desativada como responsável`, description: "O vínculo anterior foi encerrado após a confirmação da substituição.", actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" }, badge: { label: "Desativada", tone: "neutral" } },
        ]
      : [
          activationEvent,
          { id: `responsible-replacement-${responsibleEvents.length + 2}`, timestamp, title: `${previous} deixou de ser responsável`, description: `A responsabilidade foi transferida para ${next.label}.`, actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" } },
        ];
    setResponsibleEvents((current) => [...events, ...current]);
    setAgencyEvents((current) => [...events.map((event) => ({ ...event, status: agencyTimelineStatus[currentState] })), ...current]);
    setResponsibleFlow(null);
    setSelectedReplacement(null);
    setResponsibleSearchScope("agency");
    setInviteMode(false);
    notify("Responsável alterado");
  }

  function inviteResponsible() {
    if (!inviteEmail.trim()) return;
    setPendingTransfer({ email: inviteEmail.trim(), requestedAt: "23 jul. 2026, 10:20" });
    const event: TimelineEvent = {
      id: `responsible-invite-${responsibleEvents.length + 1}`,
      timestamp: "2026-07-23T10:20:00-03:00",
      title: "Convite enviado para o novo responsável",
      description: `${inviteEmail.trim()} precisa criar ou confirmar a conta antes da transferência.`,
      actor: { name: "André Martins", initials: "AM", seed: "USR-001", href: userStoryHref, target: "_top" },
      badge: { label: "Pendente", tone: "warn" },
    };
    setResponsibleEvents((current) => [event, ...current]);
    setAgencyEvents((current) => [{ ...event, status: agencyTimelineStatus[currentState] }, ...current]);
    setResponsibleFlow(null);
    setInviteMode(false);
    setInviteEmail("");
    notify("Convite enviado. A responsável atual continua ativa.");
  }

  function confirmDecision() {
    if (decision === "approve") {
      setCurrentState("active");
      addAgencyEvent("Imobiliária aprovada", `Acesso liberado em domuz.app/imobiliaria/${registration.slug}. O responsável recebeu a decisão por e-mail e na Domuz.app.`, { state: "active" });
      notify("Imobiliária aprovada e responsável avisado");
    }
    setDecision(null);
    setDecisionReason("");
    setApprovalConfirmed(false);
  }

  return (
    <>
      <BackofficeShell
        sidebar={backofficeSidebar}
        crumbs={[{ label: "Plataforma", onClick: () => openHarnessStory(backofficeHomeStoryId) }, { label: "Imobiliárias", onClick: () => openHarnessStory(agencyIndexStoryId) }, { label: "Horizonte Negócios" }]}
      >
        <StickyBar
          visible={stickyVisible}
          title={<span className={styles.agencyStickyTitle}><Avatar shape="square" size="sm" initials="HN" seed="Horizonte Negócios" src={agencyAvatar} /><span>Horizonte Negócios</span></span>}
          meta="TNT-002"
          status={<button type="button" className={styles.agencyStatusLink} onClick={() => openHarnessStory(agencyLifecycleStoryId)} aria-label={`Abrir o ciclo do cadastro em ${status.label}`}><Badge tone={status.tone} dot>{status.label}</Badge></button>}
          actions={reviewActions}
        />
        <div className={styles.page}>
          <PageHeader
            ref={pageHeaderRef}
            className={styles.pageHeader}
            title={<span className={styles.agencyReviewTitle}><Avatar shape="square" size="md" initials="HN" seed="Horizonte Negócios" src={agencyAvatar} /><span>Horizonte Negócios</span></span>}
            lead={<span className={styles.agencyReviewLead}><button type="button" className={styles.agencyStatusLink} onClick={() => openHarnessStory(agencyLifecycleStoryId)} aria-label={`Abrir o ciclo do cadastro em ${status.label}`}><Badge tone={status.tone} dot>{status.label}</Badge></button>{currentState !== "active" && <Badge tone="neutral">Operação inativa</Badge>}<span className={styles.agencyId}>TNT-002</span><span>Nova Lima, MG</span><span>{status.note}</span></span>}
            actions={reviewActions}
          />

          <Tabs
            className={styles.agencyReviewTabs}
            items={[
              { id: "registration", label: "Cadastro" },
              { id: "analysis", label: "Análise", disabled: currentState === "pending-review" },
              { id: "history", label: "Histórico" },
            ]}
            value={activeView === "analysis" ? "analysis" : activeView === "history" ? "history" : "registration"}
            onChange={(id) => setActiveView(id === "analysis" ? "analysis" : id === "history" ? "history" : "general")}
          />

          {activeView === "analysis" ? (
            <AgencyAnalysisWorkbench />
          ) : (
          <div className={styles.agencyReviewLayout}>
            <SettingsSubnav
              className={styles.agencyReviewSubnav}
              label="Áreas da imobiliária"
              items={reviewSubnav}
              activeHref={`#${activeView}`}
              renderLink={(item, linkProps) => (
                <a {...linkProps} onClick={(event) => { event.preventDefault(); changeView(item.href); }} />
              )}
            />

            <div className={styles.agencyReviewContent} id="agency-review-view">
              {activeView === "general" && (
                <>
                  <section className={styles.agencyReviewSection} aria-labelledby="agency-registration">
                    <SectionHeader id="agency-registration" title="Dados cadastrais" sub="Identificação, registro e endereços públicos da imobiliária." action={currentState === "active" ? <Button size="sm" disabled={savingRegistration} onClick={() => setEditingRegistration((editing) => !editing)}>{editingRegistration ? "Cancelar edição" : "Editar dados"}</Button> : undefined} />
                    <Card aria-busy={savingRegistration || undefined}>
                      <div className={styles.agencyAvatarEditor}>
                        <Avatar shape="square" size="xl" initials="HN" seed="Horizonte Negócios" src={agencyAvatar} />
                        <div>
                          <strong>Avatar da imobiliária</strong>
                          <span>PNG ou JPG. Máximo de 10 MB.</span>
                          {currentState === "active" && <div className={styles.agencyAvatarActions}>
                            <input
                              ref={avatarInputRef}
                              className={styles.agencyHiddenInput}
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              onChange={(event) => updateAgencyAvatar(Array.from(event.target.files ?? []))}
                            />
                            <Button size="sm" onClick={() => avatarInputRef.current?.click()}>Trocar avatar</Button>
                            {agencyAvatar && <Button size="sm" variant="ghost" onClick={() => { setAgencyAvatar(undefined); addAgencyEvent("Avatar da imobiliária removido", "A imobiliária voltou a usar as iniciais."); notify("Avatar removido"); }}>Remover</Button>}
                          </div>}
                        </div>
                      </div>
                      <div className={styles.agencyReviewFormGrid}>
                        <Input className={styles.agencyReviewWideField} label="Razão social" value={registration.legalName} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, legalName: event.target.value })} />
                        <Input label="Nome fantasia" value={registration.tradeName} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, tradeName: event.target.value })} />
                        <Input label="CNPJ" value={registration.document} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, document: event.target.value })} />
                        <Input label="CRECI PJ" value={registration.creci} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, creci: event.target.value })} />
                        <Input label="Site" prefix="https://" value={registration.site} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, site: event.target.value })} />
                        <Input label="Endereço na Domuz.app" prefix="domuz.app/imobiliaria/" value={registration.slug} disabled={!editingRegistration || savingRegistration} onChange={(event) => setRegistration({ ...registration, slug: event.target.value })} />
                      </div>
                      {editingRegistration && <div className={styles.agencyReviewFormActions}><Button size="sm" variant="primary" loading={savingRegistration} loadingLabel="Salvando" onClick={saveRegistration}>Salvar alterações</Button></div>}
                    </Card>

                    {currentState === "active" && (
                      <div className={styles.agencyReviewDestinations} aria-label="Acessos da imobiliária">
                        <NavCard title="Abrir área da imobiliária" description={`Acessar domuz.app/imobiliaria/${registration.slug}`} leading={Icons.projects} href="/?path=/story/produto-imobili%C3%A1ria-vis%C3%A3o-geral--h-02-agency-area" target="_top" />
                        <NavCard title="Ver corretores associados" description="Consultar vínculos e solicitações desta imobiliária" leading={Icons.backlog} href="/?path=/story/produto-backoffice-corretores--t-01-c-brokers" target="_top" />
                      </div>
                    )}
                  </section>

                  <section className={styles.agencyReviewSection} aria-labelledby="agency-address">
                    <SectionHeader id="agency-address" title="Endereço" sub="Endereço comercial informado no cadastro." />
                    <Card>
                      {editingAddress ? (
                        <>
                          <div key="address-fields" className={styles.agencyReviewFormGrid}>
                            <Input key="address-cep" label="CEP" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
                            <Input className={styles.agencyReviewWideField} label="Logradouro" defaultValue="Rua das Acácias" />
                            <Input label="Número" defaultValue="240" />
                            <Input label="Complemento" defaultValue="" />
                            <Input label="Bairro" defaultValue="Vila da Serra" />
                            <Input label="Cidade" defaultValue="Nova Lima" />
                            <Select label="Estado" defaultValue="MG"><option value="MG">Minas Gerais</option><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option></Select>
                          </div>
                          <div className={styles.agencyReviewFormActions}>
                            <Button size="sm" onClick={() => setEditingAddress(false)}>Cancelar</Button>
                            <Button size="sm" variant="primary" onClick={() => { setEditingAddress(false); addAgencyEvent("Endereço comercial atualizado", "Os campos do endereço foram alterados pelo administrador Domuz."); notify("Endereço salvo"); }}>Salvar endereço</Button>
                          </div>
                        </>
                      ) : (
                        <div key="full-address" className={styles.agencyReviewInlineField}>
                          <Input label="Endereço completo" value="Rua das Acácias, 240, Vila da Serra, Nova Lima, MG, 34006-042" disabled readOnly />
                          {currentState === "active" && <Button size="sm" onClick={() => setEditingAddress(true)}>Editar endereço</Button>}
                        </div>
                      )}
                    </Card>
                  </section>

                  <section className={styles.agencyReviewSection} aria-labelledby="agency-contacts">
                    <SectionHeader id="agency-contacts" title="Contatos" sub="Canais usados pela equipe Domuz e pelos clientes." action={currentState === "active" ? <Button size="sm" onClick={() => setEditingContacts((editing) => !editing)}>{editingContacts ? "Cancelar edição" : "Editar contatos"}</Button> : undefined} />
                    <Card>
                      <div className={styles.agencyReviewFormGrid}>
                        <Input className={styles.agencyReviewWideField} label="E-mail da imobiliária" type="email" value={agencyContacts.email} disabled={!editingContacts} onChange={(event) => setAgencyContacts({ ...agencyContacts, email: event.target.value })} />
                        <PhoneInput label="Telefone comercial" country={commercialCountry} onCountryChange={(country) => setCommercialCountry(country.code)} value={agencyContacts.commercialPhone} disabled={!editingContacts} onChange={(event) => setAgencyContacts({ ...agencyContacts, commercialPhone: event.target.value })} />
                        <PhoneInput label="WhatsApp" country={whatsappCountry} onCountryChange={(country) => setWhatsappCountry(country.code)} value={agencyContacts.whatsapp} disabled={!editingContacts} onChange={(event) => setAgencyContacts({ ...agencyContacts, whatsapp: event.target.value })} />
                      </div>
                      {editingContacts && <div className={styles.agencyReviewFormActions}><Button size="sm" variant="primary" onClick={() => { setEditingContacts(false); addAgencyEvent("Contatos da imobiliária atualizados", "E-mail, telefone comercial ou WhatsApp foram alterados."); notify("Contatos salvos"); }}>Salvar contatos</Button></div>}
                    </Card>
                  </section>

                  <section className={styles.agencyReviewSection} aria-labelledby="agency-documents">
                    <SectionHeader id="agency-documents" title="Documentos" count={documents.length} sub="Arquivos usados na análise do cadastro." />
                    <Card>
                      <SettingRowGroup aria-label="Documentos enviados">
                        {documents.map((document) => (
                          <SettingRow
                            key={document.id}
                            leading={<span className={styles.agencyFileType}>PDF</span>}
                            leadingFrame
                            title={document.title}
                            description={document.description}
                            meta={<span className={styles.agencyDocumentMeta}>{document.meta}<Badge tone={document.status === "Aprovado" ? "success" : document.status === "Reprovado" ? "danger" : "neutral"} dot>{document.status}</Badge></span>}
                            actions={<><Button size="sm" onClick={() => { setPreviewDocument(document); setDocumentFinding(""); setReviewingDocument(false); }}>Abrir arquivo</Button>{currentState === "active" && <Button size="sm" variant="danger" onClick={() => setDocumentToDelete(document)}>Excluir</Button>}</>}
                          />
                        ))}
                      </SettingRowGroup>
                      {currentState === "active" && <FileUpload className={styles.agencyReviewUpload} multiple accept={agencyDocumentAccept} label="Adicionar documento" hint={agencyDocumentHint} />}
                    </Card>
                  </section>
                </>
              )}

              {activeView === "responsible" && (
                <>
                  <section className={styles.agencyReviewSection} aria-labelledby="agency-responsible">
                    <SectionHeader id="agency-responsible" title="Responsável atual" sub="Pessoa autorizada a responder pelo cadastro da imobiliária." action={<Button size="sm" disabled={savingResponsible} onClick={() => setEditingResponsible((editing) => !editing)}>{editingResponsible ? "Cancelar edição" : "Editar responsável"}</Button>} />
                    {pendingTransfer && (
                      <div className={styles.agencyPendingTransfer}>
                        <div>
                          <Badge tone="warn" dot>Transferência pendente</Badge>
                          <strong>Convite enviado para {pendingTransfer.email}</strong>
                          <span>Marina Torres continua ativa. A Domuz.app avisará quando a nova pessoa confirmar a conta.</span>
                        </div>
                        <Button size="sm" onClick={() => openHarnessStory("produto-backoffice-imobiliárias-detalhes-da-imobiliária--transferir-responsabilidade")}>Acompanhar transferência</Button>
                      </div>
                    )}
                    <Card aria-busy={savingResponsible || undefined}>
                      <div className={styles.agencyReviewPerson}>
                        <Avatar size="md" initials={currentResponsible.initials} seed={currentResponsible.name} />
                        <div><strong>{currentResponsible.name}</strong><span>{currentResponsible.role}</span></div>
                        <Badge tone="success" dot>Ativa</Badge>
                      </div>
                      <div className={styles.agencyReviewFormGrid}>
                        <Input label="Nome completo" value={currentResponsible.name} disabled={!editingResponsible || savingResponsible} onChange={(event) => setCurrentResponsible({ ...currentResponsible, name: event.target.value })} />
                        <Select label="Função cadastrada" value={currentResponsible.role} disabled={!editingResponsible || savingResponsible} onChange={(event) => setCurrentResponsible({ ...currentResponsible, role: event.target.value })}>{roleOptions.map((role) => <option key={role}>{role}</option>)}</Select>
                        <Input label="E-mail" type="email" value={currentResponsible.email} disabled={!editingResponsible || savingResponsible} onChange={(event) => setCurrentResponsible({ ...currentResponsible, email: event.target.value })} />
                        <PhoneInput label="Telefone" country={responsibleCountry} onCountryChange={(country) => setResponsibleCountry(country.code)} value={responsiblePhone} disabled={!editingResponsible || savingResponsible} onChange={(event) => setResponsiblePhone(event.target.value)} />
                      </div>
                      <div className={styles.agencyReviewFormActions}>
                        {editingResponsible ? <Button size="sm" variant="primary" loading={savingResponsible} loadingLabel="Salvando" onClick={saveResponsible}>Salvar alterações</Button> : <><Button size="sm" onClick={() => setResponsibleFlow("replace")}>Trocar responsável</Button><Button size="sm" variant="danger" onClick={() => setResponsibleFlow("disable")}>Desativar e substituir</Button></>}
                      </div>
                    </Card>
                  </section>

                  <section className={styles.agencyReviewSection} id="agency-responsible-history">
                    <EventTimeline title="Alterações do responsável" context="Trocas e desativações registradas nesta imobiliária." events={responsibleEvents} />
                  </section>
                </>
              )}

              {activeView === "history" && (
                <section className={styles.agencyReviewSection} id="agency-event-history">
                  <EventTimeline title="Histórico da imobiliária" context="Alterações cadastrais, documentos, responsáveis, decisões e acessos em ordem cronológica." events={agencyEvents} />
                </section>
              )}

              {activeView === "administration" && (
                <div className={styles.agencyReviewSection}>
                  {currentState === "suspended" && <div className={styles.agencyReviewRestore}><p>A imobiliária está desativada e não pode acessar a plataforma.</p><Button size="sm" variant="primary" onClick={() => { setCurrentState("active"); addAgencyEvent("Imobiliária reativada", "Os acessos e a área pública foram liberados.", { state: "active" }); }}>Reativar imobiliária</Button></div>}
                  <DangerZone title="Ações restritas">
                    <DangerZoneRow id="agency-suspend" title={agencyActionCriteria.suspend.title} description={agencyActionCriteria.suspend.description} actionLabel="Abrir decisão" disabled={currentState === "suspended" || currentState === "deleted"} onConfirm={() => openAgencyAction("suspend")} />
                    <DangerZoneRow id="agency-delete" title={agencyActionCriteria.delete.title} description={agencyActionCriteria.delete.description} actionLabel="Abrir decisão" disabled={currentState === "deleted"} onConfirm={() => openAgencyAction("delete")} />
                  </DangerZone>
                </div>
              )}
            </div>

            <TableOfContents key={activeView} className={styles.agencyReviewToc} items={currentSections} />
          </div>
          )}
        </div>
      </BackofficeShell>
      <Drawer
        open={previewDocument != null}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        title={previewDocument?.title}
        className={styles.agencyDocumentDrawer}
        width={1080}
        footer={currentState === "active" ? (
          <div className={styles.agencyDocumentActions}>
            {reviewingDocument ? (
              <>
                <Button size="sm" variant="danger" disabled={!documentFinding.trim()} onClick={() => saveDocumentAnalysis("Reprovado")}>Reprovar documento</Button>
                <Button size="sm" variant="primary" disabled={!documentFinding.trim()} onClick={() => saveDocumentAnalysis("Aprovado")}>Aprovar documento</Button>
              </>
            ) : (
              <Button size="sm" variant="primary" onClick={() => setReviewingDocument(true)}>Reabrir análise</Button>
            )}
          </div>
        ) : undefined}
      >
        <div className={styles.agencyDocumentReview}>
          <div className={styles.agencyDocumentPreview}>
            <div className={styles.agencyDocumentToolbar}>
              <div><span>Página 1 de 3</span><span>100%</span></div>
              <IconButton size="sm" variant="outline" aria-label="Baixar documento" icon={Icons.download} onClick={() => notify("Download iniciado")} />
            </div>
            <div className={styles.agencyDocumentCanvas}>
              <aside aria-label="Páginas do documento">
                <button type="button" aria-current="page"><span>1</span><i>HORIZONTE</i></button>
                <button type="button"><span>2</span><i>CLÁUSULAS</i></button>
                <button type="button"><span>3</span><i>ASSINATURAS</i></button>
              </aside>
              <article className={styles.agencyDocumentPage} aria-label={`Pré-visualização de ${previewDocument?.title}`}>
                <small>JUNTA COMERCIAL DO ESTADO DE MINAS GERAIS</small>
                <h3>Horizonte Negócios Imobiliários Ltda.</h3>
                <p>CNPJ 23.456.789/0001-01</p>
                <hr />
                <h4>Alteração contratual consolidada</h4>
                <p>Marina Torres, brasileira, empresária, declara a atualização dos dados da sociedade empresária registrada sob o NIRE 31234567890.</p>
                <p>A sociedade opera com sede na Rua das Acácias, 240, Vila da Serra, Nova Lima, Minas Gerais.</p>
                <div className={styles.agencyDocumentSeal}>Documento registrado<br />22 JUL 2026</div>
                <footer><span>Documento de demonstração</span><span>Página 1/3</span></footer>
              </article>
            </div>
          </div>
          <aside className={styles.agencyDocumentAnalysis} aria-label="Análise do documento">
            <div><span>Situação</span><Badge tone={previewDocument?.status === "Aprovado" ? "success" : previewDocument?.status === "Reprovado" ? "danger" : "neutral"} dot>{previewDocument?.status}</Badge></div>
            {previewDocument && <div><span>Finalidade</span><p>{previewDocument.description}</p></div>}
            {reviewingDocument && <Textarea label="Nova análise" hint="Registre o que você conferiu neste arquivo." value={documentFinding} onChange={(event) => setDocumentFinding(event.target.value)} />}
            <section className={styles.agencyDocumentTimeline} aria-labelledby="document-analysis-history">
              <h3 id="document-analysis-history">Análises</h3>
              {previewDocument?.analyses.length ? (
                <ol>
                  {previewDocument.analyses.map((analysis) => (
                    <li key={analysis.id}>
                      <Avatar size="sm" initials={analysis.actor.initials} seed={analysis.actor.name} />
                      <div>
                        <p><strong>{analysis.actor.name}</strong><span>{analysis.timestamp}</span></p>
                        <Badge tone={analysis.status === "Aprovado" ? "success" : "danger"} dot>{analysis.status}</Badge>
                        <span>{analysis.finding}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : <p>Nenhuma análise registrada.</p>}
            </section>
          </aside>
        </div>
      </Drawer>
      <Modal
        open={decision != null}
        onClose={() => { setDecision(null); setDecisionReason(""); setApprovalConfirmed(false); }}
        title="Aprovar imobiliária"
        width={640}
        footer={<><Button size="sm" onClick={() => { setDecision(null); setDecisionReason(""); setApprovalConfirmed(false); }}>Cancelar</Button><Button size="sm" variant="primary" disabled={!approvalConfirmed} onClick={confirmDecision}>Aprovar imobiliária</Button></>}
      >
        {decision === "approve" && (
          <>
            <p className={styles.agencyModalCopy}>A aprovação ativa a imobiliária e conclui a análise manual.</p>
            <ul className={styles.agencyDecisionEffects}>
              <li>libera o acesso da equipe autorizada;</li>
              <li>publica domuz.app/imobiliaria/{registration.slug};</li>
              <li>envia a decisão por e-mail e notificação para Marina Torres;</li>
              <li>registra o administrador, a data e os documentos aprovados.</li>
            </ul>
            <Checkbox className={styles.agencyApprovalCheck} boxed checked={approvalConfirmed} onChange={(event) => setApprovalConfirmed(event.target.checked)} label="Revisei os dados, o CRECI PJ, os documentos e os poderes do responsável." />
          </>
        )}
      </Modal>
      <Modal
        open={documentToDelete != null}
        onClose={() => setDocumentToDelete(null)}
        title="Excluir documento"
        footer={<><Button size="sm" onClick={() => setDocumentToDelete(null)}>Cancelar</Button><Button size="sm" variant="danger" onClick={() => { if (!documentToDelete) return; setDocuments((current) => current.filter((item) => item.id !== documentToDelete.id)); addAgencyEvent("Documento excluído", documentToDelete.title); setDocumentToDelete(null); }}>Excluir documento</Button></>}
      >
        <p className={styles.agencyModalCopy}>O arquivo <strong>{documentToDelete?.title}</strong> será removido da análise. A exclusão ficará registrada no histórico.</p>
      </Modal>
      <Modal
        open={responsibleFlow != null}
        onClose={() => { setResponsibleFlow(null); setSelectedReplacement(null); setResponsibleSearchScope("agency"); setInviteMode(false); setInviteEmail(""); }}
        title={responsibleFlow === "disable" ? "Desativar e substituir responsável" : "Trocar responsável"}
        footer={<><Button size="sm" onClick={() => { setResponsibleFlow(null); setSelectedReplacement(null); setResponsibleSearchScope("agency"); setInviteMode(false); setInviteEmail(""); }}>Cancelar</Button>{inviteMode ? <Button size="sm" variant="primary" disabled={!inviteEmail.trim()} onClick={inviteResponsible}>Enviar convite</Button> : <Button size="sm" variant={responsibleFlow === "disable" ? "danger" : "primary"} disabled={!selectedReplacement} onClick={applyReplacement}>{responsibleFlow === "disable" ? "Desativar e substituir" : "Salvar troca"}</Button>}</>}
      >
        {inviteMode ? (
          <>
            <p className={styles.agencyModalCopy}>A pessoa não está na base. Envie o convite pelo e-mail dela. Marina Torres continua ativa até a nova conta ser confirmada; depois, a Domuz.app avisa que a transferência pode ser concluída.</p>
            <Input className={styles.agencyModalField} label="E-mail do novo responsável" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
            <Button className={styles.agencyModalDestination} size="sm" variant="ghost" onClick={() => setInviteMode(false)}>Voltar à busca de usuários</Button>
          </>
        ) : (
          <>
            <p className={styles.agencyModalCopy}>{responsibleFlow === "disable" ? `${currentResponsible.name} só perde o vínculo quando a substituição for confirmada.` : responsibleSearchScope === "agency" ? "A busca mostra primeiro os usuários vinculados à Horizonte Negócios. A função vem do cadastro da pessoa." : "Agora você está buscando entre todos os usuários da Domuz.app. A função vem do cadastro da pessoa."}</p>
            <Combobox className={styles.agencyModalField} label="Novo responsável" options={responsibleSearchScope === "agency" ? replacementOptions : platformReplacementOptions} value={selectedReplacement} onChange={(option) => setSelectedReplacement(option?.value ?? null)} placeholder={responsibleSearchScope === "agency" ? "Buscar usuários da imobiliária" : "Buscar usuários da plataforma"} emptyMessage="Nenhum usuário encontrado" />
            {selectedReplacement && (() => { const person = (responsibleSearchScope === "agency" ? replacementOptions : platformReplacementOptions).find((option) => option.value === selectedReplacement); return person ? <div className={styles.agencyReplacementPreview}><Avatar size="md" initials={person.label.split(" ").map((part) => part[0]).join("").slice(0, 2)} seed={person.label} /><div><strong>{person.label}</strong><span>{person.role}</span><small>{person.email}</small></div></div> : null; })()}
            {responsibleSearchScope === "agency"
              ? <Button className={styles.agencyModalDestination} size="sm" variant="ghost" onClick={() => { setResponsibleSearchScope("platform"); setSelectedReplacement(null); }}>Buscar em todos os usuários da plataforma</Button>
              : <><Button className={styles.agencyModalDestination} size="sm" variant="ghost" onClick={() => { setResponsibleSearchScope("agency"); setSelectedReplacement(null); }}>Voltar aos usuários da imobiliária</Button><Button className={styles.agencyModalDestination} size="sm" variant="ghost" onClick={() => { setInviteMode(true); setSelectedReplacement(null); }}>Não encontrou? Convidar por e-mail</Button></>}
          </>
        )}
      </Modal>
      <Modal
        open={agencyAction != null}
        onClose={resetAgencyAction}
        title={agencyAction === "delete" ? "Excluir imobiliária" : "Desativar imobiliária"}
        footer={<><Button size="sm" onClick={resetAgencyAction}>Cancelar</Button><Button size="sm" variant="danger" disabled={!agencyActionReady} onClick={() => { if (!agencyAction || !selectedActionCriterion) return; const reason = `${selectedActionCriterion.title}: ${selectedActionChecks.join("; ")}. ${decisionReason.trim()}`; if (agencyAction === "delete") { setCurrentState("deleted"); addAgencyEvent("Imobiliária excluída", reason, { state: "deleted" }); } else { setCurrentState("suspended"); addAgencyEvent("Imobiliária desativada", reason, { state: "suspended" }); } resetAgencyAction(); }}>{agencyAction === "delete" ? "Excluir imobiliária" : "Desativar imobiliária"}</Button></>}
      >
        {activeActionConfig && (
          <>
            <p className={styles.agencyModalCopy}>{activeActionConfig.description} A Domuz.app registra seu usuário nessa decisão.</p>
            <Select
              className={styles.agencyModalField}
              label={agencyAction === "delete" ? "Motivo da exclusão" : "Motivo da desativação"}
              value={agencyActionCriterion}
              onChange={(event) => {
                setAgencyActionCriterion(event.target.value);
                setAgencyActionChecks({});
              }}
            >
              <option value="">Escolha o motivo</option>
              {activeActionConfig.criteria.map((criterion) => <option key={criterion.id} value={criterion.id}>{criterion.title}</option>)}
            </Select>
            {selectedActionCriterion && (
              <div className={styles.agencyActionChecklist}>
                <strong>{selectedActionCriterion.title}</strong>
                <p>{selectedActionCriterion.description}</p>
                {selectedActionCriterion.subcriteria.map((item) => (
                  <Checkbox
                    key={item}
                    boxed
                    label={item}
                    checked={agencyActionChecks[item] === true}
                    onChange={(event) => setAgencyActionChecks((current) => ({ ...current, [item]: event.target.checked }))}
                  />
                ))}
              </div>
            )}
            <Textarea className={styles.agencyModalField} label="Registro da decisão" value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} />
            <p className={styles.agencyConfirmationHint}>Digite <strong>{registration.slug}</strong> para confirmar.</p>
            <Input className={styles.agencyModalField} label="Confirmação" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} />
          </>
        )}
      </Modal>
      {snackbarMessage && <div className={styles.agencySnackbar}><Snackbar>{snackbarMessage}</Snackbar></div>}
    </>
  );
}
