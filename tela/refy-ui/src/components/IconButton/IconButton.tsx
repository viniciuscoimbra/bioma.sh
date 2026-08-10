import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

/** Props for icon-only buttons. */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rótulo acessível obrigatório — o botão não tem texto visível. */
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

/** Botão só-ícone (toolbar, topbar, ações de linha). Sempre com aria-label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = "ghost", size = "md", className, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(styles.iconbtn, styles[variant], styles[size], className)}
      {...rest}
    >
      {icon}
    </button>
  );
});
