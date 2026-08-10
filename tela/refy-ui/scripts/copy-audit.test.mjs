import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("copy-audit.mjs", import.meta.url));
const good = fileURLToPath(new URL("fixtures/copy-audit/good.tsx", import.meta.url));
const bad = fileURLToPath(new URL("fixtures/copy-audit/bad.tsx", import.meta.url));

test("aceita copy PT-BR específica", () => {
  const result = spawnSync(process.execPath, [script, good], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PASS/u);
});

test("reprova todos os padrões objetivos da fixture", () => {
  const result = spawnSync(process.execPath, [script, bad], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  for (const rule of [
    "placeholder",
    "internal-ontology",
    "generic-ai-phrase",
    "vague-claim",
    "meta-copy",
    "manufactured-contrast",
    "visible-dash",
  ]) {
    assert.match(result.stdout, new RegExp(`\\[${rule}\\]`, "u"));
  }
});

test("aceita supressão local com regra e motivo", () => {
  const fixture = fileURLToPath(new URL("fixtures/copy-audit/suppressed.tsx", import.meta.url));
  const result = spawnSync(process.execPath, [script, fixture], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
