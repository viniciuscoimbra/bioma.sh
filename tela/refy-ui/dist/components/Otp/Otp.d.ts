import type { HTMLAttributes } from "react";
/** Props for the OTP input group. */
export interface OtpProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
    /** Quantidade de dígitos. Padrão 6. */
    length?: number;
    /** Separador "—" a cada N dígitos (ex.: 3 → `392 — 114`). */
    groupSize?: number;
    /** Código controlado (string com até `length` caracteres). */
    value?: string;
    /** Código inicial (não-controlado). */
    defaultValue?: string;
    /** Disparado a cada digitação com o código atual. */
    onChange?: (code: string) => void;
    /** Disparado quando todos os dígitos são preenchidos. */
    onComplete?: (code: string) => void;
    /** Aceita letras além de números. Padrão só dígitos. */
    alphanumeric?: boolean;
    /** Rótulo acessível do grupo. */
    label?: string;
    error?: string;
    disabled?: boolean;
    /** Foca o primeiro campo ao montar. */
    autoFocus?: boolean;
}
/**
 * Otp — código de verificação, um dígito por campo.
 *
 * Digitar avança o foco; Backspace limpa e volta; ←/→ navegam; colar
 * distribui o código inteiro. `groupSize` insere o separador "—" entre
 * grupos. Dispara `onComplete` quando o último dígito entra. Controlado
 * (`value`/`onChange`) ou não-controlado (`defaultValue`).
 *
 *   <Otp length={6} groupSize={3} onComplete={verify} />
 */
export declare const Otp: import("react").ForwardRefExoticComponent<OtpProps & import("react").RefAttributes<HTMLDivElement>>;
