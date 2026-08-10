import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { BrandLogo } from "../components/BrandLogo";
import { Callout } from "../components/Callout";
import { Card } from "../components/Card";
import { productContextFixtures, validationViewports } from "./productValidationFixtures";
import styles from "./ProductValidationHarness.module.css";

function ProductValidationHarness() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Validação de produto · V0</p>
            <h1 className={styles.title}>Harness de telas e fluxos</h1>
            <p className={styles.description}>
              Base visual isolada para revisar cada ID antes de desenvolver rotas. Esta story valida somente o harness; nenhuma das 36 telas está aprovada.
            </p>
          </div>
          <BrandLogo brand="dommus" size="md" animated={false} />
        </header>

        <Callout title="Ambiente de protótipo" tone="note">
          Tema Domuz.app claro, dados fictícios e estáveis, sem API, banco, autenticação ou envio externo.
        </Callout>

        <section className={styles.section} aria-labelledby="fixture-title">
          <h2 id="fixture-title" className={styles.sectionTitle}>Fixtures dos cinco contextos</h2>
          <div className={styles.grid}>
            {productContextFixtures.map((context) => (
              <Card className={styles.fixture} elevation={1} key={context.id}>
                <div className={styles.fixtureHeader}>
                  <Avatar initials={context.initials} seed={context.id} shape="square" />
                  <div className={styles.fixtureIdentity}>
                    <p className={styles.fixtureTitle}>{context.area}</p>
                    <p className={styles.fixtureMeta}>{context.persona} · {context.entity}</p>
                  </div>
                  <Badge tone="neutral">fixture</Badge>
                </div>
                <p className={styles.route}>{context.destination}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

const meta = {
  title: "Validação de Produto/00 Harness",
  component: ProductValidationHarness,
  parameters: {
    layout: "fullscreen",
    viewport: { viewports: validationViewports },
  },
  globals: { theme: "dommus" },
} satisfies Meta<typeof ProductValidationHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  parameters: { viewport: { defaultViewport: "desktop1440" } },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile390" } },
};
