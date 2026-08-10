# Auditoria tela-a-tela — DS Refy vs telas de referência (§8.12)

**Data:** 2026-07-17 · **Fonte:** telas de referência estáticas do design system de origem ·
**Contra:** inventário §6 do `HANDOFF.md` (49 componentes) + onda paralela em andamento.

**Método:** cada padrão visual usado nas telas foi classificado como
(a) **componente do DS** (existe no §6), (b) **onda paralela** (sendo feito agora:
NavCard, TableOfContents, SettingsSubnav, StickyFooter, AvatarGroup, Combobox-com-imagem,
HelpField, BillingCard, PlanCard, UsageMeter, CodeBlock — NÃO listados como lacuna) ou
(c) **LACUNA NOVA** (improvisado em HTML/CSS à mão, sem componente correspondente).
Lacunas novas consolidadas no final, com spec de 2 linhas.

**Nota 8.4 (resolvida nesta branch):** a barra de cota de `settings_projects.html`
usava fill tinta (`#0e0e10` = `--ink-1`) que a `ProgressBar` não oferecia (só
primary/warn/critical). Implementado `tone="neutral"` — evidência comparativa em
`AUDITORIA-TELAS-2026-07-17-progressbar.png` (fill computado do DS = `rgb(14,14,16)`,
idêntico à referência).

---

## Shell compartilhado (`app-shell.css`, `app-sidebar.js`, `app-topbar.js`, `settings-subnav.js`)

| Padrão da tela | Componente do DS | Status |
|---|---|---|
| `.shell-sidebar` (logo, colapso, nav com seções/ícones/badges) | `Sidebar` (com `cta`, `badge`, `brand`) | OK |
| `.shell-ws` (workspace na sidebar) | `WorkspaceSwitcher` | OK |
| `.shell-sidebar-footer` (conta na sidebar) | `UserMenu` | OK |
| `.app-topbar` (breadcrumb + busca ⌘K + ações) | `Topbar` (`crumbs`, `searchPlaceholder`, `actions`) | OK |
| `.app-topbar-crumb` / `.shell-breadcrumb` | `Breadcrumb` | OK |
| `.search-overlay` / `.search-modal` (⌘K) | `Command` | OK |
| Sino + painel de notificações | `NotificationBell` (`items` + painel) | OK |
| Botão de ajuda | `HelpMenu` | OK |
| `.app-topbar-avatar-btn` (avatar + menu de conta no TOPBAR) | — | **VIOLAÇÃO PO** (ver §Violações) |
| `.shell-btn` (primary/secondary/ghost/danger/sm) | `Button` | OK |
| `.shell-iconbtn` | `IconButton` | OK |
| `.shell-chip` (success/warning/danger/info/neutral) | `Chip` / `Badge` | OK |
| `.shell-modal` (scrim/header/body/footer) | `Modal` | OK |
| `.shell-toast` / região | `Toast` + `ToastRegion` | OK |
| `.shell-segmented` | `Segmented` | OK |
| `.shell-switch` | `Switch` | OK |
| `.shell-empty` | `EmptyState` | OK |
| `.shell-split` (+ `-sm`) | `SplitButton` (`size="sm"`) | OK |
| `.kbd` | `Kbd` | OK |
| `.has-tip` (tooltip CSS por atributo) | `Tooltip` | OK |
| `.shell-toc` | TableOfContents | onda paralela |
| `.shell-subnav` / `settings-subnav.js` | SettingsSubnav | onda paralela |
| `.shell-page-eyebrow`/`-h1`/`-lead` (cabeçalho de página) | — | **LACUNA L1 PageHeader** |
| `.shell-section-h`/`-sub` (cabeçalho de seção) | — | **LACUNA L2 SectionHeader** |
| `.shell-card-row` (linha título+desc+ações dentro de card) | — | **LACUNA L3 SettingRow** |
| `.shell-back` ("Voltar pro app") | — | dobra em L1/`Topbar` (slot `backLink`) |

## `workspace_picker.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.ws-card` (card clicável com chevron) | NavCard | onda paralela |
| `.ws-create` (card tracejado "criar novo") | NavCard (variante `dashed`/create) | onda paralela (garantir variante) |
| `.ws-avatar` (48px, quadrado arredondado, gradiente) | `Avatar` | **LACUNA L15** (`shape="square"`, gradientes de marca) |
| `.ws-current-pill` / `.ws-role-pill` | `Badge` / `Chip` | OK |
| `.ws-divider` ("ou" com linhas) | — | **LACUNA L10 Divider** (DS não tem Divider nenhum) |
| `.picker-topbar` (topbar mínima fora de workspace) | `Topbar` | variante "mínima" a decidir com PO |
| `.picker-account` (avatar+nome+email no topbar) | — | **VIOLAÇÃO PO** (avatar no header) + padrão L11 PersonCell |
| `.menu-pop` | `Menu` | OK |
| `.picker-eyebrow`/`-h1`/`-lead` | — | LACUNA L1 PageHeader |

