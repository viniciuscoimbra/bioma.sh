#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DEFAULT_PATHS = ["src/prototypes", "src/components"];
const EXTENSIONS = new Set([".html", ".js", ".jsx", ".md", ".ts", ".tsx"]);
const SKIP_DIRS = new Set(["assets", "coverage", "dist", "node_modules", "reports", "storybook-static"]);
const VISIBLE_KEYS = new Set([
  "alt",
  "aria-label",
  "back",
  "caption",
  "content",
  "description",
  "defaultValue",
  "emptyMessage",
  "eyebrow",
  "helperText",
  "hint",
  "label",
  "lead",
  "message",
  "placeholder",
  "statusText",
  "subtitle",
  "text",
  "title",
]);

export const RULES = [
  {
    id: "placeholder",
    pattern: /\b(?:Lorem ipsum|lorem ipsum|TODO|TBD|texto aqui|Texto aqui|Jane Doe|John Doe)\b/u,
    message: "substitua placeholder por copy real ou remova o campo",
  },
  {
    id: "internal-ontology",
    pattern: /\b(?:tenant|workspace|rbac|share_pct|affiliation|scd2|raw|silver|gold|crawl|threshold|kyp)\b/iu,
    message: "traduza o conceito interno para o vocabulário da pessoa",
  },
  {
    id: "generic-ai-phrase",
    pattern: /(?:em um mundo em constante evolu[cç][aã]o|eleve sua experi[eê]ncia|transforme sua jornada|descubra o poder|solu[cç][aã]o completa|experi[eê]ncia [uú]nica|feito para voc[eê]|tudo em um s[oó] lugar)/iu,
    message: "troque a fórmula genérica por ação, condição ou benefício comprovável",
  },
  {
    id: "vague-claim",
    pattern: /(?:especialistas afirmam|estudos mostram|l[ií]der do mercado|a melhor plataforma)/iu,
    message: "cite a fonte e o fato específico ou remova a alegação",
  },
  {
    id: "meta-copy",
    pattern: /(?:[eé] importante destacar|vale ressaltar|vamos explorar|sem mais delongas)/iu,
    message: "comece pela informação útil",
  },
  {
    id: "manufactured-contrast",
    pattern: /(?:n[aã]o [eé] apenas .{1,80}, [eé] |mais que .{1,80}, )/iu,
    message: "diga diretamente o que o produto faz",
  },
  {
    id: "visible-dash",
    pattern: /[—–]/u,
    message: "reestruture a frase com ponto, vírgula, parênteses ou hífen",
  },
];

function walk(path) {
  if (!existsSync(path)) throw new Error(`Caminho não encontrado: ${path}`);
  if (!statSync(path).isDirectory()) return EXTENSIONS.has(extname(path)) ? [path] : [];

  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) return [];
    return walk(resolve(path, entry.name));
  });
}

function candidatesFor(line, extension) {
  if (extension === ".md") return [line];
  if (/^\s*(?:import|export)\b/u.test(line)) return [];
  if (/^\s*(?:\/\*|\*|\/\/)/u.test(line)) return [];

  const candidates = [];
  for (const match of line.matchAll(/>([^<>{}]+)</gu)) {
    if (!/["'=]/u.test(match[1])) candidates.push(match[1]);
  }
  for (const match of line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/gu)) {
    const before = line.slice(0, match.index);
    const assignment = before.match(/([A-Za-z][\w-]*)\s*(?::|=\s*\{?)\s*$/u);
    if (!assignment || !VISIBLE_KEYS.has(assignment[1])) continue;
    candidates.push(match[2]);
  }
  return candidates;
}

function ignoredRules(lines, index) {
  const source = `${lines[index - 1] ?? ""}\n${lines[index]}`;
  return new Set(
    [...source.matchAll(/copy-audit-ignore\s+([a-z-]+):\s*[^\n<}]+/gu)].map((match) => match[1]),
  );
}

export function auditPaths(paths, { cwd = ROOT } = {}) {
  const files = paths.flatMap((path) => walk(resolve(cwd, path)));
  const findings = [];
  const seen = new Set();

  for (const file of files) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/u);
    const extension = extname(file);
    lines.forEach((line, index) => {
      const ignored = ignoredRules(lines, index);
      for (const candidate of candidatesFor(line, extension)) {
        for (const rule of RULES) {
          const match = candidate.match(rule.pattern);
          if (!match || ignored.has(rule.id)) continue;
          const finding = {
            file: relative(cwd, file),
            line: index + 1,
            rule: rule.id,
            evidence: match[0],
            message: rule.message,
          };
          const key = `${finding.file}:${finding.line}:${finding.rule}:${finding.evidence}`;
          if (!seen.has(key)) findings.push(finding);
          seen.add(key);
        }
      }
    });
  }

  return { filesScanned: new Set(files).size, findings };
}

export function render(result) {
  if (result.findings.length === 0) return `copy-audit: PASS (${result.filesScanned} arquivos, 0 achados)`;
  const lines = result.findings.map(
    ({ file, line, rule, evidence, message }) => `${file}:${line} [${rule}] ${JSON.stringify(evidence)} → ${message}`,
  );
  return `copy-audit: FAIL (${result.filesScanned} arquivos, ${result.findings.length} achados)\n${lines.join("\n")}`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const paths = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PATHS;
  try {
    const result = auditPaths(paths);
    console.log(render(result));
    process.exitCode = result.findings.length ? 1 : 0;
  } catch (error) {
    console.error(`copy-audit: ERROR ${error.message}`);
    process.exitCode = 2;
  }
}
