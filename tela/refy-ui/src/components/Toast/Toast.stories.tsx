import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Button } from "../Button";
import { Toast, ToastRegion, type ToastData } from "./Toast";

/**
 * `Toast` / `ToastRegion` — notificações empilhadas num canto da tela.
 */
const meta = {
  title: "Components/Molecules/Toast",
  component: ToastRegion,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pilha totalmente controlada: o app mantém a lista de `ToastData` e recebe `onDismiss` quando um toast expira (`duration`, padrão 5s), fecha no × ou tem a ação clicada. `aria-live=\"polite\"`. Tons: `default`, `success`, `danger`; ação inline opcional (Desfazer).",
      },
    },
  },
  argTypes: {
    position: { control: "inline-radio", options: ["bottom-right", "bottom-left", "top-right"] },
    toasts: { control: false },
    onDismiss: { control: false },
  },
} satisfies Meta<typeof ToastRegion>;
export default meta;

type Story = StoryObj<typeof ToastRegion>;

/** Dispare toasts pelos botões — auto-dismiss em 5s, × fecha antes. */
export const Playground: Story = {
  args: { toasts: [], onDismiss: () => {} },
  render: (args) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const seq = useRef(0);
    function push(toast: Omit<ToastData, "id">) {
      seq.current += 1;
      setToasts((t) => [...t, { ...toast, id: `t-${seq.current}` }]);
    }
    const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));
    return (
      <div style={{ minHeight: 380, padding: 24, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Button onClick={() => push({ title: "Análise concluída", description: "84 páginas rastreadas, 12 críticos.", tone: "success" })}>
          Sucesso
        </Button>
        <Button onClick={() => push({ title: "Falha ao exportar", description: "O servidor não respondeu.", tone: "danger" })}>
          Erro
        </Button>
        <Button onClick={() => push({ title: "Issue movida para Backlog", action: { label: "Desfazer", onClick: () => {} } })}>
          Com ação
        </Button>
        <ToastRegion {...args} toasts={toasts} onDismiss={dismiss} />
      </div>
    );
  },
};

/** Anatomia de um toast isolado (sem pilha, sem timer). */
export const Isolado: Story = {
  name: "Toast isolado",
  args: { toasts: [], onDismiss: () => {} },
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <Toast id="a" title="Análise concluída" description="84 páginas rastreadas." tone="success" duration={null} />
      <Toast id="b" title="Falha ao exportar" description="O servidor não respondeu." tone="danger" duration={null} />
      <Toast id="c" title="Issue movida para Backlog" action={{ label: "Desfazer", onClick: () => {} }} duration={null} />
    </div>
  ),
};
