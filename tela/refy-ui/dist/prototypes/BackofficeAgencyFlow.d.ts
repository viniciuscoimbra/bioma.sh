export interface FlowScopeProps {
    id: string;
    title: string;
    entry: string;
    purpose: string;
    requirements: string[];
    result: string;
}
export declare function FlowScope({ id, title, entry, purpose, requirements, result }: FlowScopeProps): import("react").JSX.Element;
export declare function AgencyLifecycle(): import("react").JSX.Element;
export declare function AndradeAgencyAccessPage(): import("react").JSX.Element;
type PlatformUserStatus = "Ativo" | "Convite pendente" | "Bloqueado";
interface PlatformUser {
    id: string;
    name: string;
    initials: string;
    email: string;
    roles: string[];
    links: string[];
    signIn: string;
    status: PlatformUserStatus;
    lastAccess: string;
}
export declare const platformUsers: PlatformUser[];
export declare function PlatformUsersPage(): import("react").JSX.Element;
type UserDetailView = "general" | "roles" | "access" | "security" | "history" | "administration";
type AccessSaveMode = "success" | "error" | "readonly";
export declare function PlatformUserDetailPage({ user, initialView, accessSaveMode, }: {
    user?: PlatformUser;
    initialView?: UserDetailView;
    accessSaveMode?: AccessSaveMode;
}): import("react").JSX.Element;
export declare function PlatformBrokerDetailPage(): import("react").JSX.Element;
export declare function InformationRequestPage(): import("react").JSX.Element;
export declare function RejectionPage(): import("react").JSX.Element;
export {};
