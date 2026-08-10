import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import mjml2html from "mjml";

const root = process.cwd();
const repoRoot = path.resolve(root, "..");
const templatePath = path.join(root, "emails", "templates", "base.mjml");
const fixturePath = path.join(root, "emails", "fixtures", "base-confirm-email.json");
const evidenceDir = path.join(repoRoot, "openspec", "changes", "validate-product-screen-flows", "evidence", "email-harness");
const brandLogoPath = path.join(root, "src", "prototypes", "assets", "brand", "domuz", "domuz-lockup.svg");

const requiredStrings = ["subject", "preheader", "label", "title", "body", "details", "cta", "footer", "privacy"];
const forbiddenPatterns = [
  /sk-[A-Za-z0-9]/,
  /postgres(?:ql)?:\/\//i,
  /gmail\.com/i,
  /viniciuscoimbra/i,
  /localhost:\d+\/api/i,
  /TODO|TBD|Lorem ipsum|Jane Doe|John Doe/i,
];

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textWrap(line, width = 76) {
  const words = line.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > width) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

function renderText(fixture) {
  const details = fixture.details.map((item) => `${item.label}: ${item.value}`).join("\n");
  return [
    fixture.subject,
    fixture.preheader,
    "",
    fixture.title,
    "",
    ...fixture.body.map((paragraph) => textWrap(paragraph)),
    "",
    details,
    "",
    `${fixture.cta.label}: ${fixture.cta.href}`,
    fixture.secondaryAction,
    "",
    fixture.footer,
    fixture.privacy,
    "",
  ].join("\n");
}

function renderMjml(template, fixture, brandLogoSrc) {
  const bodyBlocks = fixture.body
    .map((paragraph) => `<mj-text padding="0 0 16px">${htmlEscape(paragraph)}</mj-text>`)
    .join("\n");
  const detailBlocks = fixture.details
    .map((item) => `
      <mj-column width="33.333%" padding="0 10px 0 0">
        <mj-text css-class="dommus-detail-label" padding="0 0 4px">${htmlEscape(item.label)}</mj-text>
        <mj-text css-class="dommus-detail-value" padding="0">${htmlEscape(item.value)}</mj-text>
      </mj-column>
    `)
    .join("\n");

  const replacements = {
    brandLogoSrc,
    bodyBlocks,
    detailBlocks,
    subject: fixture.subject,
    preheader: fixture.preheader,
    label: fixture.label,
    title: fixture.title,
    ctaHref: fixture.cta.href,
    ctaLabel: fixture.cta.label,
    secondaryAction: fixture.secondaryAction,
    footer: fixture.footer,
    privacy: fixture.privacy,
  };

  return Object.entries(replacements).reduce(
    (source, [key, value]) => source.replaceAll(`{{${key}}}`, key.endsWith("Blocks") ? value : htmlEscape(value)),
    template,
  );
}

async function captureScreenshots(htmlPath) {
  const requireFromWebapp = createRequire(path.join(repoRoot, "webapp", "package.json"));
  const { chromium } = requireFromWebapp("playwright");
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    if (!String(error).includes("Executable doesn't exist")) throw error;
    browser = await chromium.launch({ channel: "chrome" });
  }
  const screenshots = [];
  try {
    for (const [name, viewport] of Object.entries({
      desktop: { width: 1440, height: 900 },
      mobile: { width: 390, height: 844 },
    })) {
      const page = await browser.newPage({ viewport });
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyText: document.body.innerText,
      }));
      if (!metrics.bodyText.includes("Confirme o e-mail da sua conta")) {
        throw new Error(`preview ${name}: titulo nao encontrado`);
      }
      const screenshot = path.join(evidenceDir, `${name}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      screenshots.push({ name, viewport, screenshot: path.relative(repoRoot, screenshot), metrics });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return screenshots;
}

const [template, fixtureRaw, logoSvg] = await Promise.all([
  fs.readFile(templatePath, "utf8"),
  fs.readFile(fixturePath, "utf8"),
  fs.readFile(brandLogoPath, "utf8"),
]);
const fixture = JSON.parse(fixtureRaw);

for (const key of requiredStrings) {
  if (fixture[key] == null) throw new Error(`fixture sem ${key}`);
}

const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;
const mjml = renderMjml(template, fixture, logoDataUri);
const compiled = await mjml2html(mjml, { filePath: templatePath, validationLevel: "strict" });
if ((compiled.errors ?? []).length > 0) {
  throw new Error(compiled.errors.map((error) => error.formattedMessage).join("\n"));
}

const text = renderText(fixture);
for (const [label, value] of Object.entries({ fixture: fixtureRaw, mjml, html: compiled.html, text })) {
  const match = forbiddenPatterns.find((pattern) => pattern.test(value));
  if (match) throw new Error(`${label}: padrao proibido encontrado (${match})`);
}

await fs.mkdir(evidenceDir, { recursive: true });
const htmlPath = path.join(evidenceDir, "base.html");
const textPath = path.join(evidenceDir, "base.txt");
await fs.writeFile(htmlPath, compiled.html);
await fs.writeFile(textPath, text);

const screenshots = await captureScreenshots(htmlPath);
const manifest = {
  id: fixture.id,
  status: fixture.status,
  subject: fixture.subject,
  preheader: fixture.preheader,
  recipient: fixture.recipient.email,
  source: path.relative(repoRoot, templatePath),
  fixture: path.relative(repoRoot, fixturePath),
  html: path.relative(repoRoot, htmlPath),
  text: path.relative(repoRoot, textPath),
  screenshots,
  noExternalSend: true,
  noSecretsOrProductionPii: true,
};
await fs.writeFile(path.join(evidenceDir, "qa.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
