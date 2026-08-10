import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { SectionHeader } from "./SectionHeader";

/**
 * `SectionHeader` — cabeçalho de seção dentro de uma página: `<h2>` + sub +
 * count (`Badge`) + ação inline, com `id` de âncora para o `TableOfContents`.
 */
const meta = {
  title: "Components/Molecules/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Cabeçalho de seção (padrão `.shell-section-h`/`.section-h` das telas de referência). `title` vira `<h2>`, `sub` é a descrição, `count` renderiza um `Badge` neutro ao lado do título e `action` fica à direita. O `id` é a âncora da seção — passe o mesmo `id` ao `TableOfContents` para o scrollspy funcionar (o componente já aplica `scroll-margin-top`). `rule` liga a variante compacta do dashboard: título 12px uppercase + régua até a borda.",
          "",
          "**Onde usar:** para dividir uma página em seções — cada bloco de uma tela de configurações (Conexões, Sessões ativas…), grupos de cards no dashboard. Sempre que a seção aparece no `TableOfContents`, dê um `id`.",
          "",
          "**Onde NÃO usar:** título da página (use `PageHeader` — o `<h1>` é dele); título dentro de um `Card` (use o `title` do próprio Card); rótulo de campo de formulário (use o `label` do `Input`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Título da seção (`<h2>`)." },
    sub: { control: "text", description: "Subtítulo/descrição opcional." },
    count: { control: "text", description: "Contador: vira `Badge` neutro." },
    action: { control: false, description: "Ação inline à direita." },
    id: { control: "text", description: "Âncora p/ `TableOfContents`." },
    rule: { control: "boolean", description: "Variante com régua até a borda (dashboard)." },
  },
} satisfies Meta<typeof SectionHeader>;
export default meta;

type Story = StoryObj<typeof SectionHeader>;

/** Playground — título + sub (padrão das settings). */
export const Playground: Story = {
  args: {
    title: "Sessões ativas",
    sub: "Dispositivos conectados à sua conta. Encerre qualquer sessão suspeita.",
    id: "sessoes",
  },
};

/** Com count e ação — Badge neutro ao lado do título, ação à direita. */
export const ComCountEAcao: Story = {
  name: "Com count e ação",
  args: {
    title: "Conexões",
    sub: "Provedores de login conectados à sua conta.",
    count: "3",
    action: (
      <Button size="sm" variant="ghost">
        Adicionar provedor
      </Button>
    ),
    id: "conexoes",
  },
};

/** Variante rule — título compacto uppercase + régua até a borda (dashboard). */
export const ComRegua: Story = {
  name: "Com régua (rule)",
  args: {
    title: "Projetos",
    count: "3 projetos · 2 ativos",
    rule: true,
    action: (
      <a href="#projetos" style={{ font: "inherit" }}>
        Gerenciar →
      </a>
    ),
    id: "projetos",
  },
};

/** Âncora TOC — seções com `id` casam com o `TableOfContents` (scrollspy). */
export const AncoraToc: Story = {
  name: "Âncora p/ TableOfContents",
  args: { title: "" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
      <SectionHeader
        id="perfil"
        title="Perfil"
        sub="Nome, e-mail e avatar exibidos para o time."
      />
      <SectionHeader
        id="conexoes"
        title="Conexões"
        count="3"
        sub="Provedores de login conectados à sua conta."
      />
      <SectionHeader
        id="sessoes"
        title="Sessões ativas"
        count="2"
        sub="Cada `id` acima é a âncora que o TableOfContents observa."
      />
    </div>
  ),
};
