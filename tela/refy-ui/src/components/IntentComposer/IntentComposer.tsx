import { useState } from "react";
import type { ChangeEvent } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { Chip } from "../Chip";
import { IconButton } from "../IconButton";
import { Multiselect } from "../Multiselect";
import { ProgressBar } from "../ProgressBar";
import { Segmented } from "../Segmented";
import { Textarea } from "../Textarea";
import { VoiceRecorder } from "../VoiceRecorder";
import type { VoiceRecorderProps } from "../VoiceRecorder";
import styles from "./IntentComposer.module.css";

export type IntentComposerState = "idle" | "listening" | "processing" | "understood" | "error";

export interface IntentFilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface IntentFilterGroup {
  id: string;
  label: string;
  mode: "single" | "multiple";
  options: IntentFilterOption[];
}

export interface IntentComposerProps {
  state?: IntentComposerState;
  filters?: IntentFilterGroup[];
  filterValues?: Record<string, string[]>;
  defaultFilterValues?: Record<string, string[]>;
  onFilterValuesChange?: (values: Record<string, string[]>) => void;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  examples?: string[];
  submitLabel?: string;
  understoodSummary?: string;
  errorMessage?: string;
  onSubmit?: () => void;
  onVoiceStart?: () => void;
  onEditRequest?: () => void;
  onEditDetails?: () => void;
  voiceRecorderProps?: VoiceRecorderProps;
  className?: string;
}

const micIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
  </svg>
);

/**
 * Composer de intenção. Filtros ficam acima; exemplos e ações pertencem ao
 * rodapé interno; voz usa VoiceRecorder; não inclui anexos no v1.
 */
export function IntentComposer({
  state = "idle",
  filters = [],
  filterValues,
  defaultFilterValues = {},
  onFilterValuesChange,
  value,
  defaultValue = "",
  onChange,
  label = "Conte o que você procura",
  placeholder = "Ex.: quero um apartamento com três quartos, boa luz e espaço para meus cachorros…",
  examples = [],
  submitLabel = "Continuar",
  understoodSummary,
  errorMessage = "Não conseguimos interpretar uma parte do pedido. Ajuste o texto e tente novamente.",
  onSubmit,
  onVoiceStart,
  onEditRequest,
  onEditDetails,
  voiceRecorderProps,
  className,
}: IntentComposerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalFilters, setInternalFilters] = useState(defaultFilterValues);
  const text = value ?? internalValue;
  const selections = filterValues ?? internalFilters;
  const readOnly = state === "processing" || state === "understood";

  function changeText(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  function changeFilters(next: Record<string, string[]>) {
    if (filterValues === undefined) setInternalFilters(next);
    onFilterValuesChange?.(next);
  }

  function selectFilter(group: IntentFilterGroup, next: string) {
    const current = selections[group.id] ?? [];
    changeFilters({
      ...selections,
      [group.id]: group.mode === "single"
        ? [next]
        : current.includes(next) ? current.filter((item) => item !== next) : [...current, next],
    });
  }

  return (
    <section className={cn(styles.root, className)} aria-label="Compositor do pedido">
      {state === "understood" && understoodSummary && (
        <Callout
          tone="info"
          title="Entendi assim"
          action={<Button size="sm" variant="secondary" onClick={onEditDetails}>Revisar detalhes</Button>}
        >
          {understoodSummary}
        </Callout>
      )}

      <div className={styles.filters} aria-label="Filtros iniciais">
        {filters.map((group) => {
          const selected = selections[group.id] ?? [];
          return (
            <div key={group.id} className={styles.filterGroup}>
              <span className={styles.filterLabel}>{group.label}</span>
              {group.mode === "single" ? (
                <Segmented
                  label={group.label}
                  options={group.options}
                  value={selected[0] ?? group.options[0]?.value}
                  disabled={readOnly}
                  onChange={(next) => selectFilter(group, next)}
                />
              ) : (
                <Multiselect
                  className={styles.multiselect}
                  aria-label={group.label}
                  options={group.options}
                  value={selected}
                  maxVisibleChips={2}
                  placeholder={`Selecionar ${group.label.toLowerCase()}…`}
                  disabled={readOnly}
                  onChange={(next) => changeFilters({ ...selections, [group.id]: next })}
                />
              )}
            </div>
          );
        })}
      </div>

      {state === "error" && (
        <Callout tone="danger" role="alert" title="Precisamos de um pouco mais de contexto">
          {errorMessage}
        </Callout>
      )}

      <div className={cn(styles.shell, state === "error" && styles.hasError)}>
        <Textarea
          className={styles.textarea}
          label={label}
          value={text}
          placeholder={placeholder}
          rows={5}
          readOnly={readOnly}
          aria-busy={state === "processing" || undefined}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => changeText(event.target.value)}
        />

        {state === "listening" && (
          <div className={styles.voice}>
            <VoiceRecorder state={voiceRecorderProps?.state ?? "listening"} transcript={text || undefined} {...voiceRecorderProps} />
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.examples} aria-label="Exemplos de pedido">
            {examples.length > 0 && <span>Experimente:</span>}
            {examples.map((example) => (
              <Chip key={example} disabled={readOnly} onClick={() => changeText(example)}>{example}</Chip>
            ))}
          </div>
          <div className={styles.actions}>
            {state !== "listening" && (
              <IconButton
                aria-label="Descrever por voz"
                variant="ghost"
                icon={micIcon}
                disabled={readOnly}
                onClick={onVoiceStart}
              />
            )}
            <Button
              size="sm"
              variant="primary"
              status={state === "processing" ? "loading" : "idle"}
              loadingLabel="Entendendo…"
              disabled={!text.trim() || state === "understood"}
              onClick={onSubmit}
            >
              {submitLabel}
            </Button>
          </div>
        </div>

        {state === "processing" && (
          <div className={styles.processing} role="status">
            <div>
              <strong>Organizando o que você contou</strong>
              <span>Estamos transformando o texto em critérios que você poderá revisar.</span>
            </div>
            <Button size="sm" variant="ghost" onClick={onEditRequest}>Quero editar</Button>
            <ProgressBar indeterminate size="sm" aria-label="Processando o pedido" />
          </div>
        )}
      </div>
    </section>
  );
}
