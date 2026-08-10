import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const componentsRoot = path.join(root, "src", "components");
const demosRoot = path.join(root, "demos");
const barrel = await fs.readFile(path.join(root, "src", "index.ts"), "utf8");

const exists = async (file) => fs.access(file).then(() => true, () => false);
const dirs = (await fs.readdir(componentsRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const rows = [];
for (const name of dirs) {
  const dir = path.join(componentsRoot, name);
  const files = await fs.readdir(dir);
  const storyFile = files.find((file) => file.endsWith(".stories.tsx"));
  const story = storyFile ? await fs.readFile(path.join(dir, storyFile), "utf8") : "";
  const title = Array.from(story.matchAll(/title:\s*["']([^"']+)["']/g), (match) => match[1])
    .find((candidate) => candidate.startsWith("Components/")) ?? null;
  const category = title?.match(/^Components\/(Atoms|Molecules|Organisms)\//)?.[1] ?? null;

  rows.push({
    name,
    source: await exists(path.join(dir, `${name}.tsx`)),
    index: await exists(path.join(dir, "index.ts")),
    exported: new RegExp(`from ["']\\./components/${name}["']`).test(barrel),
    story: Boolean(storyFile),
    autodocs: /tags:\s*\[[^\]]*["']autodocs["']/.test(story),
    title,
    category,
    titleMatches: title?.endsWith(`/${name}`) ?? false,
    demo: await exists(path.join(demosRoot, `${name}.demo.html`)),
  });
}

const count = (key) => rows.filter((row) => row[key]).length;
const categoryCounts = Object.fromEntries(
  ["Atoms", "Molecules", "Organisms"].map((category) => [category, rows.filter((row) => row.category === category).length])
);
const critical = rows.filter((row) =>
  !row.source || !row.index || !row.exported || !row.story || !row.autodocs || !row.category || !row.titleMatches
);
const missingDemos = rows.filter((row) => !row.demo).map((row) => row.name);
const duplicateTitles = Object.entries(Object.groupBy(rows, (row) => row.title ?? "<missing>"))
  .filter(([, matches]) => matches.length > 1)
  .map(([title]) => title);

const summary = {
  componentFamilies: rows.length,
  source: count("source"),
  indexes: count("index"),
  exports: count("exported"),
  stories: count("story"),
  autodocs: count("autodocs"),
  demos: count("demo"),
  categories: categoryCounts,
  criticalIssues: critical.length,
  duplicateTitles: duplicateTitles.length,
};

console.log(JSON.stringify({ summary, missingDemos, duplicateTitles, critical }, null, 2));

if (critical.length || duplicateTitles.length) process.exitCode = 1;
