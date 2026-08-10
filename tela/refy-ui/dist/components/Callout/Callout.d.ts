import type { HTMLAttributes, ReactNode } from "react";
export type CalloutTone = "info" | "note" | "warn" | "danger" | "upsell";
/** Props for the Callout component. */
export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Tom semântico do banner (padrão: "info"). */
    tone?: CalloutTone;
    /** Ícone à esquerda (o DS não bundleia ícones — passe por prop). */
    icon?: ReactNode;
    /** Título do banner. */
    title: ReactNode;
    /** Corpo do banner. */
    children?: ReactNode;
    /** Ação opcional à direita (ex.: `<Button size="sm">Fazer upgrade</Button>`). */
    action?: ReactNode;
    /** Exibe o botão de fechar. O banner some com transição e desmonta. */
    dismissible?: boolean;
    /** Chamado após o banner sair (fim da transição). */
    onDismiss?: () => void;
    /** Rótulo acessível do botão de fechar (padrão: "Dispensar aviso"). */
    dismissLabel?: string;
}
/**
 * Banner ESTÁTICO inline: contexto que pertence à página (dica de first-run,
 * nota explicativa, aviso de limite, upsell de plano). Não é transiente —
 * a fronteira com Toast/Snackbar está documentada na story.
 */
export declare const Callout: import("react").ForwardRefExoticComponent<CalloutProps & import("react").RefAttributes<HTMLDivElement>>;
