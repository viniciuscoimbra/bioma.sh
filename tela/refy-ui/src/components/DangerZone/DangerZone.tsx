import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import styles from "./DangerZone.module.css";

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
export function DangerZone({ title, className, children, ...rest }: DangerZoneProps) {
  return (
    <div role="group" className={cn(styles.zone, className)} {...rest}>
      {title != null && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.rows}>{children}</div>
    </div>
  );
}

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
export function DangerZoneRow({
  title,
  description,
  actionLabel,
  onConfirm,
  disabled = false,
  className,
  ...rest
}: DangerZoneRowProps) {
  return (
    <div className={cn(styles.row, className)} {...rest}>
      <div className={styles.body}>
        <div className={styles.rowTitle}>{title}</div>
        {description != null && <div className={styles.rowDesc}>{description}</div>}
      </div>
      <Button variant="danger" size="sm" disabled={disabled} onClick={onConfirm}>
        {actionLabel}
      </Button>
    </div>
  );
}
