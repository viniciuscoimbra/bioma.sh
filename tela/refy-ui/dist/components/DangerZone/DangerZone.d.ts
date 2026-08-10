import type { HTMLAttributes, ReactNode } from "react";
/** Props for the DangerZone container. */
export interface DangerZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Título da zona (tom critical). Opcional quando a seção já titula fora. */
    title?: ReactNode;
    /** `DangerZoneRow`(s), empilhadas com divisor tracejado. */
    children: ReactNode;
}
/**
 * DangerZone — seção única para ações destrutivas (excluir conta, cancelar
 * assinatura, excluir workspace): card tracejado em tom critical com linhas
 * de ação. A confirmação é do app: `onConfirm` de cada linha é o gancho para
 * abrir o `Modal` de confirmação — a zona nunca executa nada sozinha.
 */
export declare function DangerZone({ title, className, children, ...rest }: DangerZoneProps): import("react").JSX.Element;
/** Props for a destructive action row inside DangerZone. */
export interface DangerZoneRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** O que a ação faz (ex.: "Excluir conta João Mendes"). */
    title: ReactNode;
    /** Consequência, sempre explícita (ex.: "Esta ação é irreversível…"). */
    description?: ReactNode;
    /** Rótulo do botão destrutivo. */
    actionLabel: ReactNode;
    /**
     * Gancho de confirmação: chamado no clique. O app abre o Modal de
     * confirmação e só então executa — a linha não destrói nada diretamente.
     */
    onConfirm?: () => void;
    /** Desabilita a ação (ex.: pré-requisito pendente). */
    disabled?: boolean;
}
/** Linha de ação destrutiva: título + consequência + botão danger. */
export declare function DangerZoneRow({ title, description, actionLabel, onConfirm, disabled, className, ...rest }: DangerZoneRowProps): import("react").JSX.Element;
