import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SectionHeader } from "../components/SectionHeader";
import { Select } from "../components/Select";
import { SettingRow, SettingRowGroup } from "../components/SettingRow";
import { Textarea } from "../components/Textarea";
import { backofficeSidebar } from "./BackofficeAgencies";
import { BackofficeShell } from "./BackofficeShell";
import flowStyles from "./BackofficeAgencyFlow.module.css";
import styles from "./BackofficeOperationalPages.module.css";

type Action = "clone" | "publish" | "deactivate" | null;
type ProfileStatus = "Publicado" | "Rascunho" | "Desativado";

export const platformAccessProfileOptions = ["Identidades e acessos", "Análise cadastral", "Operação de dados", "Suporte", "Auditor"] as const;
export const agencyAccessProfileOptions = ["Administrador da equipe", "Corretor", "Financeiro", "Consulta", "Atendimento comercial"] as const;

interface AccessProfile {
  name: string;
  context: string;
  version: string;
  people: number;
  capabilities: string;
  status: ProfileStatus;
  protected: boolean;
  permissions: Array<{
    title: string;
    description: string;
    meta: string;
    allowed: boolean;
  }>;
}

const initialProfiles: AccessProfile[] = [
  {
    name: "Superadministrador", context: "Plataforma", version: "v1", people: 1, capabilities: "Todas as funções da Plataforma", status: "Publicado", protected: true,
    permissions: [
      { title: "Cadastros", description: "Administrar imobiliárias, corretores e usuários", meta: "platform.agencies.delete · platform.brokers.update_status · platform.users.delete", allowed: true },
      { title: "Acessos", description: "Criar, publicar, atribuir e revogar perfis", meta: "platform.access.create_profile · platform.access.publish_profile · platform.access.assign · platform.access.revoke", allowed: true },
      { title: "Dados", description: "Administrar a operação de dados", meta: "data.properties.update · data.sources.run · data.pipeline.run · data.reviews.decide · data.analytics.export", allowed: true },
    ],
  },
  {
    name: "Identidades e acessos", context: "Plataforma", version: "v3", people: 4, capabilities: "Usuários, segurança e acessos", status: "Publicado", protected: false,
    permissions: [
      { title: "Usuários", description: "Visualizar e atualizar identidade", meta: "platform.users.view · platform.users.update_identity", allowed: true },
      { title: "Segurança", description: "Recuperar acesso e bloquear conta", meta: "platform.users.manage_security · platform.users.block", allowed: true },
      { title: "Acessos", description: "Atribuir e revogar perfis e exceções", meta: "platform.access.assign · platform.access.revoke", allowed: true },
      { title: "Imobiliárias", description: "Excluir imobiliária não pertence a este perfil", meta: "platform.agencies.delete", allowed: false },
    ],
  },
  {
    name: "Análise cadastral", context: "Plataforma", version: "v2", people: 7, capabilities: "Imobiliárias e corretores", status: "Publicado", protected: false,
    permissions: [
      { title: "Imobiliárias", description: "Visualizar e revisar cadastro", meta: "platform.agencies.view · platform.agencies.review", allowed: true },
      { title: "Corretores", description: "Visualizar e revisar perfil profissional", meta: "platform.brokers.view · platform.brokers.review", allowed: true },
      { title: "Acessos", description: "Atribuir perfis não pertence a esta função", meta: "platform.access.assign", allowed: false },
    ],
  },
  {
    name: "Operação de dados", context: "Plataforma", version: "v5", people: 9, capabilities: "Imóveis, fontes, pipeline, revisões e analítica", status: "Publicado", protected: false,
    permissions: [
      { title: "Imóveis", description: "Visualizar e atualizar registros", meta: "data.properties.view · data.properties.update", allowed: true },
      { title: "Fontes", description: "Criar, alterar e executar coletas", meta: "data.sources.view · data.sources.create · data.sources.update · data.sources.run", allowed: true },
      { title: "Pipeline e revisões", description: "Executar etapas e decidir revisões", meta: "data.pipeline.view · data.pipeline.run · data.reviews.view · data.reviews.decide", allowed: true },
      { title: "Analítica", description: "Visualizar e exportar dados", meta: "data.analytics.view · data.analytics.export", allowed: true },
    ],
  },
  {
    name: "Suporte", context: "Plataforma", version: "v2", people: 6, capabilities: "Consulta de cadastros e recuperação de segurança", status: "Publicado", protected: false,
    permissions: [
      { title: "Cadastros", description: "Consultar imobiliárias, corretores e clientes", meta: "platform.agencies.view · platform.brokers.view · platform.clients.view", allowed: true },
      { title: "Usuários", description: "Consultar identidade e recuperar segurança", meta: "platform.users.view · platform.users.manage_security", allowed: true },
      { title: "Acessos", description: "Atribuir perfis não pertence a esta função", meta: "platform.access.assign", allowed: false },
    ],
  },
  {
    name: "Auditor", context: "Plataforma", version: "v1", people: 2, capabilities: "Consulta geral e exportação de auditoria", status: "Publicado", protected: false,
    permissions: [
      { title: "Módulos", description: "Consultar módulos da Plataforma e de dados", meta: "platform.dashboard.view · platform.agencies.view · data.properties.view · data.pipeline.view", allowed: true },
      { title: "Auditoria", description: "Consultar e exportar eventos", meta: "platform.audit.view · platform.audit.export", allowed: true },
      { title: "Operação", description: "Alterar dados não pertence a esta função", meta: "data.properties.update · data.pipeline.run", allowed: false },
    ],
  },
  {
    name: "Atendimento comercial", context: "Andrade Imóveis", version: "Rascunho", people: 0, capabilities: "Clientes, leads, agenda e seleções", status: "Rascunho", protected: false,
    permissions: [
      { title: "Clientes", description: "Visualizar e atualizar atendimento", meta: "agency.clients.view · agency.clients.update", allowed: true },
      { title: "Leads", description: "Visualizar, alterar e atribuir carteira", meta: "agency.leads.view · agency.leads.update · agency.leads.assign", allowed: true },
      { title: "Agenda", description: "Criar e alterar compromissos", meta: "agency.agenda.create · agency.agenda.update", allowed: true },
    ],
  },
];

