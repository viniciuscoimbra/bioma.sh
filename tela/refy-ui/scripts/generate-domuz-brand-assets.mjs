import { spawnSync } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import potrace from "potrace";
import { PNG } from "pngjs";
import TextToSVG from "text-to-svg";
import bounds from "svg-path-bounds";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const assetDir = path.join(root, "src/prototypes/assets/brand/domuz");
const componentDir = path.join(root, "src/components/BrandLogo");
const sourcePng = path.join(assetDir, "domuz-mark-black.png");
const chillaxUrl = "https://cdn.fontshare.com/wf/2T24MWUOKZU65SZJ33GPRGNOKE4KPOBX/T6LIXZJIPB23UDPMTIKURYWSZLXZBJ3A/THF5L6EHVL4N4NNE3GYDZNZSHABL5CH5.ttf";

const color = {
  theme: "#F15A24",
  themeDark: "#C94322",
  themeHot: "#FF8A32",
  ink: "#171312",
  white: "#FFF8F5",
  surface: "#F5F6F5",
  line: "#E2DDDA",
  muted: "#776C67",
  green: "#10B981",
  blue: "#0A66C4",
  yellow: "#F7D117",
};

const iconThreshold = 210;
const traceOptions = {
  threshold: iconThreshold,
  blackOnWhite: true,
  turdSize: 1,
  alphaMax: 1,
  optCurve: true,
  optTolerance: 0.08,
};

const seasonal = {
  pride: [["", "#E62418"], ["18%", "#FF7A00"], ["36%", "#FFD400"], ["54%", "#008A3D"], ["72%", "#0057B8"], ["90%", "#7A1FA2"], ["100%", "#F43F7A"]],
  trans: [["", "#6EC6EA"], ["34%", "#F7A8B8"], ["50%", "#FFF8F5"], ["66%", "#F7A8B8"], ["100%", "#6EC6EA"]],
  copa: [["", "#F7D117"], ["38%", "#169B45"], ["72%", "#0057B8"], ["100%", "#F7D117"]],
};
const themeSolidGradient = [["", color.themeHot], ["56%", color.theme], ["100%", color.themeDark]];

const logoManifest = [];
const iconManifest = [];
const applicationManifest = [];

function fixed(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function cropDarkPixels(input, threshold) {
  const min = { x: input.width, y: input.height };
  const max = { x: 0, y: 0 };

  for (let y = 0; y < input.height; y += 1) {
    for (let x = 0; x < input.width; x += 1) {
      const index = (input.width * y + x) << 2;
      const r = input.data[index];
      const g = input.data[index + 1];
      const b = input.data[index + 2];
      const a = input.data[index + 3];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a > 0 && luma < threshold) {
        min.x = Math.min(min.x, x);
        min.y = Math.min(min.y, y);
        max.x = Math.max(max.x, x);
        max.y = Math.max(max.y, y);
      }
    }
  }

  if (min.x > max.x || min.y > max.y) throw new Error(`No dark pixels found in ${sourcePng}`);

  const width = max.x - min.x + 1;
  const height = max.y - min.y + 1;
  const output = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const source = (input.width * (min.y + y) + (min.x + x)) << 2;
      const target = (width * y + x) << 2;
      output.data[target] = input.data[source];
      output.data[target + 1] = input.data[source + 1];
      output.data[target + 2] = input.data[source + 2];
      output.data[target + 3] = input.data[source + 3];
    }
  }

  return { png: output, width, height, crop: { min, max } };
}

function trace(file) {
  return new Promise((resolve, reject) => {
    potrace.trace(file, traceOptions, (error, svg) => {
      if (error) reject(error);
      else resolve(svg);
    });
  });
}

function svgPath(svg) {
  const match = svg.match(/<path[^>]*d="([^"]+)"/);
  if (!match) throw new Error("potrace output did not contain a path");
  return match[1];
}

function download(url, file) {
  if (fs.existsSync(file)) return Promise.resolve(file);
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }
        const stream = fs.createWriteStream(file);
        response.pipe(stream);
        stream.on("finish", () => stream.close(() => resolve(file)));
      })
      .on("error", reject);
  });
}

