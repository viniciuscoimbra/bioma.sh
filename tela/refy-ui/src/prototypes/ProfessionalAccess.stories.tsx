import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "../components/Badge";
import { BrandLogo } from "../components/BrandLogo";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { ChoiceCard, ChoiceCardGroup } from "../components/ChoiceCard";
import { Divider } from "../components/Divider";
import { FileUpload } from "../components/FileUpload";
import { GoogleButton } from "../components/GoogleButton";
import { Input } from "../components/Input";
import { Otp } from "../components/Otp";
import { Select } from "../components/Select";
import { WizardStepper } from "../components/WizardStepper";
import city from "./assets/e01-context-city-transparent.png";
import agencyIllustration from "./assets/personas/agency-operation-v1.png";
import brokerIllustration from "./assets/personas/broker-journey-v1.png";
import clientIllustration from "./assets/personas/client-search-v1.png";
import backofficeIllustration from "./assets/personas/dommus-backoffice-v1.png";
import { validationViewports } from "./productValidationFixtures";
import styles from "./ProfessionalAccess.module.css";

export type Screen =
  | "gateway"
  | "gateway-broker"
  | "agency-login"
  | "broker-login"
  | "signup"
  | "broker-signup"
  | "signup-error"
  | "verify-email"
  | "verify-phone"
  | "forgot-password"
  | "new-password"
  | "client-login"
  | "client-signup"
  | "client-start"
  | "platform-login"
  | "platform-otp"
  | "platform-unauthorized"
  | "agency-kyp"
  | "agency-review"
  | "broker-profile"
  | "broker-mode"
  | "broker-pending"
  | "agency-request";

export type ProfessionalAccessProps = { screen: Screen };

export const desktop = { viewport: { defaultViewport: "desktop1440" } };
export const mobile = { viewport: { defaultViewport: "mobile390" } };

function Icon({ name }: { name: "building" | "broker" | "mail" | "lock" | "clock" }) {
  const path = {
    building: <><path d="M4 21V5l8-3 8 3v16" /><path d="M9 21v-4h6v4M8 8h2m4 0h2m-8 4h2m4 0h2" /></>,
    broker: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.3 3.4-6.5 8-6.5s7.2 2.2 8 6.5M9 3h6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  }[name];
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{path}</svg>;
}

function Frame({ children, illustrated = false, illustration = city, illustrationAlt = "Bairro conectado pela Domuz.app", illustrationWidth = 1021, illustrationHeight = 1155, illustrationOverlay, wide = false, back = "Voltar" }: { children: React.ReactNode; illustrated?: boolean; illustration?: string; illustrationAlt?: string; illustrationWidth?: number; illustrationHeight?: number; illustrationOverlay?: React.ReactNode; wide?: boolean; back?: string | null }) {
  return (
    <main className={`${styles.page} ${illustrated ? styles.illustratedPage : ""}`}>
      <header className={styles.topbar}>
        <BrandLogo brand="dommus" size="sm" animated={false} />
        {back && <Button variant="secondary">{back}</Button>}
      </header>
      <div className={`${styles.shell} ${wide ? styles.wide : illustrated ? styles.split : styles.centered}`}>
        <section className={styles.content}>{children}</section>
        {illustrated && (
          <aside className={styles.visual} aria-label={illustrationAlt}>
            <img src={illustration} width={illustrationWidth} height={illustrationHeight} alt={illustrationAlt} />
            {illustrationOverlay}
          </aside>
        )}
      </div>
    </main>
  );
}

function Header({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className={styles.intro}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {text && <p className={styles.description}>{text}</p>}
    </div>
  );
}

function FormHeader({ title, text }: { title: string; text?: string }) {
  return <div className={styles.formHeader}><h1 className={styles.formTitle}>{title}</h1>{text && <p className={styles.formText}>{text}</p>}</div>;
}

function Credentials({ submit = "Entrar", email = "nome@empresa.com.br" }: { submit?: string; email?: string }) {
  return (
    <>
      <div className={styles.fields}>
        <Input label="E-mail" type="email" name="email" autoComplete="email" defaultValue={email} />
        <Input label="Senha" type="password" name="password" autoComplete="current-password" defaultValue="Domuz!2026" />
      </div>
      <div className={styles.inlineAction}><Button variant="ghost" size="sm">Esqueci minha senha</Button></div>
      <Button variant="primary" block>{submit}</Button>
    </>
  );
}

