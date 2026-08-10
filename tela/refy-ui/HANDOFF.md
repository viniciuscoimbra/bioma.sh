# Refy UI — Handoff

Pacote React do design system da Refy. **Este diretório (`refy-ui/`) é a única fonte de verdade.** Tudo fora dele no projeto (telas HTML de preview, `screens/`, playgrounds soltos) é rascunho visual e **não** faz parte da biblioteca.

Exporte / copie **apenas `refy-ui/`** para o repositório real.

---

## 1. O que é

- **React 18 + TypeScript**, cada componente isolado atomicamente.
- **CSS Modules** por componente (`*.module.css`) — zero estilo global vazando.
- **Design tokens** como única fonte de cor/tipo/espaço/motion (`src/tokens/tokens.css`). Nenhum valor hardcoded dentro dos componentes.
- **Storybook (CSF 3.0)** — uma story por componente, com `argTypes`, controls e autodocs.
- **Sem dependência externa ao diretório.** Fontes entram por `@import` no `tokens.css`: Chillax 600 via Fontshare só para o wordmark Domuz; General Sans 600/700 para títulos e métricas; Inter para interface; JetBrains Mono para metadados.

## 2. Rodar

```bash
cd refy-ui
npm install
npm run storybook     # http://localhost:6006  (componentes isolados + controls)
npm run brand:generate # regenera SVGs Domuz a partir do PNG preto + Chillax Semibold
npm run build         # lib: dist/index.js + dist/style.css + d.ts (vite.lib.config.ts)
npm run lint          # tsc --noEmit
npm pack              # gera refy-ui-<versao>.tgz instalável
```

No app consumidor, importe os estilos base uma vez:

```ts
import "@refy/ui/tokens.css";
import "@refy/ui/global.css";
import "@refy/ui/styles.css";   // CSS compilado dos módulos dos componentes
import { Button, Calendar } from "@refy/ui";
```

## 3. Estrutura

```
refy-ui/
├─ src/
│  ├─ components/<Nome>/          # 1 pasta por componente (FLAT)
│  │   ├─ <Nome>.tsx              # componente (forwardRef quando faz sentido, props tipadas)
│  │   ├─ <Nome>.module.css       # estilos isolados, só var(--token)
│  │   ├─ <Nome>.stories.tsx      # CSF 3.0 (satisfies Meta, args, argTypes, autodocs)
│  │   └─ index.ts                # export do componente + tipos
│  ├─ tokens/tokens.css           # ÚNICA fonte de tokens (+ @import das fontes)
│  ├─ styles/global.css           # reset + base tipográfica
│  ├─ lib/cn.ts                   # helper de classes condicionais
│  ├─ _demo/icons.tsx             # ícones só para stories/demos (NÃO exportado)
│  ├─ pages/                      # composições de tela (referência de uso, não são componentes)
│  └─ index.ts                    # barrel público
├─ demos/<Nome>.demo.html         # sandbox HTML por componente (validação sem npm)
├─ .storybook/                    # config
├─ package.json                   # exports: ".", "./tokens.css", "./global.css"
└─ HANDOFF.md                     # este arquivo
```

**Pastas flat, taxonomia atômica no título da story.** Não aninhamos `atoms/molecules/organisms` em disco (evita quebrar imports relativos). A camada atômica vive no `title` da story, gerando a árvore do Storybook:

| Categoria | Componentes | Prefixo de `title` |
|---|---|---|
| **Atoms** | Button, IconButton, Badge, Chip, Switch, Checkbox, RadioGroup, Input, Textarea, Select, Avatar, ProgressBar, Tooltip, Fab, Kbd, Slider, Range, Otp, Skeleton, Breadcrumb, Pagination, Segmented, ToggleGroup | `Components/Atoms/<Nome>` |
| **Molecules** | SplitButton, Card, Tabs, Calendar, Accordion, Combobox, Multiselect, Popover, HoverCard, Toast, Snackbar, Menu, EmptyState, WorkspaceSwitcher, UserMenu, NotificationBell, HelpMenu | `Components/Molecules/<Nome>` |
| **Organisms** | Sidebar, Topbar, Table, Modal, AppShell, Command, Drawer, Matrix2x2, Charts | `Components/Organisms/<Nome>` |

> ✅ **Padronização concluída (2026-07-10):** todos os `title` seguem a tabela. Autodocs habilitado em `.storybook/main.ts` (`docs.autodocs: "tag"` + `@storybook/addon-essentials@8.6.18` — a versão TEM que casar com o core, senão o renderer de docs quebra).

