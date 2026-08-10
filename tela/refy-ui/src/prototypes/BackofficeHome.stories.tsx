import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../components/Badge";
import { BarChart, LineChart } from "../components/Charts";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { NavCard } from "../components/NavCard";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import { Skeleton } from "../components/Skeleton";
import { Stat } from "../components/Stat";
import { Icons } from "../_demo/icons";
import { BackofficeShell } from "./BackofficeShell";
import { validationViewports } from "./productValidationFixtures";
import styles from "./BackofficeHome.module.css";

type HomeState = "default" | "loading" | "empty" | "error";
const storyHref = (id: string) => `/?path=/story/${id}`;

const sidebar = {
  brand: "dommus" as const,
  defaultActiveId: "overview",
  account: { name: "André Martins", email: "andre@domuz.app", initials: "AM", seed: "USR-001" },
  groups: [
    {
      section: "Plataforma",
      items: [
        { id: "overview", label: "Visão geral", icon: Icons.dashboard, href: storyHref("produto-backoffice-visão-geral--index"), target: "_top" },
        { id: "agencies", label: "Imobiliárias", icon: Icons.projects, href: storyHref("produto-backoffice-imobiliárias--index"), target: "_top" },
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
        { id: "users", label: "Usuários", icon: Icons.backlog, href: storyHref("produto-backoffice-usuários--t-01-b-users"), target: "_top" },
        { id: "parameters", label: "Parâmetros", icon: Icons.settings, href: storyHref("produto-backoffice-parâmetros--parameters"), target: "_top" },
        { id: "versions", label: "Versões", icon: Icons.download, href: storyHref("produto-backoffice-versões--versions"), target: "_top" },
        { id: "audit", label: "Auditoria", icon: Icons.backlog, href: storyHref("produto-backoffice-auditoria--audit"), target: "_top" },
      ],
    },
  ],
};

function MetricLink({ href, label, value, description, action }: { href: string; label: string; value: string; description: string; action: string }) {
  return (
    <a className={styles.metricLink} href={href} target="_top">
      <Card className={styles.metricCard}>
        <Stat label={label} value={value} description={description} size="lg" />
        <span className={styles.metricAction}>{action} →</span>
      </Card>
    </a>
  );
}