function Gateway({ broker = false }: { broker?: boolean }) {
  const [role, setRole] = useState(broker ? "broker" : "agency");
  const cta = role === "broker" ? "Continuar como corretor" : "Continuar como imobiliária";

  return (
    <Frame illustrated back={null}>
      <Header
        title="Escolha seu acesso profissional."
        text="Comece pela imobiliária ou pelo corretor. A próxima tela segue esse caminho."
      />
      <ChoiceCardGroup className={styles.gatewayChoices} label="Tipo de acesso profissional" columns={2} value={role} onChange={(value) => setRole(String(value))}>
        <ChoiceCard value="agency" icon={<Icon name="building" />} title="Imobiliária" description="Administrar a empresa e sua equipe." />
        <ChoiceCard value="broker" icon={<Icon name="broker" />} title="Corretor" description="Usar sua operação pessoal ou pedir vínculo a uma imobiliária." />
      </ChoiceCardGroup>
      <Button variant="primary">{cta}</Button>
    </Frame>
  );
}

function ProfessionalLogin({ broker = false }: { broker?: boolean }) {
  const role = broker ? "corretor" : "imobiliária";
  return (
    <Frame
      illustrated
      illustration={broker ? brokerIllustration : agencyIllustration}
      illustrationAlt={broker ? "Corretor acompanhando clientes da conversa à entrega das chaves" : "Equipe de uma imobiliária coordenando sua carteira de imóveis"}
      illustrationWidth={1024}
      illustrationHeight={1536}
      back="Trocar tipo de acesso"
    >
      <Header eyebrow={broker ? "Corretor" : "Imobiliária"} title={`Entre como ${role}.`} text="Use a conta já cadastrada para este acesso." />
      <Card className={styles.form} elevation={1}>
        <FormHeader title="E-mail e senha" />
        <Credentials />
        <p className={styles.legal}>Depois da senha, confirmaremos a entrada pelo celular cadastrado.</p>
        <div className={styles.securityNote}><Callout tone="note" title="Conta Google">Depois de entrar, você poderá conectar sua conta Google como método adicional.</Callout></div>
      </Card>
      <Button variant="ghost">Ainda não tenho conta</Button>
    </Frame>
  );
}

function Signup({ broker = false, invalid = false }: { broker?: boolean; invalid?: boolean }) {
  return (
    <Frame
      illustrated
      illustration={broker ? brokerIllustration : agencyIllustration}
      illustrationAlt={broker ? "Corretor acompanhando clientes da conversa à entrega das chaves" : "Equipe de uma imobiliária coordenando sua carteira de imóveis"}
      illustrationWidth={1024}
      illustrationHeight={1536}
      back="Voltar para entrar"
    >
      <Header
        title={broker ? "Crie seu acesso de corretor." : "Crie seu acesso de imobiliária."}
        text={broker ? "Você confirma o e-mail e o celular antes de informar seu CRECI e escolher como vai atuar." : "Você confirma o e-mail e o celular antes de enviar os dados da imobiliária para análise."}
      />
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Seus dados" text="Use qualquer endereço de e-mail." />
        <GoogleButton block>Criar conta com Google</GoogleButton>
        <Divider label="ou use seu e-mail" spacing="none" />
        <div className={styles.fieldGrid}>
          <Input label="Nome completo" name="name" autoComplete="name" defaultValue={broker ? "Rafael Martins" : "Marina Andrade"} />
          <Input label="E-mail" type="email" name="email" autoComplete="email" defaultValue={invalid ? "marina@" : broker ? "rafael@email.com" : "marina@andradeimoveis.com.br"} error={invalid ? "Digite um e-mail válido." : undefined} />
          <Input label="Crie uma senha" type="password" name="new-password" autoComplete="new-password" defaultValue="Domuz!2026" hint="Use 8 ou mais caracteres." />
          <Input label="Confirme a senha" type="password" name="confirm-password" autoComplete="new-password" defaultValue={invalid ? "Domuz!2025" : "Domuz!2026"} error={invalid ? "As senhas não são iguais." : undefined} />
        </div>
        <Checkbox name="terms" defaultChecked label="Li e aceito os termos e a política de privacidade." />
        <Button variant="primary" block>Criar conta e confirmar e-mail</Button>
      </Card>
      <p className={styles.legal}>{broker ? "A imobiliária precisa aceitar o vínculo antes de você entrar por ela." : "A imobiliária só acessa a operação depois da análise e aprovação da Domuz.app."}</p>
    </Frame>
  );
}

