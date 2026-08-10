export interface OperationalRow {
    title: string;
    description: string;
    meta: string;
    status: string;
    tone?: "success" | "warn" | "danger" | "neutral";
}
export interface BackofficeOperationalPageProps {
    title: string;
    lead: string;
    sectionTitle: string;
    sectionLead: string;
    primaryAction: string;
    resultMessage: string;
    rows: OperationalRow[];
}
export declare function BackofficeOperationalPage({ title, lead, sectionTitle, sectionLead, primaryAction, resultMessage, rows, }: BackofficeOperationalPageProps): import("react").JSX.Element;
