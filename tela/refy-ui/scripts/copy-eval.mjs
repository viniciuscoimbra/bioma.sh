#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { auditPaths, RULES } from "./copy-audit.mjs";

const REFY_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const REPO_ROOT = dirname(REFY_ROOT);
const DATE = new Date().toISOString().slice(0, 10);
const RUN_PROBES = process.env.COPY_EVAL_PROBES === "1";

const SKILLS = ["stop-slop", "kill-ai-slop", "voz-autoral", "othon-garcia", "vinicius-voice", "dommus-product-copy"];
const ROOTS = [".agents/skills", ".claude/skills", ".kiro/skills"];
const EXPECTED_BAD_RULES = RULES.map(({ id }) => id);

const prompt = `Você está revisando uma tela da Dommus. Nenhuma voz foi indicada no pedido.
Contexto confirmado: a pessoa tentou publicar um imóvel, mas não informou endereço nem preço; o anúncio só entra no ar depois que os dois campos forem preenchidos.
Reescreva esta copy em PT-BR:
Título: Quase lá!
Texto: Complete as informações necessárias para seguir sua jornada.
Status: Pendente.
Botão: Continuar.
Devolva somente o objeto JSON bruto com as chaves title, body, status e cta, sem cerca Markdown, introdução, nota ou explicação.`;