function VerifyEmail() {
  return (
    <Frame>
      <Card className={styles.form} elevation={1}>
        <div className={styles.statusBlock}>
          <span className={styles.statusMark}><Icon name="mail" /></span>
          <h1 className={styles.statusTitle}>Confirme seu e-mail</h1>
          <p className={styles.statusText}>Enviamos um link e um código para marina@andradeimoveis.com.br.</p>
        </div>
        <Otp length={6} groupSize={3} label="Código enviado por e-mail" defaultValue="482" />
        <Button variant="primary" block>Confirmar e-mail</Button>
        <Button variant="ghost" block>Reenviar em 00:42</Button>
        <p className={styles.legal}>O link e o código expiram em 15 minutos.</p>
      </Card>
    </Frame>
  );
}

function VerifyPhone({ platform = false }: { platform?: boolean }) {
  return (
    <Frame back={platform ? "Voltar ao login" : "Voltar"}>
      <Card className={styles.form} elevation={1}>
        <FormHeader title={platform ? "Confirme sua entrada no backoffice" : "Confirme esta entrada"} text={platform ? "Digite o código enviado para +55 (XX) XXXXX-1234." : "Digite o código enviado para o celular cadastrado final 1234."} />
        <Otp length={6} groupSize={3} label="Código de confirmação do celular" defaultValue="731" />
        <Button variant="primary" block>{platform ? "Entrar no backoffice" : "Confirmar entrada"}</Button>
        <Button variant="ghost" block>Reenviar código</Button>
        <Callout tone="note" title="Não reconhece o número?">{platform ? "Interrompa a entrada e fale com a equipe Domuz.app." : "Interrompa a entrada e recupere sua conta pelo e-mail."}</Callout>
      </Card>
    </Frame>
  );
}

function ForgotPassword() {
  return (
    <Frame>
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Recupere sua senha" text="Enviaremos um link e um código para o e-mail informado." />
        <Input label="E-mail" type="email" name="email" autoComplete="email" defaultValue="nome@empresa.com.br" />
        <Button variant="primary" block>Enviar recuperação</Button>
        <p className={styles.legal}>Se houver uma conta com esse e-mail, você receberá as instruções.</p>
      </Card>
    </Frame>
  );
}

function NewPassword() {
  return (
    <Frame>
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Crie uma nova senha" text="Este código será invalidado depois da alteração." />
        <Otp length={6} groupSize={3} label="Código de recuperação" defaultValue="905184" />
        <Input label="Nova senha" type="password" name="password" autoComplete="new-password" defaultValue="NovaSenha!2026" hint="Use 8 ou mais caracteres." />
        <Input label="Confirme a nova senha" type="password" name="confirm-password" autoComplete="new-password" defaultValue="NovaSenha!2026" />
        <Button variant="primary" block>Alterar senha</Button>
      </Card>
    </Frame>
  );
}

function ContextualLogin({ platform = false }: { platform?: boolean }) {
  return (
    <Frame
      illustrated
      illustration={platform ? backofficeIllustration : clientIllustration}
      illustrationAlt={platform ? "Equipe Domuz.app operando aprovações, permissões e auditoria" : "Bairro com imóveis associados a diferentes perfis de busca"}
      illustrationWidth={platform ? 1024 : 1254}
      illustrationHeight={platform ? 1536 : 1254}
      illustrationOverlay={!platform && <div className={styles.clientMatches} aria-hidden="true"><span className={styles.matchFamily}><strong>Família Martins</strong>3 quartos, escola a pé</span><span className={styles.matchLuisa}><strong>Luísa</strong>1 quarto, rotina funcional</span><span className={styles.matchBento}><strong>Rafa &amp; Bento</strong>casa com quintal</span></div>}
      back={platform ? "Voltar para domuz.app" : "Voltar para minha busca"}
    >
      <Header eyebrow={platform ? "admin.domuz.app" : "Domuz.app para clientes"} title={platform ? "Acesse o backoffice Domuz.app." : "Continue sua busca."} text={platform ? "Entrada exclusiva para pessoas autorizadas pela equipe Domuz.app." : "Sua conta, suas buscas e os imóveis que você salvou."} />
      <Card className={styles.form} elevation={1}>
        {platform ? <><GoogleButton block>Entrar com Google</GoogleButton><p className={styles.legal}>Depois do Google, enviaremos um código para o celular cadastrado.</p></> : <><FormHeader title="Entrar" /><Credentials email="voce@email.com" /><Button variant="secondary" block>Criar minha conta</Button></>}
      </Card>
      <p className={styles.legal}>{platform ? "Sem permissão de backoffice, o acesso será negado." : "Esta entrada não mostra áreas profissionais."}</p>
    </Frame>
  );
}

