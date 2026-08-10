import { useMemo } from "react";
import type { ReactNode } from "react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import type { BadgeTone } from "../Badge";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { EmptyState } from "../EmptyState";
import { StatusDot } from "../StatusDot";
import type { StatusDotTone } from "../StatusDot";
import { cn } from "../../lib/cn";
import styles from "./EventTimeline.module.css";

export interface TimelineActor {
  name: string;
  initials?: string;
  seed?: string;
  src?: string;
  href?: string;
  target?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: Date | string;
  title: ReactNode;
  description?: ReactNode;
  actor?: TimelineActor;
  status?: { label: ReactNode; tone?: StatusDotTone; pulse?: boolean };
  badge?: { label: ReactNode; tone?: BadgeTone };
  action?: ReactNode;
}

export interface EventTimelineProps {
  /** Assunto maior do histórico. Ex.: "Vinícius × Apartamento Itapoã". */
  title?: ReactNode;
  /** Escopo explicado sob o título. */
  context?: ReactNode;
  events: TimelineEvent[];
  locale?: string;
  timezone?: string;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
  density?: "default" | "compact";
  showHeader?: boolean;
  className?: string;
}

/** Linha do tempo reutilizável para eventos de cliente, imóvel, visita e auditoria. */
export function EventTimeline({
  title = "Histórico de interações",
  context = "Eventos deste relacionamento em ordem cronológica.",
  events,
  locale = "pt-BR",
  timezone = "America/Sao_Paulo",
  error,
  onRetry,
  emptyTitle = "Nenhum evento ainda",
  emptyMessage = "As atividades aparecerão aqui quando acontecerem.",
  density = "default",
  showHeader = true,
  className,
}: EventTimelineProps) {
  const groups = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.reduce<Array<{ key: string; date: Date; items: TimelineEvent[] }>>((result, event) => {
      const date = new Date(event.timestamp);
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
      const existing = result.find((group) => group.key === key);
      if (existing) existing.items.push(event);
      else result.push({ key, date, items: [event] });
      return result;
    }, []);
  }, [events, timezone]);

  if (error) {
    return (
      <Callout
        className={className}
        tone="danger"
        role="alert"
        title="Não foi possível carregar o histórico"
        action={onRetry ? <Button size="sm" variant="danger" onClick={onRetry}>Tentar novamente</Button> : undefined}
      >
        {error}
      </Callout>
    );
  }

  if (events.length === 0) {
    return <EmptyState className={className} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className={cn(styles.root, density === "compact" && styles.compact, className)} aria-label="Histórico de eventos">
      {showHeader && <header className={styles.contextHeader}><h2>{title}</h2><p>{context}</p></header>}
      {groups.map((group) => (
        <section key={group.key} className={styles.group} aria-labelledby={`timeline-${group.key}`}>
          <div className={styles.dateRow}>
            <h3 id={`timeline-${group.key}`}>{new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "long", timeZone: timezone }).format(group.date)}</h3>
            <Badge tone="neutral">{group.items.length} evento{group.items.length === 1 ? "" : "s"}</Badge>
          </div>
          <ol className={styles.list}>
            {group.items.map((event) => {
              const date = new Date(event.timestamp);
              return (
                <li key={event.id} className={styles.item}>
                  <div className={styles.marker}>
                    {event.actor ? <Avatar size="md" initials={event.actor.initials ?? event.actor.name.slice(0, 2).toUpperCase()} src={event.actor.src} alt={event.actor.name} seed={event.actor.seed ?? event.actor.name} /> : <StatusDot tone={event.status?.tone ?? "neutral"} pulse={event.status?.pulse} aria-label={typeof event.status?.label === "string" ? event.status.label : "Evento"} />}
                  </div>
                  <article className={styles.event}>
                    <div className={styles.eventHead}>
                      <div className={styles.copy}>
                        <div className={styles.titleRow}>
                          <h4>{event.title}</h4>
                          {event.badge && <Badge tone={event.badge.tone}>{event.badge.label}</Badge>}
                        </div>
                        <p className={styles.meta}>
                          <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(date)}</time>
                          {event.actor && <span>por {event.actor.href ? <a href={event.actor.href} target={event.actor.target}>{event.actor.name}</a> : event.actor.name}</span>}
                          {event.status && <StatusDot tone={event.status.tone} pulse={event.status.pulse}>{event.status.label}</StatusDot>}
                        </p>
                      </div>
                      {event.action && <div className={styles.action}>{event.action}</div>}
                    </div>
                    {event.description && <div className={styles.description}>{event.description}</div>}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
