import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "./UserMenu";

/**
 * `UserMenu` — bloco de usuário que abre o menu de conta (compõe Avatar + Menu).
 */
const meta = {
  title: "Components/Molecules/UserMenu",
  component: UserMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Avatar (+ nome/e-mail) como trigger; itens padrão Perfil/Configurações/Sair, customizáveis via `entries` (mesma API do `Menu`). `compact` mostra só o avatar (topbar); `side=\"top\"` abre o menu para cima (rodapé da sidebar).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, minHeight: 300, display: "flex", alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    user: { control: false },
    entries: { control: false },
    compact: { control: "boolean" },
    side: { control: "inline-radio", options: ["bottom", "top"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof UserMenu>;
export default meta;

type Story = StoryObj<typeof UserMenu>;

const user = { name: "João Mendes", email: "joao@globoeditorial.com", initials: "JM" };

/** Bloco completo (sidebar) — clique para abrir. */
export const Playground: Story = {
  args: { user },
};

/** Compacto (topbar) — só o avatar, menu alinhado ao fim. */
export const Compact: Story = {
  name: "Compacto",
  args: { user, compact: true },
};

/** Abrindo para cima (rodapé da sidebar) — menu na largura do trigger. */
export const ParaCima: Story = {
  name: "Abrindo para cima",
  decorators: [
    (Story) => (
      <div style={{ width: 240, minHeight: 300, display: "flex", alignItems: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
  args: { user, side: "top" },
};

/** Itens sem ícone, alinhados ao início. */
export const SemIcones: Story = {
  name: "Sem ícones",
  args: {
    user,
    align: "start",
    entries: [
      { id: "profile", label: "Perfil" },
      { id: "billing", label: "Faturamento" },
      { id: "team", label: "Equipe" },
      { type: "separator" },
      { id: "logout", label: "Sair", danger: true },
    ],
  },
};
