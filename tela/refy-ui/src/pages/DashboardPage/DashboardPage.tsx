import { AppShell } from "../../components/AppShell";
import { Card, CardHeader } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { SplitButton } from "../../components/SplitButton";
import { IconButton } from "../../components/IconButton";
import { Avatar } from "../../components/Avatar";
import { Icons } from "../../_demo/icons";
import styles from "./DashboardPage.module.css";

/**
 * Tela real (Visão geral) composta EXCLUSIVAMENTE de componentes do @refy/ui.
 * Nenhum estilo de componente é redefinido aqui — o CSS local trata só do
 * arranjo (grid, espaçamento). É o teste de fogo do design system.
 */
export function DashboardPage() {
  return (
    <AppShell
      sidebar={{
        activeId: "dashboard",
        workspace: { name: "Globo Editorial", role: "Workspace · Pro", initials: "GE" },
        account: { name: "João Mendes", email: "joao@globoeditorial.com", initials: "JM" },
        cta: { label: "Nova análise", icon: Icons.plus },
        groups: [
          {
            section: "Trabalho",
            items: [
              { id: "dashboard", label: "Visão geral", icon: Icons.dashboard },
              { id: "projects", label: "Projetos", icon: Icons.projects },
              { id: "backlog", label: "Backlog", icon: Icons.backlog, badge: 12 },
              { id: "monitor", label: "Monitor", icon: Icons.monitor },
              { id: "competitors", label: "Concorrentes", icon: Icons.competitors },
            ],
          },
          {
            section: "Sistema",
            items: [
              { id: "notifications", label: "Notificações", icon: Icons.bell, badge: 3 },
              { id: "settings", label: "Configurações", icon: Icons.settings },
            ],
          },
        ],
      }}
      topbar={{
        crumbs: [{ label: "Globo Editorial", href: "#" }, { label: "Visão geral" }],
        actions: (
          <>
            <IconButton aria-label="Notificações" icon={Icons.bell} />
            <IconButton aria-label="Ajuda" icon={Icons.help} />
            <Avatar size="md" initials="JM" style={{ marginLeft: 4 }} />
          </>
        ),
      }}
    >
      {/* Header da página */}
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Workspace · última análise há 14min</p>
          <h1 className={styles.h1}>Visão geral</h1>
          <p className={styles.sub}>
            3 projetos · <span className={styles.mono}>2.451</span> créditos usados este ciclo ·{" "}
            <span className={styles.mono}>8</span> tarefas no backlog
          </p>
        </div>
        <div className={styles.headActions}>
          <SplitButton
            label="Exportar"
            leadingIcon={Icons.download}
            options={[
              { label: "PDF", hint: ".pdf" },
              { label: "CSV", hint: ".csv" },
              { label: "Excel", hint: ".xlsx" },
              { label: "Markdown", hint: ".md" },
              { label: "JSON", hint: ".json" },
            ]}
          />
          <Button variant="primary" leadingIcon={Icons.plus}>
            Analisar URL
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpis}>
        {[
          { label: "Score médio", value: "78", tone: "primary" as const, pct: 78, foot: "+4 vs. ciclo anterior" },
          { label: "Issues críticas", value: "3", tone: "critical" as const, pct: 30, foot: "em 2 projetos" },
          { label: "Cobertura de busca", value: "64%", tone: "warn" as const, pct: 64, foot: "12 lacunas mapeadas" },
        ].map((k) => (
          <Card key={k.label} elevation={1}>
            <p className={styles.kpiLabel}>{k.label}</p>
            <p className={styles.kpiValue}>{k.value}</p>
            <ProgressBar value={k.pct} tone={k.tone} size="sm" />
            <p className={styles.kpiFoot}>{k.foot}</p>
          </Card>
        ))}
      </div>

      {/* Duas colunas: projetos + uso */}
      <div className={styles.cols}>
        <Card>
          <CardHeader
            title="Projetos"
            count="3 ativos"
            action={<Button variant="ghost" size="sm">Gerenciar</Button>}
          />
          <div className={styles.projList}>
            {[
              { name: "Economia", url: "g1.globo.com/economia", score: 84, tone: "primary" as const, badge: "Bom" as const, bt: "success" as const },
              { name: "Beleza", url: "vogue.com.br/beleza", score: 71, tone: "warn" as const, badge: "Atenção" as const, bt: "warn" as const },
              { name: "Realeza", url: "quem.globo.com/realeza", score: 40, tone: "critical" as const, badge: "Crítico" as const, bt: "danger" as const },
            ].map((p) => (
              <div key={p.name} className={styles.projRow}>
                <Avatar size="md" initials={p.name.slice(0, 2)} style={{ borderRadius: 7 }} />
                <div className={styles.projInfo}>
                  <div className={styles.projName}>{p.name}</div>
                  <div className={styles.projUrl}>{p.url}</div>
                </div>
                <div className={styles.projScore}>
                  <span className={styles.mono}>{p.score}</span>
                  <ProgressBar value={p.score} tone={p.tone} size="sm" />
                </div>
                <Badge tone={p.bt}>{p.badge}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Uso este ciclo"
            action={<Button variant="ghost" size="sm">Detalhes</Button>}
          />
          <div className={styles.usage}>
            {[
              { label: "Créditos do plano", val: "2.451 / 5.000", pct: 49, tone: "primary" as const },
              { label: "Análises padrão", val: "18 / 40", pct: 45, tone: "primary" as const },
              { label: "Sínteses profundas", val: "6 / 10", pct: 60, tone: "warn" as const },
            ].map((u) => (
              <div key={u.label}>
                <div className={styles.usageMeta}>
                  <span>{u.label}</span>
                  <b className={styles.mono}>{u.val}</b>
                </div>
                <ProgressBar value={u.pct} tone={u.tone} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
