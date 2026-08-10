import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "./BrandLogo";
import styles from "./BrandLogo.stories.module.css";
import manifest from "../../prototypes/assets/brand/domuz/domuz-brand-assets.manifest.json";

type LogoAsset = {
  family: "mark" | "lockup";
  mode: "line" | "solid";
  color: string;
  wordmark: boolean;
  use: string;
  file: string;
};

type IconAsset = {
  group: string;
  size: number | string;
  purpose: string;
  file: string;
};

type ApplicationAsset = {
  surface: string;
  use: string;
  file: string;
};

const brandManifest = manifest as {
  generatedFrom: { symbol: string; wordmarkFont: string };
  logos: LogoAsset[];
  icons: IconAsset[];
  applications: ApplicationAsset[];
};

const brandAssetModules = import.meta.glob<string>("../../prototypes/assets/brand/domuz/**/*.{png,svg}", {
  eager: true,
  query: "?url",
  import: "default",
});

const assetUrl = (file: string) => brandAssetModules[`../../prototypes/assets/brand/domuz/${file}`] ?? "";

const meta = {
  title: "Components/Atoms/BrandLogo",
  component: BrandLogo,
  tags: ["autodocs"],
  args: { brand: "domuz", size: "sm", mode: "solid", variant: "theme", animated: true },
  argTypes: {
    brand: { control: "inline-radio", options: ["refy", "domuz", "dommus"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    tone: { control: "inline-radio", options: ["default", "inverse"] },
    mode: { control: "inline-radio", options: ["line", "solid"] },
    variant: { control: "inline-radio", options: ["theme", "black", "white", "orange", "pride", "trans", "copa"] },
  },
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof BrandLogo>;

const colorLabel: Record<string, string> = {
  theme: "cor do tema",
  black: "preto",
  white: "branco",
  pride: "orgulho LGBTQIA+",
  trans: "visibilidade trans",
  copa: "Copa do Mundo",
};

const modeLabel = {
  line: "linha",
  solid: "sólido / gestalt",
} as const;

const familyLabel = {
  mark: "sem escrito",
  lockup: "com escrito",
} as const;

const previewClass = (asset: LogoAsset | { color: string }) => asset.color === "white" ? styles.darkPreview : styles.lightPreview;

const iconRows = brandManifest.icons.filter((icon) => icon.group !== "master");
const applicationRows = brandManifest.applications;
const solidGradientRows = brandManifest.logos.filter((logo) => logo.mode === "solid" && ["theme", "pride", "trans", "copa"].includes(logo.color));
const referenceBoards = [
  { name: "Tom de voz e aplicações", file: "brand-system-voice-and-applications.png" },
  { name: "Datas e variações culturais", file: "brand-system-cultural-dates.png" },
  { name: "Aplicações com tipografia", file: "brand-system-typography-applications.png" },
] as const;

export const Padrao: Story = {};

export const Refy: Story = { args: { brand: "refy", size: "lg" } };

export const LinhaComEscrito: Story = { args: { brand: "domuz", size: "xl", mode: "line", variant: "theme" } };

export const SolidoComEscrito: Story = { args: { brand: "domuz", size: "xl", mode: "solid", variant: "theme" } };

export const LinhaSemEscrito: Story = { args: { brand: "domuz", size: "xl", mode: "line", markOnly: true, variant: "theme" } };

export const SolidoSemEscrito: Story = { args: { brand: "domuz", size: "xl", mode: "solid", markOnly: true, variant: "theme" } };

export const SolidosComDegradesEComemorativos: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Sólidos com degradês</h2>
        <p>As áreas internas do D recebem o degradê; os traços da versão de linha viram vazios.</p>
      </header>
      <div className={styles.componentGrid}>
        {solidGradientRows.map((asset) => (
          <article key={asset.file} className={styles.assetCard}>
            <div className={styles.lightPreview}>
              <img src={assetUrl(asset.file)} alt={`Logo Domuz sólido ${familyLabel[asset.family]} ${colorLabel[asset.color] ?? asset.color}`} />
            </div>
            <strong>sólido · {familyLabel[asset.family]} · {colorLabel[asset.color] ?? asset.color}</strong>
            <code>{asset.file}</code>
            <p>{asset.use}</p>
          </article>
        ))}
      </div>
    </section>
  ),
};

export const MatrizDeLogo: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Matriz completa de assinatura</h2>
        <p>{brandManifest.logos.length} arquivos SVG cobrem linha e sólido/gestalt, com escrito e sem escrito, em branco, preto, cor do tema e datas culturais.</p>
      </header>
      <div className={styles.logoMatrix}>
        {brandManifest.logos.map((asset) => (
          <article key={asset.file} className={styles.assetCard}>
            <div className={previewClass(asset)}>
              <img src={assetUrl(asset.file)} alt={`Logo Domuz ${modeLabel[asset.mode]} ${familyLabel[asset.family]} ${colorLabel[asset.color] ?? asset.color}`} />
            </div>
            <strong>{modeLabel[asset.mode]} · {familyLabel[asset.family]}</strong>
            <code>{asset.file}</code>
            <p>{colorLabel[asset.color] ?? asset.color}. {asset.use}</p>
          </article>
        ))}
      </div>
    </section>
  ),
};