function svg(title, viewBox, body, attrs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="title"${attrs}>
  <title id="title">${title}</title>
${body}
</svg>
`;
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function writeAsset(relativePath, content, entry) {
  write(path.join(assetDir, relativePath), content);
  if (entry?.kind === "logo") logoManifest.push({ ...entry, file: relativePath });
  if (entry?.kind === "icon") iconManifest.push({ ...entry, file: relativePath });
  if (entry?.kind === "application") applicationManifest.push({ ...entry, file: relativePath });
}

function pathAttr(fill, d, transform = "") {
  return `<path fill="${fill}" fill-rule="evenodd" d="${d}"${transform ? ` transform="${transform}"` : ""}/>`;
}

function splitPathSubpaths(d) {
  const parts = d.match(/M [\s\S]*?(?=M |$)/g);
  if (!parts?.length) throw new Error("Domuz symbol path has no subpaths");
  return parts;
}

function solidGestaltPath(symbol) {
  const [, ...innerPaths] = splitPathSubpaths(symbol.path);
  if (innerPaths.length < 2) throw new Error("Domuz symbol path has no inner gestalt paths");
  return innerPaths.join(" ");
}

function wordmarkPath(fill, wordmark, transform = "") {
  return `<path fill="${fill}" d="${wordmark.path}" transform="${transform || `translate(${-wordmark.minX} ${-wordmark.minY})`}"/>`;
}

function gradientDefs(id, stops) {
  return `  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
${stops.map(([offset, stopColor]) => `      <stop${offset ? ` offset="${offset}"` : ""} stop-color="${stopColor}"/>`).join("\n")}
    </linearGradient>
  </defs>
`;
}

function lineMarkSvg(title, symbol, fill, defs = "") {
  return svg(title, `0 0 ${symbol.width} ${symbol.height}`, `${defs}  ${pathAttr(fill, symbol.path)}`);
}

function lineLockupBody(symbol, wordmark, lockup, fill) {
  const symbolTransform = `translate(0 ${lockup.symbolY}) scale(${lockup.symbolScale})`;
  const textTransform = `translate(${lockup.wordmarkX} ${lockup.wordmarkY}) translate(${-wordmark.minX} ${-wordmark.minY})`;
  return `  ${pathAttr(fill.symbol, symbol.path, symbolTransform)}
  ${wordmarkPath(fill.wordmark, wordmark, textTransform)}`;
}

function lineLockupSvg(title, symbol, wordmark, lockup, fill, defs = "") {
  return svg(title, `0 0 ${lockup.width} ${lockup.height}`, `${defs}${lineLockupBody(symbol, wordmark, lockup, fill)}`);
}

function solidMarkBody(symbol, solidMark, surface, transform = "") {
  const content = `<g transform="translate(${solidMark.symbolX} ${solidMark.symbolY}) scale(${solidMark.symbolScale})">
    ${pathAttr(surface, solidMark.gestaltPath)}
  </g>`;
  return transform ? `  <g transform="${transform}">
    ${content}
  </g>` : `  ${content}`;
}

function solidMarkSvg(title, symbol, solidMark, fill, defs = "") {
  return svg(title, `0 0 ${solidMark.size} ${solidMark.size}`, `${defs}${solidMarkBody(symbol, solidMark, fill.surface)}`);
}

function solidLockupBody(symbol, wordmark, solidMark, solidLockup, fill) {
  const textTransform = `translate(${solidLockup.wordmarkX} ${solidLockup.wordmarkY}) translate(${-wordmark.minX} ${-wordmark.minY})`;
  return `${solidMarkBody(symbol, solidMark, fill.surface, `translate(${solidLockup.symbolShiftX} 0)`)}
  ${wordmarkPath(fill.wordmark, wordmark, textTransform)}`;
}

function solidLockupSvg(title, symbol, wordmark, solidMark, solidLockup, fill, defs = "") {
  return svg(title, `0 0 ${solidLockup.width} ${solidLockup.height}`, `${defs}${solidLockupBody(symbol, wordmark, solidMark, solidLockup, fill)}`);
}

function generatedTs(symbol, wordmark, lineLockup, solidMark, solidLockup) {
  return `// Generated by scripts/generate-domuz-brand-assets.mjs. Do not edit by hand.

export const DOMUZ_SYMBOL = {
  width: ${symbol.width},
  height: ${symbol.height},
  path: ${JSON.stringify(symbol.path)},
} as const;

export const DOMUZ_SOLID_GESTALT_PATH = ${JSON.stringify(solidMark.gestaltPath)};

export const DOMUZ_WORDMARK = {
  width: ${wordmark.width},
  height: ${wordmark.height},
  minX: ${wordmark.minX},
  minY: ${wordmark.minY},
  path: ${JSON.stringify(wordmark.path)},
} as const;

export const DOMUZ_LOCKUP = {
  width: ${lineLockup.width},
  height: ${lineLockup.height},
  symbolScale: ${lineLockup.symbolScale},
  symbolY: ${lineLockup.symbolY},
  wordmarkX: ${lineLockup.wordmarkX},
  wordmarkY: ${lineLockup.wordmarkY},
} as const;

export const DOMUZ_SOLID_MARK = {
  size: ${solidMark.size},
  radius: ${solidMark.radius},
  symbolScale: ${solidMark.symbolScale},
  symbolX: ${solidMark.symbolX},
  symbolY: ${solidMark.symbolY},
} as const;

export const DOMUZ_SOLID_LOCKUP = {
  width: ${solidLockup.width},
  height: ${solidLockup.height},
  symbolShiftX: ${solidLockup.symbolShiftX},
  wordmarkX: ${solidLockup.wordmarkX},
  wordmarkY: ${solidLockup.wordmarkY},
} as const;
`;
}

function text(x, y, value, size, fill = color.ink, weight = 600, anchor = "start") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${value}</text>`;
}

