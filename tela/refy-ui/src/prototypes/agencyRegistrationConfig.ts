import type { ComboboxOption } from "../components/Combobox";

export const emptyAgencyRegistration = {
  cnpj: "",
  razaoSocial: "",
  nome: "",
  creci: "",
  site: "",
  email: "",
  telefone: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  responsavel: "",
  creciResponsavel: "",
  emailResponsavel: "",
  telefoneResponsavel: "",
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

export const agencyRegistrationSections = [
  {
    id: "empresa",
    label: "Empresa",
    saveLabel: "empresa",
    savedFeedback: "Empresa salva",
    fields: ["cnpj", "razaoSocial", "nome", "creci", "site"],
    requiredFields: ["cnpj", "razaoSocial", "nome", "creci"],
  },
  {
    id: "contato",
    label: "Endereço e contato",
    saveLabel: "endereço e contato",
    savedFeedback: "Endereço e contato salvos",
    fields: ["email", "telefone", "cep", "logradouro", "numero", "complemento", "bairro", "cidade", "uf"],
    requiredFields: ["email", "telefone", "cep", "logradouro", "numero", "bairro", "cidade", "uf"],
  },
  {
    id: "responsavel",
    label: "Responsável",
    saveLabel: "responsável",
    savedFeedback: "Responsável salvo",
    fields: ["responsavel", "creciResponsavel", "emailResponsavel", "telefoneResponsavel"],
    requiredFields: ["responsavel", "emailResponsavel", "telefoneResponsavel"],
  },
  {
    id: "documentos",
    label: "Documentos",
    saveLabel: "documentos",
    savedFeedback: "Documentos salvos",
    fields: [],
    requiredFields: [],
  },
] as const satisfies readonly AgencyRegistrationSection[];

export type AgencyRegistrationSectionId = (typeof agencyRegistrationSections)[number]["id"];

export const agencyRegistrationSectionById = agencyRegistrationSections.reduce(
  (sections, section) => ({ ...sections, [section.id]: section }),
  {} as Record<AgencyRegistrationSectionId, AgencyRegistrationSection>,
);

export const agencyRegistrationDocuments = [
  {
    id: "contract",
    label: "Contrato social",
    purpose: "Comprova a existência da empresa, os sócios e os poderes de representação.",
    reviewCheck: "Contrato social legível e atualizado",
  },
  {
    id: "cnpj",
    label: "Cartão do CNPJ",
    purpose: "Confirma CNPJ, razão social e situação cadastral informada.",
    reviewCheck: "Cartão do CNPJ confere com o cadastro",
  },
  {
    id: "creci",
    label: "Comprovante do CRECI PJ",
    purpose: "Comprova a inscrição profissional da imobiliária no conselho.",
    reviewCheck: "Comprovante do CRECI PJ confere com o cadastro",
  },
  {
    id: "address",
    label: "Comprovante de endereço",
    purpose: "Confirma o endereço comercial usado na análise cadastral.",
    reviewCheck: "Comprovante de endereço confere com o cadastro",
  },
] as const;

export type AgencyRegistrationDocumentId = (typeof agencyRegistrationDocuments)[number]["id"];
export type AgencyRegistrationDocumentFiles = Record<AgencyRegistrationDocumentId, File[]>;

export const agencyDocumentAccept = ".pdf,.png,.jpg,.jpeg";
export const agencyDocumentHint = "PDF, PNG ou JPG, até 10 MB.";
export const agencyCreciPublicSearchUrl = "https://crecimg.spiderware.com.br/spw/consultacadastral/TelaConsultaPublicaCompleta.aspx";

export interface AgencyResponsibleOption extends ComboboxOption {
  email: string;
  phone: string;
  creci: string;
}

export const agencyResponsibleOptions = [
  {
    value: "ana-lima",
    label: "Ana Lima",
    avatar: { name: "Ana Lima" },
    description: "CRECI 44.910-MG · perfil aprovado",
    email: "ana.lima@domuz.app",
    phone: "(31) 98888-4401",
    creci: "44.910-MG",
  },
  {
    value: "marcos-silva",
    label: "Marcos Silva",
    avatar: { name: "Marcos Silva" },
    description: "CRECI 21.877-MG · perfil aprovado",
    email: "marcos.silva@domuz.app",
    phone: "(31) 97777-2187",
    creci: "21.877-MG",
  },
  {
    value: "renata-costa",
    label: "Renata Costa",
    avatar: { name: "Renata Costa" },
    description: "CRECI 40.203-MG · verificação em análise",
    email: "renata.costa@domuz.app",
    phone: "(31) 96666-4020",
    creci: "40.203-MG",
  },
] as const satisfies readonly AgencyResponsibleOption[];

export const brazilStateCodes = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO",
  "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR",
  "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
] as const;

export async function lookupBrazilianPostalCode(postalCode: string) {
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${postalCode}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("postal-code-lookup-failed");
  const address = await response.json() as {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
  };
  return {
    postalCode: address.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2"),
    street: address.street,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
  };
}

export async function lookupBrazilianCompany(cnpj: string) {
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits(cnpj)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("company-lookup-failed");
  const company = await response.json() as {
    razao_social: string;
    nome_fantasia?: string;
    descricao_situacao_cadastral: string;
  };
  return {
    legalName: company.razao_social,
    displayName: company.nome_fantasia ?? "",
    status: company.descricao_situacao_cadastral,
  };
}

export function createAgencyRegistrationState(value = false) {
  return Object.fromEntries(
    agencyRegistrationSections.map((section) => [section.id, value]),
  ) as Record<AgencyRegistrationSectionId, boolean>;
}

