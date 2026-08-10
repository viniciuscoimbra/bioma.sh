import type { Meta, StoryObj } from "@storybook/react";
import { GoogleButton } from "./GoogleButton";

const meta = {
  title: "Components/Atoms/GoogleButton",
  component: GoogleButton,
  tags: ["autodocs"],
  args: { children: "Continuar com Google" },
} satisfies Meta<typeof GoogleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Continuar: Story = {};
export const Entrar: Story = { args: { children: "Entrar com Google" } };
export const CriarConta: Story = { args: { children: "Criar conta com Google" } };
export const Carregando: Story = { args: { loading: true, loadingLabel: "Conectando ao Google" } };
export const Desabilitado: Story = { args: { disabled: true } };
export const LarguraTotal: Story = { args: { block: true }, decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>] };