function PlatformUnauthorized() {
  return (
    <Frame back="Voltar para domuz.app">
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Esta conta não tem acesso ao backoffice" text="Entre com uma conta Google autorizada pela equipe Domuz.app." />
        <Button variant="primary" block>Tentar com outra conta</Button>
        <Button variant="secondary" block>Voltar para domuz.app</Button>
      </Card>
    </Frame>
  );
}

function ClientSignup() {
  return (
    <Frame wide back="Já tenho conta">
      <WizardStepper variant="horizontal" label="Cadastro do cliente" current="conta" steps={[{ id: "conta", label: "Conta" }, { id: "confirmar", label: "Confirmar" }, { id: "busca", label: "Sua busca" }]} />
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Crie sua conta" text="Esta entrada cria seu acesso de cliente sem misturar áreas profissionais." />
        <div className={styles.fieldGrid}>
          <Input label="Nome completo" name="client-name" autoComplete="name" defaultValue="Ana Martins" />
          <Input label="E-mail" type="email" name="client-email" autoComplete="email" defaultValue="ana@email.com" />
          <Input label="Crie uma senha" type="password" name="client-password" autoComplete="new-password" defaultValue="Domuz!2026" hint="Use 8 ou mais caracteres." />
          <Input label="Confirme a senha" type="password" name="client-confirm-password" autoComplete="new-password" defaultValue="Domuz!2026" />
        </div>
        <Checkbox name="client-terms" defaultChecked label="Li e aceito os termos e a política de privacidade." />
        <Button variant="primary" block>Confirmar e-mail</Button>
      </Card>
    </Frame>
  );
}

function ClientStart() {
  return (
    <Frame back="Sair">
      <Header eyebrow="Sua busca" title="Por onde quer começar?" text="Você pode informar sua intenção agora ou construir uma busca com a ajuda da Domuz.app." />
      <ChoiceCardGroup className={styles.choiceList} label="Forma de criar a busca" columns={1} defaultValue="direct">
        <ChoiceCard value="direct" title="Já sei o que estou buscando" description="Criar uma intenção direta com localização, tipo e faixa de valor." />
        <ChoiceCard value="guided" title="Quero ajuda para descobrir" description="Seguir o wizard guiado, uma pergunta por vez." />
      </ChoiceCardGroup>
      <Button variant="primary" block>Continuar</Button>
    </Frame>
  );
}

function AgencyKyp() {
  return (
    <Frame wide back="Salvar e sair">
      <WizardStepper variant="horizontal" label="Cadastro da imobiliária" current="documentos" steps={[{ id: "empresa", label: "Empresa" }, { id: "endereco", label: "Endereço" }, { id: "documentos", label: "Análise" }, { id: "revisao", label: "Revisão" }]} />
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Documentos para análise" text="A imobiliária só será ativada depois da aprovação manual da Domuz.app." />
        <div className={styles.fieldGrid}>
          <Input label="CNPJ" name="cnpj" defaultValue="12.345.678/0001-90" />
          <Input label="CRECI Pessoa Jurídica" name="creci-pj" defaultValue="12345-J" />
          <Input label="Responsável legal" name="legal-name" defaultValue="Marina Andrade" />
          <Select label="Função do responsável" defaultValue="partner"><option value="partner">Sócia administradora</option><option value="director">Diretoria</option><option value="proxy">Procurador(a)</option></Select>
        </div>
        <FileUpload multiple accept=".pdf,.png,.jpg,.jpeg" label="Documentos da imobiliária" hint="Contrato social, cartão CNPJ e comprovante do CRECI PJ. PDF, PNG ou JPG." />
        <Checkbox name="truth" defaultChecked label="Confirmo que os dados são verdadeiros e posso representar a empresa." />
        <div className={styles.actions}><Button variant="primary" block>Revisar cadastro</Button><Button variant="secondary" block>Salvar rascunho</Button></div>
      </Card>
    </Frame>
  );
}

