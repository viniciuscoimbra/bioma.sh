import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { Combobox } from "../components/Combobox";
import { FileUpload, type FileUploadState } from "../components/FileUpload";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";
import { PhoneInput } from "../components/PhoneInput";
import { PostalCodeInput } from "../components/PostalCodeInput";
import { SectionHeader } from "../components/SectionHeader";
import { Segmented } from "../components/Segmented";
import { Select } from "../components/Select";
import { SettingRow, SettingRowGroup } from "../components/SettingRow";
import { StickyFooter } from "../components/StickyFooter";
import { Tabs } from "../components/Tabs";
import { ToastRegion, type ToastData } from "../components/Toast";
import { agencyIndexStoryId, backofficeSidebar, openStory } from "./BackofficeAgencies";
import { BackofficeShell } from "./BackofficeShell";
import {
  agencyDocumentAccept,
  agencyDocumentHint,
  agencyCreciPublicSearchUrl,
  agencyRegistrationDocuments,
  agencyRegistrationSectionById,
  agencyRegistrationSections,
  agencyResponsibleOptions,
  brazilStateCodes,
  clearAgencyRegistrationDraft,
  createAgencyDocumentFiles,
  createAgencyRegistrationState,
  emptyAgencyRegistration,
  formatAgencyCreci,
  formatCnpj,
  isValidCnpj,
  loadAgencyDocumentDraft,
  loadAgencyRegistrationDraft,
  lookupBrazilianCompany,
  lookupBrazilianPostalCode,
  saveAgencyDocumentDraft,
  saveAgencyRegistrationDraft,
  validateAgencyRegistrationSection,
  type AgencyRegistrationData,
  type AgencyRegistrationDocumentId,
  type AgencyRegistrationErrors,
  type AgencyRegistrationSectionId,
} from "./agencyRegistrationConfig";
import styles from "./BackofficeAgencyCreate.module.css";

type ResponsibleMode = "existing" | "invite";
type CompanyLookupState = {
  status: "idle" | "loading" | "success" | "error";
  cnpj?: string;
  legalName?: string;
  registrationStatus?: string;
};
const unlockedPostalAddress = { logradouro: false, bairro: false, cidade: false, uf: false };

