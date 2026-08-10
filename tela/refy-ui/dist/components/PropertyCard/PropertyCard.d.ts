import type { ReactNode } from "react";
import type { BadgeTone } from "../Badge";
import type { PropertyActionGroupProps } from "../PropertyActionGroup";
import type { PropertyMediaItem, PropertyMediaProps } from "../PropertyMedia";
export type PropertyCardLayout = "grid" | "list" | "deck";
export interface PropertyCardBadge {
    label: ReactNode;
    tone?: BadgeTone;
}
export interface PropertyCardFact {
    label: string;
    value: ReactNode;
}
export interface PropertyCardProps {
    title: ReactNode;
    address: ReactNode;
    price: ReactNode;
    priceSuffix?: ReactNode;
    media: PropertyMediaItem[];
    mediaProps?: Omit<PropertyMediaProps, "items">;
    layout?: PropertyCardLayout;
    matchScore?: number;
    badges?: PropertyCardBadge[];
    facts?: PropertyCardFact[];
    summary?: ReactNode;
    actions?: Omit<PropertyActionGroupProps, "className"> | false;
    headerAction?: ReactNode;
    detailsAction?: ReactNode;
    className?: string;
}
/** Card canônico do imóvel; muda composição, nunca duplica mídia ou ações. */
export declare function PropertyCard({ title, address, price, priceSuffix, media, mediaProps, layout, matchScore, badges, facts, summary, actions, headerAction, detailsAction, className, }: PropertyCardProps): import("react").JSX.Element;
