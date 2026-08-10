# @refy/ui

Design system do Refy em **React + TypeScript**, com componentes **atômicos e isolados** — um componente por pasta, cada um com seu `.tsx`, `.module.css`, `.stories.tsx` e `index.ts`. Pronto pra cair num projeto real e pro Storybook.

> Regra de ouro: **um componente por tela do Storybook**. Nada de "vários componentes numa tela só". As telas reais vivem em `src/pages/` e são montadas **só** com componentes de `src/components/`.

---

## Estrutura

```
refy-ui/
├─ package.json
├─ tsconfig.json
├─ .storybook/
│  ├─ main.ts            # stories: src/**/*.stories.tsx
│  └─ preview.ts         # importa tokens.css + global.css; tema light por padrão
└─ src/
   ├─ index.ts           # barrel: re-exporta todos os componentes
   ├─ css-modules.d.ts   # tipagem de *.module.css
   ├─ tokens/tokens.css  # ÚNICA fonte de tokens (cores, tipo, espaço, motion)
   ├─ styles/global.css  # reset + base tipográfica
   ├─ lib/cn.ts          # helper de classes condicionais
   ├─ _demo/icons.tsx    # ícones só para stories/exemplos (use lucide-react em prod)
   ├─ components/
   │  ├─ Button/         # Button.tsx · Button.module.css · Button.stories.tsx · index.ts
   │  ├─ IconButton/
   │  ├─ Badge/
   │  ├─ Switch/
   │  ├─ Avatar/
   │  ├─ Card/           # Card + CardHeader
   │  ├─ ProgressBar/
   │  ├─ SplitButton/
   │  ├─ Sidebar/
   │  ├─ Topbar/
   │  └─ AppShell/       # compõe Sidebar + Topbar + conteúdo
   └─ pages/
      └─ DashboardPage/  # TELA REAL montada só de componentes ↑
```

Cada pasta de componente é **auto-contida**: dá pra mover, versionar ou publicar isolada. Nenhum componente importa o CSS de outro — só tokens.

---

## Rodando o Storybook

```bash
cd refy-ui
npm install
npm run storybook      # abre em http://localhost:6006
```

O Storybook já vem configurado (`.storybook/`) pra Vite + React, carregando `tokens.css` e `global.css` globalmente. Cada componente aparece agrupado:

- **Primitivos** — Button, IconButton, Badge, Switch, Avatar
- **Composites** — Card, ProgressBar, SplitButton
- **Shell** — Sidebar, Topbar
- **Páginas** — Dashboard (a tela real)

---

## Usando num app React

1. Importe os estilos base **uma vez** (ex.: no `main.tsx` / `_app.tsx`):

```ts
import "@refy/ui/tokens.css";
import "@refy/ui/global.css";
```

2. Defina o tema no elemento raiz (o app autenticado usa `light`):

```html
<html data-theme="light">
```

3. Importe e componha:

```tsx
import { AppShell, Card, CardHeader, Button, ProgressBar, Badge } from "@refy/ui";

export function Minha Tela() {
  return (
    <AppShell sidebar={{ /* ... */ }} topbar={{ /* ... */ }}>
      <Card>
        <CardHeader title="Uso este ciclo" action={<Button variant="ghost" size="sm">Detalhes</Button>} />
        <ProgressBar value={49} tone="primary" />
        <Badge tone="success" dot>Ativo</Badge>
      </Card>
    </AppShell>
  );
}
```

`src/pages/DashboardPage/DashboardPage.tsx` é o exemplo canônico: uma tela inteira **sem uma linha de estilo de componente redefinida** — só arranjo (grid/espaço) no `.module.css` local.

---

## Decisões de arquitetura

| Tema | Decisão | Por quê |
|---|---|---|
| Estilo | **CSS Modules** (`*.module.css`) | Escopo automático (sem colisão de `.primary`/`.sm`), zero runtime, funciona em qualquer bundler (Vite/Next/Webpack). |
| Tokens | **CSS custom properties** em `tokens.css` | Uma fonte de verdade; troca de tema por `data-theme`; consumível por CSS, JS e Tailwind. |
| Ícones | **lucide-react** (recomendado) | O `_demo/icons.tsx` existe só pros exemplos. Em produção, passe ícones via props (`leadingIcon`, `icon`). |
| Temas | `data-theme="light" | "dark" | "editorial"` | Extraídos dos protótipos. O app autenticado é `light`. |
| Cor primária | verde `#10b981`, texto **branco** | Contraste garantido; texto escuro sobre verde é proibido no DS. |

---

## Tokens principais (`tokens.css`)

- **Tipografia**: `--font-headline` (Switzer), `--font-body` (Switzer), `--font-mono` (Geist Mono). Escala `--text-*`.
- **Cor (light)**: `--primary`, `--primary-hover`, `--ink-1..4`, `--surface`, `--surface-2`, `--line`, semânticas `--critical/--weak/--ok/--good/--info` (+ `*-soft`).
- **Forma**: `--radius-default` (7px light), `--radius-md/lg`, `--radius-pill`.
- **Motion**: `--duration-fast/mid/slow`, `--ease-out`.
- **Elevação**: `--elev-1..5`, `--shadow-card-light`, `--shadow-focus-ring`.

---

## Próximos componentes (roadmap)

Esta entrega é a **fatia vertical de referência** — o padrão está fechado. Estender é mecânico (copiar a estrutura de 4 arquivos). Fila sugerida, na mesma convenção:

`Input`, `Select`, `SearchInput`, `Checkbox`, `Radio`, `Tabs`, `Table`, `Modal`, `Toast`, `Tooltip`, `Menu`, `Breadcrumb`, `Pagination`, `Drawer`, `Gauge`, `Matrix2x2`.

Os visuais de todos eles já existem como referência estática nos protótipos HTML do projeto (pasta `preview/` e `screens/app/`), prontos pra portar 1:1 pra este formato.
