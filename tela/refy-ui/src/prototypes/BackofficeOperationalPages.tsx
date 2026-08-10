import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import { SettingRow, SettingRowGroup } from "../components/SettingRow";
import { backofficeSidebar } from "./BackofficeAgencies";
import { BackofficeShell } from "./BackofficeShell";
import styles from "./BackofficeOperationalPages.module.css";

export interface OperationalRow {
  title: string;
  description: string;
  meta: string;
  status: string;
  tone?: "success" | "warn" | "danger" | "neutral";
}

export interface BackofficeOperationalPageProps {
  title: string;
  lead: string;
  sectionTitle: string;
  sectionLead: string;
  primaryAction: string;
  resultMessage: string;
  rows: OperationalRow[];
}

export function BackofficeOperationalPage({
  title,
  lead,
  sectionTitle,
  sectionLead,
  primaryAction,
  resultMessage,
  rows,
}: BackofficeOperationalPageProps) {
  const [query, setQuery] = useState("");
  const [actionStarted, setActionStarted] = useState(false);
  const visibleRows = rows.filter((row) => `${row.title} ${row.description} ${row.meta}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));

  return (
    <BackofficeShell sidebar={backofficeSidebar} crumbs={[{ label: "Plataforma" }, { label: title }]}>
      <main className={styles.page}>
        <PageHeader
          title={title}
          lead={lead}
          actions={<Button size="sm" variant="primary" onClick={() => setActionStarted(true)}>{primaryAction}</Button>}
        />
        {actionStarted && <Callout tone="info" title={resultMessage}>O estado foi aberto sem sair desta story.</Callout>}
        <section className={styles.section} aria-labelledby="operational-section">
          <SectionHeader id="operational-section" title={sectionTitle} sub={sectionLead} count={visibleRows.length} />
          <Input label="Buscar nesta página" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Card>
            <SettingRowGroup aria-label={sectionTitle}>
              {visibleRows.map((row) => (
                <SettingRow
                  key={row.title}
                  title={row.title}
                  description={row.description}
                  meta={row.meta}
                  actions={<Badge tone={row.tone ?? "neutral"}>{row.status}</Badge>}
                />
              ))}
            </SettingRowGroup>
          </Card>
        </section>
      </main>
    </BackofficeShell>
  );
}