## `dashboard.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.ph` (eyebrow + dot vivo + h1 + sub + ações) | — | **LACUNA L1 PageHeader** |
| `.ph-dot` (dot pulsante "ao vivo") | — | **LACUNA L8 StatusDot** |
| `.ph-split` (exportar + caret + menu) | `SplitButton` | OK |
| `.section-h` (título de seção + count + régua + ação) | — | **LACUNA L2 SectionHeader** |
| `.projcard` (card de projeto) | composição app (Card + átomos) | OK como composição |
| `.projcard-gauge` / `.recent-mini-gauge` (gauge circular c/ número) | `Charts` não tem gauge | **LACUNA L6 ScoreGauge** |
| `.qmini` (mini barra rotulada por quesito) | `ProgressBar` sm + label externo | OK (composição) |
| `.card` / `.card-h` (título + count + ação) | `Card` + `CardHeader` (`title`/`count`/`action`) | OK |
| `.backlog-row` (linha lista com nº prioridade + gain) | — | LACUNA L3 SettingRow (variante `href`) + disco numerado é app-specific |
| `.recent-row` | — | LACUNA L3 SettingRow |
| `.usage-row` (label + n/n + barra) | UsageMeter | onda paralela |
| `.hint` (banner first-run com ícone) | — | **LACUNA L4 Callout** |
| Higiene: linha 68 do CSS corrompida (`…}ap: 6px; }`) e bloco `__om-edit-overrides` residual no fim do arquivo | — | consertar na referência |

## `settings_account.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| Form (label mono + input/select) | `Input` (`label`/`hint`/`error`/`prefix`/`suffix`), `Select` | OK |
| `.avatar-big` 72px + Trocar/Remover | `Avatar` (máx `lg`) | **LACUNA L15** (`size="xl"`) + composição AvatarUploader é app |
| Footer de form (Cancelar/Salvar) | StickyFooter | onda paralela (variante inline) |
| `.shell-card-row` 2FA (título + chip + ações) | — | LACUNA L3 SettingRow |
| `.oauth-row` (logo + nome + status + ação) | — | **LACUNA L14 ConnectorCard** (mesma família do conn-card) |
| `.oauth-status-active` (dot + texto mono) | — | LACUNA L8 StatusDot |
| `.session-row` | — | LACUNA L3 SettingRow |
| Zona "Excluir conta" (card tracejado + ação destrutiva) | — | **LACUNA L9 DangerZone** |
| Breadcrumb "Configurações / Pessoal" sem href | `Breadcrumb` | **VIOLAÇÃO PO** (sem volta ao pai) |

## `settings_general.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.theme-card` (card selecionável com preview) | — | **LACUNA L7 ChoiceCard** |
| `.pref-row` (título + desc + Switch) | — | LACUNA L3 SettingRow |
| Tabela de atalhos + `<kbd>` | `Table` + `Kbd` | OK (na tela está improvisado inline) |
| Nota explicativa (box cinza) | — | LACUNA L4 Callout (variante `note`) |

## `settings_workspace.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.ws-logo` 64px quadrado | `Avatar` | LACUNA L15 (`shape="square"`) |
| Input com prefixo `refy.app/` | `Input` (`prefix`) | OK |
| `.field-help` (ajuda sob o campo) | `Input` (`hint`) | OK |
| `.domain-row` (nome + meta + chip + ação) | — | LACUNA L3 SettingRow |
| Breadcrumb "Workspace / Workspace" duplicado | `Breadcrumb` | higiene da referência |

## `settings_projects.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.quota` (números + barra + ação) | UsageMeter | onda paralela |
| `.quota-bar` (fill tinta) | `ProgressBar` `tone="neutral"` | **RESOLVIDO nesta branch (8.4)** |
| `.quota-num`/`.quota-lbl` (stat) | — | **LACUNA L5 Stat** |
| Toolbar busca + `.filter-pill` | `Input` + filtros facetados da `Table` | OK (conferir cobertura da Table) |
| `.proj-table` | `Table` | OK |
| `.proj-cell` (ícone quadrado + nome + desc) | — | LACUNA L11 PersonCell (variante entidade) + L15 |
| `.owner-cell` (avatar xs + nome) | — | **LACUNA L11 PersonCell** |
| `.members-cell` (avatares empilhados + "+N") | AvatarGroup | onda paralela |
| `.kebab-btn` ⋯ | `IconButton` + `Menu` | OK |

