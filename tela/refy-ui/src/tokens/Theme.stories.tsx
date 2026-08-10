import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "../components/BrandLogo";
import styles from "./Theme.module.css";
import prideLockup from "../prototypes/assets/brand/domuz/domuz-lockup-pride.svg";
import transLockup from "../prototypes/assets/brand/domuz/domuz-lockup-trans.svg";
import copaLockup from "../prototypes/assets/brand/domuz/domuz-lockup-copa.svg";
import orangeLockup from "../prototypes/assets/brand/domuz/domuz-lockup-orange.svg";

const meta = {
  title: "Design System/Tokens/Temas",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Swatch = {
  name: string;
  value: string;
  use: string;
  background: string;
  color: string;
  span?: 2 | 3;
};

const refyDark: Swatch[] = [
  { name: "Brand gradient", value: "#10b981 → #006c49", use: "linear-gradient 135°", background: "linear-gradient(135deg, #10b981, #006c49)", color: "#003824", span: 3 },
  { name: "primary", value: "#4edea3", use: "on dark", background: "#4edea3", color: "#003824" },
  { name: "primary-container", value: "#10b981", use: "CTA · ring", background: "#10b981", color: "#003824" },
  { name: "inverse-primary", value: "#006c49", use: "deep brand", background: "#006c49", color: "#6ffbbe" },
  { name: "on-primary", value: "#003824", use: "texto sobre brand", background: "#003824", color: "#6ffbbe" },
  { name: "primary-fixed", value: "#6ffbbe", use: "accent claro", background: "#6ffbbe", color: "#003824" },
  { name: "background", value: "#101415", use: "+ glow esmeralda", background: "#101415", color: "#e0e3e5", span: 2 },
  { name: "surface-container", value: "#1d2022", use: "cards", background: "#1d2022", color: "#e0e3e5" },
  { name: "surface-high", value: "#272a2c", use: "elevado", background: "#272a2c", color: "#e0e3e5" },
  { name: "surface-highest", value: "#323537", use: "overlay", background: "#323537", color: "#e0e3e5" },
];

const refyLight: Swatch[] = [
  { name: "Brand gradient · idêntico", value: "#10b981 → #006c49", use: "hero do site público", background: "linear-gradient(135deg, #10b981, #006c49)", color: "#003824", span: 3 },
  { name: "primary", value: "#10b981", use: "CTA · botões", background: "#10b981", color: "#fff" },
  { name: "primary-hover", value: "#0ea371", use: "hover state", background: "#0ea371", color: "#fff" },
  { name: "primary-ink", value: "#065f46", use: "texto sobre soft", background: "#065f46", color: "#e7f8f0" },
  { name: "primary-soft", value: "#e7f8f0", use: "fills · pills", background: "#e7f8f0", color: "#065f46" },
  { name: "surface", value: "#ffffff", use: "+ focus ring", background: "#ffffff", color: "#0e0e10" },
  { name: "surface-2", value: "#f7f7f7", use: "painéis", background: "#f7f7f7", color: "#0e0e10" },
  { name: "background", value: "#f2f2f2", use: "app canvas", background: "#f2f2f2", color: "#0e0e10" },
  { name: "line", value: "#dbe8e0", use: "divisores", background: "#dbe8e0", color: "#065f46" },
  { name: "line-soft", value: "#e8f1eb", use: "divisores leves", background: "#e8f1eb", color: "#065f46" },
  { name: "ink-1", value: "#0e0e10", use: "títulos", background: "#0e0e10", color: "#fff" },
  { name: "ink-2", value: "#3e3e44", use: "corpo", background: "#3e3e44", color: "#fff" },
];

const dommusDark: Swatch[] = [
  { name: "Brand gradient", value: "#f15a24 → #a92d19", use: "gradiente fluido 135°", background: "var(--brand-gradient)", color: "#411000", span: 3 },
  { name: "primary", value: "#ffb08f", use: "on dark", background: "#ffb08f", color: "#411000" },
  { name: "primary-container", value: "#f15a24", use: "CTA · ring", background: "#f15a24", color: "#411000" },
  { name: "inverse-primary", value: "#a92d19", use: "deep brand", background: "#a92d19", color: "#ffd1bd" },
  { name: "on-primary", value: "#411000", use: "texto sobre brand", background: "#411000", color: "#ffd1bd" },
  { name: "primary-fixed", value: "#ffd1bd", use: "accent claro", background: "#ffd1bd", color: "#411000" },
  { name: "background", value: "#15110f", use: "+ glow laranja", background: "#15110f", color: "#f3e8e3", span: 2 },
  { name: "surface-container", value: "#231d1a", use: "cards", background: "#231d1a", color: "#f3e8e3" },
  { name: "surface-high", value: "#2e2723", use: "elevado", background: "#2e2723", color: "#f3e8e3" },
  { name: "surface-highest", value: "#3a312c", use: "overlay", background: "#3a312c", color: "#f3e8e3" },
];

const dommusLight: Swatch[] = [
  { name: "Brand gradient · idêntico", value: "#ff8a32 → #f15a24 → #c94322", use: "hero e assinatura", background: "var(--brand-gradient)", color: "#fff8f5", span: 3 },
  { name: "primary", value: "#c94322", use: "CTA · botões", background: "#c94322", color: "#fff8f5" },
  { name: "primary-hover", value: "#b9381b", use: "hover state", background: "#b9381b", color: "#fff8f5" },
  { name: "primary-ink", value: "#72250f", use: "texto sobre soft", background: "#72250f", color: "#fff0eb" },
  { name: "primary-soft", value: "#fff0eb", use: "seleção · ênfase de marca", background: "#fff0eb", color: "#72250f" },
  { name: "surface", value: "#fdfefd", use: "cards · controles · calendário", background: "#fdfefd", color: "#171312" },
  { name: "surface-2", value: "#f1f3f2", use: "painéis", background: "#f1f3f2", color: "#171312" },
  { name: "background", value: "#f5f6f5", use: "app canvas claro", background: "#f5f6f5", color: "#171312" },
  { name: "line", value: "#e2ddda", use: "divisores", background: "#e2ddda", color: "#72250f" },
  { name: "line-soft", value: "#efebe9", use: "divisores leves", background: "#efebe9", color: "#72250f" },
  { name: "ink-1", value: "#171312", use: "títulos", background: "#171312", color: "#fff8f5" },
  { name: "ink-2", value: "#4a403c", use: "corpo", background: "#4a403c", color: "#fff8f5" },
];

const seasonalLockups = [
  { name: "Orgulho LGBTQIA+", file: prideLockup, use: "campanhas e editoriais da data" },
  { name: "Visibilidade trans", file: transLockup, use: "campanhas e editoriais da data" },
  { name: "Copa do Mundo", file: copaLockup, use: "ativação cultural com contexto" },
  { name: "Fim de ano", file: orangeLockup, use: "datas próprias e assinatura institucional" },
] as const;

const dommusAdmin: Swatch[] = [
  { name: "Brand gradient", value: "grafite", use: "entrada e assinatura", background: "var(--brand-gradient)", color: "oklch(98% 0 0)", span: 3 },
  { name: "primary", value: "L 20", use: "CTA e seleção", background: "var(--primary)", color: "var(--on-primary)" },
  { name: "primary-hover", value: "L 28", use: "hover", background: "var(--primary-hover)", color: "var(--on-primary)" },
  { name: "primary-ink", value: "L 20", use: "texto sobre soft", background: "var(--primary-ink)", color: "var(--primary-soft)" },
  { name: "primary-soft", value: "L 94", use: "seleção e chips", background: "var(--primary-soft)", color: "var(--primary-ink)" },
  { name: "surface", value: "L 99", use: "cards e controles", background: "var(--surface)", color: "var(--ink-1)" },
  { name: "surface-2", value: "L 95", use: "painéis", background: "var(--surface-2)", color: "var(--ink-1)" },
  { name: "background", value: "L 97", use: "canvas", background: "var(--bg)", color: "var(--ink-1)" },
  { name: "line", value: "L 88", use: "divisores", background: "var(--line)", color: "var(--ink-1)" },
  { name: "ink-1", value: "L 18", use: "títulos", background: "var(--ink-1)", color: "var(--surface)" },
];

function PalettePane({ theme, crumb, title, description, colors }: { theme: string; crumb: string; title: string; description: string; colors: Swatch[] }) {
  return (
    <section data-theme={theme} className={styles.pane}>
      <header className={styles.head}>
        <span className={styles.crumb}>{crumb}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className={styles.paletteGrid}>
        {colors.map((color) => (
          <div
            key={color.name}
            className={`${styles.swatch} ${color.span === 2 ? styles.span2 : color.span === 3 ? styles.span3 : ""}`}
            style={{ background: color.background, color: color.color }}
          >
            <span className={styles.tokenName}>{color.name}</span>
            <div><div className={styles.tokenValue}>{color.value}</div><div className={styles.tokenUse}>{color.use}</div></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const Paletas: Story = {
  render: () => (
    <div className={styles.stack}>
      <PalettePane theme="dark" crumb="Colors · Brand · Refy Dark" title="Esmeralda como assinatura — landing & auth" description="Sobre fundos quase pretos com glow sutil. O gradiente primary-container → inverse-primary é a marca." colors={refyDark} />
      <PalettePane theme="light" crumb="Colors · Brand · Refy Light" title="Esmeralda funcional — app autenticado" description="No app, esmeralda vira ferramenta: CTA, focus ring, soft fills, ink em rótulos e linhas verde-sálvia." colors={refyLight} />
      <PalettePane theme="dommus-dark" crumb="Colors · Brand · Dommus Dark" title="Laranja como assinatura — superfícies imersivas" description="A mesma arquitetura do Refy dark, agora com gradiente laranja fluido, glow controlado e neutros quentes quase pretos." colors={dommusDark} />
      <PalettePane theme="dommus" crumb="Colors · Brand · Dommus Light" title="Laranja funcional — produto imobiliário" description="Branco e cinza constroem as superfícies. O laranja aparece em ação, seleção e assinatura; estados de leitura permanecem semanticamente independentes." colors={dommusLight} />
      <PalettePane theme="dommus-admin" crumb="Colors · Brand · Dommus Admin" title="P&B funcional para o backoffice" description="Preto conduz ações e seleção. Cores aparecem em estados, avatares, chips e alertas." colors={dommusAdmin} />
    </div>
  ),
};

export const VariacoesComemorativas: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.pane}>
      <header className={styles.head}>
        <span className={styles.crumb}>Brand · variações comemorativas</span>
        <h2>Marca viva, com contexto claro</h2>
        <p>Use as variações em peças da data. No produto, mantenha a assinatura padrão e preserve estados semânticos.</p>
      </header>
      <div className={styles.seasonGrid}>
        {seasonalLockups.map((item) => (
          <article key={item.name} className={styles.seasonCard}>
            <img src={item.file} width="306" height="96" alt={`Logo Domuz para ${item.name}`} />
            <div>
              <strong>{item.name}</strong>
              <span>{item.use}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  ),
};

const semantic = [
  { name: "Crítico", label: "Crítico", token: "critical", value: "#dc2626", on: "#ffffff", soft: "critical-soft", softValue: "#fee7e5", softInk: "#991b1b" },
  { name: "Atenção", label: "Weak", token: "weak", value: "#f59e0b", on: "#3a2400", soft: "weak-soft", softValue: "#fef3cc", softInk: "#92400e" },
  { name: "Aceitável", label: "OK", token: "ok", value: "#84cc16", on: "#1f2e02", soft: "ok-soft", softValue: "#ecfbca", softInk: "#3f6212" },
  { name: "Bom", label: "Good", token: "good", value: "#10b981", on: "#003824", soft: "good-soft", softValue: "#dcfce7", softInk: "#065f46" },
  { name: "Info", label: "Info", token: "info", value: "#0a66c4", on: "#ffffff", soft: "info-soft", softValue: "#dbeafe", softInk: "#0a66c4" },
] as const;

function SemanticPane({ theme, name }: { theme: string; name: string }) {
  return (
    <section data-theme={theme} className={styles.pane}>
      <header className={styles.head}>
        <span className={styles.crumb}>Colors · semântica · {name}</span>
        <h2>Cinco estados, cinco leituras</h2>
        <p>A marca muda com o tema; crítico, atenção, aceitável, bom e informação continuam dizendo a mesma coisa.</p>
      </header>
      <div className={styles.semanticGrid}>
        {semantic.map((item) => (
          <div key={item.token} className={styles.semanticColumn}>
            <div className={styles.semanticCard} style={{ background: `var(--${item.token})`, color: item.on }}>
              <span className={styles.tokenName}>{item.name}</span><div className={styles.semanticLabel}>{item.label}</div><div className={styles.tokenValue}>{item.value}</div>
            </div>
            <div className={styles.semanticCard} style={{ background: `var(--${item.soft})`, color: item.softInk }}>
              <span className={styles.tokenName}>soft</span><div className={styles.tokenValue}>{item.softValue}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.pillRow}>
        {semantic.map((item, index) => <span key={item.token} className={styles.pill}><span className={styles.pillDot} style={{ background: `var(--${item.token})` }} />{["3 lacunas críticas", "5 sinais fracos", "12 aceitáveis", "87 cobertos", "Última leitura · 2 min"][index]}</span>)}
        <span className={styles.pill}><span className={styles.pillDot} style={{ background: "var(--ink-3)" }} />Em revisão</span>
      </div>
    </section>
  );
}

export const EstadosSemanticos: Story = {
  render: () => <div className={styles.stack}><SemanticPane theme="light" name="Refy" /><SemanticPane theme="dommus" name="Dommus" /></div>,
};

const typeRows = [
  ["Wordmark", "Chillax 600 · lowercase · -0.035em", styles.wordmark, <BrandLogo brand="domuz" size="xl" />],
  ["Display hero · 64/72", "General Sans 700 · -0.03em", styles.display, <>Encontre o imóvel<br />que combina com você.</>],
  ["H1 · 48/56", "General Sans 600 · -0.02em", styles.h1, "Vamos entender o que você procura."],
  ["H2 · 36/44", "General Sans 600 · -0.018em", styles.h2, "Sinais para encontrar seu lugar"],
  ["H3 · 28/36", "General Sans 600 · -0.012em", styles.h3, "Conte um pouco sobre você"],
  ["H4 · 24/32", "General Sans 600 · -0.008em", styles.h4, "Cruzando preferências e imóveis"],
  ["Metric · 32/40", "General Sans 600 · -0.015em", styles.metric, "128 imóveis compatíveis"],
  ["Lead · 20/30", "Inter 400", styles.lead, "Conte sua rotina, seus bairros preferidos e o que precisa existir no próximo imóvel."],
  ["Body · 16/24", "Inter 400", styles.body, "Descreva as pessoas que vivem com você, os bairros que fazem sentido e o que não pode faltar no próximo imóvel."],
  ["Small · 14/20", "Inter 400", styles.small, "A busca considera preferências, orçamento e contexto de moradia."],
  ["Code · 13/20", "JetBrains Mono 400", styles.mono, "domuz.app/vinicius/encontrar-imovel"],
  ["Eyebrow · 11/16", "JetBrains Mono 600 · 0.12em", styles.eyebrow, "Perfil · busca personalizada"],
] as const;

export const Tipografia: Story = {
  render: () => (
    <section data-theme="dommus" className={styles.pane}>
      <header className={styles.head}>
        <span className={styles.crumb}>Type · escala completa</span>
        <h2>General Sans · Inter · JetBrains Mono</h2>
        <p>Chillax fica restrita à assinatura vetorial Domuz.</p>
      </header>
      <div className={styles.typeGrid}>
        {typeRows.map(([name, detail, className, sample]) => <div key={name} className={styles.typeRow}><div className={styles.typeMeta}><b>{name}</b>{detail}</div><div className={className}>{sample}</div></div>)}
      </div>
    </section>
  ),
};
