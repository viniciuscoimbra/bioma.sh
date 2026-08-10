import type { HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import type { SwitchProps } from "../Switch";
/** Props for the SettingRow list/settings line. */
export interface SettingRowProps extends Omit<HTMLAttributes<HTMLElement>, "title" | "onClick"> {
    /** Título da linha. Cabem `Badge`/`Chip` inline (ex.: status "Conectado"). */
    title: ReactNode;
    /** Descrição em texto corrido sob o título. */
    description?: ReactNode;
    /** Meta mono sob a descrição (e-mail, IP, data, chave mascarada…). */
    meta?: ReactNode;
    /** Slot inicial — ícone ou `Avatar`. */
    leading?: ReactNode;
    /** Moldura 36px em volta do `leading` (padrão `.oauth-icon` — logos de provedor/bandeira). */
    leadingFrame?: boolean;
    /** Ações à direita (`Button`/`IconButton`/`Badge`/texto mono). Em linha clicável use só conteúdo NÃO interativo. */
    actions?: ReactNode;
    /** Com `href` a linha inteira vira `<a>` (como o `NavCard`). */
    href?: string;
    /** `target` do link (só com `href`). */
    target?: string;
    /** `rel` do link (só com `href`). */
    rel?: string;
    /** Sem `href`, torna a linha inteira um `<button>`. */
    onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    /** Desabilita a linha clicável (sem clique, sem foco por Tab no link). */
    disabled?: boolean;
    /** Chevron ">" à direita nas linhas clicáveis. Padrão `true`. */
    showChevron?: boolean;
    /**
     * `Switch` acoplado à direita (padrão `.pref-row`). O componente liga
     * `aria-labelledby`/`aria-describedby` ao título/descrição automaticamente.
     */
    switchProps?: SwitchProps;
}
/**
 * SettingRow — linha de lista/configuração (padrão `.shell-card-row`,
 * `.oauth-row`, `.session-row`, `.pref-row`, `.key-row`, `.activity-row`…
 * das telas de referência). Slot `leading` (ícone/`Avatar`) + título +
 * descrição + meta mono + ações à direita.
 *
 * Variantes: estática (padrão, `<div>`); clicável — com `href` vira `<a>`,
 * com `onClick` vira `<button>` (linha inteira é o alvo, como o `NavCard`);
 * com `Switch` acoplado via `switchProps` (rótulo ligado por aria).
 * Agrupe linhas com `SettingRowGroup` (lista semântica + divisores).
 *
 *   <SettingRow leading={<GoogleIcon />} leadingFrame
 *     title={<>Google <Badge tone="success" dot>Conectado</Badge></>}
 *     meta="joao@globoeditorial.com · conectado em 12 jan. 2026"
 *     actions={<Button size="sm" variant="ghost">Desconectar</Button>} />
 */
export declare const SettingRow: import("react").ForwardRefExoticComponent<SettingRowProps & import("react").RefAttributes<HTMLElement>>;
/** Props for the SettingRowGroup list wrapper. */
export interface SettingRowGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** `SettingRow`s (ou qualquer linha) — cada filho vira um `listitem` com divisor. */
    children: ReactNode;
    /** Rótulo acessível da lista (ex.: "Sessões ativas"). */
    "aria-label"?: string;
}
/**
 * SettingRowGroup — agrupa `SettingRow`s numa lista semântica
 * (`role="list"`/`role="listitem"`) com divisores por token entre as linhas.
 * É o miolo típico de um `Card` de configurações.
 *
 *   <SettingRowGroup aria-label="Preferências">
 *     <SettingRow title="Análise concluída" switchProps={{ defaultChecked: true }} />
 *     <SettingRow title="Resumo semanal" switchProps={{}} />
 *   </SettingRowGroup>
 */
export declare const SettingRowGroup: import("react").ForwardRefExoticComponent<SettingRowGroupProps & import("react").RefAttributes<HTMLDivElement>>;
