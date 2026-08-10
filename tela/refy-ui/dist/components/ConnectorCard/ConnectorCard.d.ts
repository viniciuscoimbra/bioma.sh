import type { HTMLAttributes, ReactNode } from "react";
/** Props for the ConnectorCard integration row. */
export interface ConnectorCardProps extends HTMLAttributes<HTMLElement> {
    /**
     * Logo do serviço (slot — SVG real do serviço, nunca bundleado no DS).
     * Renderizado num quadrado 40px com borda neutra.
     */
    logo?: ReactNode;
    /** Nome do serviço/conexão. */
    name: ReactNode;
    /** Status ao lado do nome (slot — `Badge` "Conectado", `StatusDot`…). */
    status?: ReactNode;
    /** Descrição curta do que a integração faz. */
    description?: ReactNode;
    /** Linha mono de metadados (conta, nº de sites, último sync). */
    meta?: ReactNode;
    /** Ações à direita (slot — `Button` "Conectar"/"Configurar", `Menu`…). */
    actions?: ReactNode;
    /**
     * Bloqueado pelo plano (upsell): superfície apagada; `lockHint` substitui
     * as ações (ex.: `Badge` "Plano Growth" + `Button` de upgrade).
     */
    locked?: boolean;
    /** Conteúdo exibido no lugar das ações quando `locked`. */
    lockHint?: ReactNode;
}
/**
 * ConnectorCard — card de integração/conexão OAuth: logo + nome + status +
 * descrição + meta de sync + ações. Estado `locked` para conector fora do
 * plano (upsell). Display estruturado; os verbos (conectar, configurar)
 * entram pelos slots.
 */
export declare function ConnectorCard({ logo, name, status, description, meta, actions, locked, lockHint, className, ...rest }: ConnectorCardProps): import("react").JSX.Element;
