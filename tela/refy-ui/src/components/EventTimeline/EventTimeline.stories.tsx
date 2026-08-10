import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { EventTimeline, type TimelineEvent } from "./EventTimeline";

const events: TimelineEvent[] = [
  { id: "1", timestamp: "2026-07-23T17:30:00-03:00", title: "Visita solicitada", description: "Disponibilidade enviada: 23 jul., das 09h às 11h.", actor: { name: "Vinícius Coimbra", initials: "VC" }, status: { label: "aguardando confirmação", tone: "warn" }, badge: { label: "Visita", tone: "info" }, action: <Button size="sm">Ver visita</Button> },
  { id: "2", timestamp: "2026-07-23T16:42:00-03:00", title: "Imóvel guardado", description: "O cliente decidiu revisar este imóvel antes de agendar.", actor: { name: "Vinícius Coimbra", initials: "VC" }, status: { label: "guardado", tone: "info" } },
  { id: "3", timestamp: "2026-07-22T12:10:00-03:00", title: "Lead atribuído", description: "Atendimento atribuído ao corretor responsável pelo imóvel.", actor: { name: "Ana Lima", initials: "AL" }, status: { label: "concluído", tone: "good" }, badge: { label: "Distribuição", tone: "neutral" } },
];

const meta = {
  title: "Components/Organisms/EventTimeline",
  component: EventTimeline,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    events,
    title: "Vinícius × Apartamento com varanda · Itapoã",
    context: "Interações do cliente com este imóvel, do primeiro interesse ao agendamento da visita.",
  },
} satisfies Meta<typeof EventTimeline>;
export default meta;
type Story = StoryObj<typeof EventTimeline>;

export const Cronologia: Story = {};
export const Compacto: Story = { args: { density: "compact" } };
export const Agrupamento: Story = {};
export const Vazio: Story = { args: { events: [] } };
export const Erro: Story = {
  render: () => {
    const [error, setError] = useState("A conexão com o histórico foi interrompida.");
    return <EventTimeline events={error ? [] : events} error={error || undefined} onRetry={() => setError("")} />;
  },
};
export const ConteudoLongo: Story = {
  args: {
    events: [{
      ...events[0],
      id: "long",
      title: "O cliente atualizou detalhadamente as preferências de deslocamento, rotina de trabalho remoto, infraestrutura de bairro e espaço necessário para dois cachorros",
      description: "Registro extenso para verificar que a linha do tempo preserva autoria, horário, estado e ação sem ocultar conteúdo operacional relevante nem criar rolagem horizontal, mesmo quando o evento resulta de uma análise longa do perfil e inclui muitos detalhes contextuais.",
    }],
  },
};
