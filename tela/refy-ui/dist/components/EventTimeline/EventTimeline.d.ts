import type { ReactNode } from "react";
import type { BadgeTone } from "../Badge";
import type { StatusDotTone } from "../StatusDot";
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
    status?: {
        label: ReactNode;
        tone?: StatusDotTone;
        pulse?: boolean;
    };
    badge?: {
        label: ReactNode;
        tone?: BadgeTone;
    };
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
export declare function EventTimeline({ title, context, events, locale, timezone, error, onRetry, emptyTitle, emptyMessage, density, showHeader, className, }: EventTimelineProps): import("react").JSX.Element;
