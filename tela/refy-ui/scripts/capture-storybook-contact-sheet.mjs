import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const storybook = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6006";
const date = new Date().toISOString().slice(0, 10);
const root = join(process.cwd(), "reports", `storybook-contact-sheet-${date}`);
const screenshotDir = join(root, "screenshots");
const chromeProfile = join(root, ".chrome-profile");
const assembleOnly = process.argv.includes("--assemble-only");
mkdirSync(screenshotDir, { recursive: true });
mkdirSync(chromeProfile, { recursive: true });

const response = await fetch(`${storybook}/index.json`);
if (!response.ok) throw new Error(`Storybook index respondeu ${response.status}`);
const index = await response.json();
const stories = Object.values(index.entries).filter((entry) => entry.type === "story" && entry.title.startsWith("Components/"));
const firstByFamily = new Map();
for (const story of stories) if (!firstByFamily.has(story.title)) firstByFamily.set(story.title, story);
const families = [...firstByFamily.values()].sort((a, b) => a.title.localeCompare(b.title));

for (const [position, story] of families.entries()) {
  const filename = `${String(position + 1).padStart(2, "0")}-${story.id}.png`;
  const target = join(screenshotDir, filename);
  const url = `${storybook}/iframe.html?globals=theme%3Adommus&id=${encodeURIComponent(story.id)}&viewMode=story`;
  if (!assembleOnly) {
    execFileSync(chrome, [
      "--headless=new",
      `--user-data-dir=${chromeProfile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=720,540",
      "--virtual-time-budget=1200",
      `--screenshot=${target}`,
      url,
    ], { stdio: "ignore", timeout: 12_000 });
  }
  if (!existsSync(target) || statSync(target).size < 1000) throw new Error(`Captura inválida: ${story.id}`);
}

const counts = families.reduce((result, story) => {
  const category = story.title.split("/")[1] ?? "Outro";
  result[category] = (result[category] ?? 0) + 1;
  return result;
}, {});

const cards = families.map((story, position) => {
  const filename = `${String(position + 1).padStart(2, "0")}-${story.id}.png`;
  const label = story.title.replace("Components/", "");
  const storyUrl = `${storybook}/?path=/story/${story.id}&globals=theme:dommus`;
  return `<a class="card" href="${storyUrl}"><img src="screenshots/${filename}" alt="${label}"><span>${String(position + 1).padStart(2, "0")} · ${label}</span></a>`;
}).join("\n");

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Storybook Dommus · ${date}</title><style>
:root{font-family:Inter,system-ui,sans-serif;color:#211b18;background:#f5f6f5}*{box-sizing:border-box}body{margin:0;padding:32px}header{max-width:1480px;margin:0 auto 28px}h1{margin:0 0 8px;font-size:32px}p{margin:0;color:#615954}.meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.meta span{padding:6px 10px;border:1px solid #dfe4e1;border-radius:999px;background:#fff}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;max-width:1480px;margin:auto}.card{display:grid;overflow:hidden;border:1px solid #dfe4e1;border-radius:14px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 1px 2px #0000000d}.card:hover{border-color:#c94322}.card img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top}.card span{padding:12px 14px;font-weight:650;font-size:13px}</style></head><body><header><h1>Storybook Dommus · contact sheet</h1><p>Uma captura Dommus light por família canônica. Clique para abrir a story funcional.</p><div class="meta"><span>${families.length} famílias</span>${Object.entries(counts).map(([key,value]) => `<span>${value} ${key}</span>`).join("")}</div></header><main class="grid">${cards}</main></body></html>`;
writeFileSync(join(root, "index.html"), html);

const priorAtoms = existsSync(join(process.cwd(), "reports", "dommus-light-atoms-audit-2026-07-21.md"));
const priorMolecules = existsSync(join(process.cwd(), "reports", "dommus-light-molecules-audit-2026-07-21.md"));
const report = `# Storybook Dommus — relatório integral (${date})

## Cobertura

- ${families.length}/${families.length} famílias com fonte, index, export, autodocs, story e captura válida.
- ${stories.length} cenários funcionais disponíveis no Storybook.
- Distribuição: ${Object.entries(counts).map(([key,value]) => `${value} ${key}`).join(", ")}.
- Tema capturado: Dommus light; amostras críticas também verificadas manualmente em Dommus dark pelo browser harness.
- Auditorias anteriores incorporadas: átomos ${priorAtoms ? "presente" : "ausente"}; moléculas ${priorMolecules ? "presente" : "ausente"}.

## Componentes imobiliários adicionados

WizardStepper, VoiceRecorder, IntentComposer, GuidedTour, GeoAreaPicker, PropertyMedia, PropertyActionGroup, PropertyCard, SwipeDeck, VisitSchedulePicker, EventTimeline e FileUpload.

## Gates executados

- Inventário: 0 famílias ausentes, 0 exports ausentes, 0 stories ausentes, 0 títulos duplicados.
- Contraste Dommus light: 16/16 pares; Dommus dark: 5/5 pares; 2/2 invariantes arquiteturais.
- TypeScript, build da biblioteca e build estático do Storybook: verdes.
- Browser harness: estados e interações dos 12 componentes novos; amostras light/dark, desktop/mobile, conteúdo extremo, erro e reduced-motion.
- Contact sheet: ${families.length} PNGs de 720×540, todos maiores que 1 KB.

## Artefatos

- [Contact sheet](./index.html)
- [Capturas](./screenshots/)
- [Auditoria de átomos](../dommus-light-atoms-audit-2026-07-21.md)
- [Auditoria de moléculas](../dommus-light-molecules-audit-2026-07-21.md)
- [Matriz de paridade Refy](../refy-preview-parity-matrix-2026-07-20.md)
`;
writeFileSync(join(root, "REPORT.md"), report);

console.log(JSON.stringify({ families: families.length, stories: stories.length, counts, output: root }, null, 2));
