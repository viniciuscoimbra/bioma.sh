import { useId } from "react";
import type { ReactNode } from "react";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge";
import { Card } from "../Card";
import { PropertyActionGroup } from "../PropertyActionGroup";
import type { PropertyActionGroupProps } from "../PropertyActionGroup";
import { PropertyMedia } from "../PropertyMedia";
import type { PropertyMediaItem, PropertyMediaProps } from "../PropertyMedia";
import { ScoreGauge } from "../ScoreGauge";
import { cn } from "../../lib/cn";
import styles from "./PropertyCard.module.css";

export type PropertyCardLayout = "grid" | "list" | "deck";

export interface PropertyCardBadge {
  label: ReactNode;
  tone?: BadgeTone;
}

export interface PropertyCardFact {
  label: string;
  value: ReactNode;
}

export interface PropertyCardProps {
  title: ReactNode;
  address: ReactNode;
  price: ReactNode;
  priceSuffix?: ReactNode;
  media: PropertyMediaItem[];
  mediaProps?: Omit<PropertyMediaProps, "items">;
  layout?: PropertyCardLayout;
  matchScore?: number;
  badges?: PropertyCardBadge[];
  facts?: PropertyCardFact[];
  summary?: ReactNode;
  actions?: Omit<PropertyActionGroupProps, "className"> | false;
  headerAction?: ReactNode;
  detailsAction?: ReactNode;
  className?: string;
}

/** Card canônico do imóvel; muda composição, nunca duplica mídia ou ações. */
export function PropertyCard({
  title,
  address,
  price,
  priceSuffix,
  media,
  mediaProps,
  layout = "grid",
  matchScore,
  badges = [],
  facts = [],
  summary,
  actions,
  headerAction,
  detailsAction,
  className,
}: PropertyCardProps) {
  const headingId = useId();
  const showActions = actions !== false && (layout === "deck" || actions != null);

  return (
    <Card
      className={cn(styles.card, styles[layout], className)}
      padding="none"
      elevation={layout === "deck" ? 3 : 1}
      role="article"
      aria-labelledby={headingId}
    >
      <div className={styles.media}>
        <PropertyMedia {...mediaProps} items={media} aspectRatio={mediaProps?.aspectRatio ?? (layout === "deck" ? "16 / 10" : "4 / 3")} />
        {badges.length > 0 && (
          <div className={styles.badges} aria-label="Destaques do imóvel">
            {badges.map((badge, index) => <Badge key={index} tone={badge.tone}>{badge.label}</Badge>)}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.headingRow}>
          <div className={styles.headingCopy}>
            <h3 id={headingId} className={styles.title}>{title}</h3>
            <p className={styles.address}>{address}</p>
          </div>
          {matchScore != null && (
            <div className={styles.compatibility} aria-label={`Índice de compatibilidade: ${Math.round(matchScore)}%`}>
              <ScoreGauge value={matchScore} label="compat." size={layout === "deck" ? "md" : "sm"} />
              <span>compatibilidade</span>
            </div>
          )}
          {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
        </div>

        <p className={styles.price}>{price}{priceSuffix && <small>{priceSuffix}</small>}</p>

        {facts.length > 0 && (
          <dl className={styles.facts}>
            {facts.map((fact, index) => (
              <div key={`${fact.label}-${index}`} className={styles.fact}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {summary && <p className={styles.summary}>{summary}</p>}
        {detailsAction && <div className={styles.details}>{detailsAction}</div>}
      </div>

      {showActions && <PropertyActionGroup className={styles.actions} {...actions} />}
    </Card>
  );
}
