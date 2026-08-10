import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { Avatar } from "../Avatar";
import type { AvatarSize } from "../Avatar";
import { Tooltip } from "../Tooltip";
import { cn } from "../../lib/cn";
import styles from "./AvatarGroup.module.css";

/** Uma pessoa (ou workspace) dentro do AvatarGroup. */
export interface AvatarGroupItem {
  /** Nome completo — vira tooltip e origem das iniciais. */
  name: string;
  /** URL da foto; se ausente, mostra iniciais derivadas do nome. */
  src?: string;
  /** Iniciais explícitas (sobrepõem as derivadas de `name`). */
  initials?: string;
  /** Cor de fundo das iniciais (repassada ao Avatar). */
  color?: string;
}

/** Props for the AvatarGroup component. */
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Pessoas, na ordem em que devem aparecer (ordem estável, primeira por cima). */
  items: AvatarGroupItem[];
  /** Máximo de avatares visíveis; o excedente vira "+N" com tooltip. Padrão 4. */
  max?: number;
  /** Tamanho herdado do átomo Avatar. Padrão "md". */
  size?: AvatarSize;
  /** Se presente, cada avatar vira botão (foco + Enter/Espaço). */
  onItemClick?: (item: AvatarGroupItem, index: number) => void;
  /** Se presente, o "+N" vira botão (ex.: abrir lista completa de membros). */
  onOverflowClick?: () => void;
}

/** Deriva iniciais (1ª letra do primeiro e do último nome). */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

/**
 * AvatarGroup — avatares empilhados com sobreposição e overflow "+N".
 *
 * Composição sobre o átomo `Avatar`: cada item é um Avatar com anel da
 * superfície; o excedente (`items.length - max`) vira um chip "+N" cujo
 * tooltip lista os nomes restantes. Com `onItemClick`/`onOverflowClick`
 * os itens viram botões reais (tab, Enter/Espaço, foco visível).
 *
 *   <AvatarGroup items={membros} max={4} size="md" />
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { items, max = 4, size = "md", onItemClick, onOverflowClick, className, ...rest },
  ref
) {
  const visible = items.slice(0, Math.max(0, max));
  const rest_ = items.slice(Math.max(0, max));
  const overflow = rest_.length;

  const defaultLabel =
    items.length === 1 ? items[0].name : `${items.length} pessoas`;

  return (
    <div
      ref={ref}
      role="group"
      aria-label={rest["aria-label"] ?? defaultLabel}
      className={cn(styles.group, styles[size], className)}
      {...rest}
    >
      {visible.map((item, index) => {
        const avatar = (
          <Avatar
            size={size}
            src={item.src}
            alt=""
            initials={item.initials ?? initialsOf(item.name)}
            color={item.color}
            className={styles.ring}
          />
        );
        // primeira por cima: z decresce com o índice (ordem estável)
        const z = visible.length + 1 - index;
        return (
          <Tooltip key={`${item.name}-${index}`} label={item.name}>
            {onItemClick ? (
              <button
                type="button"
                className={styles.item}
                style={{ zIndex: z }}
                aria-label={item.name}
                onClick={() => onItemClick(item, index)}
              >
                {avatar}
              </button>
            ) : (
              <span className={styles.item} style={{ zIndex: z }}>
                {avatar}
              </span>
            )}
          </Tooltip>
        );
      })}

      {overflow > 0 && (
        <Tooltip label={rest_.map((item) => item.name).join(", ")}>
          {onOverflowClick ? (
            <button
              type="button"
              className={styles.item}
              style={{ zIndex: 0 }}
              aria-label={`Mais ${overflow} ${overflow === 1 ? "pessoa" : "pessoas"}`}
              onClick={onOverflowClick}
            >
              <Avatar
                size={size}
                initials={`+${overflow}`}
                color="var(--surface-2, var(--surface-container-high))"
                className={cn(styles.ring, styles.overflow)}
              />
            </button>
          ) : (
            <span
              className={styles.item}
              style={{ zIndex: 0 }}
              aria-label={`Mais ${overflow} ${overflow === 1 ? "pessoa" : "pessoas"}`}
            >
              <Avatar
                size={size}
                initials={`+${overflow}`}
                color="var(--surface-2, var(--surface-container-high))"
                className={cn(styles.ring, styles.overflow)}
              />
            </span>
          )}
        </Tooltip>
      )}
    </div>
  );
});