function AgencyReview() {
  return (
    <Frame>
      <Card className={styles.form} elevation={1}>
        <div className={styles.statusBlock}>
          <span className={styles.statusMark}><Icon name="clock" /></span>
          <Badge tone="warn" dot>Em análise manual</Badge>
          <h1 className={styles.statusTitle}>Recebemos o cadastro</h1>
          <p className={styles.statusText}>A Domuz.app está verificando a Andrade Imóveis. Você receberá atualizações por e-mail.</p>
        </div>
        <div className={styles.reviewList}>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>Protocolo</p><p className={styles.reviewValue}>CAD-2026-00482</p></div>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>Enviado em</p><p className={styles.reviewValue}>22 de julho de 2026</p></div>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>Acesso atual</p><p className={styles.reviewValue}>Acompanhamento do cadastro</p></div>
        </div>
        <Callout tone="note" title="Ainda sem acesso operacional">A imobiliária será ativada somente depois da aprovação.</Callout>
        <Button variant="secondary" block>Ver cadastro enviado</Button>
      </Card>
    </Frame>
  );
}

function BrokerProfile() {
  return (
    <Frame wide back="Salvar e sair">
      <WizardStepper variant="horizontal" label="Cadastro do corretor" current="perfil" steps={[{ id: "conta", label: "Conta" }, { id: "perfil", label: "Perfil" }, { id: "atuacao", label: "Atuação" }]} />
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Seu perfil profissional" text="Esses dados identificam você nas relações com clientes e imobiliárias." />
        <div className={styles.fieldGrid}>
          <Input label="Nome profissional" name="professional-name" defaultValue="Rafael Martins" />
          <Input label="CRECI" name="creci" defaultValue="MG 54321-F" />
          <Input label="Celular profissional" type="tel" name="phone" autoComplete="tel" defaultValue="(31) 99999-1234" />
          <Select label="Estado do CRECI" defaultValue="MG"><option value="MG">Minas Gerais</option><option value="SP">São Paulo</option><option value="RJ">Rio de Janeiro</option></Select>
        </div>
        <FileUpload accept=".pdf,.png,.jpg,.jpeg" label="Comprovante do CRECI" hint="Envie documento legível em PDF, PNG ou JPG." />
        <Button variant="primary" block>Definir como vou atuar</Button>
      </Card>
    </Frame>
  );
}

function BrokerMode() {
  return (
    <Frame wide back="Voltar ao perfil">
      <Header eyebrow="Cadastro do corretor" title="Como você atua hoje?" text="Sua operação pessoal continuará disponível mesmo quando você se vincular a uma imobiliária." />
      <ChoiceCardGroup className={styles.choiceList} label="Modelo de atuação" columns={1} defaultValue="personal">
        <ChoiceCard value="personal" title="Trabalho de forma independente" description="Criar minha operação pessoal agora." />
        <ChoiceCard value="agency" title="Quero me vincular a uma imobiliária" description="Buscar uma imobiliária e solicitar aprovação." />
        <ChoiceCard value="missing" title="Minha imobiliária ainda não está na Domuz.app" description="Solicitar a inclusão sem criar a empresa em meu nome." />
      </ChoiceCardGroup>
      <Button variant="primary">Continuar</Button>
    </Frame>
  );
}

function BrokerPending() {
  return (
    <Frame>
      <Card className={styles.form} elevation={1}>
        <div className={styles.statusBlock}>
          <span className={styles.statusMark}><Icon name="clock" /></span>
          <Badge tone="warn" dot>Aguardando imobiliária</Badge>
          <h1 className={styles.statusTitle}>Solicitação enviada</h1>
          <p className={styles.statusText}>A Andrade Imóveis precisa aceitar seu vínculo antes que esse contexto apareça na sua conta.</p>
        </div>
        <div className={styles.reviewList}>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>Imobiliária</p><p className={styles.reviewValue}>Andrade Imóveis</p></div>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>CRECI informado</p><p className={styles.reviewValue}>MG 54321-F</p></div>
          <div className={styles.reviewItem}><p className={styles.reviewLabel}>Enquanto aguarda</p><p className={styles.reviewValue}>Sua operação pessoal continua ativa</p></div>
        </div>
        <Button variant="primary" block>Ir para minha operação</Button>
        <Button variant="ghost" block>Cancelar solicitação</Button>
      </Card>
    </Frame>
  );
}

