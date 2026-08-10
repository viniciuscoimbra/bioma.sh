import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Components/Molecules/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bloco de código copiável: monoespaçado, fundo escuro, scroll horizontal próprio e botão copiar com feedback \"Copiado\" visível e anunciado (aria-live). `secret` mascara o conteúdo (chaves de API) com toggle revelar — **copiar sempre copia o valor real**, mesmo mascarado.\n\n" +
          "**Onde usar:** página de API & Webhooks (chaves com `secret`, snippets de quickstart), instruções de integração, qualquer valor técnico que o usuário precisa copiar exato (endpoint, comando, webhook secret).\n\n" +
          "**Onde NÃO usar:** não use para campos editáveis (isso é `Input`/`Textarea`); não use para atalhos de teclado (isso é `Kbd`); não use para texto corrido ou citações; não use `secret` como controle de permissão — quem vê a tela consegue revelar e copiar o valor.",
      },
    },
  },
  argTypes: {
    secret: { control: "boolean" },
    visibleChars: { control: { type: "number", min: 0, max: 8 } },
    language: { control: "text" },
  },
} satisfies Meta<typeof CodeBlock>;
export default meta;

type Story = StoryObj<typeof CodeBlock>;

const curlSnippet = `curl https://api.dommus.app/v1/imoveis \\
  -H "Authorization: Bearer dommus_live_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "bairro": "Itapoã", "quartos": 3 }'`;

export const Snippet: Story = {
  args: {
    code: curlSnippet,
    label: "Buscar imóveis",
    language: "bash",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args}>
        <><span style={{ color: "#82aaff" }}>curl</span> <span style={{ color: "#c3e88d" }}>https://api.dommus.app/v1/imoveis</span> \\{"\n"}  <span style={{ color: "#89ddff" }}>-H</span> <span style={{ color: "#f6c177" }}>&quot;Authorization: Bearer dommus_live_sk_...&quot;</span> \\{"\n"}  <span style={{ color: "#89ddff" }}>-H</span> <span style={{ color: "#f6c177" }}>&quot;Content-Type: application/json&quot;</span> \\{"\n"}  <span style={{ color: "#89ddff" }}>-d</span> <span style={{ color: "#c3e88d" }}>&apos;{`{ "bairro": "Itapoã", "quartos": 3 }`}&apos;</span></>
      </CodeBlock>
    </div>
  ),
};

export const SaidaDoLint: Story = {
  name: "Saída de lint",
  args: { code: "src/busca.ts:18:7  error  'bairro' is assigned but never used  no-unused-vars", label: "npm run lint", language: "text" },
  render: (args) => <div style={{ maxWidth: 720 }}><CodeBlock {...args}><><span style={{ color: "#89ddff" }}>src/busca.ts:18:7</span>  <span style={{ color: "#ff6b6b", fontWeight: 700 }}>error</span>  <span style={{ color: "#e6edf3" }}>&apos;bairros&apos; is assigned but never used</span>  <span style={{ color: "#c792ea" }}>no-unused-vars</span></></CodeBlock></div>,
};

export const SemCabecalho: Story = {
  name: "Sem cabeçalho (copiar flutuante)",
  args: {
    code: "npm install @dommus/design-system",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const ChaveSecreta: Story = {
  name: "Chave secreta (secret)",
  args: {
    code: "dommus_live_sk_8f2hd92hd8a2b1c9d0e4f7a3cN9k",
    label: "API key · Produção",
    secret: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <CodeBlock {...args} />
    </div>
  ),
};

export const OverflowHorizontal: Story = {
  name: "Overflow horizontal",
  args: {
    code: `https://api.dommus.app/v1/imoveis?bairro=itapoa&tipo=apartamento&quartos=3&ordenar=compatibilidade`,
    label: "URL assinada",
    language: "http",
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <CodeBlock {...args} />
    </div>
  ),
};
