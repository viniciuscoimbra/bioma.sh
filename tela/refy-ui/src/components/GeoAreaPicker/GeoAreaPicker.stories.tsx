import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { GeoAreaPicker } from "./GeoAreaPicker";
import type { GeoNeighborhood } from "./GeoAreaPicker";
import { neighborhoodFeatureCollection } from "./neighborhoods.geojson";

const neighborhoods: GeoNeighborhood[] = [
  { id: "planalto", label: "Planalto", distance: 0 },
  { id: "itapoa", label: "Itapoã", distance: 1.2 },
  { id: "vila-cloris", label: "Vila Clóris", distance: 1.4 },
  { id: "campo-alegre", label: "Campo Alegre", distance: 1.8 },
  { id: "santa-amelia", label: "Santa Amélia", distance: 2.6 },
  { id: "pampulha", label: "Pampulha", distance: 4.1 },
];

interface GoogleDataFeature {
  getProperty(name: string): unknown;
}

interface GoogleDataLayer {
  addGeoJson(geoJson: object): void;
  setStyle(style: (feature: GoogleDataFeature) => object): void;
}

interface GoogleMapsApi {
  importLibrary(name: "maps"): Promise<{
    Map: new (element: HTMLElement, options: object) => { data: GoogleDataLayer };
  }>;
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsApi };
    dommusGoogleMaps?: Promise<GoogleMapsApi>;
    dommusGoogleMapsReady?: () => void;
  }
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.dommusGoogleMaps) return window.dommusGoogleMaps;

  window.dommusGoogleMaps = new Promise<GoogleMapsApi>((resolve, reject) => {
    const script = document.createElement("script");
    window.dommusGoogleMapsReady = () => window.google?.maps
      ? resolve(window.google.maps)
      : reject(new Error("Google Maps indisponível"));
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&callback=dommusGoogleMapsReady`;
    script.onerror = () => reject(new Error("Falha ao carregar Google Maps"));
    document.head.appendChild(script);
  });
  return window.dommusGoogleMaps;
}

function styleNeighborhoods(data: GoogleDataLayer, selectedIds: string[], primary: string, primaryHover: string) {
  const selected = new Set(selectedIds);
  data.setStyle((feature) => {
    const active = selected.has(String(feature.getProperty("id")));
    return {
      fillColor: active ? primary : "#64748b",
      fillOpacity: active ? 0.2 : 0.04,
      strokeColor: active ? primaryHover : "#94a3b8",
      strokeOpacity: active ? 0.9 : 0.35,
      strokeWeight: active ? 2 : 1,
    };
  });
}

function GoogleMap({ selectedIds }: { selectedIds: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<GoogleDataLayer | undefined>(undefined);
  const colorsRef = useRef({ primary: "#c94322", primaryHover: "#b9381b" });
  const [error, setError] = useState("");
  const selectedKey = selectedIds.join("|");

  useEffect(() => {
    const element = containerRef.current;
    const apiKey = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_GOOGLE_MAPS_API_KEY;
    if (!element || !apiKey) return setError("Configure VITE_GOOGLE_MAPS_API_KEY");

    loadGoogleMaps(apiKey).then(async (maps) => {
      const { Map } = await maps.importLibrary("maps");
      const map = new Map(element, {
        center: { lat: -19.8417, lng: -43.9567 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });
      map.data.addGeoJson(neighborhoodFeatureCollection);
      dataRef.current = map.data;
      const styles = getComputedStyle(element);
      colorsRef.current = {
        primary: styles.getPropertyValue("--primary").trim() || colorsRef.current.primary,
        primaryHover: styles.getPropertyValue("--primary-hover").trim() || colorsRef.current.primaryHover,
      };
      styleNeighborhoods(map.data, selectedIds, colorsRef.current.primary, colorsRef.current.primaryHover);
      setError("");
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Google Maps indisponível"));
  }, []);

  useEffect(() => {
    const data = dataRef.current;
    if (!data) return;
    styleNeighborhoods(data, selectedIds, colorsRef.current.primary, colorsRef.current.primaryHover);
  }, [selectedKey]);

  return (
    <div ref={containerRef} role="img" aria-label={`Google Maps com bairros selecionados: ${selectedIds.join(", ")}`} style={{ width: "100%", height: "100%" }}>
      {error}
    </div>
  );
}

const meta = {
  title: "Components/Organisms/GeoAreaPicker",
  component: GeoAreaPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "O mapa é um slot adaptável ao provedor. O DS controla raio, bairros alcançados e listas textuais separadas de incluídos/excluídos. Estar no raio não inclui automaticamente um bairro no ranking. Compõe `Range`, `Multiselect`, `Chip`, `SettingRowGroup` e `Callout`.",
      },
    },
  },
  argTypes: {
    neighborhoods: { control: false }, baseId: { control: false }, radius: { control: false }, includedIds: { control: false },
    map: { control: false }, onRadiusChange: { action: "radius" }, onIncludedIdsChange: { action: "included" }, error: { control: "text" },
  },
} satisfies Meta<typeof GeoAreaPicker>;
export default meta;

type Story = StoryObj<typeof GeoAreaPicker>;

function PickerDemo({ initialRadius = 2, initialIncluded = ["itapoa"], withMap = true, error }: { initialRadius?: number; initialIncluded?: string[]; withMap?: boolean; error?: string }) {
  const [radius, setRadius] = useState(initialRadius);
  const [included, setIncluded] = useState(initialIncluded);
  return (
    <div style={{ maxWidth: 1080 }}>
      <GeoAreaPicker
        neighborhoods={neighborhoods}
        baseId="planalto"
        radius={radius}
        onRadiusChange={setRadius}
        includedIds={included}
        onIncludedIdsChange={setIncluded}
        map={withMap ? <GoogleMap selectedIds={["planalto", ...included]} /> : undefined}
        error={error}
      />
    </div>
  );
}

/** O raio redesenha o mapa e atualiza imediatamente os bairros alcançados. */
export const Raio: Story = { render: () => <PickerDemo /> };

/** Planalto e Itapoã incluídos; vizinhos no raio continuam explícitos fora da busca. */
export const Incluidos: Story = { render: () => <PickerDemo initialIncluded={["itapoa"]} /> };

/** Nenhum vizinho foi confirmado: todos os alcançados aparecem na lista de fora. */
export const Excluidos: Story = { render: () => <PickerDemo initialIncluded={[]} /> };

/** Sem provedor de mapa, a seleção textual continua integralmente utilizável. */
export const SemMapa: Story = { render: () => <PickerDemo withMap={false} /> };

/** Falha do mapa é persistente e bloqueia mudanças até sincronizar novamente. */
export const Erro: Story = { render: () => <PickerDemo error="A conexão com o provedor foi interrompida. Sua seleção anterior foi preservada." /> };
