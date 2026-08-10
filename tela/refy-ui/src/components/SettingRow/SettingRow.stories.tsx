import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { IconButton } from "../IconButton";
import { SettingRow, SettingRowGroup } from "./SettingRow";

const googleIcon = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const keyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const copyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

/**
 * `SettingRow` — linha de lista/configuração: leading + título + descrição +
 * meta mono + ações. Estática, clicável (`href`/`onClick`) ou com `Switch`.
 */
const meta = {
  title: "Components/Molecules/SettingRow",
  component: SettingRow,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Linha de lista/configuração: o padrão mais improvisado das telas de referência (`.shell-card-row`, `.oauth-row`, `.session-row`, `.pref-row`, `.key-row`, `.wh-row`, `.activity-row`, `.pm-row`, `.domain-row`…). Slots: `leading` (ícone/`Avatar`; `leadingFrame` liga a moldura 36px p/ logos), `title` (aceita `Badge` inline), `description` (texto corrido), `meta` (mono: e-mail, IP, data, chave), `actions` (à direita). Variantes: estática (`<div>`); clicável, com `href` virando `<a>` e `onClick` virando `<button>`; linha inteira é o alvo com chevron. `switchProps` acopla um `Switch` com rótulo ligado por aria. Agrupe com `SettingRowGroup` (lista semântica `role=\"list\"` + divisores por token), tipicamente dentro de um `Card`.",
          "",
          "**Onde usar:** qualquer lista de itens de configuração/estado dentro de um card: conexões OAuth, sessões ativas, preferências com Switch, chaves de API, webhooks, métodos de pagamento, domínios, atividade recente.",
          "",
          "**Onde NÃO usar:** dados tabulares com ordenação/colunas (use `Table`); navegação entre destinos com card individual (use `NavCard`); item de menu (use `Menu`); formulário campo-a-campo (use `Input`/`Select`). Numa linha clicável NÃO coloque `actions` interativas (botão dentro de botão é HTML inválido); use `meta`/`Badge`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Título: aceita Badge/Chip inline." },
    description: { control: "text", description: "Descrição em texto corrido." },
    meta: { control: "text", description: "Meta mono (e-mail, IP, data…)." },
    leading: { control: false, description: "Ícone ou Avatar." },
    leadingFrame: { control: "boolean", description: "Moldura 36px p/ logos." },
    actions: { control: false, description: "Ações à direita." },
    href: { control: "text", description: "Linha vira `<a>`." },
    disabled: { control: "boolean" },
    showChevron: { control: "boolean", description: "Chevron nas clicáveis." },
    onClick: { action: "clicked" },
    switchProps: { control: false, description: "Acopla um `Switch` (pref-row)." },
  },
} satisfies Meta<typeof SettingRow>;
export default meta;

type Story = StoryObj<typeof SettingRow>;

/** Playground — linha estática com ação à direita (padrão `.shell-card-row`). */
export const Playground: Story = {
  args: {
    title: "Autenticação em dois fatores",
    description: "Proteja sua conta exigindo um segundo fator no login.",
    actions: (
      <>
        <Badge tone="neutral">Desativada</Badge>
        <Button size="sm" variant="secondary">
          Ativar
        </Button>
      </>
    ),
  },
};

