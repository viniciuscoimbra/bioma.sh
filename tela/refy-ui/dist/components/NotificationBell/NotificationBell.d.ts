export interface NotificationItem {
    id: string;
    title: string;
    description?: string;
    /** Tempo relativo já formatado (ex.: "há 2h"). */
    time?: string;
    unread?: boolean;
}
/** Props for the notification bell menu. */
export interface NotificationBellProps {
    items: NotificationItem[];
    /** Clique numa notificação. */
    onItemClick?: (item: NotificationItem) => void;
    /** "Marcar todas como lidas". */
    onMarkAllRead?: () => void;
    /** Título do painel. */
    title?: string;
    emptyMessage?: string;
    className?: string;
}
/**
 * NotificationBell — sino com contador de não lidas + painel de notificações.
 *
 * Compõe `IconButton` (lg). O badge mostra quantos itens têm `unread`; o painel lista título,
 * descrição, tempo e ponto de não lida, com ação "Marcar todas como lidas".
 * Esc/clique fora fecham. O estado das notificações é do app — o componente
 * só exibe `items` e emite eventos.
 *
 *   <NotificationBell items={notifications} onItemClick={open} onMarkAllRead={clear} />
 */
export declare function NotificationBell({ items, onItemClick, onMarkAllRead, title, emptyMessage, className, }: NotificationBellProps): import("react").JSX.Element;