function AgencyRequest() {
  return (
    <Frame wide back="Voltar para busca">
      <Card className={styles.form} elevation={1}>
        <FormHeader title="Solicite a inclusão da imobiliária" text="A Domuz.app entrará em contato com a empresa e conduzirá a verificação cadastral. Isso não cria uma área de operação nem torna você administrador." />
        <div className={styles.fieldGrid}>
          <Input label="Nome da imobiliária" name="agency-name" defaultValue="Horizonte Negócios Imobiliários" />
          <Input label="CNPJ ou CRECI PJ, se souber" name="agency-doc" defaultValue="MG 98765-J" />
          <Input label="Nome do contato na imobiliária" name="contact-name" defaultValue="Fernanda Lima" />
          <Input label="E-mail ou telefone do contato" name="contact" defaultValue="fernanda@horizonteimoveis.com.br" />
        </div>
        <Input label="Como você se relaciona com essa imobiliária?" name="relationship" defaultValue="Sou corretor associado à empresa." />
        <Checkbox name="contact-consent" defaultChecked label="Autorizo a Domuz.app a mencionar meu nome ao entrar em contato." />
        <Button variant="primary" block>Enviar solicitação</Button>
      </Card>
    </Frame>
  );
}

export function ProfessionalAccess({ screen }: ProfessionalAccessProps) {
  const screens: Record<Screen, React.ReactNode> = {
    gateway: <Gateway />, "gateway-broker": <Gateway broker />, "agency-login": <ProfessionalLogin />, "broker-login": <ProfessionalLogin broker />, signup: <Signup />, "broker-signup": <Signup broker />, "signup-error": <Signup invalid />, "verify-email": <VerifyEmail />, "verify-phone": <VerifyPhone />, "forgot-password": <ForgotPassword />, "new-password": <NewPassword />, "client-login": <ContextualLogin />, "client-signup": <ClientSignup />, "client-start": <ClientStart />, "platform-login": <ContextualLogin platform />, "platform-otp": <VerifyPhone platform />, "platform-unauthorized": <PlatformUnauthorized />, "agency-kyp": <AgencyKyp />, "agency-review": <AgencyReview />, "broker-profile": <BrokerProfile />, "broker-mode": <BrokerMode />, "broker-pending": <BrokerPending />, "agency-request": <AgencyRequest />,
  };
  return screens[screen];
}

const meta = {
  title: "Produto/Imobiliária/Entrada e cadastro",
  component: ProfessionalAccess,
  args: { screen: "gateway" },
  argTypes: { screen: { control: "select", options: ["gateway", "agency-login", "signup", "signup-error", "verify-email", "verify-phone", "forgot-password", "new-password", "agency-kyp", "agency-review"] } },
  parameters: { layout: "fullscreen", viewport: { viewports: validationViewports } },
  globals: { theme: "dommus" },
} satisfies Meta<typeof ProfessionalAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const E01EntradaProfissionalDesktop: Story = { args: { screen: "gateway" }, parameters: desktop, tags: ["em-revisao"] };
export const E01EntradaProfissionalMobile: Story = { args: { screen: "gateway" }, parameters: mobile, tags: ["em-revisao"] };
export const E02EntrarDesktop: Story = { args: { screen: "agency-login" }, parameters: desktop, tags: ["aprovada"] };
export const E02EntrarMobile: Story = { args: { screen: "agency-login" }, parameters: mobile, tags: ["aprovada"] };
export const E03CriarContaDesktop: Story = { args: { screen: "signup" }, parameters: desktop, tags: ["aprovada"] };
export const E03CriarContaMobile: Story = { args: { screen: "signup" }, parameters: mobile, tags: ["aprovada"] };
export const E03Validacao: Story = { args: { screen: "signup-error" }, parameters: desktop, tags: ["aprovada"] };
export const E04ConfirmarEmail: Story = { args: { screen: "verify-email" }, parameters: desktop, tags: ["em-revisao"] };
export const E05ConfirmarEntrada: Story = { args: { screen: "verify-phone" }, parameters: desktop, tags: ["em-revisao"] };
export const E06RecuperarSenha: Story = { args: { screen: "forgot-password" }, parameters: desktop, tags: ["em-revisao"] };
export const E06CriarNovaSenha: Story = { args: { screen: "new-password" }, parameters: desktop, tags: ["em-revisao"] };
export const T02DocumentosDesktop: Story = { args: { screen: "agency-kyp" }, parameters: desktop, tags: ["em-revisao"] };
export const T02DocumentosMobile: Story = { args: { screen: "agency-kyp" }, parameters: mobile, tags: ["em-revisao"] };
export const T04CadastroEmAnalise: Story = { args: { screen: "agency-review" }, parameters: desktop, tags: ["em-revisao"] };