/** Conexões OAuth — `leadingFrame` p/ logo, Badge de status no título, meta mono. */
export const ConexoesOauth: Story = {
  name: "Conexões OAuth",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Conexões">
        <SettingRow
          leading={googleIcon}
          leadingFrame
          title={
            <>
              Google{" "}
              <Badge tone="success" dot>
                Conectado · primário
              </Badge>
            </>
          }
          meta="joao@globoeditorial.com · conectado em 12 jan. 2026"
          actions={
            <Button size="sm" variant="ghost" disabled>
              Provedor primário
            </Button>
          }
        />
        <SettingRow
          leading={keyIcon}
          leadingFrame
          title="GitHub"
          meta="Não conectado · útil para conectar repositórios à API"
          actions={
            <Button size="sm" variant="secondary">
              Conectar
            </Button>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Sessões ativas — chip no título, meta mono, trailing misto (texto/ação). */
export const SessoesAtivas: Story = {
  name: "Sessões ativas",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Sessões ativas">
        <SettingRow
          title={
            <>
              MacBook Pro · Chrome 138{" "}
              <Badge tone="success">Esta sessão</Badge>
            </>
          }
          meta="Rio de Janeiro, BR · 187.65.xx.xx · há 2 min"
          actions={<Badge tone="neutral">Ativa</Badge>}
        />
        <SettingRow
          title="iPhone 15 · Safari iOS 18"
          meta="Rio de Janeiro, BR · 187.65.xx.xx · ontem"
          actions={
            <Button size="sm" variant="ghost">
              Encerrar
            </Button>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Preferências — `switchProps` acopla o Switch com rótulo ligado por aria. */
export const Preferencias: Story = {
  name: "Preferências (Switch)",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Notificações">
        <SettingRow
          title="Análise concluída"
          description="Avisar quando uma análise iniciada por você terminar."
          switchProps={{ defaultChecked: true }}
        />
        <SettingRow
          title="Monitor detectou mudanças"
          description="URLs monitoradas que mudaram score ou aparição em busca."
          switchProps={{ defaultChecked: true }}
        />
        <SettingRow
          title="Resumo semanal por e-mail"
          description="Um resumo do ambiente toda segunda de manhã."
          switchProps={{}}
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Chaves de API — meta mono mascarada + IconButtons de copiar/rotacionar. */
export const ChavesDeApi: Story = {
  name: "Chaves de API",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Chaves de API">
        <SettingRow
          title="Produção"
          meta="rfy_live_••••••••••••4f2a · criada em 03 mai. 2026"
          actions={
            <>
              <IconButton size="sm" aria-label="Copiar chave" icon={copyIcon} />
              <Button size="sm" variant="ghost">
                Rotacionar
              </Button>
            </>
          }
        />
        <SettingRow
          title="Desenvolvimento"
          meta="rfy_test_••••••••••••91c8 · criada em 03 mai. 2026"
          actions={
            <>
              <IconButton size="sm" aria-label="Copiar chave" icon={copyIcon} />
              <Button size="sm" variant="ghost">
                Rotacionar
              </Button>
            </>
          }
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Atividade recente — quem fez o quê, meta mono, custo no trailing. */
export const AtividadeRecente: Story = {
  name: "Atividade recente",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Atividade recente">
        <SettingRow
          leading={<Avatar initials="JM" size="sm" />}
          title="Análise · globo.com/economia/desempenho-do-real"
          meta="João Mendes · há 2h · projeto Economia"
          actions={<span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>−100 cr.</span>}
        />
        <SettingRow
          leading={<Avatar initials="MC" size="sm" />}
          title="Síntese profunda · vogue.com.br/beleza/skincare-coreana"
          meta="Marina Costa · há 5h · projeto Beleza"
          actions={<span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>−300 cr.</span>}
        />
      </SettingRowGroup>
    </Card>
  ),
};

/** Clicável — `href` vira `<a>`, `onClick` vira `<button>`; linha inteira é o alvo. */
export const Clicavel: Story = {
  name: "Clicável (href/onClick)",
  args: { title: "" },
  render: () => (
    <Card>
      <SettingRowGroup aria-label="Backlog">
        <SettingRow
          href="#issue-1"
          title="Título duplicado na home"
          description="Prioridade 1 · ganho estimado +12 pts"
          meta="globoeditorial.com · detectado há 2 dias"
        />
        <SettingRow
          onClick={() => {}}
          title="Meta description ausente em 8 páginas"
          description="Prioridade 2 · ganho estimado +8 pts"
        />
        <SettingRow
          href="#issue-3"
          disabled
          title="Sitemap desatualizado"
          description="Resolvido em 14 jul. 2026"
        />
      </SettingRowGroup>
    </Card>
  ),
};
