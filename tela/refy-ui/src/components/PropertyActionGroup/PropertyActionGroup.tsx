import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button";
import type { ButtonStatus } from "../Button";
import { cn } from "../../lib/cn";
import styles from "./PropertyActionGroup.module.css";

export type PropertyAction = "reject" | "save" | "visit";
export type PropertyActionGroupState = "idle" | "processing" | "completed" | "unavailable";

export interface PropertyActionGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  state?: PropertyActionGroupState;
  activeAction?: PropertyAction;
  onAction?: (action: PropertyAction) => void;
  orientation?: "auto" | "horizontal" | "vertical";
  disabledActions?: PropertyAction[];
  statusMessage?: ReactNode;
}

const icons: Record<PropertyAction, ReactNode> = {
  reject: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  save: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>,
  visit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>,
};

const labels: Record<PropertyAction, string> = {
  reject: "Não quero",
  save: "Guardar",
  visit: "Quero visitar",
};

/** Ações principais do imóvel. Cada ação inicia um fluxo próprio no consumidor. */
export function PropertyActionGroup({
  state = "idle",
  activeAction,
  onAction,
  orientation = "auto",
  disabledActions = [],
  statusMessage,
  className,
  ...rest
}: PropertyActionGroupProps) {
  const actions: PropertyAction[] = ["reject", "save", "visit"];
  const unavailable = state === "unavailable";

  function buttonStatus(action: PropertyAction): ButtonStatus {
    if (activeAction !== action) return "idle";
    if (state === "processing") return "loading";
    if (state === "completed") return "success";
    return "idle";
  }

  const message = statusMessage ?? (
    state === "processing" && activeAction ? `${labels[activeAction]}: processando…` :
    state === "completed" && activeAction ? `${labels[activeAction]}: concluído.` :
    unavailable ? "As ações deste imóvel estão indisponíveis." :
    "Escolha o que deseja fazer com este imóvel."
  );

  return (
    <div className={cn(styles.root, styles[orientation], className)} {...rest}>
      <div className={styles.actions} role="group" aria-label="Classificar imóvel">
        {actions.map((action) => {
          const isActive = action === activeAction;
          return (
            <Button
              key={action}
              className={cn(styles.action, styles[action], isActive && styles.active)}
              variant={action === "visit" ? "primary" : "secondary"}
              status={buttonStatus(action)}
              loadingLabel={labels[action]}
              leadingIcon={icons[action]}
              disabled={unavailable || disabledActions.includes(action) || (state !== "idle" && !isActive)}
              aria-pressed={isActive || undefined}
              onClick={() => onAction?.(action)}
            >
              {labels[action]}
            </Button>
          );
        })}
      </div>
      <span className={styles.status} role="status" aria-live="polite">{message}</span>
    </div>
  );
}
