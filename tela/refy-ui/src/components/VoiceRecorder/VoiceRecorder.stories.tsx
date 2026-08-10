import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";
import type { VoiceRecorderState } from "./VoiceRecorder";

const meta = {
  title: "Components/Molecules/VoiceRecorder",
  component: VoiceRecorder,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Captura visual controlada e compacta: o app conecta Web Speech/MediaRecorder e fornece estado, duração e nível. Atividade usa a marca; vermelho aparece somente em erro. Compõe `IconButton`, `Button`, `ProgressBar` e `Callout`.",
      },
    },
  },
  argTypes: {
    state: { control: "select", options: ["idle", "listening", "paused", "error", "fallback"] },
    duration: { control: "number" }, level: { control: { type: "range", min: 0, max: 100 } },
    transcript: { control: "text" }, errorMessage: { control: "text" },
    onStart: { action: "start" }, onPause: { action: "pause" }, onResume: { action: "resume" },
    onCancel: { action: "cancel" }, onFinish: { action: "finish" }, onRetry: { action: "retry" },
    onUseFallback: { action: "fallback" },
  },
} satisfies Meta<typeof VoiceRecorder>;
export default meta;

type Story = StoryObj<typeof VoiceRecorder>;

function RecorderDemo({ initialState }: { initialState: VoiceRecorderState }) {
  const [state, setState] = useState<VoiceRecorderState>(initialState);
  const [duration, setDuration] = useState(initialState === "paused" ? 18 : 0);
  const [level, setLevel] = useState(36);
  const [message, setMessage] = useState(`Estado atual: ${initialState}.`);

  useEffect(() => {
    if (state !== "listening") return;
    const timer = window.setInterval(() => {
      setDuration((value) => value + 1);
      setLevel((value) => (value + 17) % 96 + 4);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  const transition = (next: VoiceRecorderState, copy: string) => {
    setState(next);
    setMessage(copy);
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
      <VoiceRecorder
        state={state}
        duration={duration}
        level={level}
        onStart={() => transition("listening", "Microfone ativado.")}
        onPause={() => transition("paused", "Gravação pausada.")}
        onResume={() => transition("listening", "Gravação retomada.")}
        onCancel={() => { setDuration(0); transition("idle", "Gravação descartada."); }}
        onFinish={() => transition("idle", "Áudio concluído; transcrição pronta para revisão.")}
        onRetry={() => transition("idle", "Permissão será solicitada novamente ao tocar no microfone.")}
        onUseFallback={() => transition(state === "error" ? "fallback" : "idle", state === "error" ? "Fallback de ditado exibido." : "Continue pelo teclado do celular.")}
      />
      <p role="status" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{message}</p>
    </div>
  );
}

/** Toque no microfone para iniciar; nenhum pedido de permissão acontece antes disso. */
export const Idle: Story = { render: () => <RecorderDemo initialState="idle" /> };

/** Medidor, duração, pausa, cancelamento e conclusão operam de verdade. */
export const Escutando: Story = { render: () => <RecorderDemo initialState="listening" /> };

/** Pausa congela o medidor e oferece retomada. */
export const Pausado: Story = { render: () => <RecorderDemo initialState="paused" /> };

/** Erro usa vermelho semântico e oferece retry ou fallback. */
export const ErroDePermissao: Story = { render: () => <RecorderDemo initialState="error" /> };

/** Alternativa explícita quando Web Speech não está disponível. */
export const FallbackDitado: Story = { render: () => <RecorderDemo initialState="fallback" /> };