## `settings_team.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.team-table` | `Table` | OK |
| `.member-cell` (avatar + nome + email) | — | LACUNA L11 PersonCell |
| `.role-pill` | `Badge` | OK |
| `.invite-bar` (email + papel + enviar) | `Input`+`Select`+`Button` | OK (composição) |
| `.role-card` (ícone + nome + desc + chips de permissão + ações) | — | LACUNA L3 SettingRow (chips = `Badge` mono) |
| `.role-locked` ("built-in" + cadeado) | `Badge` com ícone | OK |
| `.role-drawer` (drawer de papel customizado) | `Drawer` | OK |
| `.perm-row` (checkbox + chave mono + desc + tag "destrutivo") | `Checkbox` só tem label | **LACUNA L13 CheckboxField** |

## `settings_billing.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.plan-summary` (hero escuro com stats + ações) | BillingCard | onda paralela + **LACUNA L12 superfície invertida** + L5 Stat |
| `.pm-row` (bandeira + cartão + meta + ação) | — | LACUNA L3 SettingRow |
| `.invoices-table` | `Table` | OK |
| `.credit-pack` (card selecionável de pacote) | — | LACUNA L7 ChoiceCard |
| `.plan-card` (nome/preço/feats/CTA/tag) | PlanCard | onda paralela |
| Segmented Mensal/Anual no modal | `Segmented` | OK |
| `.cancel-zone` (cancelar assinatura) | — | LACUNA L9 DangerZone (2ª ocorrência) |
| Info fiscal (dl label mono + valor) | layout `dl` | OK (padrão L5 Stat cabe se virar tile) |

## `settings_usage.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.usage-hero` (painel escuro: barra + 3 stats) | UsageMeter (barra) | onda paralela + **LACUNA L12 InvertedPanel** + L5 Stat |
| `.usage-hero-cumulative` (pill com ícone) | `Badge` | OK |
| `.cost-table` | `Table` | OK |
| `.consumption-row` (nome + barra + créditos) | UsageMeter / `ProgressBar` | onda paralela |
| `.auto-recharge` (Switch + título + desc) | — | LACUNA L3 SettingRow |
| `.activity-row` | — | LACUNA L3 SettingRow |
| `?` no título de seção com tooltip | `Tooltip` / HelpField | onda paralela (HelpField) |

## `settings_api.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.key-row` (nome + chave mascarada + copiar/rotacionar) | CodeBlock (copiar) | onda paralela + LACUNA L3 SettingRow |
| `.key-val` (código inline em chip) | — | dobrar no spec do CodeBlock (variante `inline`) |
| `.endpoint` (barra escura verbo+path) | — | dobrar no spec do CodeBlock (slot `verb`) |
| `.code-block` (snippet com highlight) | CodeBlock | onda paralela |
| Tabela de eventos | `Table` | OK |
| "Limites de uso" (3 tiles label+número+desc) | — | **LACUNA L5 Stat** |
| `.wh-row` (webhook + chip + editar) | — | LACUNA L3 SettingRow |

## `settings_connectors.html`

| Padrão | Componente do DS | Status |
|---|---|---|
| `.conn-card` (logo + nome + chip + desc + meta + ação; `is-locked`) | — | **LACUNA L14 ConnectorCard** |
| `.lock-banner` (upsell de plano com CTA) | — | LACUNA L4 Callout (variante `upsell`) |
| Modais WP/GSC/GitHub | `Modal` | OK |
| Linhas checkbox com borda (propriedades GSC) | — | LACUNA L13 CheckboxField (variante `boxed`) / L7 |

---

# LACUNAS NOVAS consolidadas (candidatas à próxima leva do §8)

Fora da onda paralela. Ordenadas por recorrência/impacto.

