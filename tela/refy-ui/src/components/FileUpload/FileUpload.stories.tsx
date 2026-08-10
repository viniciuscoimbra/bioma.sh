import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "./FileUpload";

function documentFile() { return new File(["comprovante"], "comprovante-de-renda.pdf", { type: "application/pdf", lastModified: 1 }); }
function imageFile() { return new File([`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#bedcf0"/><path d="M40 150 160 40l120 110" fill="#fff8f2" stroke="#bd4b30" stroke-width="12"/></svg>`], "fachada.svg", { type: "image/svg+xml", lastModified: 2 }); }
function typeFiles() {
  return [
    new File(["pdf"], "contrato-social.pdf", { type: "application/pdf", lastModified: 3 }),
    new File(["docx"], "procuracao.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", lastModified: 4 }),
    new File(["xlsx"], "socios.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", lastModified: 5 }),
    imageFile(),
  ];
}

const meta = {
  title: "Components/Molecules/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { accept: "image/*,.pdf", maxSize: 10 * 1024 * 1024 },
} satisfies Meta<typeof FileUpload>;
export default meta;
type Story = StoryObj<typeof FileUpload>;

function Preset({ kind = "document", ...props }: { kind?: "document" | "image" } & React.ComponentProps<typeof FileUpload>) {
  const [files, setFiles] = useState(() => [kind === "image" ? imageFile() : documentFile()]);
  return <FileUpload {...props} files={files} onFilesChange={setFiles} />;
}

export const Selecao: Story = { render: (args) => <Preset {...args} /> };
export const Preview: Story = { render: (args) => <Preset {...args} kind="image" /> };
export const TiposDeArquivo: Story = {
  name: "Tipos de arquivo",
  render: (args) => <FileUpload {...args} files={typeFiles()} multiple />,
  args: { accept: ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.svg" },
};
export const Progresso: Story = { render: (args) => <Preset {...args} state="uploading" progress={64} /> };
export const Erro: Story = { args: { state: "error", errorMessage: "O arquivo excede o limite de 10 MB." } };
export const Remocao: Story = { render: (args) => <Preset {...args} /> };
export const Teclado: Story = { args: { label: "Anexar documentação", hint: "Use Tab e Enter para abrir o seletor nativo." } };
