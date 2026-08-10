import type { ButtonProps } from "../Button";
export type GoogleButtonProps = Omit<ButtonProps, "variant" | "leadingIcon">;
export declare const GoogleButton: import("react").ForwardRefExoticComponent<GoogleButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
