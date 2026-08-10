import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "../components/BrandLogo";
import { Button } from "../components/Button";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { GoogleButton } from "../components/GoogleButton";
import contextCity from "./assets/e01-context-city-transparent.png";
import { validationViewports } from "./productValidationFixtures";
import styles from "./E01Entry.module.css";

type EntryState = "default" | "error" | "cancelled";

type EntryProps = {
  state: EntryState;
  layout: "split" | "centered";
};

const feedback = {
  error: {
    tone: "danger",
    title: "Não foi possível continuar",
    text: "Confira o celular ou tente entrar com Google novamente.",
  },
  cancelled: {
    tone: "note",
    title: "Entrada cancelada",
    text: "Nada foi alterado. Continue quando quiser.",
  },
} as const;

function E01Entry({ state, layout }: EntryProps) {
  const message = state === "default" ? null : feedback[state];
  const isCentered = layout === "centered";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <BrandLogo brand="dommus" size="md" animated={false} />
      </header>

      <div className={`${styles.content} ${isCentered ? styles.centered : ""}`}>
        <section className={styles.entry} aria-labelledby="entry-title">
          {!isCentered && (
            <div className={styles.intro}>
              <p className={styles.eyebrow}>Uma conta, todos os seus lugares</p>
              <h1 id="entry-title" className={styles.title}>Entre para seguir do seu jeito.</h1>
              <p className={styles.description}>
                Continue sua busca ou acesse sua operação. A Domuz.app reconhece seus vínculos e leva você ao contexto certo.
              </p>
            </div>
          )}

          <Card className={styles.form} elevation={1}>
            <div className={styles.formHeader}>
              {isCentered ? (
                <h1 id="entry-title" className={styles.formTitle}>Entrar na Domuz.app</h1>
              ) : (
                <h2 className={styles.formTitle}>Entrar na Domuz.app</h2>
              )}
              <p className={styles.formText}>Escolha como continuar.</p>
            </div>

            {message && (
              <Callout title={message.title} tone={message.tone} aria-live="polite">
                {message.text}
              </Callout>
            )}

            <GoogleButton block />

            <div className={styles.divider} aria-hidden="true">ou</div>

            <div className={styles.phoneEntry}>
              <Input
                label="Celular com WhatsApp"
                prefix="+55"
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                defaultValue="(31) 99999-1234"
                error={state === "error" ? "Confira o número informado." : undefined}
              />
              <Button variant="primary" block>Receber código</Button>
            </div>

            <p className={styles.legal}>
              Sem senha. Ao continuar, você confirma que leu os termos e a política de privacidade da Domuz.app.
            </p>
          </Card>
        </section>

        {!isCentered && (
          <aside className={styles.art} aria-label="Bairro com diferentes caminhos, moradias e contextos profissionais">
            <img
              src={contextCity}
              width="1021"
              height="1155"
              alt="Ilustração isométrica de um bairro com casas, edifícios, uma imobiliária e pessoas chegando a uma praça central"
            />
          </aside>
        )}
      </div>
    </main>
  );
}

const meta = {
  title: "Histórico rejeitado/E01 Entrar v3",
  component: E01Entry,
  args: { state: "default", layout: "split" },
  argTypes: {
    state: { control: "radio", options: ["default", "error", "cancelled"] },
    layout: { control: "radio", options: ["split", "centered"] },
  },
  parameters: {
    layout: "fullscreen",
    viewport: { viewports: validationViewports },
  },
  globals: { theme: "dommus" },
} satisfies Meta<typeof E01Entry>;

export default meta;
type Story = StoryObj<typeof meta>;

const desktop = { viewport: { defaultViewport: "desktop1440" } };
const mobile = { viewport: { defaultViewport: "mobile390" } };

export const NormalDesktop: Story = { parameters: desktop };
export const ErroDesktop: Story = { args: { state: "error" }, parameters: desktop };
export const CanceladoDesktop: Story = { args: { state: "cancelled" }, parameters: desktop };
export const NormalMobile: Story = { parameters: mobile };
export const ErroMobile: Story = { args: { state: "error" }, parameters: mobile };
export const CanceladoMobile: Story = { args: { state: "cancelled" }, parameters: mobile };
export const CentralizadoDesktop: Story = { args: { layout: "centered" }, parameters: desktop };
export const CentralizadoMobile: Story = { args: { layout: "centered" }, parameters: mobile };
