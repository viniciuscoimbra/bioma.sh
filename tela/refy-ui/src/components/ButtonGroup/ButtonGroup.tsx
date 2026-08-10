import { Children, cloneElement, isValidElement, useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement } from "react";
import { cn } from "../../lib/cn";
import styles from "./ButtonGroup.module.css";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Eixo visual do conjunto de ações. */
  orientation?: "horizontal" | "vertical";
  /** Nome acessível do grupo de ações. */
  label?: string;
  /** Índice ativo inicial. O grupo mantém uma única opção ativa. */
  defaultActiveIndex?: number;
  /** Índice ativo controlado. */
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

/** Grupo de seleção única com bordas contíguas. */
export function ButtonGroup({ orientation = "horizontal", label, defaultActiveIndex = 0, activeIndex, onActiveIndexChange, className, children, ...rest }: ButtonGroupProps) {
  const [internalActive, setInternalActive] = useState(defaultActiveIndex);
  const selectedIndex = activeIndex ?? internalActive;
  const items = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const button = child as ReactElement<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }>;
    const selected = index === selectedIndex;
    return cloneElement(button, {
      "aria-pressed": selected,
      variant: selected ? "primary" : "secondary",
      onClick: (event) => {
        if (!button.props.disabled) {
          if (activeIndex === undefined) setInternalActive(index);
          onActiveIndexChange?.(index);
        }
        button.props.onClick?.(event);
      },
    });
  });
  return (
    <div
      role="group"
      aria-label={label}
      aria-orientation={orientation}
      className={cn(styles.group, styles[orientation], className)}
      {...rest}
    >
      {items}
    </div>
  );
}
