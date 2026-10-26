// Checks that every translation key used in src/ (and the server messages) has a translation in src/i18n/en.ts.
// Keys: first literal argument of t("…"), values of the tr({…}) dictionaries, names and descriptions of the
// built-in themes and server text patterns (lib/i18n.ts). It also fails if:
//  - t() is called with a `…` template (the key must be a literal),
//  - «t» is used as a parameter or variable name (it would shadow the translation function).
// Usage: node tools/i18n-keys.mjs [--list] [--detect]
//   --list     prints the keys without a translation
//   --detect   reports (without failing) Spanish texts that do not seem to be wrapped in t()
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(f)) files.push(p); } })(src);

const unquote = (q, body) => body.replace(/\\(["'\\nt])/g, (_, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c));
const keys = new Map();
const problems = [];
const add = (k, where) => { if (!keys.has(k)) keys.set(k, where); };

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (rel.endsWith("i18n/en.ts")) continue;
  const code = fs.readFileSync(file, "utf8").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of code.matchAll(/(?<![\w.])t\(\s*(["'])((?:\\.|(?!\1)[^\\\n])*)\1/g)) add(unquote(m[1], m[2]), rel);
  for (const m of code.matchAll(/(?<![\w.])t\(\s*`/g)) problems.push(`${rel}: t() con plantilla \`…\`; usa una clave literal y {variables}`);
  for (const m of code.matchAll(/\btr\(\{([\s\S]*?)\}\s*(?:as [^)]+)?\)/g))
    for (const v of m[1].matchAll(/:\s*(["'])((?:\\.|(?!\1)[^\\\n])*)\1/g)) add(unquote(v[1], v[2]), rel);
  if (rel.endsWith("lib/labels.ts")) for (const m of code.matchAll(/const DAYS_(?:SHORT|LONG)_ES = \[([^\]]*)\]/g))
    for (const v of m[1].matchAll(/"([^"]*)"/g)) add(v[1], rel);
  if (rel.endsWith("lib/i18n.ts")) for (const m of code.matchAll(/\[\/.*\/,\s*"([^"]+)"\]/g)) add(m[1], rel);
  if (!rel.endsWith("lib/i18n.ts")) {
    const lines = code.split("\n");
    lines.forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      if (/[(,]\s*t\s*[:,)]|\(\s*t\s*\)\s*=>|\bconst t\b|\blet t\b|\bvar t\b|\bfunction t\b/.test(line.replace(/"(?:\\.|[^"\\])*"/g, '""')))
        problems.push(`${rel}:${i + 1}: «t» used as a variable or parameter name`);
    });
  }
}
// Built-in themes (name and description are shown translated)
const themes = fs.readFileSync(path.join(src, "lib", "themes-data.ts"), "utf8");
for (const m of themes.matchAll(/"(name|description)":\s*"((?:\\.|[^"\\])*)"/g)) add(JSON.parse(`"${m[2]}"`), "lib/themes-data.ts");
add("laborables", "lib/i18n.ts"); add("naturales", "lib/i18n.ts");

// Server messages (backend/kaosnt/*.py): they are translation keys too and the client renders them with t().
// Collected from invalid(…), AppError(…), not_found/missing_ref(…), "message_key"/msg = "…" and the ENTITIES tuple.
const backend = path.resolve(root, "..", "backend", "kaosnt");
const LIT = /(?<![\w])([rbuRBU]?)("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y;
function literalGroups(text) {
  // Groups of adjacent (implicitly concatenated) non f-string literals
  const groups = [];
  let i = 0, cur = null;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === "#") { while (i < text.length && text[i] !== "\n") i++; continue; }
    const f = /[fF]/.test(ch) && /["']/.test(text[i + 1] || "");
    LIT.lastIndex = f ? i + 1 : i;
    const m = LIT.exec(text);
    if (m && (f || /["']|[rbuRBU]/.test(ch))) {
      const val = f ? null : JSON.parse('"' + m[2].slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"').replace(/\\\\"/g, '\\"') + '"');
      if (cur && !f && cur.ok) cur.v += val; else { cur = { v: val ?? "", ok: !f }; groups.push(cur); }
      i = LIT.lastIndex; continue;
    }
    cur = null; i++;
  }
  return groups.filter((g) => g.ok).map((g) => g.v);
}
function callArgs(code, start) {
  // Text between the parenthesis that opens at `start` and its matching close (strings aware)
  let depth = 0, i = start, q = null;
  for (; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === "\\") i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === "(") depth++;
    else if (c === ")") { depth--; if (depth === 0) break; }
  }
  return code.slice(start + 1, i);
}
const isKey = (v) => /[A-Za-zÁÉÍÓÚáéíóúñ]{2}/.test(v) && !/^\w+$/.test(v);
for (const f of fs.readdirSync(backend).filter((x) => x.endsWith(".py"))) {
  const code = fs.readFileSync(path.join(backend, f), "utf8");
  const rel = "backend/kaosnt/" + f;
  for (const m of code.matchAll(/\b(invalid|AppError|not_found|missing_ref)\(/g))
    for (const v of literalGroups(callArgs(code, m.index + m[0].length - 1))) if (isKey(v)) add(v, rel);
  for (const m of code.matchAll(/("message_key":\s*|\bmsg = )("(?:\\.|[^"\\])*"(?:\s*"(?:\\.|[^"\\])*")*)/g))
    for (const v of literalGroups(m[2])) if (isKey(v)) add(v, rel);
  const ent = /ENTITIES = \(([\s\S]*?)\)/.exec(code);
  if (ent) for (const v of literalGroups(ent[1])) add(v, rel);
}

const enSrc = fs.readFileSync(path.join(src, "i18n", "en.ts"), "utf8");
const en = new Set();
for (const m of enSrc.matchAll(/^\s*("(?:\\.|[^"\\])*")\s*:/gm)) en.add(JSON.parse(m[1]));
const missing = [...keys.keys()].filter((k) => !en.has(k));
const unused = [...en].filter((k) => !keys.has(k));

if (process.argv.includes("--list")) for (const k of missing) console.log(JSON.stringify(k) + "  // " + keys.get(k));
if (process.argv.includes("--detect")) {
  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (/i18n\/en\.ts|themes-data\.ts/.test(rel)) continue;
    fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (/^\s*(\/\/|\*|import )/.test(line)) return;
      const jsx = line.match(/>\s*([^<>{}]*[áéíóúñ¿][^<>{}]*)\s*</);
      if (jsx && !/t\(/.test(jsx[1])) console.log(`WARNING ${rel}:${i + 1}: JSX text without t(): ${jsx[1].trim().slice(0, 80)}`);
    });
  }
}
for (const p of problems) console.error("ERROR " + p);
console.log(`i18n: ${keys.size} keys · ${missing.length} without English translation · ${unused.length} unused translations`);
if (missing.length && !process.argv.includes("--list")) console.error("Missing translations (run with --list):\n" + missing.slice(0, 20).map((k) => "  " + JSON.stringify(k)).join("\n"));
process.exit(missing.length || problems.length ? 1 : 0);
