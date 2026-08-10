import type { HTMLAttributes, ReactNode } from "react";
/** Props for the BillingCard component. */
export interface BillingCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** Bandeira/ícone do método (ReactNode — o DS não bundleia logos). Ex.: <span>VISA</span>. */
    brandIcon?: ReactNode;
    /** Nome do método. Ex.: "Cartão de crédito". */
    methodLabel: ReactNode;
    /** Últimos dígitos do cartão — vira "· final 4242". */
    lastDigits?: string;
    /** Linha secundária do método. Ex.: "Vence em 09/2028 · Asaas (Brasil)". */
    methodMeta?: ReactNode;
    /** Status da cobrança — slot para `Badge` (ex.: <Badge tone="success" dot>Ativa</Badge>). */
    status?: ReactNode;
    /** Rótulo do bloco de próxima cobrança. */
    nextChargeLabel?: ReactNode;
    /** Valor da próxima cobrança. Ex.: "R$ 2.388". */
    nextChargeAmount?: ReactNode;
    /** Data/complemento da próxima cobrança. Ex.: "em 2 mai. 2027". */
    nextChargeDate?: ReactNode;
    /** Ações (slot) — ex.: Trocar cartão, Ver faturas (`Button`). */
    actions?: ReactNode;
    /** Elevação repassada ao Card. */
    elevation?: 0 | 1 | 2;
}
/**
 * Cartão de cobrança: método de pagamento + próxima cobrança + ações.
 * Composição sobre `Card`; bandeira, status e ações entram por slots
 * (o DS não bundleia logos de bandeira nem decide as ações).
 */
export declare function BillingCard({ brandIcon, methodLabel, lastDigits, methodMeta, status, nextChargeLabel, nextChargeAmount, nextChargeDate, actions, elevation, className, ...rest }: BillingCardProps): import("react").JSX.Element;
