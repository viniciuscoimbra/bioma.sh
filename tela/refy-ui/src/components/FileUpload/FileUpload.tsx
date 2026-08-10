import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { IconButton } from "../IconButton";
import { ProgressBar } from "../ProgressBar";
import { cn } from "../../lib/cn";
import styles from "./FileUpload.module.css";

export type FileUploadState = "idle" | "uploading" | "success" | "error";

export interface FileUploadProps {
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  state?: FileUploadState;
  progress?: number;
  errorMessage?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

const uploadIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 15v4h14v-4" /></svg>;
const removeIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>;
const documentIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></svg>;
const spreadsheetIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M9 4v16M15 4v16M4 14h16" /></svg>;
const genericFileIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5" /></svg>;

function fileType(file: File) {
  const extension = file.name.split(".").pop()?.toLocaleLowerCase("pt-BR") ?? "";
  const label = extension ? extension.toLocaleUpperCase("pt-BR") : "ARQ";
  if (["xls", "xlsx", "csv"].includes(extension)) return { kind: "spreadsheet", label, icon: spreadsheetIcon };
  if (["doc", "docx", "odt", "pdf"].includes(extension)) return { kind: "document", label, icon: documentIcon };
  return { kind: "file", label, icon: genericFileIcon };
}

/** Upload sobre input nativo; seleção, drag/drop e remoção mantêm o File[] no consumidor. */
export function FileUpload({
  files,
  defaultFiles = [],
  onFilesChange,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  state = "idle",
  progress,
  errorMessage,
  disabled = false,
  label = "Adicionar arquivos",
  hint = "Arraste arquivos para cá ou escolha no seu dispositivo.",
  className,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState(defaultFiles);
  const [validationError, setValidationError] = useState<string>();
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const current = files ?? internal;
  const busy = state === "uploading";

  useEffect(() => {
    const next: Record<string, string> = {};
    current.forEach((file) => {
      if (file.type.startsWith("image/")) next[`${file.name}-${file.lastModified}`] = URL.createObjectURL(file);
    });
    setPreviews(next);
    return () => Object.values(next).forEach(URL.revokeObjectURL);
  }, [current]);

  function commit(next: File[]) {
    if (files === undefined) setInternal(next);
    onFilesChange?.(next);
  }

  function validate(incoming: File[]) {
    const oversized = incoming.find((file) => file.size > maxSize);
    if (oversized) {
      setValidationError(`${oversized.name} excede o limite de ${(maxSize / 1024 / 1024).toLocaleString("pt-BR")} MB.`);
      return;
    }
    setValidationError(undefined);
    commit(multiple ? [...current, ...incoming] : incoming.slice(0, 1));
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    validate(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled && !busy) validate(Array.from(event.dataTransfer.files));
  }

  function remove(index: number) {
    commit(current.filter((_, fileIndex) => fileIndex !== index));
  }

  const shownError = errorMessage ?? validationError;

  return (
    <section className={cn(styles.root, className)} aria-label={label} aria-busy={busy || undefined}>
      <input ref={inputRef} id={inputId} className={styles.input} type="file" accept={accept} multiple={multiple} disabled={disabled || busy} onChange={handleInput} />
      {(multiple || current.length === 0) && (
        <div
          className={cn(styles.dropzone, dragging && styles.dragging, disabled && styles.disabled)}
          onDragEnter={(event) => { event.preventDefault(); if (!disabled && !busy) setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className={styles.icon}>{uploadIcon}</div>
          <div className={styles.copy}>
            <strong>{label}</strong>
            <span>{hint}</span>
          </div>
          <Button variant="secondary" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>Escolher arquivo{multiple ? "s" : ""}</Button>
        </div>
      )}

      {shownError && <Callout tone="danger" role="alert" title="Arquivo não adicionado">{shownError}</Callout>}

      {current.length > 0 && (
        <ul className={styles.files} aria-label="Arquivos selecionados">
          {current.map((file, index) => {
            const preview = previews[`${file.name}-${file.lastModified}`];
            const type = fileType(file);
            return (
              <li key={`${file.name}-${file.lastModified}-${index}`} className={styles.file}>
                <div className={styles.preview} data-kind={type.kind} aria-hidden="true">
                  {preview
                    ? <><img src={preview} alt="" /><span className={styles.previewExtension}>{type.label}</span></>
                    : <><span className={styles.fileTypeIcon}>{type.icon}</span><span className={styles.fileTypeLabel}>{type.label}</span></>}
                </div>
                <div className={styles.fileCopy}>
                  <strong>{file.name}</strong>
                  <span>{(file.size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB</span>
                  {busy && <ProgressBar value={progress} indeterminate={progress === undefined} size="sm" aria-label={`Upload de ${file.name}`} />}
                </div>
                <div className={styles.fileActions}>
                  {state === "success" && <Badge tone="success">Enviado</Badge>}
                  <IconButton aria-label={`Remover ${file.name}`} icon={removeIcon} size="sm" disabled={busy || disabled} onClick={() => remove(index)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <span className={styles.status} role="status" aria-live="polite">
        {busy
          ? progress === undefined
            ? `Enviando ${current.length} arquivo${current.length === 1 ? "" : "s"}.`
            : `Enviando ${current.length} arquivo${current.length === 1 ? "" : "s"}: ${Math.round(progress)}%.`
          : state === "success"
            ? "Upload concluído."
            : `${current.length} arquivo${current.length === 1 ? "" : "s"} selecionado${current.length === 1 ? "" : "s"}.`}
      </span>
    </section>
  );
}
