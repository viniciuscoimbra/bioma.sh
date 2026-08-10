import type { Meta, StoryObj } from "@storybook/react";
import { DangerZone, DangerZoneRow } from "./DangerZone";

/** `DangerZone` — seção padrão de ações destrutivas. */
const meta = {
  title: "Components/Molecules/DangerZone",
  component: DangerZone,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Card tracejado em tom critical com linhas de ação destrutiva (`DangerZoneRow`): título + consequência explícita + botão `danger`. `onConfirm` é gancho — o app abre o `Modal` de confirmação e só então executa; a zona nunca destrói nada sozinha.",
          "",
          "**Onde usar:** o padrão único para excluir conta, cancelar assinatura, excluir workspace/projeto — sempre no FIM da página de configurações, uma zona por página.",
          "",
          "**Onde NÃO usar:** ações reversíveis (arquivar, desativar — use `SettingRow` com botão secundário); avisos sem ação (use `Callout`); confirmação em si (é `Modal`, do app).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    children: { control: false },
  },
} satisfies Meta<typeof DangerZone>;
export default meta;

type Story = StoryObj<typeof DangerZone>;

export const ExcluirConta: Story = {
  render: () => (
    <DangerZone style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Excluir conta João Mendes"
        description="Esta ação é irreversível. Análises e backlog ficam com o ambiente, não com você."
        actionLabel="Excluir conta"
        onConfirm={() => console.log("abrir Modal de confirmação")}
      />
    </DangerZone>
  ),
};

export const ComTituloEVariasLinhas: Story = {
  name: "Com título e várias linhas",
  render: () => (
    <DangerZone title="Zona de perigo" style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Cancelar assinatura"
        description="O ambiente volta ao plano gratuito no fim do ciclo. Análises acima da cota ficam somente leitura."
        actionLabel="Cancelar assinatura"
        onConfirm={() => console.log("abrir Modal")}
      />
      <DangerZoneRow
        title="Excluir ambiente"
        description="Apaga permanentemente projetos, análises e membros. Não dá para desfazer."
        actionLabel="Excluir ambiente"
        onConfirm={() => console.log("abrir Modal")}
      />
    </DangerZone>
  ),
};

export const AcaoBloqueada: Story = {
  name: "Ação bloqueada (pré-requisito)",
  render: () => (
    <DangerZone style={{ maxWidth: 640 }}>
      <DangerZoneRow
        title="Excluir conta"
        description="Transfira os workspaces dos quais você é admin antes de excluir a conta."
        actionLabel="Excluir conta"
        disabled
      />
    </DangerZone>
  ),
};