export function BackofficeProfilesPage() {
  const [profiles, setProfiles] = useState<AccessProfile[]>(initialProfiles);
  const [selected, setSelected] = useState<AccessProfile>(initialProfiles[0]);
  const [action, setAction] = useState<Action>(null);
  const [cloneName, setCloneName] = useState("");
  const [reason, setReason] = useState("");
  const [replacement, setReplacement] = useState("");
  const [result, setResult] = useState("");

  const close = () => {
    setAction(null);
    setCloneName("");
    setReason("");
    setReplacement("");
  };

  const confirm = () => {
    const versionNumber = Number(selected.version.replace("v", ""));
    const nextVersion = Number.isFinite(versionNumber) ? `v${versionNumber + 1}` : "v1";
    if (action === "clone") {
      const clone: AccessProfile = {
        ...selected,
        name: cloneName,
        version: "Rascunho",
        people: 0,
        status: "Rascunho",
        protected: false,
        permissions: selected.permissions.map((permission) => ({ ...permission })),
      };
      setProfiles((current) => [...current, clone]);
      setSelected(clone);
      setResult(`Rascunho “${cloneName}” criado a partir de ${selected.name}.`);
    } else if (action === "publish") {
      const published = { ...selected, version: nextVersion, status: "Publicado" as const };
      setProfiles((current) => current.map((profile) => profile.name === selected.name ? published : profile));
      setSelected(published);
      setResult(`${selected.name} ${nextVersion} publicada para ${selected.people} pessoas.`);
    } else {
      const deactivated = { ...selected, status: "Desativado" as const, people: 0 };
      setProfiles((current) => current.map((profile) => profile.name === selected.name ? deactivated : profile));
      setSelected(deactivated);
      setResult(`${selected.name} desativado. ${selected.people} atribuições serão substituídas por ${replacement}.`);
    }
    close();
  };

  const canConfirm =
    (action === "clone" && cloneName.trim()) ||
    (action === "publish" && reason.trim()) ||
    (action === "deactivate" && reason.trim() && replacement);

  return (
    <>
      <BackofficeShell
        sidebar={{ ...backofficeSidebar, defaultActiveId: "users" }}
        crumbs={[{ label: "Plataforma" }, { label: "Usuários" }, { label: "Perfis de acesso" }]}
      >
        <main className={styles.page}>
          <PageHeader
            title="Perfis de acesso"
            lead="Perfis agrupam permissões por função. Uma exceção individual muda apenas uma pessoa."
            actions={<Button size="sm" variant="primary" onClick={() => { setSelected(initialProfiles[0]); setAction("clone"); }}>Criar perfil</Button>}
          />

          {result && <Callout tone="info" title="Alteração registrada">{result}</Callout>}

          <section className={styles.section} aria-labelledby="profile-list">
            <SectionHeader id="profile-list" title="Catálogo" sub="Perfis da Plataforma e perfis próprios das imobiliárias." count={profiles.length} />
            <Card padding="none">
              <SettingRowGroup aria-label="Perfis de acesso">
                {profiles.map((profile) => (
                  <SettingRow
                    key={profile.name}
                    title={profile.name}
                    description={`${profile.context} · ${profile.capabilities}`}
                    meta={`${profile.version} · ${profile.people} pessoas`}
                    actions={<Badge tone={profile.status === "Publicado" ? "success" : profile.status === "Rascunho" ? "warn" : "neutral"}>{profile.status}</Badge>}
                    onClick={() => setSelected(profile)}
                  />
                ))}
              </SettingRowGroup>
            </Card>
          </section>

          <section className={styles.section} aria-labelledby="profile-detail">
            <SectionHeader
              id="profile-detail"
              title={selected.name}
              sub={`${selected.context} · ${selected.version} · ${selected.people} pessoas afetadas`}
              action={<><Button size="sm" onClick={() => setAction("clone")}>Clonar</Button> <Button size="sm" disabled={selected.status === "Desativado"} onClick={() => setAction("publish")}>Publicar versão</Button> <Button size="sm" variant="danger" disabled={selected.protected || selected.status === "Desativado"} onClick={() => setAction("deactivate")}>Desativar</Button></>}
            />
            {selected.protected && <Callout tone="warn" title="Último Superadministrador">Este perfil não pode ser desativado enquanto for o único com administração completa da Plataforma.</Callout>}
            <Card padding="none">
              <SettingRowGroup aria-label={`Permissões de ${selected.name}`}>
                {selected.permissions.map((permission) => (
                  <SettingRow
                    key={permission.meta}
                    title={permission.title}
                    description={permission.description}
                    meta={permission.meta}
                    actions={<Badge tone={permission.allowed ? "success" : "neutral"}>{permission.allowed ? "Permitido" : "Negado"}</Badge>}
                  />
                ))}
              </SettingRowGroup>
            </Card>
          </section>
        </main>
      </BackofficeShell>

      <Modal
        open={action != null}
        onClose={close}
        title={action === "clone" ? `Clonar ${selected.name}` : action === "publish" ? `Publicar nova versão` : `Desativar ${selected.name}`}
        footer={<><Button size="sm" onClick={close}>Cancelar</Button><Button size="sm" variant={action === "deactivate" ? "danger" : "primary"} disabled={!canConfirm} onClick={confirm}>{action === "clone" ? "Criar rascunho" : action === "publish" ? "Publicar versão" : "Desativar perfil"}</Button></>}
      >
        <div className={flowStyles.userModalFields}>
          {action === "clone" && <Input label="Nome do novo perfil" value={cloneName} onChange={(event) => setCloneName(event.target.value)} />}
          {action === "publish" && (
            <>
              <Callout tone="warn" title={`${selected.people} pessoas serão afetadas`}>A versão publicada passa a valer na próxima decisão de acesso. A versão anterior continua no histórico.</Callout>
              <Textarea label="Motivo da publicação" value={reason} onChange={(event) => setReason(event.target.value)} />
            </>
          )}
          {action === "deactivate" && (
            <>
              <Callout tone="danger" title="Nenhuma atribuição ficará sem perfil">Escolha um perfil substituto ou revogue as atribuições antes de desativar.</Callout>
              <Select label="Destino das atribuições" value={replacement} onChange={(event) => setReplacement(event.target.value)}>
                <option value="">Escolha uma opção</option>
                <option>Suporte</option>
                <option>Análise cadastral</option>
                <option>Revogar atribuições</option>
              </Select>
              <Textarea label="Motivo da desativação" value={reason} onChange={(event) => setReason(event.target.value)} />
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
