import { useEffect, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { IconButton } from "../IconButton";
import { Skeleton } from "../Skeleton";
import { cn } from "../../lib/cn";
import styles from "./PropertyMedia.module.css";

export interface PropertyMediaItem {
  src: string;
  alt: string;
}

export interface PropertyMediaProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: PropertyMediaItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  aspectRatio?: CSSProperties["aspectRatio"];
  fit?: "cover" | "contain";
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const previousIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const nextIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/** Galeria de imóvel responsiva. Navegação e feedback não dependem da proporção da foto. */
export function PropertyMedia({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  aspectRatio = "4 / 3",
  fit = "cover",
  loading = false,
  errorMessage,
  onRetry,
  className,
  onKeyDown,
  ...rest
}: PropertyMediaProps) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const [imageState, setImageState] = useState<"loading" | "ready" | "error">("loading");
  const maxIndex = Math.max(0, items.length - 1);
  const currentIndex = Math.min(Math.max(index ?? internalIndex, 0), maxIndex);
  const current = items[currentIndex];

  useEffect(() => setImageState("loading"), [current?.src]);

  function select(next: number) {
    if (items.length === 0) return;
    const normalized = (next + items.length) % items.length;
    if (index === undefined) setInternalIndex(normalized);
    onIndexChange?.(normalized);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || items.length < 2) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      select(currentIndex + 1);
    }
  }

  const failed = Boolean(errorMessage) || imageState === "error" || items.length === 0;
  const busy = loading || (!failed && imageState === "loading");

  return (
    <div
      className={cn(styles.root, styles[fit], className)}
      style={{ aspectRatio }}
      role="region"
      aria-label="Fotos do imóvel"
      aria-roledescription="carrossel"
      aria-busy={busy || undefined}
      tabIndex={items.length > 1 && !failed ? 0 : undefined}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {current && !failed && (
        <img
          key={current.src}
          className={styles.image}
          src={current.src}
          alt={current.alt}
          onLoad={() => setImageState("ready")}
          onError={() => setImageState("error")}
        />
      )}

      {busy && (
        <div className={styles.loading} aria-label="Carregando foto">
          <Skeleton width="100%" height="100%" />
        </div>
      )}

      {failed && (
        <div className={styles.error}>
          <Callout
            tone="danger"
            role="alert"
            title="Foto indisponível"
            action={onRetry ? <Button size="sm" variant="danger" onClick={onRetry}>Tentar novamente</Button> : undefined}
          >
            {errorMessage ?? "Não foi possível carregar esta imagem."}
          </Callout>
        </div>
      )}

      {items.length > 1 && !failed && (
        <>
          <IconButton className={cn(styles.arrow, styles.previous)} variant="outline" size="lg" aria-label="Foto anterior" icon={previousIcon} onClick={() => select(currentIndex - 1)} />
          <IconButton className={cn(styles.arrow, styles.next)} variant="outline" size="lg" aria-label="Próxima foto" icon={nextIcon} onClick={() => select(currentIndex + 1)} />
          <div className={styles.dots} role="group" aria-label="Escolher foto">
            {items.map((item, itemIndex) => (
              <button
                key={`${item.src}-${itemIndex}`}
                type="button"
                className={cn(styles.dot, itemIndex === currentIndex && styles.activeDot)}
                aria-label={`Mostrar foto ${itemIndex + 1} de ${items.length}`}
                aria-current={itemIndex === currentIndex ? "true" : undefined}
                onClick={() => select(itemIndex)}
              />
            ))}
          </div>
        </>
      )}

      {!failed && items.length > 1 && (
        <span className={styles.counter} aria-live="polite">Foto {currentIndex + 1} de {items.length}</span>
      )}
    </div>
  );
}
