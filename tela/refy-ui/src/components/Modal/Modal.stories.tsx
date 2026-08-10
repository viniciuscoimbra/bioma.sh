import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "../Button";

const meta = {
  title: "Components/Organisms/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    open: { control: "boolean" },
    title: { control: "text" },
    ariaLabel: { control: "text" },
    children: { control: "text" },
    footer: { control: false },
    onClose: { control: false },
  },
} satisfies Meta<typeof Modal>;
export default meta;

type Story = StoryObj<typeof Modal>;

export const CancelarPlano: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>Cancelar plano</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Cancelar plano Pro?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>Manter assinatura</Button>
              <Button variant="danger" onClick={() => setOpen(false)}>Confirmar cancelamento</Button>
            </>
          }
        >
          Você mantém acesso até 2 mai. 2027. Créditos acumulados permanecem no saldo e não são reembolsados.
        </Modal>
      </>
    );
  },
};

export const SemTituloVisivel: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir confirmação</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          ariaLabel="Confirmar alteração"
          footer={<Button onClick={() => setOpen(false)}>Concluir</Button>}
        >
          Revise a alteração antes de concluir.
        </Modal>
      </>
    );
  },
};

export const ConteudoLongo: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Abrir termos</Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Termos da operação"
          footer={<Button onClick={() => setOpen(false)}>Entendi</Button>}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>Cláusula {index + 1}: as informações permanecem disponíveis para revisão antes da confirmação.</p>
          ))}
        </Modal>
      </>
    );
  },
};