function sha(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function validateSkill(path, expectedName) {
  if (!existsSync(path)) return { status: "fail", reason: "SKILL.md ausente" };
  const text = readFileSync(path, "utf8");
  const name = text.match(/^---\s*\n[\s\S]*?^name:\s*["']?([^\n"']+)/mu)?.[1]?.trim();
  const description = text.match(/^---\s*\n[\s\S]*?^description:\s*[>"']?-?\s*([^\n]+)/mu)?.[1]?.trim();
  return name === expectedName && description
    ? { status: "pass", name, description }
    : { status: "fail", reason: `frontmatter inválido: name=${name ?? "ausente"}` };
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
  return {
    status: result.error?.code === "ENOENT" ? "unavailable" : result.status === 0 ? "pass" : "fail",
    exitCode: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? result.error?.message ?? "",
  };
}

function scoreProbe(output) {
  const clean = output.replace(/\u001b\[[0-9;]*m/gu, "");
  const trimmed = clean.trim();
  const fenced = trimmed.match(/^```json\s*([\s\S]*?)\s*```$/u);
  const payload = fenced ? fenced[1] : trimmed;
  const slopRules = RULES.filter(({ pattern }) => pattern.test(payload)).map(({ id }) => id);
  const context = {
    address: /endere[cç]o/iu.test(payload),
    price: /pre[cç]o/iu.test(payload),
    publish: /public|an[uú]ncio|entrar? no ar/iu.test(payload),
  };
  const keys = ["title", "body", "status", "cta"].filter((key) => new RegExp(`["']?${key}["']?\\s*:`, "iu").test(payload));
  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch {
    parsed = undefined;
  }
  const exactJson = Boolean(parsed);
  const voice = {
    directReader: /(?<!\p{L})(você|seu|sua)(?!\p{L})/iu.test(payload),
    oralPtBr: /(?<!\p{L})pra(?!\p{L})/iu.test(payload),
    concreteFirst: /falt|endere[cç]o|pre[cç]o/iu.test(parsed?.title ?? ""),
  };
  const othon = {
    unit: context.address && context.price,
    emphasis: voice.concreteFirst,
  };
  const factualStatus = Object.values(context).every(Boolean) ? "pass" : "fail";
  const voiceStatus = Object.values(voice).filter(Boolean).length >= 2 ? "pass" : "fail";
  const othonStatus = Object.values(othon).every(Boolean) ? "pass" : "fail";
  const antiSlopStatus = slopRules.length === 0 ? "pass" : "fail";
  const passed = exactJson && factualStatus === "pass" && voiceStatus === "pass"
    && othonStatus === "pass" && antiSlopStatus === "pass" && keys.length === 4;
  return { status: passed ? "pass" : "fail", factualStatus, voiceStatus, othonStatus, antiSlopStatus, exactJson, transport: fenced ? "json-fence" : "raw-json", slopRules, context, voice, othon, keys, output: trimmed };
}

function probeAgents() {
  if (!RUN_PROBES) {
    return Object.fromEntries(["codex", "claude", "kiro"].map((name) => [name, { status: "skipped" }]));
  }

  const temp = mkdtempSync(join(tmpdir(), "dommus-copy-eval-"));
  try {
    const codexOutput = join(temp, "codex.txt");
    const codex = run("codex", [
      "exec", "-C", REPO_ROOT, "--sandbox", "read-only", "--ephemeral", "--color", "never",
      "--output-last-message", codexOutput, prompt,
    ]);
    const claude = run("claude", [
      "-p", "--output-format", "text", "--permission-mode", "dontAsk", "--tools", "Read",
      "--setting-sources", "project", "--model", "sonnet", "--no-session-persistence", "--max-budget-usd", "2", prompt,
    ]);
    const kiro = run("kiro-cli", [
      "chat", "--no-interactive", "--trust-tools=", "--wrap", "never", prompt,
    ]);

    const kiroOutput = kiro.stdout.replace(/\u001b\[[0-9;]*m/gu, "");
    const kiroMarker = kiroOutput.lastIndexOf("\n> ");
    const outputs = {
      codex: existsSync(codexOutput) ? readFileSync(codexOutput, "utf8") : codex.stdout,
      claude: claude.stdout,
      kiro: kiroMarker >= 0 ? kiroOutput.slice(kiroMarker + 3) : kiroOutput,
    };
    return Object.fromEntries(
      Object.entries({ codex, claude, kiro }).map(([name, execution]) => [
        name,
        execution.status === "pass"
          ? { execution: "pass", ...scoreProbe(outputs[name]) }
          : { status: execution.status, exitCode: execution.exitCode, error: execution.stderr.trim() },
      ]),
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

function countBy(items, key) {
  return Object.fromEntries(
    [...new Set(items.map((item) => item[key]))].sort().map((value) => [value, items.filter((item) => item[key] === value).length]),
  );
}

const skillValidation = Object.fromEntries(
  SKILLS.map((skill) => [skill, validateSkill(resolve(REPO_ROOT, `.agents/skills/${skill}/SKILL.md`), skill)]),
);

const discovery = Object.fromEntries(SKILLS.map((skill) => {
  const paths = ROOTS.map((root) => resolve(REPO_ROOT, root, skill, "SKILL.md"));
  const valid = paths.every(existsSync);
  const hashes = valid ? paths.map(sha) : [];
  const targets = valid ? paths.map((path) => realpathSync(path)) : [];
  return [skill, {
    status: valid && new Set(hashes).size === 1 && new Set(targets).size === 1 ? "pass" : "fail",
    paths: paths.map((path, index) => ({ path: path.slice(REPO_ROOT.length + 1), hash: hashes[index], target: targets[index] })),
  }];
}));

const fixtures = {
  good: auditPaths(["scripts/fixtures/copy-audit/good.tsx"]),
  bad: auditPaths(["scripts/fixtures/copy-audit/bad.tsx"]),
  suppressed: auditPaths(["scripts/fixtures/copy-audit/suppressed.tsx"]),
};
const fixtureStatus = fixtures.good.findings.length === 0
  && fixtures.suppressed.findings.length === 0
  && EXPECTED_BAD_RULES.every((rule) => fixtures.bad.findings.some((finding) => finding.rule === rule));

const routingFiles = [
  resolve(REPO_ROOT, "AGENTS.md"),
  resolve(REPO_ROOT, "CLAUDE.md"),
  resolve(REPO_ROOT, ".claude/skills/refy-design-system/SKILL.md"),
  resolve(REPO_ROOT, ".agents/skills/dommus-product-copy/SKILL.md"),
];
const routing = routingFiles.map((path) => ({
  path: path.slice(REPO_ROOT.length + 1),
  status: existsSync(path)
    && readFileSync(path, "utf8").includes("dommus-product-copy")
    && readFileSync(path, "utf8").includes("npm --prefix refy-ui run audit:copy")
    && readFileSync(path, "utf8").includes("vinicius")
    && readFileSync(path, "utf8").includes("othon-garcia") ? "pass" : "fail",
}));
const graftCheck = run(resolve(REPO_ROOT, "node_modules/.bin/graft"), ["check"]);
const repoContextGraph = {
  status: existsSync(resolve(REPO_ROOT, "node_modules/@nanonets/graft"))
    && readFileSync(resolve(REPO_ROOT, "package.json"), "utf8").includes("\"@nanonets/graft\"")
    && readFileSync(resolve(REPO_ROOT, "AGENTS.md"), "utf8").includes("<!-- graft:start -->")
    && readFileSync(resolve(REPO_ROOT, ".gitignore"), "utf8").includes("graft/")
    && graftCheck.status === "pass" ? "pass" : "fail",
  graftCheck: { status: graftCheck.status, exitCode: graftCheck.exitCode },
};
const voicePolicyText = readFileSync(resolve(REPO_ROOT, ".agents/skills/vinicius-voice/SKILL.md"), "utf8");
const voicePolicy = {
  status: voicePolicyText.includes("`vinicius` (padrão)")
    && voicePolicyText.includes("usuário a escolher pelo nome")
    && voicePolicyText.includes("mostre os perfis disponíveis e pare") ? "pass" : "fail",
  defaultProfile: "vinicius",
  availableProfiles: ["vinicius"],
};

const claudeSettings = JSON.parse(readFileSync(resolve(REPO_ROOT, ".claude/settings.json"), "utf8"));
const claudeHookPath = resolve(REPO_ROOT, ".claude/hooks/copy-harness-context.mjs");
const claudeHookHandlers = claudeSettings.hooks?.UserPromptSubmit?.flatMap(({ hooks = [] }) => hooks) ?? [];
const claudeHookExecution = run(process.execPath, [claudeHookPath], {
  input: JSON.stringify({
    session_id: "copy-eval",
    transcript_path: join(tmpdir(), "dommus-copy-eval.jsonl"),
    cwd: REPO_ROOT,
    permission_mode: "default",
    hook_event_name: "UserPromptSubmit",
    prompt: "Avalie a copy desta tela.",
  }),
  env: { ...process.env, CLAUDE_PROJECT_DIR: REPO_ROOT },
});
let claudeHookOutput;
try {
  claudeHookOutput = JSON.parse(claudeHookExecution.stdout);
} catch {
  claudeHookOutput = undefined;
}
const claudeHookContext = claudeHookOutput?.hookSpecificOutput?.additionalContext ?? "";
const claudePromptHook = {
  status: existsSync(claudeHookPath)
    && claudeHookHandlers.some(({ type, command }) => type === "command" && command?.includes("copy-harness-context.mjs"))
    && claudeHookExecution.status === "pass"
    && claudeHookOutput?.hookSpecificOutput?.hookEventName === "UserPromptSubmit"
    && ["vinicius", "Othon Garcia", "audit:copy", "não precisa citar skills"].every((signal) => claudeHookContext.includes(signal))
    ? "pass" : "fail",
  event: claudeHookOutput?.hookSpecificOutput?.hookEventName ?? null,
  defaultProfile: claudeHookContext.includes("vinicius") ? "vinicius" : null,
};

const upstreamTests = run(process.execPath, ["--test", "scripts/scan.test.mjs"], {
  cwd: resolve(REPO_ROOT, ".agents/skills/kill-ai-slop"),
});
const visualScan = run(process.execPath, [
  resolve(REPO_ROOT, ".agents/skills/kill-ai-slop/scripts/scan.mjs"),
  resolve(REFY_ROOT, "src/prototypes"),
]);
const visualSummary = visualScan.stdout.match(/→\s*(\d+) groups,\s*(\d+) hits/u);

const baseline = auditPaths(["src/prototypes", "src/components"]);
const probes = probeAgents();
const harnessPass = Object.values(skillValidation).every(({ status }) => status === "pass")
  && Object.values(discovery).every(({ status }) => status === "pass")
  && fixtureStatus
  && routing.every(({ status }) => status === "pass")
  && repoContextGraph.status === "pass"
  && voicePolicy.status === "pass"
  && claudePromptHook.status === "pass"
  && upstreamTests.status === "pass";
const probePass = !RUN_PROBES || Object.values(probes).every(({ status }) => status === "pass");
const voiceProbePass = !RUN_PROBES || Object.values(probes).every(({ voiceStatus }) => voiceStatus === "pass");
const othonProbePass = !RUN_PROBES || Object.values(probes).every(({ othonStatus }) => othonStatus === "pass");

const report = {
  generatedAt: new Date().toISOString(),
  harnessConformance: harnessPass ? "pass" : "fail",
  productBaseline: baseline.findings.length === 0 ? "pass" : "fail",
  agentBehavior: RUN_PROBES ? (probePass ? "pass" : "fail") : "skipped",
  agentVoiceBehavior: RUN_PROBES ? (voiceProbePass ? "pass" : "fail") : "skipped",
  agentOthonBehavior: RUN_PROBES ? (othonProbePass ? "pass" : "fail") : "skipped",
  skillValidation,
  discovery,
  fixtures: { status: fixtureStatus ? "pass" : "fail", ...fixtures },
  routing,
  repoContextGraph,
  voicePolicy,
  claudePromptHook,
  upstreamTests: { status: upstreamTests.status, exitCode: upstreamTests.exitCode },
  advisoryVisualScan: {
    status: visualScan.status,
    groups: visualSummary ? Number(visualSummary[1]) : null,
    hits: visualSummary ? Number(visualSummary[2]) : null,
  },
  baseline: {
    filesScanned: baseline.filesScanned,
    findings: baseline.findings,
    byRule: countBy(baseline.findings, "rule"),
  },
  probes,
};

const jsonPath = resolve(REFY_ROOT, `reports/copy-quality-eval-${DATE}.json`);
const mdPath = resolve(REFY_ROOT, `reports/copy-quality-eval-${DATE}.md`);
writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

const probeLines = Object.entries(probes).map(([name, result]) => `- ${name}: ${result.status}`).join("\n");
const ruleLines = Object.entries(report.baseline.byRule).map(([rule, count]) => `- ${rule}: ${count}`).join("\n") || "- nenhum";
writeFileSync(mdPath, `# Copy quality eval — ${DATE}\n\n- Harness: **${report.harnessConformance}**\n- Graft/contexto do repo: **${report.repoContextGraph.status}**\n- Hook Claude por prompt: **${report.claudePromptHook.status}**\n- Baseline de produto: **${report.productBaseline}** (${baseline.findings.length} achados em ${baseline.filesScanned} arquivos)\n- Probes de agentes: **${report.agentBehavior}**\n- Voz Vinícius: **${report.agentVoiceBehavior}**\n- Othon Garcia: **${report.agentOthonBehavior}**\n- Scanner visual advisory: ${report.advisoryVisualScan.groups ?? "?"} grupos / ${report.advisoryVisualScan.hits ?? "?"} hits\n\n## Agentes\n\n${probeLines}\n\n## Baseline por regra\n\n${ruleLines}\n\n## Achados\n\n${baseline.findings.map(({ file, line, rule, evidence }) => `- \`${file}:${line}\` [${rule}] ${JSON.stringify(evidence)}`).join("\n") || "Nenhum."}\n`);

console.log(`copy-eval: harness=${report.harnessConformance} baseline=${report.productBaseline} agents=${report.agentBehavior}`);
console.log(`copy-eval: ${baseline.findings.length} achados; relatórios ${jsonPath.slice(REPO_ROOT.length + 1)} e ${mdPath.slice(REPO_ROOT.length + 1)}`);
process.exitCode = harnessPass && probePass && baseline.findings.length === 0 ? 0 : 1;
