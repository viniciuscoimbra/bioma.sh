import { forwardRef } from "react";
import type { ButtonProps } from "../Button";
import { Button } from "../Button";
import { cn } from "../../lib/cn";
import styles from "./GoogleButton.module.css";

export type GoogleButtonProps = Omit<ButtonProps, "variant" | "leadingIcon">;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export const GoogleButton = forwardRef<HTMLButtonElement, GoogleButtonProps>(function GoogleButton(
  { children = "Continuar com Google", className, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      variant="secondary"
      leadingIcon={<GoogleIcon />}
      className={cn(styles.googleButton, className)}
      {...props}
    >
      {children}
    </Button>
  );
});
