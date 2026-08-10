import type { ReactNode } from "react";
export interface Column<Row> {
    /** Chave única da coluna. */
    key: string;
    /** Cabeçalho. */
    header: ReactNode;
    /** Célula. Recebe a linha. */
    cell: (row: Row) => ReactNode;
    /** Alinhamento — 'num' usa mono + direita para números. */
    align?: "left" | "right" | "num";
    width?: string;
    /** Habilita ordenação pelo cabeçalho (asc → desc → sem ordenação). */
    sortable?: boolean;
    /** Valor de ordenação. Padrão: `row[key]`. Obrigatório quando a célula é composta. */
    sortValue?: (row: Row) => string | number | null;
    /** Gera um filtro facetado acima da tabela com os valores distintos da coluna. */
    filterable?: boolean;
    /** Valor de filtro. Padrão: `String(row[key])`. */
    filterValue?: (row: Row) => string | string[];
}
/** Props for the data table. */
export interface TableProps<Row> {
    columns: Column<Row>[];
    rows: Row[];
    /** Extrai a key React de cada linha. */
    rowKey: (row: Row, index: number) => string;
    onRowClick?: (row: Row) => void;
    /** Nome acessível de uma linha interativa. */
    rowLabel?: (row: Row) => string;
    /** Legenda acessível da tabela, visualmente oculta. */
    caption?: string;
    /** Mensagem quando não há linhas. */
    empty?: ReactNode;
    /** Campo de busca acima da tabela filtrando as linhas. */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Critério da busca. Padrão: qualquer valor da linha contém o texto. */
    searchMatch?: (row: Row, query: string) => boolean;
    /** Exibe linhas skeleton e marca a composição como ocupada. */
    loading?: boolean;
    /** Substitui as linhas por um erro anunciado. */
    error?: ReactNode;
    /** Paginação interna reaproveitando o componente Pagination. */
    pagination?: {
        pageSize: number;
        /** Opções para o usuário alterar a quantidade de registros exibidos. */
        pageSizeOptions?: number[];
        page?: number;
        defaultPage?: number;
        onPageChange?: (page: number) => void;
    };
    /** Largura mínima da tabela; o container passa a rolar horizontalmente. */
    minTableWidth?: number | string;
    className?: string;
}
/**
 * Tabela de dados. Cabeçalho mono uppercase, hover de linha, colunas
 * numéricas em mono. Colunas com `sortable` ordenam pelo cabeçalho
 * (asc → desc → original), `filterable` gera filtros facetados combináveis com os valores
 * distintos da coluna e `searchable` adiciona busca acima da tabela.
 */
export declare function Table<Row>({ columns, rows, rowKey, onRowClick, rowLabel, caption, empty, searchable, searchPlaceholder, searchMatch, loading, error, pagination, minTableWidth, className, }: TableProps<Row>): import("react").JSX.Element;
