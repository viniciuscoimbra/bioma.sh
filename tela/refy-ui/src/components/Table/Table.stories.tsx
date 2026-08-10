import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Table } from "./Table";
import type { Column } from "./Table";

interface Fatura {
  numero: string;
  data: string;
  dataOrd: string;
  descricao: string;
  status: "Pago" | "Pendente" | "Encerrado";
  valor: string;
  valorNum: number;
}

const rows: Fatura[] = [
  ["DMS-2026-0512", "02 mai. 2026", "2026-05-02", "Plano Imobiliária Pro", "Pago", 2388],
  ["DMS-2026-0488", "28 abr. 2026", "2026-04-28", "Pacote 2.000 créditos", "Pago", 299],
  ["DMS-2026-0441", "17 abr. 2026", "2026-04-17", "Plano Corretor Autônomo", "Pendente", 149],
  ["DMS-2026-0398", "02 abr. 2026", "2026-04-02", "Assinatura mensal", "Pago", 199],
  ["DMS-2026-0312", "14 mar. 2026", "2026-03-14", "Créditos de captação", "Pago", 79],
  ["DMS-2026-0277", "03 mar. 2026", "2026-03-03", "Plano Imobiliária Starter", "Encerrado", 948],
  ["DMS-2026-0204", "21 fev. 2026", "2026-02-21", "Assinatura mensal", "Pago", 199],
  ["DMS-2026-0182", "08 fev. 2026", "2026-02-08", "Pacote de mensagens", "Pendente", 59],
  ["DMS-2026-0121", "19 jan. 2026", "2026-01-19", "Plano Corretor Autônomo", "Pago", 149],
  ["DMS-2025-1192", "18 dez. 2025", "2025-12-18", "Créditos de captação", "Pago", 79],
  ["DMS-2025-1161", "05 dez. 2025", "2025-12-05", "Assinatura mensal", "Encerrado", 199],
  ["DMS-2025-1102", "02 nov. 2025", "2025-11-02", "Plano Imobiliária Pro", "Pago", 2388],
].map(([numero, data, dataOrd, descricao, status, valorNum]) => ({
  numero: String(numero),
  data: String(data),
  dataOrd: String(dataOrd),
  descricao: String(descricao),
  status: status as Fatura["status"],
  valorNum: Number(valorNum),
  valor: Number(valorNum).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
}));

const columns: Column<Fatura>[] = [
  { key: "numero", header: "Número", sortable: true, cell: (row) => <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-1)" }}>{row.numero}</span> },
  { key: "data", header: "Data", sortable: true, sortValue: (row) => row.dataOrd, filterable: true, filterValue: (row) => row.dataOrd.slice(0, 4), cell: (row) => row.data },
  { key: "descricao", header: "Descrição", filterable: true, cell: (row) => row.descricao },
  { key: "status", header: "Status", sortable: true, filterable: true, cell: (row) => <Badge tone={row.status === "Pago" ? "success" : row.status === "Pendente" ? "warn" : "neutral"}>{row.status}</Badge> },
  { key: "valor", header: "Valor", align: "num", sortable: true, sortValue: (row) => row.valorNum, filterable: true, filterValue: (row) => (row.valorNum >= 1000 ? "≥ R$ 1.000" : "< R$ 1.000"), cell: (row) => row.valor },
];

const meta = {
  title: "Components/Organisms/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Data Table canônica: combina busca, facetas, ordenação, paginação e seletor de registros por página. `loading`, `error` e `empty` são estados mutuamente exclusivos; linhas interativas respondem a clique, Enter e Espaço. Conteúdo largo rola no próprio container.",
      },
    },
  },
  argTypes: {
    columns: { control: false }, rows: { control: false }, rowKey: { control: false },
    rowLabel: { control: false }, searchMatch: { control: false }, pagination: { control: false },
    empty: { control: "text" }, searchable: { control: "boolean" }, searchPlaceholder: { control: "text" },
    loading: { control: "boolean" }, error: { control: "text" }, onRowClick: { action: "row-click" },
  },
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof Table>;

/** Composição fiel: busca, quatro facetas, ordenação, paginação e linhas acionáveis. */
export const DataTable: Story = {
  render: (args) => {
    const [selected, setSelected] = useState("Nenhuma fatura aberta.");
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Table
          {...args}
          caption="Faturas da conta"
          searchable
          searchPlaceholder="Buscar fatura…"
          columns={columns}
          rows={rows}
          rowKey={(row: Fatura) => row.numero}
          rowLabel={(row: Fatura) => `Abrir fatura ${row.numero}`}
          onRowClick={(row: Fatura) => setSelected(`Fatura ${row.numero} aberta.`)}
          pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20] }}
          minTableWidth={760}
        />
        <p aria-live="polite" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{selected}</p>
      </div>
    );
  },
};

/** O mesmo componente alterna loading → conteúdo real. */
export const Loading: Story = {
  render: (args) => {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Button size="sm" style={{ justifySelf: "start" }} onClick={() => setLoading((value) => !value)}>
          {loading ? "Concluir carregamento" : "Carregar novamente"}
        </Button>
        <Table {...args} caption="Faturas em carregamento" columns={columns} rows={rows.slice(0, 4)} rowKey={(row: Fatura) => row.numero} loading={loading} />
      </div>
    );
  },
};

/** O retry remove o erro e revela as linhas. */
export const Erro: Story = {
  render: (args) => {
    const [failed, setFailed] = useState(true);
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <Table
          {...args}
          caption="Faturas com falha de carregamento"
          columns={columns}
          rows={rows.slice(0, 3)}
          rowKey={(row: Fatura) => row.numero}
          error={failed ? "Não foi possível carregar as faturas." : undefined}
        />
        {failed && <Button size="sm" style={{ justifySelf: "start" }} onClick={() => setFailed(false)}>Tentar novamente</Button>}
      </div>
    );
  },
};

/** Sem linhas: estado vazio neutro, sem superfície laranja. */
export const Vazia: Story = {
  render: (args) => <Table {...args} caption="Faturas vazias" columns={columns} rows={[]} rowKey={(row: Fatura) => row.numero} empty="Nenhuma fatura ainda." />,
};

/** Colunas e textos extremos preservam a leitura com rolagem horizontal local. */
export const ConteudoLongo: Story = {
  render: (args) => (
    <div style={{ maxWidth: 620 }}>
      <Table
        {...args}
        caption="Fatura com conteúdo longo"
        columns={[
          ...columns.slice(0, 3),
          { key: "observacao", header: "Observação operacional detalhada", width: "420px", cell: () => "Conciliação pendente após alteração de responsável financeiro e reprocessamento automático da cobrança da imobiliária." },
          ...columns.slice(3),
        ]}
        rows={rows.slice(0, 3)}
        rowKey={(row: Fatura) => row.numero}
        minTableWidth={1180}
      />
    </div>
  ),
};