| # | Componente | Spec (2 linhas) | Ocorrências |
|---|---|---|---|
| L1 | `PageHeader` | Eyebrow mono (com StatusDot opcional) + h1 + lead + slot de ações à direita (Button/SplitButton). Padrão de TODAS as páginas; hoje cada tela improvisa `.ph`/`.shell-page-*`. | todas as 11 telas |
| L2 | `SectionHeader` | h2 de seção + subtítulo + count mono + ação inline; variante `rule` (régua até a borda, dashboard) e âncora `id` p/ TOC. | todas as telas |
| L3 | `SettingRow` | Linha de lista/configuração: slot leading (ícone/avatar/Switch) + título + descrição + meta mono + ações trailing; `as="a"` clicável; empilha com divisor. Mata ~10 improvisos (card-row, oauth, session, pref, domain, key, wh, activity, pm, role-card). | 9 telas, ~12 classes distintas |
| L4 | `Callout` | Banner estático inline: ícone + título + texto + ação opcional; tons `info`/`note`/`warn`/`upsell` (lock-banner). Não é Toast/Snackbar (não é transiente). | dashboard, connectors, general, api |
| L5 | `Stat` | Label mono uppercase + valor grande tabular + sub/meta; grid responsivo; funciona em superfície clara e invertida. | api (limites), projects (quota), billing (plan-summary), usage (hero) |
| L6 | `ScoreGauge` | Gauge circular SVG com número centrado e cor por banda (boa/mediana/fraca); tamanhos 32/56px. Charts (D3) não cobre — é indicador, não gráfico. | dashboard (projcard, recentes) |
| L7 | `ChoiceCard` | Card-como-radio: preview/ícone + título + desc + preço/meta; `is-selected` com anel; grupo com teclado (roving). | general (tema), billing (credit-pack), connectors (GSC) |
| L8 | `StatusDot` | Dot colorido 6-7px + texto mono uppercase opcional; variante `pulse` (ao vivo). Hoje improvisado em 4 telas. | dashboard, account, topbar (notifs), picker |
| L9 | `DangerZone` | Card tracejado com título + consequência + `Button` danger; confirmação via Modal. Padrão único p/ excluir conta / cancelar plano / excluir workspace. | account, billing |
| L10 | `Divider` | Separador horizontal com label central opcional ("ou"); DS não tem NENHUM Divider hoje (todo mundo usa `<hr>` inline com estilo à mão). | picker, account, workspace, api, billing |
| L11 | `PersonCell` | Avatar (xs/sm) + nome + linha secundária (email/meta); variante entidade (ícone quadrado + nome + desc). Célula padrão de Table e listas. | team, projects (owner/member), picker |
| L12 | `Card tone="inverted"` | Variante do Card: superfície escura com gradiente + radial da marca, tokens de texto invertidos; base p/ usage-hero e plan-summary (BillingCard senta em cima). | usage, billing |
| L13 | `CheckboxField` | Checkbox com título + descrição (+ tag "destrutivo" opcional); variante `boxed` (linha com borda selecionável). Ou prop `description` no Checkbox atual. | team (permissões), connectors (GSC) |
| L14 | `ConnectorCard` | SettingRow especializado p/ integrações: logo slot + nome + chip status + desc + meta de sync + ação; estados `locked` (plano) e desabilitado. | connectors (7×), account (oauth 3×) |
| L15 | `Avatar` ampliado | Props novas: `shape="square"` (workspace/projeto/logo), `size="xl"` (72px perfil) e paleta de gradientes de marca determinística por nome. | picker, workspace, projects, team, account |

**Sugestões que DOBRAM em specs da onda paralela** (passar pro executor da onda, não são lacunas novas):
CodeBlock ganha variante `inline` (chip de código mascarado) e slot `verb` (barra de endpoint);
NavCard precisa da variante `dashed`/create (ws-create); Topbar precisa do slot `backLink`
("Voltar pro app") ou isso entra no PageHeader.

---

# Violações dos padrões do PO nas próprias telas de referência

1. **Avatar de usuário no topbar** (`app-topbar.js` → `.app-topbar-avatar-btn` com menu de
   conta completo; e `workspace_picker.html` → `.picker-account`). Regra PO: header só
   Help + NotificationBell; UserMenu fica na SIDEBAR. A sidebar de referência JÁ tem a
   conta no footer — o avatar do topbar é duplicado e deve sair. (No picker não há sidebar;
   decidir com PO se o picker é exceção.)
2. **Tema escuro no menu do avatar do topbar** (`app-topbar.js`) — o toggle de tema deve
   viver no UserMenu da sidebar (ou em Configurações › Geral, onde já existe).
3. **SettingsSubnav sem ícones** (`settings-subnav.js` — itens só com label+desc). Regra
   "todo item de menu TEM ícone"; se vale para o subnav, a onda paralela do SettingsSubnav
   precisa de slot de ícone.
4. **Breadcrumb sem navegação de volta ao pai** — em todas as settings, "Configurações" e o
   grupo ("Pessoal"/"Workspace") são `<span>` sem href. Regra PO: breadcrumb sempre com
   volta ao pai. (O `.shell-back` compensa em parte, mas o crumb em si é morto.)
5. **Termo técnico sem HelpField** — `settings_api.html` expõe "HMAC-SHA256", "rate limit",
   "webhook", "MCP" sem ícone de ajuda + "saber mais" (o padrão `has-tip` existe mas só é
   usado 2×, em usage/billing). Regra: termo técnico inevitável nasce com HelpField.
6. **Higiene das referências**: `dashboard.html` linha ~68 tem CSS corrompido
   (`.ph-split-divider { … }ap: 6px; }`) e um bloco `<style id="__om-edit-overrides">`
   residual de ferramenta de edição após o `</html>`; `settings_workspace.html` tem
   breadcrumb "Workspace / Workspace" duplicado.

---

**Evidências:** build da lib e `tsc --noEmit` limpos após a variante 8.4;
screenshot comparativo `AUDITORIA-TELAS-2026-07-17-progressbar.png`.
