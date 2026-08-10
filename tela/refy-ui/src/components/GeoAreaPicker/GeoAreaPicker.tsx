import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Callout } from "../Callout";
import { Chip } from "../Chip";
import { Multiselect } from "../Multiselect";
import { Range } from "../Range";
import { SettingRow, SettingRowGroup } from "../SettingRow";
import { cn } from "../../lib/cn";
import styles from "./GeoAreaPicker.module.css";

export interface GeoNeighborhood {
  id: string;
  label: string;
  /** Distância em km a partir do bairro principal. */
  distance: number;
}

export interface GeoAreaPickerProps {
  neighborhoods: GeoNeighborhood[];
  baseId: string;
  radius?: number;
  defaultRadius?: number;
  minRadius?: number;
  maxRadius?: number;
  radiusStep?: number;
  onRadiusChange?: (radius: number) => void;
  includedIds?: string[];
  defaultIncludedIds?: string[];
  onIncludedIdsChange?: (ids: string[]) => void;
  /** Slot do provedor de mapa. A seleção textual continua sendo do DS. */
  map?: ReactNode;
  mapLabel?: string;
  error?: string;
  className?: string;
}

/**
 * Seleção geográfica com contrato textual completo. O mapa é um slot visual;
 * raio, bairros alcançados e inclusão explícita permanecem no design system.
 */
export function GeoAreaPicker({
  neighborhoods,
  baseId,
  radius,
  defaultRadius = 2,
  minRadius = 0.5,
  maxRadius = 5,
  radiusStep = 0.5,
  onRadiusChange,
  includedIds,
  defaultIncludedIds = [],
  onIncludedIdsChange,
  map,
  mapLabel = "Mapa da área de busca",
  error,
  className,
}: GeoAreaPickerProps) {
  const [internalRadius, setInternalRadius] = useState(defaultRadius);
  const [internalIncluded, setInternalIncluded] = useState(defaultIncludedIds);
  const currentRadius = radius ?? internalRadius;
  const currentIncluded = includedIds ?? internalIncluded;
  const base = neighborhoods.find((item) => item.id === baseId);
  const reached = useMemo(
    () => neighborhoods.filter((item) => item.id === baseId || item.distance <= currentRadius),
    [neighborhoods, baseId, currentRadius]
  );
  const reachedExtras = reached.filter((item) => item.id !== baseId);
  const included = reached.filter((item) => item.id === baseId || currentIncluded.includes(item.id));
  const excluded = reachedExtras.filter((item) => !currentIncluded.includes(item.id));

  function setRadius(next: number) {
    if (radius === undefined) setInternalRadius(next);
    onRadiusChange?.(next);
  }

  function setIncluded(next: string[]) {
    const unique = Array.from(new Set(next.filter((id) => id !== baseId)));
    if (includedIds === undefined) setInternalIncluded(unique);
    onIncludedIdsChange?.(unique);
  }

  function toggle(id: string) {
    setIncluded(currentIncluded.includes(id)
      ? currentIncluded.filter((item) => item !== id)
      : [...currentIncluded, id]);
  }

  return (
    <section className={cn(styles.root, className)} aria-label="Seleção da área de busca">
      {error && <Callout tone="danger" role="alert" title="Não foi possível atualizar o mapa">{error}</Callout>}

      <div className={styles.layout}>
        <div className={styles.visual} aria-label={mapLabel}>
          {map ?? (
            <div className={styles.noMap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" /><path d="M9 3v15M15 6v15" />
              </svg>
              <strong>Mapa indisponível</strong>
              <span>Você pode concluir toda a seleção pelas listas ao lado.</span>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <Range
            label={`Entorno de ${base?.label ?? "área principal"}`}
            min={0}
            max={maxRadius}
            step={radiusStep}
            value={[0, currentRadius]}
            fixedMinimum
            disabled={Boolean(error)}
            formatValue={(value) => `${value.toLocaleString("pt-BR")} km`}
            ticks={["0", `${maxRadius / 2} km`, `${maxRadius} km`]}
            onChange={([, next]) => setRadius(Math.max(minRadius, next))}
          />

          <Multiselect
            label="Bairros próximos incluídos"
            placeholder="Adicionar bairro alcançado…"
            options={reachedExtras.map((item) => ({ value: item.id, label: item.label }))}
            value={currentIncluded.filter((id) => reachedExtras.some((item) => item.id === id))}
            maxVisibleChips={2}
            disabled={Boolean(error)}
            onChange={setIncluded}
            hint={`${reachedExtras.length} bairro${reachedExtras.length === 1 ? "" : "s"} no raio atual`}
          />

          <div className={styles.explanation} role="note">
            O raio só sugere vizinhos. Apenas os bairros em “Na sua busca” entram no ranking.
          </div>
        </div>
      </div>

      <div className={styles.lists}>
        <section className={styles.listCard} aria-labelledby="geo-included-title">
          <div className={styles.listHeader}>
            <div>
              <h3 id="geo-included-title">Na sua busca</h3>
              <p>Somente estes bairros podem trazer imóveis.</p>
            </div>
            <span>{included.length}</span>
          </div>
          <SettingRowGroup aria-label="Bairros incluídos">
            {included.map((item) => (
              <SettingRow
                key={item.id}
                title={item.label}
                description={item.id === baseId ? "Bairro principal" : `${item.distance.toLocaleString("pt-BR")} km do bairro principal`}
                actions={
                  <Chip
                    aria-label={item.id === baseId ? `${item.label} é o bairro principal` : `Remover ${item.label} da busca`}
                    selected
                    showCheck
                    disabled={Boolean(error) || item.id === baseId}
                    onClick={() => toggle(item.id)}
                  >
                    {item.id === baseId ? "Principal" : "Incluído"}
                  </Chip>
                }
              />
            ))}
          </SettingRowGroup>
        </section>

        <section className={styles.listCard} aria-labelledby="geo-excluded-title">
          <div className={styles.listHeader}>
            <div>
              <h3 id="geo-excluded-title">Fora da busca</h3>
              <p>Estão no raio, mas não serão usados no ranking.</p>
            </div>
            <span>{excluded.length}</span>
          </div>
          {excluded.length ? (
            <SettingRowGroup aria-label="Bairros excluídos">
              {excluded.map((item) => (
                <SettingRow
                  key={item.id}
                  title={item.label}
                  description={`${item.distance.toLocaleString("pt-BR")} km do bairro principal`}
                  actions={
                    <Chip
                      aria-label={`Incluir ${item.label} na busca`}
                      disabled={Boolean(error)}
                      onClick={() => toggle(item.id)}
                    >
                      Incluir
                    </Chip>
                  }
                />
              ))}
            </SettingRowGroup>
          ) : (
            <p className={styles.empty}>Todos os bairros alcançados estão na busca.</p>
          )}
        </section>
      </div>

      <p className={styles.summary} aria-live="polite">
        Busca em {included.map((item) => item.label).join(", ") || "nenhum bairro"}; {excluded.length} deixado{excluded.length === 1 ? "" : "s"} de fora.
      </p>
    </section>
  );
}
