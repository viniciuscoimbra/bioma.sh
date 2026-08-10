import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const css = await fs.readFile("src/tokens/tokens.css", "utf8");

function themeBlock(theme) {
  const marker = `[data-theme="${theme}"]`;
  const markerIndex = css.indexOf(marker);
  if (markerIndex < 0) return null;
  const openIndex = css.indexOf("{", markerIndex);
  const closeIndex = css.indexOf("\n}", openIndex);
  if (openIndex < 0 || closeIndex < 0) return null;
  return css.slice(openIndex + 1, closeIndex);
}

const block = themeBlock("dommus");
const darkBlock = themeBlock("dommus-dark");
if (!block || !darkBlock) throw new Error("Temas Dommus light/dark não encontrados");

const tokens = Object.fromEntries(
  Array.from(block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})\s*;/g), ([, name, value]) => [name, value])
);
const darkTokens = Object.fromEntries(
  Array.from(darkBlock.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})\s*;/g), ([, name, value]) => [name, value])
);

function luminance(hex) {
  const channels = hex.match(/[\da-fA-F]{2}/g).map((value) => Number.parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const pairs = [
  ["on-primary", "primary", 4.5],
  ["on-primary", "primary-hover", 4.5],
  ["ink-1", "surface", 7],
  ["ink-2", "surface", 4.5],
  ["ink-3", "surface", 4.5],
  ["primary-ink", "primary-soft", 4.5],
  ["on-critical", "critical", 4.5],
  ["critical-ink", "critical-soft", 4.5],
  ["on-weak", "weak", 4.5],
  ["weak-ink", "weak-soft", 4.5],
  ["on-ok", "ok", 4.5],
  ["ok-ink", "ok-soft", 4.5],
  ["on-good", "good", 4.5],
  ["good-ink", "good-soft", 4.5],
  ["on-info", "info", 4.5],
  ["info-ink", "info-soft", 4.5],
];

const results = pairs.map(([foreground, background, minimum]) => {
  const value = ratio(tokens[foreground], tokens[background]);
  return { foreground, background, ratio: Number(value.toFixed(2)), minimum, pass: value >= minimum };
});

const darkPairs = [
  ["on-primary", "primary", 4.5],
  ["on-primary", "primary-hover", 4.5],
  ["ink-1", "surface", 7],
  ["ink-2", "surface", 4.5],
  ["ink-3", "surface", 4.5],
];
const darkResults = darkPairs.map(([foreground, background, minimum]) => {
  const value = ratio(darkTokens[foreground], darkTokens[background]);
  return { foreground, background, ratio: Number(value.toFixed(2)), minimum, pass: value >= minimum };
});

async function componentCss(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const chunks = [];
  for (const file of files) {
    const target = path.join(dir, file.name);
    if (file.isDirectory()) chunks.push(await componentCss(target));
    else if (file.name.endsWith(".css")) chunks.push(await fs.readFile(target, "utf8"));
  }
  return chunks.join("\n");
}

const cssModules = await componentCss("src/components");
const semanticBrandMismatch = Array.from(cssModules.matchAll(/[^{}]+\{[^{}]+\}/g), ([rule]) => rule)
  .filter((rule) => /background:\s*var\(--(critical|weak|ok|good|info)-soft\)/.test(rule))
  .filter((rule) => /color:\s*var\(--(primary|primary-ink|brand-[\w-]+)/.test(rule));

const architecture = [
  {
    check: "neutral-light-surface",
    detail: "legacy-white precisa coincidir com surface no Dommus light",
    pass: tokens["legacy-white"] === tokens.surface,
  },
  {
    check: "semantic-colors-independent-from-brand",
    detail: "soft semântico não pode usar tinta primary/brand",
    pass: semanticBrandMismatch.length === 0,
    violations: semanticBrandMismatch,
  },
];

console.log(JSON.stringify({ contrast: { dommus: results, "dommus-dark": darkResults }, architecture }, null, 2));
if (results.some((result) => !result.pass) || darkResults.some((result) => !result.pass) || architecture.some((result) => !result.pass)) process.exitCode = 1;
