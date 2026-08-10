import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Pagination } from "../Pagination";
import { Select } from "../Select";
import { Skeleton } from "../Skeleton";
import styles from "./Table.module.css";

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

type SortDir = "asc" | "desc";

function defaultSearchMatch<Row>(row: Row, query: string): boolean {
  return Object.values(row as Record<string, unknown>)
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

/**
 * Tabela de dados. Cabeçalho mono uppercase, hover de linha, colunas
 * numéricas em mono. Colunas com `sortable` ordenam pelo cabeçalho
 * (asc → desc → original), `filterable` gera filtros facetados combináveis com os valores
 * distintos da coluna e `searchable` adiciona busca acima da tabela.
 */
export function Table<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowLabel,
  caption,
  empty,
  searchable,
  searchPlaceholder = "Buscar…",
  searchMatch = defaultSearchMatch,
  loading = false,
  error,
  pagination,
  minTableWidth,
  className,
}: TableProps<Row>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterSel, setFilterSel] = useState<Record<string, string[]>>({});
  const [openFacet, setOpenFacet] = useState<string | null>(null);
  const [internalPage, setInternalPage] = useState(pagination?.defaultPage ?? 1);
  const [internalPageSize, setInternalPageSize] = useState(pagination?.pageSize ?? 1);
  const filtersRef = useRef<HTMLDivElement>(null);

  // fecha o menu de faceta ao clicar fora
  useEffect(() => {
    if (!openFacet) return;
    function onPointerDown(event: PointerEvent) {
      if (!filtersRef.current?.contains(event.target as Node)) setOpenFacet(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openFacet]);

  const filterCols = columns.filter((c) => c.filterable);
  const filterValueOf = (c: Column<Row>) =>
    c.filterValue ?? ((row: Row) => String((row as Record<string, unknown>)[c.key] ?? ""));
  const filterValues = (value: string | string[]) => Array.isArray(value) ? value : [value];

  function toggleFilter(colKey: string, value: string | null) {
    setFilterSel((prev) => {
      const current = prev[colKey] ?? [];
      if (value === null) return { ...prev, [colKey]: [] }; // "Todos"
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [colKey]: next };
    });
  }

  function toggleSort(column: Column<Row>) {
    if (!column.sortable) return;
    if (sortKey !== column.key) {
      setSortKey(column.key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null); // terceiro clique volta à ordem original
    }
  }

  const visible = useMemo(() => {
    let out = rows;
    if (searchable && query.trim()) {
      out = out.filter((row) => searchMatch(row, query.trim()));
    }
    for (const c of filterCols) {
      const sel = filterSel[c.key];
      if (sel?.length) {
        const getValue = filterValueOf(c);
        out = out.filter((row) => filterValues(getValue(row)).some((value) => sel.includes(value)));
      }
    }
    if (sortKey) {
      const column = columns.find((c) => c.key === sortKey);
      const getValue =
        column?.sortValue ?? ((row: Row) => (row as Record<string, unknown>)[sortKey] as string | number | null);
      const factor = sortDir === "asc" ? 1 : -1;
      out = [...out].sort((a, b) => {
        const va = getValue(a);
        const vb = getValue(b);
        if (va == null) return 1;
        if (vb == null) return -1;
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
        return String(va).localeCompare(String(vb), "pt-BR", { numeric: true }) * factor;
      });
    }
    return out;
  }, [rows, searchable, query, searchMatch, sortKey, sortDir, columns, filterSel]);

  const pageSize = pagination ? internalPageSize : Math.max(visible.length, 1);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const requestedPage = pagination?.page ?? internalPage;
  const currentPage = Math.min(Math.max(requestedPage, 1), pageCount);
  const displayed = pagination
    ? visible.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : visible;

  function changePage(next: number) {
    if (pagination?.page == null) setInternalPage(next);
    pagination?.onPageChange?.(next);
  }

  function resetPage() {
    if (pagination?.page == null) setInternalPage(1);
    pagination?.onPageChange?.(1);
  }

  function changePageSize(next: number) {
    setInternalPageSize(next);
    resetPage();
  }

  return (
    <div className={cn(styles.wrap, className)}>
      {searchable && (
        <div className={styles.toolbar}>
          <span className={styles.searchIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
          />
          {query && (
            <span className={styles.searchCount}>
              {visible.length} de {rows.length}
            </span>
          )}
        </div>
      )}
      {filterCols.length > 0 && (
        <div className={styles.filters} ref={filtersRef} onKeyDown={(e) => e.key === "Escape" && setOpenFacet(null)}>
          <span className={styles.filtersLabel}>Filtros</span>
          {filterCols.map((c) => {
            const getValue = filterValueOf(c);
            // contagem facetada: busca + filtros das OUTRAS colunas
            let base = rows;
            if (searchable && query.trim()) base = base.filter((row) => searchMatch(row, query.trim()));
            for (const other of filterCols) {
              if (other.key === c.key) continue;
              const otherSel = filterSel[other.key];
              if (otherSel?.length) {
                const gv = filterValueOf(other);
                base = base.filter((row) => filterValues(gv(row)).some((value) => otherSel.includes(value)));
              }
            }
            const counts = new Map<string, number>();
            for (const row of rows) for (const value of filterValues(getValue(row))) counts.set(value, 0);
            for (const row of base) for (const value of filterValues(getValue(row))) counts.set(value, (counts.get(value) ?? 0) + 1);
            const sel = filterSel[c.key] ?? [];
            const label = typeof c.header === "string" ? c.header : c.key;
            const open = openFacet === c.key;
            return (
              <div key={c.key} className={styles.facet}>
                <button
                  type="button"
                  className={cn(styles.facetBtn, (sel.length > 0 || open) && styles.facetActive)}
                  aria-haspopup="listbox"
                  aria-expanded={open}
                  onClick={() => setOpenFacet(open ? null : c.key)}
                >
                  {label}
                  {sel.length > 0 && <span className={styles.facetCount}>{sel.length}</span>}
                  <svg className={styles.facetCaret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {open && (
                  <div role="listbox" aria-multiselectable="true" aria-label={`Filtrar por ${label}`} className={styles.facetMenu}>
                    {Array.from(counts).map(([value, count]) => {
                      const on = sel.includes(value);
                      return (
                        <div
                          key={value}
                          role="option"
                          aria-selected={on}
                          className={cn(styles.facetOpt, on && styles.facetOptOn)}
                          tabIndex={0}
                          onClick={() => {
                            toggleFilter(c.key, value);
                            resetPage();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleFilter(c.key, value);
                              resetPage();
                            }
                          }}
                        >
                          <span className={styles.facetCheck}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          <span className={styles.facetValue}>{value}</span>
                          <span className={styles.facetOptCount}>{count}</span>
                        </div>
                      );
                    })}
                    {sel.length > 0 && (
                      <button type="button" className={styles.facetClear} onClick={() => { toggleFilter(c.key, null); resetPage(); }}>
                        Limpar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {Object.values(filterSel).some((v) => v.length > 0) && (
            <button type="button" className={styles.clearAll} onClick={() => { setFilterSel({}); resetPage(); }}>
              Limpar filtros
            </button>
          )}
        </div>
      )}
      <div className={styles.scroller} aria-busy={loading || undefined}>
      <table className={styles.table} style={{ minWidth: minTableWidth }}>
        {caption && <caption className={styles.srOnly}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => {
              const isSorted = sortKey === c.key;
              return (
                <th
                  key={c.key}
                  className={cn(styles.th, (c.align === "right" || c.align === "num") && styles.right)}
                  style={{ width: c.width }}
                  aria-sort={isSorted ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      className={cn(styles.sortBtn, isSorted && styles.sorted)}
                      onClick={() => toggleSort(c)}
                    >
                      {c.header}
                      <svg
                        className={cn(styles.sortIcon, isSorted && sortDir === "desc" && styles.sortDesc)}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {isSorted ? <path d="m18 15-6-6-6 6" /> : <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />}
                      </svg>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: Math.min(pagination?.pageSize ?? 5, 5) }, (_, rowIndex) => (
              <tr key={`loading-${rowIndex}`}>
                {columns.map((column, columnIndex) => (
                  <td key={column.key} className={styles.td}>
                    <Skeleton width={columnIndex === 0 ? "72%" : columnIndex % 2 ? "54%" : "64%"} />
                  </td>
                ))}
              </tr>
            ))
          ) : error ? (
            <tr>
              <td className={styles.error} colSpan={columns.length} role="alert">
                {error}
              </td>
            </tr>
          ) : visible.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {query || Object.values(filterSel).some((v) => v.length) ? "Nada encontrado com os filtros atuais." : empty ?? "Nada por aqui ainda."}
              </td>
            </tr>
          ) : (
            displayed.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className={cn(onRowClick && styles.clickable)}
                onClick={onRowClick ? (event) => {
                  if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) return;
                  onRowClick(row);
                } : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? rowLabel?.(row) : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      styles.td,
                      (c.align === "right" || c.align === "num") && styles.right,
                      c.align === "num" && styles.num
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {pagination && !loading && !error && visible.length > 0 && (
        <div className={styles.paginationBar}>
          <div className={styles.paginationMeta}>
            <p className={styles.paginationSummary} aria-live="polite">
              {Math.min((currentPage - 1) * pageSize + 1, visible.length)}–{Math.min(currentPage * pageSize, visible.length)} de {visible.length}
            </p>
            {pagination.pageSizeOptions && pagination.pageSizeOptions.length > 0 && (
              <div className={styles.pageSizeControl}>
                <span>Por página</span>
                <Select
                  block={false}
                  aria-label="Registros por página"
                  value={pageSize}
                  onChange={(event) => changePageSize(Number(event.target.value))}
                >
                  {Array.from(new Set([pagination.pageSize, ...pagination.pageSizeOptions])).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={changePage} />
        </div>
      )}
    </div>
  );
}