function DashboardContent() {
  return (
    <>
      <section aria-labelledby="platform-overview">
        <SectionHeader id="platform-overview" title="Plataforma" sub="Imobiliárias clientes, inventário observado, corretores e clientes ativos." />
        <div className={styles.metrics}>
          <MetricLink href="/?path=/story/produto-backoffice-imobili%C3%A1rias--index" label="Imobiliárias clientes" value="34" description="28 ativas · 6 em análise" action="Ver imobiliárias" />
          <MetricLink href="/?path=/story/valida%C3%A7%C3%A3o-de-produto-backoffice-imobili%C3%A1rias--inventario" label="Inventário de imobiliárias" value="521" description="Mapeadas a partir dos anúncios" action="Abrir inventário" />
          <MetricLink href="/?path=/story/produto-backoffice-corretores--t-01-c-brokers" label="Corretores" value="183" description="4 vínculos aguardam decisão" action="Ver corretores" />
          <MetricLink href="/?path=/story/produto-backoffice-clientes-e-buscas--clients" label="Clientes ativos" value="1.284" description="1.906 buscas em andamento" action="Ver clientes" />
        </div>
      </section>

      <section aria-labelledby="operation-health">
        <SectionHeader id="operation-health" title="Saúde da operação" sub="Rotinas que exigem diagnóstico ou decisão." />
        <div className={styles.healthGrid}>
          <NavCard
            href="/?path=/story/produto-backoffice-fontes-e-crawlers--sources"
            target="_top"
            leading={<span className={styles.healthIcon}>{Icons.monitor}</span>}
            title="Captação"
            description="2 de 108 fontes estão interrompidas"
            meta={<Badge tone="danger" dot>2 falhas</Badge>}
          />
          <NavCard
            href="/?path=/story/produto-backoffice-pipeline--pipeline"
            target="_top"
            leading={<span className={styles.healthIcon}>{Icons.competitors}</span>}
            title="Pipeline"
            description="1 de 24 execuções falhou nas últimas 24h"
            meta={<Badge tone="danger" dot>Falhou</Badge>}
          />
          <NavCard
            href="/?path=/story/produto-backoffice-revis%C3%B5es-de-dados--data-reviews"
            target="_top"
            leading={<span className={styles.healthIcon}>{Icons.backlog}</span>}
            title="Qualidade dos dados"
            description="14 pares de imóveis aguardam decisão"
            meta={<Badge tone="warn" dot>14 revisões</Badge>}
          />
          <NavCard
            href="/?path=/story/produto-backoffice-entregas--deliveries"
            target="_top"
            leading={<span className={styles.healthIcon}>{Icons.bell}</span>}
            title="Entregas"
            description="99,4% das mensagens foram entregues em 24h"
            meta={<Badge tone="success" dot>Normal</Badge>}
          />
        </div>
      </section>

      <section aria-labelledby="data-volume">
        <SectionHeader
          id="data-volume"
          title="Volume de dados"
          sub="Coleta e aproveitamento dos imóveis recebidos pelas fontes."
          action={<a className={styles.sectionLink} href="/?path=/story/produto-backoffice-anal%C3%ADtica--analytics" target="_top">Abrir analítica</a>}
        />
        <div className={styles.charts}>
          <Card className={styles.chartCard}>
            <LineChart
              title="Coleta e aproveitamento"
              label="Imóveis coletados e aceitos nos últimos sete dias"
              series={[
                { name: "Coletados", data: [12540, 13920, 13410, 15180, 16240, 17760, 18420], tone: "primary" },
                { name: "Aceitos", data: [11680, 12810, 12320, 14090, 14980, 16340, 16980], tone: "info" },
              ]}
              xLabels={["16 jul", "17 jul", "18 jul", "19 jul", "20 jul", "21 jul", "Hoje"]}
              yTitle="Imóveis"
              showLegend
              area={false}
            />
          </Card>
          <Card className={styles.chartCard}>
            <BarChart
              title="Volume por fonte"
              label="Imóveis coletados por fonte nas últimas 24 horas"
              valueTitle="Imóveis coletados nas últimas 24 horas"
              formatValue={(value) => value === 0 ? "0" : `${(value / 1000).toFixed(1).replace(".", ",")} mil`}
              items={[
                { label: "Grupo ZAP", value: 4950 },
                { label: "OLX", value: 3820 },
                { label: "VivaReal", value: 3240 },
                { label: "Imovelweb", value: 2760 },
                { label: "QuintoAndar", value: 2100 },
              ]}
            />
          </Card>
        </div>
      </section>
    </>
  );
}

function LoadingContent() {
  return (
    <div className={styles.loadingGrid} aria-busy="true" aria-label="Carregando visão geral">
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} className={styles.loadingCard}>
          <Skeleton width="52%" height={10} />
          <Skeleton width="34%" height={34} />
          <Skeleton width="76%" height={12} />
        </Card>
      ))}
    </div>
  );
}

function BackofficeHome({ state = "default" }: { state?: HomeState }) {
  return (
    <BackofficeShell sidebar={sidebar} crumbs={[{ label: "Plataforma" }, { label: "Visão geral" }]}>
        <div className={styles.page}>
          <PageHeader className={styles.pageHeader} title="Visão geral" />
          {state === "error" && (
            <Callout tone="danger" title="Os dados mais recentes não foram carregados">
              Esta visão mostra a atualização das 10:48. Abra Pipeline para verificar a execução interrompida.
            </Callout>
          )}
          {state === "loading" ? <LoadingContent /> : state === "empty" ? (
            <EmptyState className={styles.empty} title="Ainda não há dados consolidados" message="A visão geral será preenchida após a primeira coleta e o cadastro da primeira imobiliária." />
          ) : <DashboardContent />}
        </div>
    </BackofficeShell>
  );
}

const meta = {
  id: "produto-backoffice-visão-geral",
  title: "Produto/Backoffice/Visão geral/Index",
  component: BackofficeHome,
  args: { state: "default" },
  argTypes: { state: { control: "select", options: ["default", "loading", "empty", "error"] } },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports } },
  globals: { theme: "dommus-admin" },
} satisfies Meta<typeof BackofficeHome>;

export default meta;
type Story = StoryObj<typeof meta>;

const desktop = { viewport: { defaultViewport: "desktop1440" } };

export const Index: Story = { args: { state: "default" }, parameters: desktop, tags: ["aprovada"] };