## 4. Componente de referência

**`Calendar`** é o padrão-ouro. Ao criar/revisar qualquer componente, siga o que ele faz:

- Funcional de verdade (seleção, navegação de mês, teclado, min/max, `mode="single" | "range"`).
- Controlado **e** não-controlado (`value`/`onChange` ou `defaultValue`).
- Acessível: `role="grid"`, `aria-selected`, `aria-current`, roving `tabindex`, navegação por teclado.
- Só tokens no CSS Module.
- Story CSF 3.0 com estados reais (padrão, controlado, com limite, range).

## 5. Checklist por componente

Nenhum componente é "pronto" sem os 6 itens:

- [ ] `<Nome>.tsx` — props tipadas + JSDoc, `forwardRef` se receber `ref`, comportamento **funcionando** (não só visual)
- [ ] `<Nome>.module.css` — apenas `var(--token)`, nenhum hex/px mágico de marca
- [ ] Acessibilidade — roles/aria, foco visível, navegação por teclado, `prefers-reduced-motion`
- [ ] `<Nome>.stories.tsx` — `satisfies Meta<typeof X>`, `args` + `argTypes`, autodocs, um story por estado relevante
- [ ] `index.ts` — export do componente e dos tipos
- [ ] Barrel `src/index.ts` — re-export adicionado

## 6. Inventário

**Prontos (72) — inventário 2026-07-27 (49 base + 10 do §8 ondas A–D + 12 da leva 8.13+ + PostalCodeInput). Extensões não-breaking acumuladas: Combobox avatar, ProgressBar neutral+indeterminate, Avatar shape/xs/xl/seed, Card inverted, Checkbox tag/meta/boxed.**

