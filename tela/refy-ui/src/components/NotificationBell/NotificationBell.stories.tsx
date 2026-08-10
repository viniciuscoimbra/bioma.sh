import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NotificationBell, type NotificationItem } from "./NotificationBell";

const items: NotificationItem[] = [
  { id: "n1", title: "Análise concluída", description: "refy.com.br: 84 páginas, 12 críticos.", time: "há 5min", unread: true },
  { id: "n2", title: "Concorrente subiu 4 posições", description: "rdstation.com para 'seo técnico'.", time: "há 2h", unread: true },
  { id: "n3", title: "Créditos acabando", description: "Restam 300 créditos no ciclo.", time: "há 1d", unread: true },
  { id: "n4", title: "Convite aceito", description: "Ana Costa entrou no ambiente.", time: "há 3d" },
  { id: "n5", title: "Relatório semanal disponível", description: "Resumo de 12 a 18 de junho.", time: "há 5d" },
];

/**
 * `NotificationBell` — sino com contador de não lidas + painel de notificações.
 */
const meta = {
  title: "Components/Molecules/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Badge vermelho sobreposto ao sino com a contagem de `unread` (9+ trunca); painel com título/descrição/tempo e ponto verde nas não lidas. O estado é do app: `onItemClick` e `onMarkAllRead` emitem eventos — na story 'Fluxo completo', clicar numa notificação a marca como lida. Esc/clique fora fecham.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 440, paddingRight: 320, paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    items: { control: false },
    title: { control: "text" },
    emptyMessage: { control: "text" },
    onItemClick: { action: "item" },
    onMarkAllRead: { action: "mark-all" },
  },
} satisfies Meta<typeof NotificationBell>;
export default meta;

type Story = StoryObj<typeof NotificationBell>;

/** 3 não lidas + 2 lidas — repare no ponto verde e no peso do título. */
export const Playground: Story = {
  args: { items },
};

/**
 * Fluxo completo: clicar numa notificação marca como lida (ponto some,
 * badge decrementa); "Marcar todas como lidas" zera o badge.
 */
export const FluxoCompleto: Story = {
  name: "Fluxo completo",
  args: { items },
  render: (args) => {
    const [list, setList] = useState(items);
    return (
      <NotificationBell
        {...args}
        items={list}
        onItemClick={(item) =>
          setList((l) => l.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))
        }
        onMarkAllRead={() => setList((l) => l.map((n) => ({ ...n, unread: false })))}
      />
    );
  },
};

/** Todas lidas — sem badge, sem ação de marcar. */
export const TodasLidas: Story = {
  name: "Todas lidas",
  args: { items: items.map((n) => ({ ...n, unread: false })) },
};

/** Mais de 9 não lidas — badge trunca em "9+". */
export const MuitasNaoLidas: Story = {
  name: "9+ não lidas",
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `m-${i}`,
      title: `Notificação ${i + 1}`,
      time: `há ${i + 1}h`,
      unread: true,
    })),
  },
};

/** Vazio. */
export const Empty: Story = {
  name: "Sem notificações",
  args: { items: [] },
};
