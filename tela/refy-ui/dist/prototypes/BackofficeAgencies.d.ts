export type AgenciesState = "default" | "loading" | "empty" | "error";
export type AgencyReviewState = "pending-review" | "active" | "under-review" | "needs-information" | "rejected" | "suspended" | "deleted";
export type AgencyReviewView = "general" | "analysis" | "responsible" | "history" | "administration";
export declare const storyHref: (id: string) => string;
export declare const openStory: (id: string) => void;
export declare const agencyIndexStoryId = "produto-backoffice-imobili\u00E1rias--index";
export declare const backofficeSidebar: {
    brand: "dommus";
    defaultActiveId: string;
    account: {
        name: string;
        email: string;
        initials: string;
        seed: string;
    };
    groups: {
        section: string;
        items: ({
            id: string;
            label: string;
            icon: import("react").JSX.Element;
            href: string;
            target: string;
            badge?: undefined;
        } | {
            id: string;
            label: string;
            icon: import("react").JSX.Element;
            badge: number;
            href: string;
            target: string;
        })[];
    }[];
};
export declare function BackofficeAgencies({ state }: {
    state?: AgenciesState;
}): import("react").JSX.Element;
type AgencyAdministrativeAction = "suspend" | "delete";
export interface BackofficeAgencyReviewProps {
    initialView?: AgencyReviewView;
    initialState?: AgencyReviewState;
    initialAgencyAction?: AgencyAdministrativeAction | null;
}
export declare function BackofficeAgencyReview({ initialView, initialState, initialAgencyAction, }?: BackofficeAgencyReviewProps): import("react").JSX.Element;
export {};
