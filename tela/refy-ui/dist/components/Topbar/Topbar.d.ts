import type { ReactNode } from "react";
import { type BrandLogoBrand } from "../BrandLogo";
import { type SegmentedOption } from "../Segmented";
import { type TabItem } from "../Tabs";
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
export declare function Topbar({ crumbs, brand, showBrand, composition, searchPlaceholder, onSearchClick, tabs, tabValue, tabDefaultValue, onTabChange, segments, segmentValue, segmentDefaultValue, onSegmentChange, actions, className, }: TopbarProps): import("react").JSX.Element;
