import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { Button } from "../Button";
import { EmptyState } from "../EmptyState";
import { PropertyActionGroup } from "../PropertyActionGroup";
import type { PropertyAction } from "../PropertyActionGroup";
import { PropertyCard } from "../PropertyCard";
import type { PropertyCardProps } from "../PropertyCard";
import { cn } from "../../lib/cn";
import styles from "./SwipeDeck.module.css";

export interface SwipeDeckItem extends PropertyCardProps { id: string; }

export interface SwipeDeckProps {
  items: SwipeDeckItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onAction?: (action: PropertyAction, item: SwipeDeckItem) => void;
  onReset?: () => void;
  gestureEnabled?: boolean;
  motion?: "auto" | "reduced";
  className?: string;
}

/** Fila Tinder-like: botões são o caminho principal; gesto e teclado são atalhos equivalentes. */
export function SwipeDeck({
  items,
  index,
  defaultIndex = 0,
  onIndexChange,
  onAction,
  onReset,
  gestureEnabled = true,
  motion = "auto",
  className,
}: SwipeDeckProps) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const [activeAction, setActiveAction] = useState<PropertyAction>();
  const [processing, setProcessing] = useState(false);
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | undefined>(undefined);
  const timer = useRef<number | undefined>(undefined);
  const currentIndex = index ?? internalIndex;
  const current = items[currentIndex];
  const remaining = Math.max(0, items.length - currentIndex - 1);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    setOffset(0);
    setActiveAction(undefined);
    setProcessing(false);
  }, [current?.id]);

  function commit(action: PropertyAction) {
    if (!current || processing) return;
    setActiveAction(action);
    setProcessing(true);
    setOffset(action === "reject" ? -120 : action === "save" ? 120 : 0);
    const delay = motion === "reduced" ? 0 : 280;
    timer.current = window.setTimeout(() => {
      onAction?.(action, current);
      const next = currentIndex + 1;
      if (index === undefined) setInternalIndex(next);
      onIndexChange?.(next);
    }, delay);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!gestureEnabled || processing) return;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (startX.current == null || !gestureEnabled || processing) return;
    setOffset(Math.max(-140, Math.min(140, event.clientX - startX.current)));
  }

  function handlePointerEnd() {
    if (startX.current == null) return;
    startX.current = undefined;
    if (offset <= -72) commit("reject");
    else if (offset >= 72) commit("save");
    else setOffset(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, a, input, textarea, select")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commit("reject");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      commit("save");
    } else if (event.key.toLowerCase() === "v") {
      event.preventDefault();
      commit("visit");
    }
  }

  if (!current) {
    return (
      <div className={cn(styles.end, className)}>
        <EmptyState
          bordered
          title="Você viu todos os imóveis desta fila"
          message="Suas escolhas foram guardadas. Você pode revisar as classificações ou atualizar a busca."
          action={onReset ? <Button variant="primary" onClick={onReset}>Recomeçar fila</Button> : undefined}
        />
      </div>
    );
  }

  const { id: _id, ...cardProps } = current;
  const rotation = offset / 28;

  return (
    <section className={cn(styles.root, motion === "reduced" && styles.reduced, className)} aria-label="Fila de imóveis">
      <div className={styles.queueMeta}>
        <strong>Seu próximo imóvel ideal</strong>
        <span>{remaining} depois deste</span>
      </div>
      <div className={styles.stage}>
        {remaining > 0 && <div className={cn(styles.backCard, styles.backTwo)} aria-hidden="true" />}
        {remaining > 0 && <div className={cn(styles.backCard, styles.backOne)} aria-hidden="true" />}
        <div
          className={cn(styles.current, processing && activeAction && styles[`leaving-${activeAction}`])}
          style={{ transform: `translateX(${offset}px) rotate(${rotation}deg)` }}
          role="region"
          aria-label={`Imóvel ${currentIndex + 1} de ${items.length}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <PropertyCard {...cardProps} layout="deck" actions={false} />
          {offset <= -32 && <span className={cn(styles.gestureLabel, styles.rejectLabel)}>Não quero</span>}
          {offset >= 32 && <span className={cn(styles.gestureLabel, styles.saveLabel)}>Guardar</span>}
        </div>
      </div>
      <PropertyActionGroup
        className={styles.actions}
        state={processing ? "processing" : "idle"}
        activeAction={activeAction}
        onAction={commit}
        statusMessage={gestureEnabled ? "Use os botões. Arrastar e ← → são atalhos; V agenda uma visita." : "Use os botões para classificar este imóvel."}
      />
    </section>
  );
}
