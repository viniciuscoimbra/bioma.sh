import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "./Callout";
import { Button } from "../Button";

const iconInfo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
const iconWarn = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
const iconLock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const meta = {
  title: "Components/Molecules/Callout",
  component: Callout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Banner ESTÁTICO inline: contexto que pertence à página, renderizado junto com ela. Tons `info` (dica de first-run), `note` (nota explicativa neutra), `warn` (aviso de limite/atenção), `danger` (falha persistente) e `upsell` (recurso travado por plano, com CTA). `dismissible` some com transição (motion tokens) e chama `onDismiss` — a persistência do \"não mostrar de novo\" é do app.\n\n" +
          "**Fronteira com Toast/Snackbar:** `Callout` NÃO é transiente — não aparece em resposta a uma ação nem some sozinho. Feedback de ação (salvou, falhou, desfazer) é `Toast`/`Snackbar`, que flutua e expira. Se a informação continua verdadeira ao recarregar a página, é `Callout`; se descreve algo que acabou de acontecer, é `Toast`.\n\n" +
          "**Onde usar:** hint de first-run no dashboard, nota explicativa em Configurações, aviso de limite próximo, lock-banner de plano em Conectores.\n\n" +
          "**Onde NÃO usar:** feedback de ação (Toast/Snackbar); erro de campo de formulário (prop `error` do `Input`); estado vazio de lista (isso é `EmptyState`); confirmação destrutiva (isso é `Modal`).",
      },
    },
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["info", "note", "warn", "danger", "upsell"] },
    icon: { control: false },
    action: { control: false },
  },
} satisfies Meta<typeof Callout>;
export default meta;

type Story = StoryObj<typeof Callout>;

export const Info: Story = {
  name: "Info (hint de first-run)",
  args: {
    tone: "info",
    icon: iconInfo,
    title: "Sua primeira análise está rodando",
    children: "Em alguns minutos o score do projeto aparece aqui. Enquanto isso, conecte o Search Console para enriquecer os dados.",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Nota: Story = {
  name: "Note (nota explicativa)",
  args: {
    tone: "note",
    title: "Atalhos valem em qualquer tela",
    children: "A busca (⌘K) e a navegação por teclado funcionam em todo o app, inclusive dentro de modais.",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Aviso: Story = {
  name: "Warn (limite próximo)",
  args: {
    tone: "warn",
    icon: iconWarn,
    title: "Créditos do ciclo quase no fim",
    children: "Restam 120 de 2.500 créditos. Análises novas ficam pausadas quando o saldo zerar.",
    action: <Button size="sm" variant="secondary">Ver uso</Button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const ErroPersistente: Story = {
  name: "Danger (falha persistente)",
  args: {
    tone: "danger",
    icon: iconWarn,
    title: "Não foi possível acessar o microfone",
    children: "Revise a permissão do navegador ou continue pelo teclado.",
    action: <Button size="sm" variant="secondary">Tentar novamente</Button>,
    role: "alert",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Upsell: Story = {
  name: "Upsell (lock-banner de plano)",
  args: {
    tone: "upsell",
    icon: iconLock,
    title: "Conectores avançados são do plano Business",
    children: "GitHub, GA4 e BigQuery ficam disponíveis no upgrade. Seus dados atuais são preservados.",
    action: <Button size="sm">Fazer upgrade</Button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

/** Fecha com transição (motion token) e desmonta; `onDismiss` avisa o app. */
export const Dispensavel: Story = {
  name: "Dismissible",
  args: {
    tone: "info",
    icon: iconInfo,
    title: "Dica: arraste colunas para reordenar",
    children: "Este aviso some com transição ao fechar — recarregue a story para vê-lo de novo.",
    dismissible: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};