function roundedRect(x, y, width, height, radius, fill, stroke = "none") {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}"${stroke === "none" ? "" : ` stroke="${stroke}"`}/>`;
}

function appLockup(symbol, wordmark, lockup, x, y, width, fill, mode = "solid") {
  const scale = width / lockup.width;
  if (mode === "solid") {
    const solidFill = {
      surface: fill.surface ?? fill.symbol,
      glyph: fill.glyph ?? color.white,
      wordmark: fill.wordmark,
    };
    return `<g transform="translate(${x} ${y}) scale(${scale})">${solidLockupBody(symbol, wordmark, solidMark, solidLockup, solidFill)}</g>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${scale})">${lineLockupBody(symbol, wordmark, lockup, fill)}</g>`;
}

function applicationSvg(title, width, height, body) {
  return svg(title, `0 0 ${width} ${height}`, body, ` width="${width}" height="${height}"`);
}

function watermarkLockup(symbol, wordmark, lockup, x, y, width, fill) {
  return `<g opacity="0.14" transform="translate(${x} ${y}) scale(${width / lockup.width})">
${lineLockupBody(symbol, wordmark, lockup, fill)}
  </g>`;
}

function renderPng(sourceRelativePath, outputRelativePath, size) {
  const source = path.join(assetDir, sourceRelativePath);
  const output = path.join(assetDir, outputRelativePath);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const result = spawnSync("rsvg-convert", ["-w", String(size), "-h", String(size), source, "-o", output], { encoding: "utf8" });
  if (result.status !== 0) {
    console.warn(`skipped ${outputRelativePath}: rsvg-convert failed`);
    return false;
  }
  return true;
}

function iconEntry(group, size, file, purpose) {
  iconManifest.push({ kind: "icon", group, size, file, purpose });
}

const cropped = cropDarkPixels(readPng(sourcePng), 245);
const croppedFile = path.join(os.tmpdir(), "domuz-mark-cropped.png");
fs.writeFileSync(croppedFile, PNG.sync.write(cropped.png));

const tracedSvg = await trace(croppedFile);
const symbol = {
  width: cropped.width,
  height: cropped.height,
  path: svgPath(tracedSvg),
};

const fontFile = path.join(os.tmpdir(), "chillax-semibold.ttf");
await download(chillaxUrl, fontFile);
const textToSvg = TextToSVG.loadSync(fontFile);
const wordmarkPathData = textToSvg.getD("domuz", {
  x: 0,
  y: 0,
  fontSize: 720,
  anchor: "top",
  letterSpacing: -0.035,
});
const [minX, minY, maxX, maxY] = bounds(wordmarkPathData).map((value) => fixed(value));
const wordmark = {
  minX,
  minY,
  width: fixed(maxX - minX),
  height: fixed(maxY - minY),
  path: wordmarkPathData,
};

const lockupHeight = 1000;
const symbolScale = fixed(lockupHeight / symbol.height, 6);
const symbolWidth = fixed(symbol.width * symbolScale);
const symbolHeight = fixed(symbol.height * symbolScale);
const gap = fixed(lockupHeight * 0.14);
const lineLockup = {
  width: fixed(symbolWidth + gap + wordmark.width),
  height: lockupHeight,
  symbolScale,
  symbolY: fixed((lockupHeight - symbolHeight) / 2),
  wordmarkX: fixed(symbolWidth + gap),
  wordmarkY: fixed((lockupHeight - wordmark.height) / 2),
};

const gestaltPath = solidGestaltPath(symbol);
const solidScale = fixed(760 / symbol.width, 6);
const solidMark = {
  size: 1000,
  radius: 180,
  symbolScale: solidScale,
  symbolX: 120,
  symbolY: fixed((1000 - symbol.height * solidScale) / 2),
  gestaltPath,
};
const [solidMinX, , solidMaxX] = bounds(gestaltPath).map((value) => fixed(value));
const solidPaintedMinX = fixed(solidMark.symbolX + solidMinX * solidMark.symbolScale);
const solidPaintedMaxX = fixed(solidMark.symbolX + solidMaxX * solidMark.symbolScale);
const solidVisualWidth = fixed(solidPaintedMaxX - solidPaintedMinX);
const solidLockup = {
  width: fixed(solidVisualWidth + gap + wordmark.width),
  height: solidMark.size,
  symbolShiftX: fixed(-solidPaintedMinX),
  wordmarkX: fixed(solidVisualWidth + gap),
  wordmarkY: fixed((solidMark.size - wordmark.height) / 2),
};

write(path.join(componentDir, "domuzLogo.generated.ts"), generatedTs(symbol, wordmark, lineLockup, solidMark, solidLockup));

const logoVariants = [
  {
    name: "theme",
    label: "Cor do tema",
    line: { symbol: color.theme, wordmark: color.ink },
    solid: { surface: color.theme, glyph: color.white, wordmark: color.theme },
    solidGradient: themeSolidGradient,
    use: "Produto, site e materiais institucionais claros.",
  },
  {
    name: "black",
    label: "Preto",
    line: { symbol: color.ink, wordmark: color.ink },
    solid: { surface: color.ink, glyph: color.white, wordmark: color.ink },
    use: "Documento, contrato, assinatura simples e impressão.",
  },
  {
    name: "white",
    label: "Branco",
    line: { symbol: color.white, wordmark: color.white },
    solid: { surface: color.white, glyph: color.ink, wordmark: color.white },
    use: "Fundo escuro, foto escura, placa e vídeo.",
  },
];

for (const variant of logoVariants) {
  const solidGradientId = variant.solidGradient ? `domuzSolid${variant.name}` : null;
  const solidDefs = solidGradientId ? gradientDefs(solidGradientId, variant.solidGradient) : "";
  const solidSurface = solidGradientId ? `url(#${solidGradientId})` : variant.solid.surface;
  const solidWordmark = solidGradientId ? `url(#${solidGradientId})` : variant.solid.wordmark;

  writeAsset(`logos/domuz-mark-line-${variant.name}.svg`, lineMarkSvg(`Domuz linha ${variant.label}`, symbol, variant.line.symbol), {
    kind: "logo",
    family: "mark",
    mode: "line",
    color: variant.name,
    wordmark: false,
    use: variant.use,
  });
  writeAsset(`logos/domuz-lockup-line-${variant.name}.svg`, lineLockupSvg(`Domuz lockup linha ${variant.label}`, symbol, wordmark, lineLockup, variant.line), {
    kind: "logo",
    family: "lockup",
    mode: "line",
    color: variant.name,
    wordmark: true,
    use: variant.use,
  });
  writeAsset(`logos/domuz-mark-solid-${variant.name}.svg`, solidMarkSvg(`Domuz solido ${variant.label}`, symbol, solidMark, { ...variant.solid, surface: solidSurface }, solidDefs), {
    kind: "logo",
    family: "mark",
    mode: "solid",
    color: variant.name,
    wordmark: false,
    use: variant.use,
  });
  writeAsset(`logos/domuz-lockup-solid-${variant.name}.svg`, solidLockupSvg(`Domuz lockup solido ${variant.label}`, symbol, wordmark, solidMark, solidLockup, { ...variant.solid, surface: solidSurface, wordmark: solidWordmark }, solidDefs), {
    kind: "logo",
    family: "lockup",
    mode: "solid",
    color: variant.name,
    wordmark: true,
    use: variant.use,
  });
}

writeAsset("domuz-mark-line.svg", lineMarkSvg("Domuz mark", symbol, "currentColor"));
writeAsset("domuz-mark-mono.svg", lineMarkSvg("Domuz mark mono", symbol, color.ink));
writeAsset("domuz-mark-inverse.svg", lineMarkSvg("Domuz mark inverse", symbol, color.white));
writeAsset("domuz-mark-solid.svg", solidMarkSvg("Domuz mark solid", symbol, solidMark, { surface: "url(#domuzSolidTheme)", glyph: color.white }, gradientDefs("domuzSolidTheme", themeSolidGradient)));
writeAsset("domuz-wordmark.svg", svg("Domuz wordmark", `0 0 ${wordmark.width} ${wordmark.height}`, `  ${wordmarkPath("currentColor", wordmark)}`));
writeAsset("domuz-lockup.svg", lineLockupSvg("Domuz lockup", symbol, wordmark, lineLockup, logoVariants[0].line));
writeAsset("domuz-lockup-inverse.svg", lineLockupSvg("Domuz lockup inverse", symbol, wordmark, lineLockup, logoVariants[2].line));
writeAsset("domuz-lockup-orange.svg", lineLockupSvg("Domuz lockup orange", symbol, wordmark, lineLockup, { symbol: color.theme, wordmark: color.theme }));

for (const [name, stops] of Object.entries(seasonal)) {
  const id = `domuz${name}`;
  const defs = gradientDefs(id, stops);
  const fill = `url(#${id})`;
  const label = name === "pride" ? "orgulho LGBTQIA+" : name === "trans" ? "visibilidade trans" : "Copa do Mundo";
  writeAsset(`logos/domuz-mark-line-${name}.svg`, lineMarkSvg(`Domuz linha ${label}`, symbol, fill, defs), {
    kind: "logo",
    family: "mark",
    mode: "line",
    color: name,
    wordmark: false,
    use: "Campanhas e editoriais da data.",
  });
  writeAsset(`logos/domuz-lockup-line-${name}.svg`, lineLockupSvg(`Domuz lockup linha ${label}`, symbol, wordmark, lineLockup, { symbol: fill, wordmark: fill }, defs), {
    kind: "logo",
    family: "lockup",
    mode: "line",
    color: name,
    wordmark: true,
    use: "Campanhas e editoriais da data.",
  });
  writeAsset(`logos/domuz-mark-solid-${name}.svg`, solidMarkSvg(`Domuz solido ${label}`, symbol, solidMark, { surface: fill, glyph: color.white }, defs), {
    kind: "logo",
    family: "mark",
    mode: "solid",
    color: name,
    wordmark: false,
    use: "Avatar, splash e cards de campanha.",
  });
  writeAsset(`logos/domuz-lockup-solid-${name}.svg`, solidLockupSvg(`Domuz lockup solido ${label}`, symbol, wordmark, solidMark, solidLockup, { surface: fill, glyph: color.white, wordmark: fill }, defs), {
    kind: "logo",
    family: "lockup",
    mode: "solid",
    color: name,
    wordmark: true,
    use: "Campanhas com assinatura completa.",
  });
}

writeAsset("domuz-lockup-pride.svg", lineLockupSvg("Domuz lockup orgulho LGBTQIA+", symbol, wordmark, lineLockup, { symbol: "url(#domuzPride)", wordmark: "url(#domuzPride)" }, gradientDefs("domuzPride", seasonal.pride)));
writeAsset("domuz-lockup-trans.svg", lineLockupSvg("Domuz lockup visibilidade trans", symbol, wordmark, lineLockup, { symbol: "url(#domuzTrans)", wordmark: "url(#domuzTrans)" }, gradientDefs("domuzTrans", seasonal.trans)));
writeAsset("domuz-lockup-copa.svg", lineLockupSvg("Domuz lockup Copa do Mundo", symbol, wordmark, lineLockup, { symbol: "url(#domuzCopa)", wordmark: "url(#domuzCopa)" }, gradientDefs("domuzCopa", seasonal.copa)));

writeAsset("icons/domuz-icon-app.svg", solidMarkSvg("Domuz app icon", symbol, solidMark, { surface: "url(#domuzSolidTheme)", glyph: color.white }, gradientDefs("domuzSolidTheme", themeSolidGradient)), { kind: "icon", group: "master", size: "svg", purpose: "Fonte para icones de app e favicon." });
writeAsset("icons/domuz-icon-app-black.svg", solidMarkSvg("Domuz app icon black", symbol, solidMark, { surface: color.ink, glyph: color.white }), { kind: "icon", group: "master", size: "svg", purpose: "App icon monocromatico escuro." });
writeAsset("icons/domuz-icon-app-white.svg", solidMarkSvg("Domuz app icon white", symbol, solidMark, { surface: color.white, glyph: color.ink }), { kind: "icon", group: "master", size: "svg", purpose: "App icon claro para fundos escuros." });
writeAsset("icons/favicon.svg", lineMarkSvg("Domuz favicon", symbol, color.theme), { kind: "icon", group: "site", size: "svg", purpose: "Favicon SVG responsivo." });

for (const size of [16, 32, 48, 64, 96, 128]) {
  const file = `icons/site/favicon-${size}.png`;
  if (renderPng("icons/domuz-icon-app.svg", file, size)) iconEntry("site", size, file, "Favicon PNG.");
}

for (const size of [120, 152, 167, 180]) {
  const file = `icons/mobile/apple-touch-icon-${size}.png`;
  if (renderPng("icons/domuz-icon-app.svg", file, size)) iconEntry("mobile", size, file, "Apple touch icon.");
}

for (const size of [192, 512]) {
  const chrome = `icons/mobile/android-chrome-${size}.png`;
  const maskable = `icons/mobile/maskable-icon-${size}.png`;
  if (renderPng("icons/domuz-icon-app.svg", chrome, size)) iconEntry("mobile", size, chrome, "Android Chrome icon.");
  if (renderPng("icons/domuz-icon-app.svg", maskable, size)) iconEntry("mobile", size, maskable, "Maskable PWA icon.");
}

writeAsset("icons/site.webmanifest", `${JSON.stringify({
  name: "Domuz.app",
  short_name: "Domuz",
  icons: [
    { src: "mobile/android-chrome-192.png", sizes: "192x192", type: "image/png" },
    { src: "mobile/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    { src: "mobile/maskable-icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "mobile/maskable-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  theme_color: color.theme,
  background_color: color.surface,
  display: "standalone",
}, null, 2)}\n`);

writeAsset("applications/web-header.svg", applicationSvg("Domuz web header", 1440, 720, `  <rect width="1440" height="720" fill="${color.surface}"/>
  ${roundedRect(64, 54, 1312, 92, 24, color.white, color.line)}
  ${appLockup(symbol, wordmark, lineLockup, 96, 82, 180, { symbol: color.theme, wordmark: color.ink })}
  ${roundedRect(1040, 78, 104, 44, 14, color.theme)}
  ${text(1076, 110, "Entrar", 18, color.white, 700)}
  ${text(96, 272, "O lar ideal esta", 56, color.ink, 700)}
  ${text(96, 334, "mais perto.", 56, color.ink, 700)}
  ${text(96, 398, "Assinatura solida para telas em que a marca divide espaco com busca.", 22, color.muted, 400)}
  ${roundedRect(96, 470, 448, 68, 18, color.white, color.line)}
  ${text(128, 513, "Cidade, bairro ou referencia", 20, color.muted, 400)}
  ${roundedRect(564, 470, 186, 68, 18, color.theme)}
  ${text(598, 513, "Buscar imoveis", 20, color.white, 700)}
  ${roundedRect(880, 236, 360, 320, 36, "#EAE4E0")}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(980 316) scale(0.18)")}`), {
  kind: "application",
  surface: "Web",
  fileName: "web-header.svg",
  use: "Topo de site, landing e pagina institucional.",
});

writeAsset("applications/app-splash.svg", applicationSvg("Domuz app splash", 1080, 1920, `  <defs>
    <linearGradient id="splash" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${color.themeHot}"/>
      <stop offset="1" stop-color="${color.themeDark}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#splash)"/>
  ${solidMarkBody(symbol, solidMark, color.white, "translate(290 596) scale(0.5)")}
  ${appLockup(symbol, wordmark, lineLockup, 340, 1168, 400, { symbol: color.white, glyph: color.theme, wordmark: color.white }, "solid")}
  ${text(540, 1308, "Seu proximo lugar comeca aqui.", 34, color.white, 500, "middle")}`), {
  kind: "application",
  surface: "Mobile",
  fileName: "app-splash.svg",
  use: "Tela de abertura e splash screen.",
});

writeAsset("applications/instagram-post.svg", applicationSvg("Domuz Instagram post", 1080, 1080, `  <defs>
    <linearGradient id="post" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${color.themeHot}"/>
      <stop offset="0.56" stop-color="${color.theme}"/>
      <stop offset="1" stop-color="${color.themeDark}"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#post)"/>
  ${appLockup(symbol, wordmark, lineLockup, 92, 92, 310, { symbol: color.white, glyph: color.theme, wordmark: color.white })}
  ${text(92, 512, "Mais do que imoveis,", 64, color.white, 700)}
  ${text(92, 586, "conectamos casas e planos.", 64, color.white, 700)}
  ${text(92, 676, "Use lockup branco em fundo de campanha.", 28, color.white, 500)}
  ${watermarkLockup(symbol, wordmark, lineLockup, 530, 760, 620, { symbol: color.white, wordmark: color.white })}`), {
  kind: "application",
  surface: "Instagram",
  fileName: "instagram-post.svg",
  use: "Post quadrado 1080x1080.",
});

writeAsset("applications/instagram-story.svg", applicationSvg("Domuz Instagram story", 1080, 1920, `  <rect width="1080" height="1920" fill="${color.ink}"/>
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(90 180) scale(0.9)")}
  ${text(90, 1240, "Seu novo lar,", 84, color.white, 700)}
  ${text(90, 1334, "sem perder o contexto.", 84, color.white, 700)}
  ${text(90, 1460, "Use o simbolo solido quando a marca precisa aparecer rapido.", 34, "#D8C4BA", 400)}
  ${roundedRect(90, 1580, 300, 72, 36, color.white)}
  ${text(142, 1626, "Ver imoveis", 28, color.ink, 700)}`), {
  kind: "application",
  surface: "Instagram",
  fileName: "instagram-story.svg",
  use: "Story 1080x1920 e tela vertical de campanha.",
});

writeAsset("applications/social-avatar.svg", applicationSvg("Domuz social avatar", 1080, 1080, `  <rect width="1080" height="1080" fill="${color.surface}"/>
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(120 120) scale(0.84)")}`), {
  kind: "application",
  surface: "Redes sociais",
  fileName: "social-avatar.svg",
  use: "Avatar de perfil, comunidade e canal social.",
});

writeAsset("applications/social-cover.svg", applicationSvg("Domuz social cover", 1500, 500, `  <rect width="1500" height="500" fill="${color.surface}"/>
  ${appLockup(symbol, wordmark, lineLockup, 90, 120, 390, { symbol: color.theme, wordmark: color.ink })}
  ${text(90, 336, "Conectamos pessoas, corretores e imobiliarias.", 34, color.ink, 600)}
  ${text(90, 386, "Use assinatura completa em capas, banners e canais institucionais.", 22, color.muted, 400)}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(1140 100) scale(0.3)")}`), {
  kind: "application",
  surface: "Redes sociais",
  fileName: "social-cover.svg",
  use: "Capa de LinkedIn, Facebook, YouTube e comunidade.",
});

writeAsset("applications/presentation-cover.svg", applicationSvg("Domuz presentation cover", 1920, 1080, `  <rect width="1920" height="1080" fill="${color.ink}"/>
  ${appLockup(symbol, wordmark, lineLockup, 112, 104, 390, { symbol: color.white, glyph: color.ink, wordmark: color.white })}
  ${text(112, 594, "Sistema de marca", 88, color.white, 700)}
  ${text(112, 690, "Assinaturas, icones e aplicacoes principais.", 38, "#D8C4BA", 400)}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(1360 238) scale(0.38)")}
  ${text(112, 944, "Domuz.app", 28, "#AD9890", 500)}`), {
  kind: "application",
  surface: "Apresentacao",
  fileName: "presentation-cover.svg",
  use: "Capa de PPT, keynote e proposta comercial.",
});

writeAsset("applications/ad-feed.svg", applicationSvg("Domuz ad feed", 1200, 628, `  <rect width="1200" height="628" fill="${color.surface}"/>
  ${roundedRect(56, 56, 1088, 516, 36, color.white, color.line)}
  ${appLockup(symbol, wordmark, lineLockup, 96, 100, 260, { symbol: color.theme, wordmark: color.ink })}
  ${text(96, 294, "Anuncie com uma marca que o cliente entende.", 48, color.ink, 700)}
  ${text(96, 358, "Use lockup solido em anuncio claro e mantenha o CTA na cor do tema.", 24, color.muted, 400)}
  ${roundedRect(96, 430, 232, 58, 18, color.theme)}
  ${text(130, 468, "Anunciar imovel", 21, color.white, 700)}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(840 180) scale(0.23)")}`), {
  kind: "application",
  surface: "Anuncio",
  fileName: "ad-feed.svg",
  use: "Anuncio de feed, display e midia paga.",
});

writeAsset("applications/email-signature.svg", applicationSvg("Domuz email signature", 1200, 420, `  <rect width="1200" height="420" fill="${color.white}"/>
  ${appLockup(symbol, wordmark, lineLockup, 64, 70, 280, { symbol: color.theme, wordmark: color.ink })}
  ${text(64, 220, "Equipe Domuz", 34, color.ink, 700)}
  ${text(64, 266, "domuz.app", 24, color.muted, 500)}
  ${text(64, 316, "contato@domuz.app   @domuz.app", 22, color.muted, 400)}
  ${roundedRect(760, 70, 360, 220, 28, color.surface, color.line)}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(850 110) scale(0.14)")}`), {
  kind: "application",
  surface: "Assinatura",
  fileName: "email-signature.svg",
  use: "Assinatura de e-mail e rodape institucional.",
});

writeAsset("applications/business-card.svg", applicationSvg("Domuz business card", 1050, 600, `  <rect width="1050" height="600" fill="${color.surface}"/>
  ${roundedRect(40, 40, 470, 520, 32, color.ink)}
  ${appLockup(symbol, wordmark, lineLockup, 92, 102, 280, { symbol: color.white, glyph: color.ink, wordmark: color.white })}
  ${text(92, 454, "domuz.app", 26, "#D8C4BA", 500)}
  ${roundedRect(540, 40, 470, 520, 32, color.white, color.line)}
  ${solidMarkBody(symbol, solidMark, color.theme, "translate(592 92) scale(0.16)")}
  ${text(592, 304, "Nome Sobrenome", 34, color.ink, 700)}
  ${text(592, 352, "Corretor de imoveis", 24, color.muted, 500)}
  ${text(592, 430, "contato@domuz.app", 22, color.muted, 400)}
  ${text(592, 466, "+55 11 99999 9999", 22, color.muted, 400)}`), {
  kind: "application",
  surface: "Impresso",
  fileName: "business-card.svg",
  use: "Cartao de visita e credencial simples.",
});

writeAsset("domuz-brand-assets.manifest.json", `${JSON.stringify({
  generatedFrom: {
    symbol: "domuz-mark-black.png",
    wordmarkFont: "Chillax SemiBold 600",
  },
  logos: logoManifest,
  icons: iconManifest,
  applications: applicationManifest,
}, null, 2)}\n`);

console.log(`generated Domuz vectors from ${path.relative(root, sourcePng)}`);
console.log(`symbol ${symbol.width}x${symbol.height}, line lockup ${lineLockup.width}x${lineLockup.height}`);
console.log(`logos ${logoManifest.length}, icons ${iconManifest.length}, applications ${applicationManifest.length}`);