export function createAgencyDocumentFiles() {
  return agencyRegistrationDocuments.reduce(
    (files, document) => ({ ...files, [document.id]: [] }),
    {} as AgencyRegistrationDocumentFiles,
  );
}

export interface AgencyRegistrationDraft {
  form: AgencyRegistrationData;
  saved: Record<AgencyRegistrationSectionId, boolean>;
  responsibleMode: "existing" | "invite";
  selectedResponsible: string | null;
  responsibleIsOwner: boolean;
}

const agencyDraftKey = "domuz:backoffice:agency-registration";
const agencyDocumentDatabase = "domuz-agency-registration";
const agencyDocumentStore = "draft";

export function loadAgencyRegistrationDraft() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(agencyDraftKey);
    return value ? JSON.parse(value) as AgencyRegistrationDraft : null;
  } catch {
    return null;
  }
}

export function saveAgencyRegistrationDraft(draft: AgencyRegistrationDraft) {
  try {
    window.localStorage.setItem(agencyDraftKey, JSON.stringify(draft));
  } catch {
    // O cadastro continua funcionando quando o navegador bloqueia armazenamento local.
  }
}

function openAgencyDocumentDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(agencyDocumentDatabase, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(agencyDocumentStore);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAgencyDocumentDraft() {
  if (typeof window === "undefined" || !window.indexedDB) return createAgencyDocumentFiles();
  try {
    const database = await openAgencyDocumentDatabase();
    return await new Promise<AgencyRegistrationDocumentFiles>((resolve) => {
      const transaction = database.transaction(agencyDocumentStore);
      const request = transaction.objectStore(agencyDocumentStore).get("files");
      request.onsuccess = () => resolve(request.result ?? createAgencyDocumentFiles());
      request.onerror = () => resolve(createAgencyDocumentFiles());
      transaction.oncomplete = () => database.close();
    });
  } catch {
    return createAgencyDocumentFiles();
  }
}

export async function saveAgencyDocumentDraft(files: AgencyRegistrationDocumentFiles) {
  if (!window.indexedDB) return;
  const database = await openAgencyDocumentDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(agencyDocumentStore, "readwrite").objectStore(agencyDocumentStore).put(files, "files");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  database.close();
}

export async function clearAgencyRegistrationDraft() {
  window.localStorage.removeItem(agencyDraftKey);
  if (!window.indexedDB) return;
  const database = await openAgencyDocumentDatabase();
  await new Promise<void>((resolve) => {
    const request = database.transaction(agencyDocumentStore, "readwrite").objectStore(agencyDocumentStore).delete("files");
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
  });
  database.close();
}

const digits = (value: string) => value.replace(/\D/g, "");

export function formatCnpj(value: string) {
  return digits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatAgencyCreci(value: string) {
  const number = digits(value).slice(0, 6);
  const hasCompanySuffix = value.toUpperCase().includes("J");
  return number ? `${number}${hasCompanySuffix ? "-J" : ""}` : "";
}

export function isValidCnpj(value: string) {
  const number = digits(value);
  if (number.length !== 14 || /^(\d)\1+$/.test(number)) return false;

  const check = (length: number) => {
    let factor = length - 7;
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(number[index]) * factor--;
      if (factor < 2) factor = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return check(12) === Number(number[12]) && check(13) === Number(number[13]);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasBrazilianPhone(value: string) {
  const length = digits(value).length;
  return length === 10 || length === 11;
}

export function validateAgencyRegistrationSection(
  sectionId: Exclude<AgencyRegistrationSectionId, "documentos">,
  data: AgencyRegistrationData,
) {
  const errors: AgencyRegistrationErrors = {};
  agencyRegistrationSectionById[sectionId].requiredFields.forEach((field) => {
    if (!data[field].trim()) errors[field] = "Preencha este campo.";
  });

  if (sectionId === "empresa") {
    if (data.cnpj && !isValidCnpj(data.cnpj)) errors.cnpj = "Informe um CNPJ válido.";
    if (data.creci && !/^\d{4,6}-J$/.test(data.creci)) errors.creci = "Informe o CRECI PJ no formato 00000-J.";
    if (data.razaoSocial && data.razaoSocial.trim().length < 3) errors.razaoSocial = "Informe a razão social completa.";
    if (data.nome && data.nome.trim().length < 2) errors.nome = "Informe o nome de exibição.";
    if (data.site && !hasHttpUrl(data.site)) errors.site = "Informe o endereço completo, começando por http:// ou https://.";
  }
  if (sectionId === "contato") {
    if (data.email && !isValidEmail(data.email)) errors.email = "Informe um e-mail válido.";
    if (data.telefone && !hasBrazilianPhone(data.telefone)) errors.telefone = "Informe o telefone com DDD.";
    if (data.cep && digits(data.cep).length !== 8) errors.cep = "Informe um CEP com 8 números.";
    if (data.logradouro.length > 160) errors.logradouro = "Use até 160 caracteres.";
    if (data.numero.length > 20) errors.numero = "Use até 20 caracteres.";
    if (data.complemento.length > 80) errors.complemento = "Use até 80 caracteres.";
    if (data.bairro.length > 80) errors.bairro = "Use até 80 caracteres.";
    if (data.cidade.length > 100) errors.cidade = "Use até 100 caracteres.";
  }
  if (sectionId === "responsavel") {
    if (data.responsavel && data.responsavel.trim().length < 3) errors.responsavel = "Informe o nome completo.";
    if (data.emailResponsavel && !isValidEmail(data.emailResponsavel)) errors.emailResponsavel = "Informe um e-mail válido.";
    if (data.telefoneResponsavel && !hasBrazilianPhone(data.telefoneResponsavel)) errors.telefoneResponsavel = "Informe o celular com DDD.";
  }
  return errors;
}
