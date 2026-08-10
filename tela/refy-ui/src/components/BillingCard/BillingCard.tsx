import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Card } from "../Card";
import styles from "./BillingCard.module.css";

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
export function BillingCard({
  brandIcon,
  methodLabel,
  lastDigits,
  methodMeta,
  status,
  nextChargeLabel = "Próxima cobrança",
  nextChargeAmount,
  nextChargeDate,
  actions,
  elevation = 0,
  className,
  ...rest
}: BillingCardProps) {
  const hasFooter = nextChargeAmount != null || actions != null;
  return (
    <Card elevation={elevation} className={cn(styles.billing, className)} {...rest}>
      <div className={styles.methodRow}>
        {brandIcon && (
          <span className={styles.brand} aria-hidden="true">
            {brandIcon}
          </span>
        )}
        <div className={styles.methodInfo}>
          <div className={styles.methodName}>
            {methodLabel}
            {lastDigits && <span className={styles.lastDigits}> · final {lastDigits}</span>}
          </div>
          {methodMeta && <div className={styles.methodMeta}>{methodMeta}</div>}
        </div>
        {status && <div className={styles.status}>{status}</div>}
      </div>

      {hasFooter && (
        <div className={styles.footer}>
          {nextChargeAmount != null && (
            <div className={styles.nextCharge}>
              <div className={styles.nextChargeLabel}>{nextChargeLabel}</div>
              <div className={styles.nextChargeValue}>
                {nextChargeAmount}
                {nextChargeDate && <span className={styles.nextChargeDate}> {nextChargeDate}</span>}
              </div>
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </Card>
  );
}
