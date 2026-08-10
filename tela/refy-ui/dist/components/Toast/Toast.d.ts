export type ToastTone = "default" | "success" | "danger";
/** Dados de um toast na pilha. */
export interface ToastData {
    id: string;
    title: string;
    description?: string;
    tone?: ToastTone;
    /** Ação inline (ex.: Desfazer). */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** ms até auto-dispensar. `null` = fica até fechar. Padrão 5000. */
    duration?: number | null;
}
/** Props for a single Toast notification. */
export interface ToastProps extends ToastData {
    onDismiss?: (id: string) => void;
}
/** Um toast individual — pílula escura com ícone por tom, título e descrição. */
export declare function Toast({ id, title, description, tone, action, duration, onDismiss }: ToastProps): import("react").JSX.Element;
/** Props for the ToastRegion stack. */
export interface ToastRegionProps {
    /** Pilha de toasts (controlada — o app é dono da lista). */
    toasts: ToastData[];
    /** Remove um toast da lista (auto-dismiss, ×, ou após a ação). */
    onDismiss: (id: string) => void;
    /** Canto da tela. Padrão `bottom-right`. */
    position?: "bottom-right" | "bottom-left" | "top-right";
    className?: string;
}
/**
 * ToastRegion — pilha fixa de toasts num canto da tela.
 *
 * Totalmente controlada: o app mantém a lista e recebe `onDismiss` quando um
 * toast expira (`duration`, padrão 5s), é fechado no × ou tem a ação clicada.
 * `aria-live="polite"` anuncia entradas para leitores de tela.
 *
 *   const [toasts, setToasts] = useState<ToastData[]>([]);
 *   <ToastRegion toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
 */
export declare function ToastRegion({ toasts, onDismiss, position, className }: ToastRegionProps): import("react").JSX.Element;