export const VariacoesDoComponente: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Átomo com tokens de marca</h2>
        <p>O componente monta a assinatura sólida como padrão. Cor e contraste vêm dos tokens do tema.</p>
      </header>
      <div className={styles.componentGrid}>
        {(["theme", "black", "white", "pride", "trans", "copa"] as const).map((variant) => (
          <article key={`line-${variant}`} className={styles.assetCard}>
            <div className={variant === "white" ? styles.darkPreview : styles.lightPreview}>
              <BrandLogo brand="domuz" size="xl" mode="line" variant={variant} />
            </div>
            <strong>linha · {colorLabel[variant]}</strong>
            <p><code>mode="line"</code> com <code>variant="{variant}"</code>.</p>
          </article>
        ))}
        {(["theme", "black", "white", "pride", "trans", "copa"] as const).map((variant) => (
          <article key={`solid-${variant}`} className={styles.assetCard}>
            <div className={variant === "white" ? styles.darkPreview : styles.lightPreview}>
              <BrandLogo brand="domuz" size="xl" mode="solid" variant={variant} />
            </div>
            <strong>sólido · {colorLabel[variant]}</strong>
            <p><code>mode="solid"</code> com <code>variant="{variant}"</code>.</p>
          </article>
        ))}
      </div>
    </section>
  ),
};

export const IconesDeSiteEMobile: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Ícones de site e mobile</h2>
        <p>{iconRows.length} PNGs e SVGs cobrem favicon, Apple touch icon, Android Chrome e PWA maskable.</p>
      </header>
      <div className={styles.iconPreviewRow}>
        {["icons/site/favicon-32.png", "icons/mobile/apple-touch-icon-180.png", "icons/mobile/android-chrome-512.png"].map((file) => (
          <div key={file} className={styles.iconPreview}>
            <img src={assetUrl(file)} alt={`Ícone Domuz ${file}`} />
            <code>{file}</code>
          </div>
        ))}
      </div>
      <div className={styles.fileList}>
        {iconRows.map((icon) => (
          <div key={icon.file} className={styles.fileRow}>
            <span>{icon.group}</span>
            <strong>{icon.size}px</strong>
            <code>{icon.file}</code>
            <p>{icon.purpose}</p>
          </div>
        ))}
      </div>
    </section>
  ),
};

export const AplicacoesPrincipais: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Aplicações principais</h2>
        <p>{applicationRows.length} templates SVG mostram onde usar linha, sólido, assinatura completa e símbolo isolado.</p>
      </header>
      <div className={styles.applicationGrid}>
        {applicationRows.map((asset) => (
          <article key={asset.file} className={styles.applicationCard}>
            <img src={assetUrl(asset.file)} alt={`Aplicação Domuz em ${asset.surface}`} />
            <div>
              <strong>{asset.surface}</strong>
              <code>{asset.file}</code>
              <p>{asset.use}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  ),
};

export const EscalaCompleta: Story = {
  render: () => (
    <div className={styles.scaleStack}>
      {[
        ["dommus-dark", "white"],
        ["dommus", "theme"],
      ].map(([theme, variant]) => (
        <section key={theme} data-theme={theme} className={styles.scalePane}>
          <span className={styles.metaLabel}>{theme}</span>
          {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
            <div key={size} className={styles.scaleRow}>
              <span>{size}</span>
              <BrandLogo brand="domuz" size={size} mode="line" variant={variant as "theme" | "white"} />
              <BrandLogo brand="domuz" size={size} mode="solid" markOnly variant={variant as "theme" | "white"} />
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

export const RegrasDeUso: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Quando usar cada versão</h2>
        <p>Use a versão que resolve reconhecimento, contraste e tamanho sem inventar outra assinatura.</p>
      </header>

      <div className={styles.ruleGrid}>
        <article>
          <strong>Linha com escrito</strong>
          <span>Site, PPT, proposta, anúncio claro e assinatura institucional.</span>
        </article>
        <article>
          <strong>Linha sem escrito</strong>
          <span>Navegação, favicon SVG, selo pequeno e contexto em que Domuz já aparece no entorno.</span>
        </article>
        <article>
          <strong>Sólido com escrito</strong>
          <span>Capa, banner, post, tela de abertura e peça com fundo mais cheio.</span>
        </article>
        <article>
          <strong>Sólido sem escrito</strong>
          <span>App icon, avatar social, splash, card pequeno e PWA maskable.</span>
        </article>
        <article>
          <strong>Preto e branco</strong>
          <span>Use quando o suporte ou a foto pede contraste direto.</span>
        </article>
        <article>
          <strong>Datas culturais</strong>
          <span>Use só em campanha da data. No produto, mantenha estados semânticos separados da marca.</span>
        </article>
      </div>
    </section>
  ),
};

export const ReferenciasDoBrandBook: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.brandSection}>
      <header className={styles.header}>
        <h2>Pranchas de referência</h2>
        <p>Arquivos PNG originais salvos no projeto para consulta de tom, tipografia e aplicação.</p>
      </header>
      <div className={styles.boardGrid}>
        {referenceBoards.map((board) => (
          <figure key={board.file}>
            <img src={assetUrl(board.file)} alt={board.name} />
            <figcaption>{board.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  ),
};

export const MovimentoReduzido: Story = {
  args: { brand: "domuz", size: "xl", mode: "solid", animated: false },
};
