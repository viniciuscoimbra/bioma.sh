import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorCard } from "./ConnectorCard";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { StatusDot } from "../StatusDot";

const wpLogo = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#21759b"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 1.5c4.69 0 8.5 3.81 8.5 8.5 0 1.74-.52 3.36-1.42 4.71L13.4 7.36h2.4v-.83h-7.5v.83h2.32l1.99 5.45-2.79 8.36L4.04 7.36h2.27v-.83H4.05A8.49 8.49 0 0 1 12 3.5Zm5.83 14.21L13.94 9.5l3.18 8.66c.48-.13.92-.31 1.34-.55l-.63-1.9Zm-7.66 1.7-3.59-9.84-2.45 7.13a8.49 8.49 0 0 0 6.04 2.71Z"
    />
  </svg>
);

/** `ConnectorCard` — card de integração/conexão OAuth. */
const meta = {
  title: "Components/Molecules/ConnectorCard",
  component: ConnectorCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Card de integração: logo (slot, SVG do serviço), nome + status (slot — `Badge`/`StatusDot`), descrição, meta mono de sync e ações à direita. `locked` marca conector fora do plano — superfície apagada e `lockHint` no lugar das ações (upsell).",
          "",
          "**Onde usar:** lista de conectores (WordPress, Search Console, GitHub) e conexões OAuth da conta (Google, Apple) — a mesma família visual nos dois lugares.",
          "",
          "**Onde NÃO usar:** configuração que não é integração (use `SettingRow`); navegação para outra página (use `NavCard`); o fluxo de conectar em si (é `Modal`/`Drawer`, do app).",
        ].join("\n"),
      },
    },
  },
  args: { name: "WordPress" },
  argTypes: {
    name: { control: "text" },
    description: { control: "text" },
    meta: { control: "text" },
    locked: { control: "boolean" },
    logo: { control: false },
    status: { control: false },
    actions: { control: false },
    lockHint: { control: false },
  },
} satisfies Meta<typeof ConnectorCard>;
export default meta;

type Story = StoryObj<typeof ConnectorCard>;

export const Conectado: Story = {
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="WordPress"
      status={<Badge tone="success">Conectado</Badge>}
      description="Leitura e sugestão de edits direto nos posts, sem publicar nada."
      meta="globoeditorial.com.br · 4 sites conectados · sincronizado há 12 min"
      actions={
        <Button variant="secondary" size="sm">
          Configurar
        </Button>
      }
    />
  ),
};

export const Desconectado: Story = {
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="WordPress"
      status={<Badge tone="neutral">Desconectado</Badge>}
      description="Leitura e sugestão de edits direto nos posts, sem publicar nada."
      actions={
        <Button variant="primary" size="sm">
          Conectar
        </Button>
      }
    />
  ),
};

export const ComStatusDot: Story = {
  name: "Conexão OAuth da conta (StatusDot)",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="Google"
      status={<StatusDot tone="good">Conectado · primário</StatusDot>}
      meta="joao@globoeditorial.com · conectado em 12 jan. 2026"
      actions={
        <Button variant="ghost" size="sm" disabled>
          Provedor primário
        </Button>
      }
    />
  ),
};

export const BloqueadoPorPlano: Story = {
  name: "Bloqueado por plano (locked)",
  render: () => (
    <ConnectorCard
      style={{ maxWidth: 640 }}
      logo={wpLogo}
      name="GitHub"
      description="Abre PRs com as correções sugeridas direto no repositório do site."
      locked
      lockHint={
        <>
          <Badge tone="neutral">Plano Growth</Badge>
          <Button variant="secondary" size="sm">
            Fazer upgrade
          </Button>
        </>
      }
    />
  ),
};

export const ListaDeConectores: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
      <ConnectorCard
        logo={wpLogo}
        name="WordPress"
        status={<Badge tone="success">Conectado</Badge>}
        meta="4 sites · sincronizado há 12 min"
        actions={
          <Button variant="secondary" size="sm">
            Configurar
          </Button>
        }
      />
      <ConnectorCard
        logo={wpLogo}
        name="Search Console"
        status={<Badge tone="success">Conectado</Badge>}
        meta="3 propriedades · sincronizado há 1h"
        actions={
          <Button variant="secondary" size="sm">
            Configurar
          </Button>
        }
      />
      <ConnectorCard
        logo={wpLogo}
        name="GitHub"
        locked
        lockHint={<Badge tone="neutral">Plano Growth</Badge>}
      />
    </div>
  ),
};
