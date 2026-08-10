import { useMemo, useState } from "react";
import { Badge } from "../Badge";
import { Calendar } from "../Calendar";
import { ChoiceCard, ChoiceCardGroup } from "../ChoiceCard";
import { ToggleGroup } from "../ToggleGroup";
import { cn } from "../../lib/cn";
import styles from "./VisitSchedulePicker.module.css";

export type VisitAvailability = Record<string, string[]>;

export interface VisitSchedulePickerProps {
  value?: VisitAvailability;
  defaultValue?: VisitAvailability;
  onChange?: (value: VisitAvailability) => void;
  defaultActiveDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  timezone?: string;
  unavailable?: VisitAvailability;
  disabled?: boolean;
  className?: string;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute === 0 ? `${String(hour).padStart(2, "0")}h` : `${String(hour).padStart(2, "0")}h${String(minute).padStart(2, "0")}`;
}

export function groupVisitTimes(times: string[]) {
  const values = Array.from(new Set(times.map(timeToMinutes))).sort((a, b) => a - b);
  if (values.length === 0) return [];
  const groups: Array<{ start: number; end: number }> = [];
  let start = values[0];
  let previous = values[0];
  values.slice(1).forEach((value) => {
    if (value === previous + 30) previous = value;
    else {
      groups.push({ start, end: previous + 30 });
      start = previous = value;
    }
  });
  groups.push({ start, end: previous + 30 });
  return groups.map(({ start: groupStart, end }) => `${formatMinutes(groupStart)}–${formatMinutes(end)}`);
}

const allTimes = Array.from({ length: 23 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** Escolha de disponibilidades para visita com resumo agrupado e timezone explícito. */
export function VisitSchedulePicker({
  value,
  defaultValue = {},
  onChange,
  defaultActiveDate = new Date(),
  minDate = new Date(),
  maxDate,
  timezone = "America/Sao_Paulo",
  unavailable = {},
  disabled = false,
  className,
}: VisitSchedulePickerProps) {
  const initialKey = dateKey(defaultActiveDate);
  const [internal, setInternal] = useState<VisitAvailability>(() => ({ [initialKey]: [], ...defaultValue }));
  const [activeKey, setActiveKey] = useState(() => Object.keys(defaultValue)[0] ?? initialKey);
  const current = value ?? internal;
  const selectedDays = useMemo(() => Object.keys(current).sort(), [current]);

  function commit(next: VisitAvailability) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  function selectDate(date: Date) {
    const key = dateKey(date);
    setActiveKey(key);
    if (!(key in current)) commit({ ...current, [key]: [] });
  }

  function selectTimes(times: string[]) {
    commit({ ...current, [activeKey]: times });
  }

  const timeOptions = allTimes.map((time) => ({
    value: time,
    label: time,
    disabled: unavailable[activeKey]?.includes(time),
  }));
  const chosenCount = selectedDays.filter((key) => current[key]?.length).length;

  return (
    <section className={cn(styles.root, className)} aria-label="Escolher disponibilidade para visita">
      <div className={styles.main}>
        <div className={styles.calendarWrap}>
          <h3>Escolha os dias</h3>
          <p>Clique em mais de uma data para montar suas alternativas.</p>
          <Calendar mode="single" value={fromKey(activeKey)} min={minDate} max={maxDate} onChange={(next) => selectDate(next as Date)} />
        </div>

        <div className={styles.schedule}>
          <div className={styles.sectionHeading}>
            <div>
              <h3>Dias selecionados</h3>
              <p>Alterne o dia para definir horários diferentes.</p>
            </div>
            <Badge tone="neutral">{selectedDays.length} dia{selectedDays.length === 1 ? "" : "s"}</Badge>
          </div>

          <ChoiceCardGroup
            mode="single"
            value={activeKey}
            onChange={(next) => setActiveKey(next as string)}
            label="Dia que está sendo editado"
            columns={Math.min(3, Math.max(1, selectedDays.length))}
            className={styles.days}
          >
            {selectedDays.map((key) => {
              const date = fromKey(key);
              return (
                <ChoiceCard
                  key={key}
                  value={key}
                  title={new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(date)}
                  description={`${current[key]?.length ?? 0} horário${current[key]?.length === 1 ? "" : "s"}`}
                />
              );
            })}
          </ChoiceCardGroup>

          <div className={styles.timesHeading}>
            <div>
              <h3>Horários disponíveis</h3>
              <p>Das 08h às 19h, em intervalos de 30 minutos.</p>
            </div>
            <Badge tone="info">fuso {timezone}</Badge>
          </div>
          <ToggleGroup
            className={styles.times}
            label={`Horários de ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(fromKey(activeKey))}`}
            options={timeOptions}
            value={current[activeKey] ?? []}
            onChange={selectTimes}
            disabled={disabled}
          />
        </div>
      </div>

      <aside className={styles.summary} aria-labelledby="visit-summary-title">
        <div className={styles.summaryHeading}>
          <div>
            <h3 id="visit-summary-title">Sua disponibilidade</h3>
            <p>O corretor confirmará um destes intervalos.</p>
          </div>
          <Badge tone={chosenCount ? "success" : "neutral"}>{chosenCount} com horário</Badge>
        </div>
        <div className={styles.summaryList} aria-live="polite">
          {selectedDays.map((key) => {
            const ranges = groupVisitTimes(current[key] ?? []);
            return (
              <div key={key} className={styles.summaryDay}>
                <strong>{new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short" }).format(fromKey(key))}</strong>
                <span>{ranges.length ? ranges.join(" · ") : "Escolha os horários"}</span>
              </div>
            );
          })}
        </div>
        <p className={styles.timezone}>Horários exibidos em {timezone}.</p>
      </aside>
    </section>
  );
}
