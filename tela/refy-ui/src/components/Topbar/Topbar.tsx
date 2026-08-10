import type { ReactNode } from "react";
import { BrandLogo, type BrandLogoBrand } from "../BrandLogo";
import { Breadcrumb } from "../Breadcrumb";
import { Kbd } from "../Kbd";
import { Segmented, type SegmentedOption } from "../Segmented";
import { Tabs, type TabItem } from "../Tabs";
import { cn } from "../../lib/cn";
import styles from "./Topbar.module.css";

export interface Crumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export type TopbarComposition = "search" | "tabs" | "dense";

export interface TopbarProps {
  crumbs?: Crumb[];
  brand?: BrandLogoBrand;
  showBrand?: boolean;
  composition?: TopbarComposition;
  searchPlaceholder?: string;
  onSearchClick?: () => void;
  tabs?: TabItem[];
  tabValue?: string;
  tabDefaultValue?: string;
  onTabChange?: (id: string) => void;
  segments?: SegmentedOption[];
  segmentValue?: string;
  segmentDefaultValue?: string;
  onSegmentChange?: (value: string) => void;
  actions?: ReactNode;
  className?: string;
}

/** App bar canônica: busca, tabs em pílula ou composição densa segmentada. */
export function Topbar({
  crumbs = [],
  brand = "refy",
  showBrand = true,
  composition = "search",
  searchPlaceholder = "Buscar clientes, imóveis, visitas…",
  onSearchClick,
  tabs = [],
  tabValue,
  tabDefaultValue,
  onTabChange,
  segments = [],
  segmentValue,
  segmentDefaultValue,
  onSegmentChange,
  actions,
  className,
}: TopbarProps) {
  return (
    <header className={cn(styles.topbar, composition === "dense" && styles.dense, className)}>
      {showBrand && <BrandLogo brand={brand} size={composition === "dense" ? "xs" : "sm"} className={styles.brand} />}
      {showBrand && crumbs.length > 0 && <span className={styles.divider} aria-hidden="true" />}
      {crumbs.length > 0 && (
        <Breadcrumb
          className={styles.crumb}
          items={crumbs.map((crumb) => ({ label: crumb.label, href: crumb.href, onClick: crumb.onClick }))}
        />
      )}

      <span className={styles.spacer} />

      {composition === "search" && (
        <button type="button" className={styles.search} aria-label={searchPlaceholder} onClick={onSearchClick}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className={styles.searchText}>{searchPlaceholder}</span>
          <Kbd className={styles.kbd}>⌘K</Kbd>
        </button>
      )}

      {composition === "tabs" && tabs.length > 0 && (
        <Tabs
          items={tabs}
          variant="pill"
          value={tabValue}
          defaultValue={tabDefaultValue}
          onChange={onTabChange}
          className={styles.tabs}
        />
      )}

      {composition === "dense" && segments.length > 0 && (
        <Segmented
          options={segments}
          value={segmentValue}
          defaultValue={segmentDefaultValue}
          onChange={onSegmentChange}
          label="Modo de visualização"
          className={styles.segmented}
        />
      )}

      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