export function BackofficeAgencyCreate() {
  const [activeTab, setActiveTab] = useState<AgencyRegistrationSectionId>("empresa");
  const [form, setForm] = useState(emptyAgencyRegistration);
  const [documentFiles, setDocumentFiles] = useState(createAgencyDocumentFiles);
  const [documentUploadStates, setDocumentUploadStates] = useState<Partial<Record<AgencyRegistrationDocumentId, FileUploadState>>>({});
  const [errors, setErrors] = useState<AgencyRegistrationErrors>({});
  const [documentErrors, setDocumentErrors] = useState<Partial<Record<AgencyRegistrationDocumentId, string>>>({});
  const [saved, setSaved] = useState(createAgencyRegistrationState);
  const [attempted, setAttempted] = useState(createAgencyRegistrationState);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastSequence = useRef(0);
  const [responsibleMode, setResponsibleMode] = useState<ResponsibleMode>("existing");
  const [selectedResponsible, setSelectedResponsible] = useState<string | null>(null);
  const [responsibleIsOwner, setResponsibleIsOwner] = useState(false);
  const [created, setCreated] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [postalAddressLocked, setPostalAddressLocked] = useState(unlockedPostalAddress);
  const [companyLookup, setCompanyLookup] = useState<CompanyLookupState>({ status: "idle" });
  const [draftReady, setDraftReady] = useState(false);
  const savedCount = Object.values(saved).filter(Boolean).length;
  const sectionCount = agencyRegistrationSections.length;
  const readyToCreate = savedCount === sectionCount;
  const tabs = agencyRegistrationSections.map((section) => ({
    id: section.id,
    label: section.label,
    status: saved[section.id]
      ? "complete" as const
      : section.id === "documentos"
        ? Object.values(documentErrors).some(Boolean) ? "warning" as const : undefined
        : section.fields.some((field) => errors[field]) ? "warning" as const : undefined,
  }));

  useEffect(() => {
    const draft = loadAgencyRegistrationDraft();
    if (draft) {
      setForm({ ...emptyAgencyRegistration, ...draft.form });
      setSaved({ ...createAgencyRegistrationState(), ...draft.saved });
      setResponsibleMode(draft.responsibleMode);
      setSelectedResponsible(draft.selectedResponsible);
      setResponsibleIsOwner(draft.responsibleIsOwner);
    }

    void loadAgencyDocumentDraft().then((files) => {
      setDocumentFiles(files);
      setDocumentUploadStates(Object.fromEntries(
        agencyRegistrationDocuments
          .filter(({ id }) => files[id].length)
          .map(({ id }) => [id, "success"]),
      ));
      setDraftReady(true);
    });
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    saveAgencyRegistrationDraft({
      form,
      saved,
      responsibleMode,
      selectedResponsible,
      responsibleIsOwner,
    });
  }, [draftReady, form, responsibleIsOwner, responsibleMode, saved, selectedResponsible]);

  useEffect(() => {
    if (!draftReady) return;
    void saveAgencyDocumentDraft(documentFiles).catch(() => {
      showToast("Não foi possível guardar os arquivos", "danger", "Mantenha esta página aberta e tente anexar novamente.");
    });
  }, [documentFiles, draftReady]);

  function showToast(title: string, tone: ToastData["tone"], description?: string) {
    toastSequence.current += 1;
    setToasts([{ id: `agency-registration-${toastSequence.current}`, title, tone, description }]);
  }

  function replaceSectionErrors(
    sectionId: Exclude<AgencyRegistrationSectionId, "documentos">,
    nextErrors: AgencyRegistrationErrors,
  ) {
    const fields = agencyRegistrationSectionById[sectionId].fields;
    setErrors((current) => {
      const next = { ...current };
      fields.forEach((field) => delete next[field]);
      return { ...next, ...nextErrors };
    });
  }

  function keepValidatedSectionCurrent(
    sectionId: Exclude<AgencyRegistrationSectionId, "documentos">,
    nextForm: AgencyRegistrationData,
  ) {
    if (attempted[sectionId]) {
      replaceSectionErrors(sectionId, validateAgencyRegistrationSection(sectionId, nextForm));
    }
  }

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const key = event.target.name as keyof AgencyRegistrationData;
    const value = key === "cnpj"
      ? formatCnpj(event.target.value)
      : key === "creci"
        ? formatAgencyCreci(event.target.value)
        : event.target.value;
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);
    if (key === "cnpj") setCompanyLookup({ status: "idle" });
    const section = agencyRegistrationSections.find(({ fields }) =>
      (fields as readonly (keyof AgencyRegistrationData)[]).includes(key),
    );
    if (section && section.id !== "documentos") {
      if (attempted[section.id]) keepValidatedSectionCurrent(section.id, nextForm);
      else setErrors((current) => ({ ...current, [key]: undefined }));
      setSaved((current) => ({ ...current, [section.id]: false }));
    }
  }

  async function consultCompany(cnpj = form.cnpj) {
    if (!isValidCnpj(cnpj)) return null;
    const formattedCnpj = formatCnpj(cnpj);
    setCompanyLookup({ status: "loading", cnpj: formattedCnpj });
    try {
      const company = await lookupBrazilianCompany(formattedCnpj);
      if (!company) {
        setCompanyLookup({ status: "error", cnpj: formattedCnpj });
        setErrors((current) => ({ ...current, cnpj: "CNPJ não encontrado na base pública." }));
        showToast("CNPJ não encontrado", "danger", "Confira os números e tente novamente.");
        return null;
      }
      if (company.status.toLocaleUpperCase("pt-BR") !== "ATIVA") {
        setCompanyLookup({
          status: "error",
          cnpj: formattedCnpj,
          legalName: company.legalName,
          registrationStatus: company.status,
        });
        setErrors((current) => ({ ...current, cnpj: `Este CNPJ está ${company.status.toLocaleLowerCase("pt-BR")}.` }));
        showToast("CNPJ sem situação ativa", "danger", "Confira a situação cadastral antes de continuar.");
        return null;
      }

      const nextForm = {
        ...form,
        cnpj: formattedCnpj,
        razaoSocial: company.legalName,
        nome: form.nome || company.displayName,
      };
      setForm(nextForm);
      setErrors((current) => ({ ...current, cnpj: undefined, razaoSocial: undefined }));
      setCompanyLookup({
        status: "success",
        cnpj: formattedCnpj,
        legalName: company.legalName,
        registrationStatus: company.status,
      });
      return nextForm;
    } catch {
      setCompanyLookup({ status: "error", cnpj: formattedCnpj });
      showToast("Não foi possível consultar o CNPJ", "danger", "Tente novamente em alguns instantes.");
      return null;
    }
  }

  function updatePostalCode(event: ChangeEvent<HTMLInputElement>) {
    const nextForm = {
      ...form,
      cep: event.target.value,
      logradouro: "",
      bairro: "",
      cidade: "",
      uf: "",
    };
    setPostalAddressLocked(unlockedPostalAddress);
    setForm(nextForm);
    if (attempted.contato) keepValidatedSectionCurrent("contato", nextForm);
    else replaceSectionErrors("contato", {});
    setSaved((current) => ({ ...current, contato: false }));
  }

  async function saveSection(section: AgencyRegistrationSectionId) {
    setAttempted((current) => ({ ...current, [section]: true }));
    if (section === "documentos") {
      const missing = agencyRegistrationDocuments.filter(({ id }) => documentFiles[id].length === 0);
      setDocumentErrors(Object.fromEntries(missing.map(({ id }) => [id, "Adicione este documento antes de salvar."])));
      if (missing.length) {
        showToast("Revise os documentos", "danger", "Adicione os arquivos indicados antes de salvar.");
        return;
      }
    } else {
      let data = form;
      if (section === "empresa" && isValidCnpj(form.cnpj) && companyLookup.cnpj !== form.cnpj) {
        const companyData = await consultCompany();
        if (!companyData) return;
        data = companyData;
      }
      const next = validateAgencyRegistrationSection(section, data);
      replaceSectionErrors(section, next);
      if (Object.keys(next).length) {
        showToast("Revise os campos destacados", "danger", "Corrija os dados desta parte antes de salvar.");
        return;
      }
    }
    setSaved((current) => ({ ...current, [section]: true }));
    showToast(agencyRegistrationSectionById[section].savedFeedback, "success");
  }

  function changeResponsibleMode(mode: ResponsibleMode) {
    setResponsibleMode(mode);
    setSelectedResponsible(null);
    const nextForm = {
      ...form,
      responsavel: "",
      creciResponsavel: "",
      emailResponsavel: "",
      telefoneResponsavel: "",
    };
    setForm(nextForm);
    if (attempted.responsavel) keepValidatedSectionCurrent("responsavel", nextForm);
    else replaceSectionErrors("responsavel", {});
    setSaved((current) => ({ ...current, responsavel: false }));
  }

  function selectResponsible(value: string | null) {
    setSelectedResponsible(value);
    const person = agencyResponsibleOptions.find((option) => option.value === value);
    const nextForm = {
      ...form,
      responsavel: person?.label ?? "",
      creciResponsavel: person?.creci ?? "",
      emailResponsavel: person?.email ?? "",
      telefoneResponsavel: person?.phone ?? "",
    };
    setForm(nextForm);
    if (attempted.responsavel) keepValidatedSectionCurrent("responsavel", nextForm);
    else replaceSectionErrors("responsavel", {});
    setSaved((current) => ({ ...current, responsavel: false }));
  }

  function backToAgencies() {
    openStory(agencyIndexStoryId);
  }

  function finishRegistration() {
    void clearAgencyRegistrationDraft();
    setCreated(true);
  }

  const field = (key: keyof AgencyRegistrationData) => ({
    name: key,
    value: form[key],
    onChange: update,
    error: errors[key],
  });

  return (
    <BackofficeShell
      sidebar={backofficeSidebar}
      crumbs={[
        { label: "Plataforma" },
        { label: "Imobiliárias", onClick: backToAgencies },
        { label: "Cadastrar imobiliária" },
      ]}
    >
      <div className={styles.page}>
        {created ? (
          <>
            <PageHeader
              className={styles.pageHeader}
              eyebrow="Cadastro concluído"
              title={form.nome}
              lead="O cadastro foi criado e está aguardando análise. A operação continua bloqueada."
              actions={<Button size="sm" onClick={backToAgencies}>Voltar para imobiliárias</Button>}
            />
            <div className={styles.statuses} aria-label="Situação da imobiliária">
              <Badge tone="warn" dot>Cadastro pendente</Badge>
              <Badge tone="neutral" dot>Operação inativa</Badge>
            </div>
            <Callout tone="info" title="O acesso continua bloqueado">
              A equipe do Backoffice precisa analisar os dados e aprovar a imobiliária antes da ativação.
            </Callout>
            <section className={styles.section} aria-labelledby="next-step">
              <SectionHeader
                id="next-step"
                title={responsibleMode === "invite" ? "Convidar responsável" : "Pedir aceite da responsabilidade"}
                sub="O envio fica registrado no cadastro da imobiliária."
              />
              <Card padding="none">
                <SettingRowGroup aria-label="Convite do administrador inicial">
                  <SettingRow
                    title={form.responsavel}
                    description={form.emailResponsavel}
                    meta={`${responsibleIsOwner ? "Dono e responsável inicial" : "Corretor responsável inicial"} · ${form.creciResponsavel || "Perfil profissional pendente"}`}
                    actions={<Badge tone={inviteSent ? "success" : "warn"}>{inviteSent ? (responsibleMode === "invite" ? "Convite enviado" : "Pedido enviado") : "Pronto para enviar"}</Badge>}
                  />
                </SettingRowGroup>
              </Card>
              {!inviteSent && (
                <div className={styles.inlineActions}>
                  <Button variant="primary" onClick={() => setInviteSent(true)}>
                    {responsibleMode === "invite" ? "Enviar convite" : "Enviar pedido de aceite"}
                  </Button>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <PageHeader
              className={styles.pageHeader}
              eyebrow={form.nome ? "Cadastro da imobiliária" : undefined}
              title={form.nome || "Cadastrar imobiliária"}
              lead="Cada parte é salva separadamente. Enquanto você preenche, o rascunho fica neste navegador. Quando todas estiverem concluídas, você cria a imobiliária para análise."
            />
            <Tabs items={tabs} value={activeTab} onChange={(id) => setActiveTab(id as AgencyRegistrationSectionId)} />

            <form onSubmit={(event) => event.preventDefault()} noValidate>
              {activeTab === "empresa" && (
                <Card className={styles.formCard}>
                  <SectionHeader
                    title="Dados da empresa"
                    sub="Use os dados que constam nos registros oficiais da imobiliária."
                    action={saved.empresa ? <Badge tone="success">Salvo</Badge> : undefined}
                  />
                  <div className={styles.grid}>
                    <Input
                      label="CNPJ"
                      placeholder="00.000.000/0000-00"
                      inputMode="numeric"
                      maxLength={18}
                      autoComplete="off"
                      hint={companyLookup.status === "loading"
                        ? "Consultando a base pública do CNPJ."
                        : companyLookup.status === "success"
                          ? `${companyLookup.legalName} · situação ${companyLookup.registrationStatus?.toLocaleLowerCase("pt-BR")}`
                          : undefined}
                      onBlur={(event) => {
                        if (isValidCnpj(event.currentTarget.value) && companyLookup.cnpj !== event.currentTarget.value) {
                          void consultCompany(event.currentTarget.value);
                        }
                      }}
                      {...field("cnpj")}
                    />
                    <Input label="CRECI Pessoa Jurídica" placeholder="00000-J" inputMode="text" maxLength={8} autoComplete="off" {...field("creci")} />
                    <Input label="Razão social" maxLength={160} autoComplete="organization" {...field("razaoSocial")} />
                    <Input label="Nome de exibição" maxLength={80} hint="É assim que a imobiliária aparece na plataforma." {...field("nome")} />
                    <Input className={styles.full} label="Site" type="url" maxLength={200} placeholder="https://" {...field("site")} />
                    <Callout
                      className={styles.full}
                      tone="info"
                      title="Consulta do CRECI"
                      action={<Button type="button" size="sm" onClick={() => window.open(agencyCreciPublicSearchUrl, "_blank", "noopener,noreferrer")}>Abrir consulta oficial</Button>}
                    >
                      O CRECI-MG exige uma verificação na página do conselho. Confira o número e o nome da imobiliária antes de salvar.
                    </Callout>
                  </div>
                </Card>
              )}

              {activeTab === "contato" && (
                <Card className={styles.formCard}>
                  <SectionHeader
                    title="Endereço e contato"
                    sub="Estes dados serão usados na análise e nas comunicações administrativas."
                    action={saved.contato ? <Badge tone="success">Salvo</Badge> : undefined}
                  />
                  <div className={styles.grid}>
                    <Input label="E-mail da imobiliária" type="email" maxLength={254} autoComplete="email" {...field("email")} />
                    <PhoneInput label="Telefone da imobiliária" autoComplete="tel" {...field("telefone")} />
                    <PostalCodeInput
                      name="cep"
                      value={form.cep}
                      error={errors.cep}
                      onChange={updatePostalCode}
                      lookup={lookupBrazilianPostalCode}
                      onAddressFound={(address) => {
                        const nextForm = {
                          ...form,
                          cep: address.postalCode,
                          logradouro: address.street,
                          bairro: address.neighborhood,
                          cidade: address.city,
                          uf: address.state,
                        };
                        setForm(nextForm);
                        if (attempted.contato) keepValidatedSectionCurrent("contato", nextForm);
                        else replaceSectionErrors("contato", {});
                        setPostalAddressLocked({
                          logradouro: Boolean(address.street),
                          bairro: Boolean(address.neighborhood),
                          cidade: Boolean(address.city),
                          uf: Boolean(address.state),
                        });
                        setSaved((current) => ({ ...current, contato: false }));
                      }}
                    />
                    <Input label="Logradouro" maxLength={160} autoComplete="address-line1" disabled={postalAddressLocked.logradouro} {...field("logradouro")} />
                    <Input label="Número" maxLength={20} {...field("numero")} />
                    <Input label="Complemento" maxLength={80} autoComplete="address-line2" {...field("complemento")} />
                    <Input label="Bairro" maxLength={80} disabled={postalAddressLocked.bairro} {...field("bairro")} />
                    <Input label="Cidade" maxLength={100} autoComplete="address-level2" disabled={postalAddressLocked.cidade} {...field("cidade")} />
                    <Select label="Estado" autoComplete="address-level1" disabled={postalAddressLocked.uf} {...field("uf")}>
                      <option value="">Selecione</option>
                      {brazilStateCodes.map((uf) => <option key={uf}>{uf}</option>)}
                    </Select>
                  </div>
                </Card>
              )}

              {activeTab === "responsavel" && (
                <Card className={styles.formCard}>
                  <SectionHeader
                    title="Corretor responsável inicial"
                    sub="Escolha um corretor da plataforma ou convide uma pessoa. A responsabilidade só é confirmada depois do aceite."
                    action={saved.responsavel ? <Badge tone="success">Salvo</Badge> : undefined}
                  />
                  <Segmented
                    label="Como identificar o responsável"
                    value={responsibleMode}
                    onChange={(value) => changeResponsibleMode(value as ResponsibleMode)}
                    options={[
                      { value: "existing", label: "Corretor na plataforma" },
                      { value: "invite", label: "Convidar corretor" },
                    ]}
                  />
                  {responsibleMode === "existing" ? (
                    <Combobox
                      label="Corretor responsável"
                      placeholder="Buscar por nome ou CRECI"
                      options={[...agencyResponsibleOptions]}
                      value={selectedResponsible}
                      onChange={(option) => selectResponsible(option?.value ?? null)}
                      filter={(option, query) => `${option.label} ${option.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))}
                      error={errors.responsavel}
                      hint="O CRECI e a situação profissional vêm do cadastro do corretor."
                    />
                  ) : (
                    <div className={styles.grid}>
                      <Input className={styles.full} label="Nome completo" maxLength={120} autoComplete="name" {...field("responsavel")} />
                      <Input label="E-mail" type="email" maxLength={254} autoComplete="email" {...field("emailResponsavel")} />
                      <PhoneInput label="Celular" autoComplete="tel" {...field("telefoneResponsavel")} />
                    </div>
                  )}
                  <Checkbox
                    boxed
                    checked={responsibleIsOwner}
                    onChange={(event) => {
                      setResponsibleIsOwner(event.target.checked);
                      setSaved((current) => ({ ...current, responsavel: false }));
                    }}
                    label="Esta pessoa é dona da imobiliária"
                  />
                  {(selectedResponsible || (responsibleMode === "invite" && form.responsavel)) && (
                    <Callout tone="info" title={responsibleIsOwner ? "Dono e responsável inicial" : "Corretor responsável inicial"}>
                      {responsibleMode === "existing"
                        ? `${form.responsavel} mantém a situação atual do perfil profissional e recebe o pedido de aceite depois que a imobiliária for criada.`
                        : `${form.responsavel} fica identificado no cadastro mesmo sem conta. O convite e o pedido de aceite serão enviados depois que a imobiliária for criada.`}
                    </Callout>
                  )}
                </Card>
              )}

              {activeTab === "documentos" && (
                <Card className={styles.formCard}>
                  <SectionHeader
                    title="Documentos para análise"
                    sub="Anexe um arquivo por exigência. A equipe confere cada item antes de liberar a operação."
                    action={saved.documentos ? <Badge tone="success">Salvo</Badge> : undefined}
                  />
                  <div className={styles.documents}>
                    {agencyRegistrationDocuments.map((document) => (
                      <section key={document.id} className={styles.documentRequirement} aria-labelledby={`document-${document.id}`}>
                        <div className={styles.documentRequirementHeader}>
                          <div>
                            <strong id={`document-${document.id}`}>{document.label}</strong>
                            <span>Finalidade: {document.purpose}</span>
                            <span>Conferência na análise: {document.reviewCheck}.</span>
                          </div>
                          <Badge tone="neutral">Obrigatório</Badge>
                        </div>
                        <FileUpload
                          files={documentFiles[document.id]}
                          onFilesChange={(next) => {
                            setDocumentFiles((current) => ({ ...current, [document.id]: next }));
                            setDocumentUploadStates((current) => ({ ...current, [document.id]: next.length ? "uploading" : "idle" }));
                            if (next.length) {
                              window.setTimeout(() => {
                                setDocumentUploadStates((current) => ({ ...current, [document.id]: "success" }));
                              }, 900);
                            }
                            setDocumentErrors((current) => ({ ...current, [document.id]: undefined }));
                            setSaved((current) => ({ ...current, documentos: false }));
                          }}
                          state={documentUploadStates[document.id]}
                          accept={agencyDocumentAccept}
                          label={`Anexar ${document.label[0].toLocaleLowerCase("pt-BR")}${document.label.slice(1)}`}
                          hint={agencyDocumentHint}
                          errorMessage={documentErrors[document.id]}
                        />
                      </section>
                    ))}
                  </div>
                </Card>
              )}

              <StickyFooter
                position="fixed"
                start={<Badge tone={readyToCreate || saved[activeTab] ? "success" : "neutral"}>
                  {readyToCreate ? "Cadastro pronto" : saved[activeTab] ? "Parte salva" : "Rascunho neste navegador"}
                </Badge>}
              >
                <Button type="button" variant="ghost" onClick={backToAgencies}>Cancelar</Button>
                {readyToCreate
                  ? <Button type="button" variant="primary" onClick={finishRegistration}>Criar imobiliária</Button>
                  : <Button type="button" variant="primary" disabled={saved[activeTab]} onClick={() => void saveSection(activeTab)}>
                      Salvar {agencyRegistrationSectionById[activeTab].saveLabel}
                    </Button>}
              </StickyFooter>
            </form>
          </>
        )}
      </div>
      <ToastRegion
        position="top-right"
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </BackofficeShell>
  );
}
