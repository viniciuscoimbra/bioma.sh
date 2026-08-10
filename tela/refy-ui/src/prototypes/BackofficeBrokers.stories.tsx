import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { PersonCell } from "../components/PersonCell";
import { Table, type Column } from "../components/Table";
import { backofficeSidebar, openStory } from "./BackofficeAgencies";
import {
  FlowScope,
  PlatformBrokerDetailPage,
} from "./BackofficeAgencyFlow";
import { BackofficeShell } from "./BackofficeShell";
import { BackofficeOperationalPage } from "./BackofficeOperationalPages";
import styles from "./BackofficeOperationalPages.module.css";
import { validationViewports } from "./productValidationFixtures";

const meta = {
  id: "produto-backoffice-corretores",
  title: "Produto/Backoffice/Corretores/Index",
  component: FlowScope,
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: validationViewports,
      defaultViewport: "desktop1440",
    },
  },
  globals: {
    theme: "dommus-admin",
  },
} satisfies Meta<typeof FlowScope>;

export default meta;
type Story = StoryObj;

interface BrokerRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  creci: string;
  verification: "Aprovado" | "Em análise" | "Pendente" | "Bloqueado";
  status: "Ativo" | "Sem operação" | "Bloqueado";
  agency: string;
  links: string;
}

const brokerRows: BrokerRow[] = [
  { id: "COR-021", name: "Ana Lima", initials: "AL", email: "ana@andradeimoveis.com.br", creci: "44.910-MG", verification: "Aprovado", status: "Ativo", agency: "Andrade Imóveis", links: "Andrade Imóveis · Minha operação" },
  { id: "COR-034", name: "Carolina Alves", initials: "CA", email: "carolina@horizonteimoveis.com.br", creci: "77.881-MG", verification: "Em análise", status: "Sem operação", agency: "Horizonte Negócios", links: "Horizonte Negócios" },
  { id: "COR-052", name: "Bruno Rocha", initials: "BR", email: "bruno@domuz.app", creci: "90.214-MG", verification: "Pendente", status: "Sem operação", agency: "Sem imobiliária", links: "Sem vínculo ativo" },
  { id: "COR-066", name: "Diego Rocha", initials: "DR", email: "diego@verticeimobiliaria.com.br", creci: "31.640-MG", verification: "Aprovado", status: "Ativo", agency: "Vértice Imobiliária", links: "Vértice Imobiliária" },
  { id: "COR-071", name: "Bruno Alves", initials: "BA", email: "bruno@casanorte.com.br", creci: "18.320-MG", verification: "Bloqueado", status: "Bloqueado", agency: "Casa Norte", links: "Casa Norte" },
];

const brokerColumns: Column<BrokerRow>[] = [
  { key: "id", header: "ID", sortable: true, cell: (broker) => <span className={styles.mono}>{broker.id}</span> },
  { key: "name", header: "Corretor", width: "25%", sortable: true, sortValue: (broker) => broker.name, cell: (broker) => <PersonCell size="sm" avatar={<Avatar size="sm" initials={broker.initials} seed={broker.id} />} name={broker.name} secondary={broker.email} /> },
  { key: "creci", header: "CRECI", sortable: true, cell: (broker) => broker.creci },
  { key: "verification", header: "Verificação", sortable: true, filterable: true, cell: (broker) => <Badge tone={broker.verification === "Aprovado" ? "success" : broker.verification === "Em análise" ? "warn" : broker.verification === "Bloqueado" ? "danger" : "neutral"}>{broker.verification}</Badge> },
  { key: "status", header: "Situação", sortable: true, filterable: true, cell: (broker) => <Badge tone={broker.status === "Ativo" ? "success" : broker.status === "Bloqueado" ? "danger" : "neutral"} dot>{broker.status}</Badge> },
  { key: "agency", header: "Imobiliária de origem", sortable: true, filterable: true, cell: (broker) => broker.agency },
  { key: "links", header: "Vínculos", cell: (broker) => broker.links },
  { key: "actions", header: "Ações", align: "right", cell: () => <Button size="sm" onClick={() => openStory("produto-backoffice-corretores--t-01-c-broker-detail")}>Abrir corretor</Button> },
];

export const T01CBrokers: Story = {
  name: "Index",
  render: () => (
    <BackofficeShell sidebar={{ ...backofficeSidebar, defaultActiveId: "brokers" }} crumbs={[{ label: "Plataforma" }, { label: "Corretores" }]}>
      <main className={styles.page}>
        <PageHeader title="Corretores" lead="Consulte CRECI, verificação profissional, situação e vínculos com imobiliárias." />
        <Table
          caption="Corretores da plataforma"
          searchable
          searchPlaceholder="Buscar por nome, e-mail, CRECI ou imobiliária"
          searchMatch={(broker, query) => `${broker.id} ${broker.name} ${broker.email} ${broker.creci} ${broker.agency} ${broker.links}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))}
          columns={brokerColumns}
          rows={brokerRows}
          rowKey={(broker) => broker.id}
          rowLabel={(broker) => `Abrir ${broker.name}`}
          onRowClick={() => openStory("produto-backoffice-corretores--t-01-c-broker-detail")}
          pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
          minTableWidth={1040}
        />
      </main>
    </BackofficeShell>
  ),
};

export const T01CBrokersEmpty: Story = {
  render: () => (
    <BackofficeOperationalPage
      title="Corretores"
      lead="Nenhum corretor corresponde aos filtros usados."
      sectionTitle="Corretores da plataforma"
      sectionLead="Limpe a busca ou altere os filtros para tentar de novo."
      primaryAction="Limpar filtros"
      resultMessage="Filtros removidos"
      rows={[]}
    />
  ),
};

export const T01CBrokersLoading: Story = {
  render: () => (
    <BackofficeOperationalPage
      title="Corretores"
      lead="Os cadastros estão sendo carregados."
      sectionTitle="Corretores da plataforma"
      sectionLead="A busca fica disponível assim que a lista terminar de carregar."
      primaryAction="Atualizar lista"
      resultMessage="Nova tentativa iniciada"
      rows={[
        { title: "Carregando cadastros", description: "Consultando corretores e vínculos", meta: "Aguarde alguns segundos", status: "Carregando", tone: "neutral" },
      ]}
    />
  ),
};

export const T01CBrokersError: Story = {
  render: () => (
    <BackofficeOperationalPage
      title="Corretores"
      lead="Não foi possível carregar os corretores."
      sectionTitle="Corretores da plataforma"
      sectionLead="Se o problema continuar, copie o código da falha para o suporte."
      primaryAction="Tentar de novo"
      resultMessage="Nova tentativa iniciada"
      rows={[
        { title: "Falha ao consultar cadastros", description: "Nenhum dado foi alterado", meta: "Código BRK-LIST-503", status: "Erro", tone: "danger" },
      ]}
    />
  ),
};

export const T01CBrokerDetail: Story = {
  render: () => <PlatformBrokerDetailPage />,
};