Base original (24): Button, IconButton (sm/md/**lg**), Badge, Chip, Switch, Checkbox, RadioGroup, Input, Textarea, Select, Avatar, ProgressBar, Tooltip, Fab, SplitButton (agora com `variant primary` + `menuAlign`), Card, Tabs, Calendar, Accordion, Sidebar, Topbar, Table (agora com `sortable` + `searchable` + filtros facetados), Modal, AppShell.

Marca Domuz (2026-07-29): `BrandLogo` aceita `brand="domuz"` e mantém `brand="dommus"` como alias legado. O padrão temporário é `mode="solid"` com `variant="theme"`, equivalente a `logos/domuz-lockup-solid-theme.svg`. `mode="line" | "solid"` cobre linha e sólido/gestalt; sólido preenche os counters internos do D e transforma os traços da versão de linha em vazios. `markOnly` alterna sem escrito/com escrito; `variant` cobre `theme`, `black`, `white`, `orange`, `pride`, `trans` e `copa`. PNGs de referência, matriz de 24 SVGs, 18 ícones de site/mobile e 10 templates de aplicação ficam em `src/prototypes/assets/brand/domuz/`; `domuz-brand-assets.manifest.json` lista tudo. Os assets são gerados por `npm run brand:generate` via `potrace` + `text-to-svg`, sem desenho manual. Tokens tipográficos oficiais ficam em `src/tokens/domuz/`; a story `Components/Atoms/BrandLogo` documenta uso, escala, aplicação e arquivos.

Construídos do UI Explorer (20): Combobox, Multiselect, Slider, Range (dual + histograma), Otp, Command (⌘K), Popover, HoverCard, Drawer (left/right/**bottom**=Sheet), Toast+ToastRegion, Snackbar, Skeleton, Breadcrumb, Pagination, Menu, EmptyState, Segmented, ToggleGroup, Matrix2x2 (com seleção), Charts (LineChart/BarChart/DonutChart/Sparkline — **D3 por trás**: d3-scale/d3-shape/d3-array; eixos com réguas, títulos, legenda, tooltip).

Novos para o AppShell (5): WorkspaceSwitcher, UserMenu, NotificationBell, HelpMenu, Kbd.

Formulários de endereço (1): PostalCodeInput, com consulta assíncrona injetável, estados de carregamento/erro e retorno padronizado de logradouro, bairro, cidade e UF.

Leva 8.13+ batch F (4, 2026-07-18, da auditoria `AUDITORIA-TELAS-2026-07-17.md`): Stat(+StatGroup) (L5 — label mono + número tabular + delta up/down + slot Sparkline; funciona em superfície invertida via `data-theme`), Callout (L4 — banner estático info/note/warn/upsell, dismissible com transição; fronteira com Toast/Snackbar na story), Divider (L10 — horizontal/vertical, rótulo central "ou", `spacing`; Atom), ScoreGauge (L6 — arco SVG animado com bandas ok/warn/critical, `role="meter"`, sm 32/md 56/lg 96). Taxonomia: Divider = Atom; Stat/Callout/ScoreGauge = Molecules. Validação viva: demos + playwright (12 checks demo + 9 checks React reais, incl. reduced-motion emulado).

Backlog §8 (10, ondas A–D 2026-07-17, PRs #53–#56): NavCard, TableOfContents, SettingsSubnav, StickyFooter (navegação/formulário); AvatarGroup, HelpField (pessoas/ajuda); BillingCard, PlanCard, UsageMeter(+Group), CodeBlock (cobrança/uso/API). Extensões não-breaking: Combobox (option.avatar/description), ProgressBar (`tone="neutral"`). Taxonomia: NavCard/StickyFooter/AvatarGroup/HelpField = Molecules; TableOfContents/SettingsSubnav/BillingCard/PlanCard/UsageMeter/CodeBlock = Molecules (BillingCard/PlanCard compostos sobre Card).

**Pendências conhecidas** (tasks 1.13–1.18 no change `multitenant-product-experience`): gate de revisão do pacote; 2 erros `tsc` pré-existentes (Card `title`/Input `prefix`); auditoria de hex soltos da base herdada; `demos/*.demo.html` dos novos; Checkbox/Radio customizados (aprovado pelo PO 2026-07-11, faixa Codex — task 1.17). Build de lib + exports: resolvido na 1.18 (`refy-ui-0.2.0.tgz`).

**Leva G (2026-07-18, branch `feat/ds-leva-g-cards`):** +5 componentes — StatusDot (Atom); PersonCell, ChoiceCard(+Group), DangerZone(+Row), ConnectorCard (Molecules) — e 3 extensões não-breaking (Avatar `shape`/`xs`/`xl`/`seed`; Card `tone="inverted"`; Checkbox `tag`/`meta`/`boxed`). Detalhe na linha 8.13g do §8.

**`refy-ui-0.2.2.tgz` (aprovado PO 2026-07-17):** 2 props opcionais, não-breaking, para white-label multi-tenant:
- `Sidebar`: `brand?: ReactNode` — wordmark exibido no topo (default `"refy"`, texto fixo anterior). Some quando colapsada, igual ao comportamento antigo. Uso: `<Sidebar brand="dommus" ... />`.
- `AppShell`: `theme?: "light" | "dark"` — controla o `data-theme` do elemento raiz (default `"light"`, igual ao comportamento anterior hardcoded). Uso: `<AppShell theme="light" ... />`.

## 7. Convenções de código

- **Props:** nomes em inglês, tipados; enums de variante como union de string literais (`type ButtonVariant = "primary" | "secondary" | ...`).
- **Sem estado global implícito.** Overlays (Modal, Tooltip) são controlados por prop.
- **Ícones não são bundleados:** o componente recebe ícone via prop (`leadingIcon?: ReactNode`); `_demo/icons` serve só stories.
- **Cores/temas:** `[data-theme="light|dark|editorial"]` no ancestral; componentes nunca fixam cor de tema, só leem tokens. Tons derivados da marca via `color-mix(in srgb, var(--primary) N%, transparent)` — nunca rgba/hex solto.
- **Composição obrigatória (moléculas/organismos herdam dos átomos):** atalhos de teclado = `Kbd`; botões só-ícone (fechar, sino, ajuda) = `IconButton` (lg para a topbar); CTA = `Button`; contadores = `Badge`; avatar = `Avatar`; trilha = `Breadcrumb`; menus pop-up = `Menu`. Duplicações intencionais e o porquê: checkboxes internos de Table/Multiselect e o input do Command são especializações do padrão listbox/`aria-activedescendant` — envolver o átomo nativo quebraria o foco.
- **Destino, configuração e conteúdo não são o mesmo padrão:** origem de conta, vínculo e entidade que abrem outra página usam `NavCard`, com o item inteiro navegável, avatar/ícone, estado e chevron. Configuração ou ação dentro da página atual usa `SettingRow`. Formulário ou conteúdo sem navegação usa `Card`. Não envolva uma lista de destinos em `Card` nem use `SettingRow` para simular `NavCard`.
- **Overlays controlados:** `open`/`onOpenChange` sempre; Esc + clique fora fecham; animação de entrada com tokens de motion e `prefers-reduced-motion` zerando tudo.
- **Sidebar colapsada:** workspace/conta viram avatares que EXPANDEM a sidebar antes de abrir menu (decisão do PO 2026-07-11).
- **Charts:** D3 só para matemática (escalas/formas/ticks) — render é 100% React/SVG; todo gráfico tem eixos com medidas, título de unidade e legenda quando há mais de uma série/segmento; Sparkline é a única exceção (sem eixos, por definição).
- **Validação viva antes de marcar pronto:** cada componente novo é exercitado via Playwright (interação real de teclado/mouse + screenshot) — nunca marcar task pelo código compilar.
- **Feedback de persistência:** salvamento confirmado usa `Toast`; erro de salvamento usa `Toast` + erro junto ao campo. `Snackbar` fica reservado para ação reversível em uma linha, com `Desfazer`.
- **Microinterações obrigatórias** (regra do PO 2026-07-18): todo elemento interativo tem hover/focus-visible/active com transição via tokens de motion (`--duration-*`/`--ease-*`) — nunca mudança seca; hover de fundo perceptível em qualquer superfície = `color-mix(in srgb, var(--ink-1) N%, transparent)` (~5–6% hover, ~9–10% active); componentes de progresso/carregamento têm estado animado (`indeterminate`); `prefers-reduced-motion` zera tudo (o reset global de `global.css` cobre transições/animações, mas loops infinitos precisam de `animation: none` explícito no componente, como no `ProgressBar`).

## 8. Backlog de componentes faltantes (PO 2026-07-17)

Fonte: telas de referência estáticas do design system de origem.
(workspace_picker, settings_*, dashboard). O PO identificou padrões usados nas telas
que NUNCA viraram componente no Storybook. **Regra: componente primeiro, tela depois** —
nenhuma tela nova consome padrão que não exista aqui como componente com story.
**Toda story nova documenta uso: "onde usar / onde NÃO usar"** (evita a LLM adivinhar
e evita estresse futuro — pedido explícito do PO).

| # | Componente | Referência | Nota |
|---|---|---|---|
| 8.1 | ✅ `NavCard` | `workspace_picker.html` | FEITO 2026-07-17 (PR #56): link/button, `current`, `variant="dashed"`, meta+chevron; 24 checks Playwright |
| 8.2 | ✅ `TableOfContents` | todas as settings_* | FEITO 2026-07-17 (PR #56): scrollspy IntersectionObserver controlável; corrige edge-case de interseção-zero que a referência tem |
| 8.3 | ✅ `SettingsSubnav` | `settings_*.html` | FEITO 2026-07-17 (PR #56): items/groups, `renderLink` p/ Next Link, `aria-current="page"` |
| 8.4 | ✅ `ProgressBar` — variantes das telas | `settings_projects.html` | FEITO 2026-07-17 (PR #53): `tone="neutral"` (fill ink das barras de cota) não-breaking; screenshot comparativo idêntico à referência |
| 8.5 | `AvatarGroup` (membros agrupados) | `settings_team.html` | ✅ feito 2026-07-17 (batch B) — empilhamento sobre o átomo Avatar, "+N" com tooltip, clicável opcional |
| 8.6 | ✅ `BillingCard` + `PlanCard` | `settings_billing.html` | FEITOS 2026-07-17 (PR #55): slots p/ bandeira/status/ações; PlanCard current/highlighted; 18 checks Playwright vivos |
| 8.7 | ✅ `UsageMeter` (+`UsageMeterGroup`) | `settings_usage.html`, `settings_api.html` | FEITO 2026-07-17 (PR #55): tom por limiar warn/critical sobre ProgressBar, aria-valuetext pt-BR |
| 8.8 | ✅ `CodeBlock` | `settings_api.html` | FEITO 2026-07-17 (PR #55): copiar real (Clipboard API), `secret` mascarado com toggle, aria-live |
| 8.9 | ✅ `StickyFooter` | rodada 3 do D15 | FEITO 2026-07-17 (PR #56): sticky/fixed com spacer automático (ResizeObserver) + safe-area |
| 8.10 | `Combobox` com imagem | feedback D15 | ✅ feito 2026-07-17 (batch B) — campos opcionais `avatar`/`description` na ComboboxOption (variante, não componente paralelo); avatar também no input |
| 8.11 | `HelpField` (label + ícone ajuda + tooltip + "saber mais" → Drawer) | feedback D15 | ✅ feito 2026-07-17 (batch B) — wrapper com `onLearnMore` (gancho; a Drawer é do app) |
| 8.12 | ✅ Auditoria das telas de referência | `screens/app/*` | FEITA 2026-07-17 (PR #53) → `AUDITORIA-TELAS-2026-07-17.md`: **15 lacunas novas** (leva 8.13+ — top-5: SettingRow, PageHeader, SectionHeader, Stat, Callout; tb. Divider, ScoreGauge, ChoiceCard, DangerZone, ConnectorCard, Avatar square/xl, Card invertido) + 6 violações dos padrões do PO nas próprias telas de referência (pior: avatar+menu no topbar do app-topbar.js) |
| 8.13 | ✅ `PageHeader` (L1) | todas as 11 telas | FEITO 2026-07-18 (branch `feat/ds-leva-e-estrutura`): eyebrow mono + `<h1>` + lead + slot de ações; slot `breadcrumb` (átomo Breadcrumb, sempre com volta ao pai). Molecule. |
| 8.14 | ✅ `SectionHeader` (L2) | todas as telas | FEITO 2026-07-18: `<h2>` + sub + count (`Badge` neutro) + ação inline + `id` de âncora c/ scroll-margin p/ `TableOfContents`; variante `rule` (régua até a borda, dashboard). Molecule. |
| 8.15 | ✅ `SettingRow` + `SettingRowGroup` (L3) | 9 telas, ~12 classes | FEITO 2026-07-18: leading (`leadingFrame` 36px p/ logos) + título (Badge inline) + descrição + meta mono + ações; clicável (`href`→`<a>`, `onClick`→`<button>`, como NavCard) c/ chevron/hover/focus; `switchProps` acopla Switch c/ aria-labelledby; grupo `role="list"` c/ divisores por token. 28 checks Playwright vivos (demos + Storybook). Molecule. |
| 8.13g | ✅ Leva G — cards/estado (L7/L8/L9/L11/L12/L13/L14/L15) | auditoria 8.12 | FEITA 2026-07-18: **novos** ChoiceCard+ChoiceCardGroup (radio/checkbox semântico, roving tabindex — setas movem E selecionam), StatusDot (Atom, `pulse`), PersonCell, DangerZone+DangerZoneRow (`onConfirm` gancho, Modal é do app), ConnectorCard (`locked`/`lockHint`); **extensões não-breaking** Avatar (`shape="square"`, tamanhos `xs`/`xl`, `seed` gradiente determinístico), Card (`tone="inverted"` com tokens de tinta re-escopados), Checkbox (`tag`/`meta`/`boxed` — cobre o L13 CheckboxField sem componente novo). 38 checks Playwright vivos + screenshots em `demos/` |
| 8.13 | ✅ `PageHeader` (L1) | todas as 11 telas | FEITO 2026-07-18 (branch `feat/ds-leva-e-estrutura`): eyebrow mono + `<h1>` + lead + slot de ações; slot `breadcrumb` (átomo Breadcrumb, sempre com volta ao pai). Molecule. |
| 8.14 | ✅ `SectionHeader` (L2) | todas as telas | FEITO 2026-07-18: `<h2>` + sub + count (`Badge` neutro) + ação inline + `id` de âncora c/ scroll-margin p/ `TableOfContents`; variante `rule` (régua até a borda, dashboard). Molecule. |
| 8.15 | ✅ `SettingRow` + `SettingRowGroup` (L3) | 9 telas, ~12 classes | FEITO 2026-07-18: leading (`leadingFrame` 36px p/ logos) + título (Badge inline) + descrição + meta mono + ações; clicável (`href`→`<a>`, `onClick`→`<button>`, como NavCard) c/ chevron/hover/focus; `switchProps` acopla Switch c/ aria-labelledby; grupo `role="list"` c/ divisores por token. 28 checks Playwright vivos (demos + Storybook). Molecule. |

Padrões de composição correlatos (obrigatórios, ver skill `refy-design-system`):
item de sidebar SEMPRE com ícone; `UserMenu` na sidebar (header só Help+Notification,
nunca avatar); `Breadcrumb` sempre no header com volta ao pai; avatar em todo
corretor/imobiliária; ontologia PT simples na UI (nunca tenant/broker/share_pct).
