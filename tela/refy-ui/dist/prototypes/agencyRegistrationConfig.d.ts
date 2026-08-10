import type { ComboboxOption } from "../components/Combobox";
export declare const emptyAgencyRegistration: {
    cnpj: string;
    razaoSocial: string;
    nome: string;
    creci: string;
    site: string;
    email: string;
    telefone: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    responsavel: string;
    creciResponsavel: string;
    emailResponsavel: string;
    telefoneResponsavel: string;
};
export type AgencyRegistrationData = typeof emptyAgencyRegistration;
export type AgencyRegistrationField = keyof AgencyRegistrationData;
export type AgencyRegistrationErrors = Partial<Record<AgencyRegistrationField, string>>;
interface AgencyRegistrationSection {
    id: "empresa" | "contato" | "responsavel" | "documentos";
    label: string;
    saveLabel: string;
    savedFeedback: string;
    fields: readonly AgencyRegistrationField[];
    requiredFields: readonly AgencyRegistrationField[];
}
export declare const agencyRegistrationSections: readonly [{
    readonly id: "empresa";
    readonly label: "Empresa";
    readonly saveLabel: "empresa";
    readonly savedFeedback: "Empresa salva";
    readonly fields: readonly ["cnpj", "razaoSocial", "nome", "creci", "site"];
    readonly requiredFields: readonly ["cnpj", "razaoSocial", "nome", "creci"];
}, {
    readonly id: "contato";
    readonly label: "Endereço e contato";
    readonly saveLabel: "endereço e contato";
    readonly savedFeedback: "Endereço e contato salvos";
    readonly fields: readonly ["email", "telefone", "cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"];
    readonly requiredFields: readonly ["email", "telefone", "cep", "logradouro", "numero", "bairro", "cidade", "uf"];
}, {
    readonly id: "responsavel";
    readonly label: "Responsável";
    readonly saveLabel: "responsável";
    readonly savedFeedback: "Responsável salvo";
    readonly fields: readonly ["responsavel", "creciResponsavel", "emailResponsavel", "telefoneResponsavel"];
    readonly requiredFields: readonly ["responsavel", "emailResponsavel", "telefoneResponsavel"];
}, {
    readonly id: "documentos";
    readonly label: "Documentos";
    readonly saveLabel: "documentos";
    readonly savedFeedback: "Documentos salvos";
    readonly fields: readonly [];
    readonly requiredFields: readonly [];
}];
export type AgencyRegistrationSectionId = (typeof agencyRegistrationSections)[number]["id"];
export declare const agencyRegistrationSectionById: Record<"responsavel" | "empresa" | "contato" | "documentos", AgencyRegistrationSection>;
export declare const agencyRegistrationDocuments: readonly [{
    readonly id: "contract";
    readonly label: "Contrato social";
    readonly purpose: "Comprova a existência da empresa, os sócios e os poderes de representação.";
    readonly reviewCheck: "Contrato social legível e atualizado";
}, {
    readonly id: "cnpj";
    readonly label: "Cartão do CNPJ";
    readonly purpose: "Confirma CNPJ, razão social e situação cadastral informada.";
    readonly reviewCheck: "Cartão do CNPJ confere com o cadastro";
}, {
    readonly id: "creci";
    readonly label: "Comprovante do CRECI PJ";
    readonly purpose: "Comprova a inscrição profissional da imobiliária no conselho.";
    readonly reviewCheck: "Comprovante do CRECI PJ confere com o cadastro";
}, {
    readonly id: "address";
    readonly label: "Comprovante de endereço";
    readonly purpose: "Confirma o endereço comercial usado na análise cadastral.";
    readonly reviewCheck: "Comprovante de endereço confere com o cadastro";
}];
export type AgencyRegistrationDocumentId = (typeof agencyRegistrationDocuments)[number]["id"];
export type AgencyRegistrationDocumentFiles = Record<AgencyRegistrationDocumentId, File[]>;
export declare const agencyDocumentAccept = ".pdf,.png,.jpg,.jpeg";
export declare const agencyDocumentHint = "PDF, PNG ou JPG, at\u00E9 10 MB.";
export declare const agencyCreciPublicSearchUrl = "https://crecimg.spiderware.com.br/spw/consultacadastral/TelaConsultaPublicaCompleta.aspx";
export interface AgencyResponsibleOption extends ComboboxOption {
    email: string;
    phone: string;
    creci: string;
}
export declare const agencyResponsibleOptions: readonly [{
    readonly value: "ana-lima";
    readonly label: "Ana Lima";
    readonly avatar: {
        readonly name: "Ana Lima";
    };
    readonly description: "CRECI 44.910-MG · perfil aprovado";
    readonly email: "ana.lima@domuz.app";
    readonly phone: "(31) 98888-4401";
    readonly creci: "44.910-MG";
}, {
    readonly value: "marcos-silva";
    readonly label: "Marcos Silva";
    readonly avatar: {
        readonly name: "Marcos Silva";
    };
    readonly description: "CRECI 21.877-MG · perfil aprovado";
    readonly email: "marcos.silva@domuz.app";
    readonly phone: "(31) 97777-2187";
    readonly creci: "21.877-MG";
}, {
    readonly value: "renata-costa";
    readonly label: "Renata Costa";
    readonly avatar: {
        readonly name: "Renata Costa";
    };
    readonly description: "CRECI 40.203-MG · verificação em análise";
    readonly email: "renata.costa@domuz.app";
    readonly phone: "(31) 96666-4020";
    readonly creci: "40.203-MG";
}];
export declare const brazilStateCodes: readonly ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
export declare function lookupBrazilianPostalCode(postalCode: string): Promise<{
    postalCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
} | null>;
export declare function lookupBrazilianCompany(cnpj: string): Promise<{
    legalName: string;
    displayName: string;
    status: string;
} | null>;
export declare function createAgencyRegistrationState(value?: boolean): Record<AgencyRegistrationSectionId, boolean>;
export declare function createAgencyDocumentFiles(): AgencyRegistrationDocumentFiles;
export interface AgencyRegistrationDraft {
    form: AgencyRegistrationData;
    saved: Record<AgencyRegistrationSectionId, boolean>;
    responsibleMode: "existing" | "invite";
    selectedResponsible: string | null;
    responsibleIsOwner: boolean;
}
export declare function loadAgencyRegistrationDraft(): AgencyRegistrationDraft | null;
export declare function saveAgencyRegistrationDraft(draft: AgencyRegistrationDraft): void;
export declare function loadAgencyDocumentDraft(): Promise<AgencyRegistrationDocumentFiles>;
export declare function saveAgencyDocumentDraft(files: AgencyRegistrationDocumentFiles): Promise<void>;
export declare function clearAgencyRegistrationDraft(): Promise<void>;
export declare function formatCnpj(value: string): string;
export declare function formatAgencyCreci(value: string): string;
export declare function isValidCnpj(value: string): boolean;
export declare function validateAgencyRegistrationSection(sectionId: Exclude<AgencyRegistrationSectionId, "documentos">, data: AgencyRegistrationData): Partial<Record<"email" | "cnpj" | "razaoSocial" | "nome" | "creci" | "site" | "telefone" | "cep" | "logradouro" | "numero" | "complemento" | "bairro" | "cidade" | "uf" | "responsavel" | "creciResponsavel" | "emailResponsavel" | "telefoneResponsavel", string>>;
export {};
