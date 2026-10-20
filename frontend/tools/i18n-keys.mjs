// Comprueba que todas las claves de traducción usadas en src/ tienen traducción en src/i18n/en.ts.
// Claves: primer argumento literal de t("…"), valores de los diccionarios tr({…}), nombres y descripciones de los
// temas integrados y patrones de textos del servidor (lib/i18n.ts). También falla si:
//  - se llama a t() con una plantilla `…` (la clave debe ser literal),
//  - se usa «t» como nombre de parámetro o variable (taparía la función de traducción).
// Uso: node tools/i18n-keys.mjs [--listar] [--detectar]
//   --listar   imprime las claves sin traducción
//   --detectar informa (sin fallar) de textos en español que parecen no estar envueltos en t()
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
        problems.push(`${rel}:${i + 1}: «t» usado como nombre de variable o parámetro`);
    });
  }
}
// Temas integrados (nombre y descripción se muestran traducidos)
const themes = fs.readFileSync(path.join(src, "lib", "themes-data.ts"), "utf8");
for (const m of themes.matchAll(/"(name|description)":\s*"((?:\\.|[^"\\])*)"/g)) add(JSON.parse(`"${m[2]}"`), "lib/themes-data.ts");
add("laborables", "lib/i18n.ts"); add("naturales", "lib/i18n.ts");

const enSrc = fs.readFileSync(path.join(src, "i18n", "en.ts"), "utf8");
const en = new Set();
for (const m of enSrc.matchAll(/^\s*("(?:\\.|[^"\\])*")\s*:/gm)) en.add(JSON.parse(m[1]));
const missing = [...keys.keys()].filter((k) => !en.has(k));
const unused = [...en].filter((k) => !keys.has(k));

if (process.argv.includes("--listar")) for (const k of missing) console.log(JSON.stringify(k) + "  // " + keys.get(k));
if (process.argv.includes("--detectar")) {
  for (const file of files) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    if (/i18n\/en\.ts|themes-data\.ts/.test(rel)) continue;
    fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (/^\s*(\/\/|\*|import )/.test(line)) return;
      const jsx = line.match(/>\s*([^<>{}]*[áéíóúñ¿][^<>{}]*)\s*</);
      if (jsx && !/t\(/.test(jsx[1])) console.log(`AVISO ${rel}:${i + 1}: texto JSX sin t(): ${jsx[1].trim().slice(0, 80)}`);
    });
  }
}
for (const p of problems) console.error("ERROR " + p);
console.log(`i18n: ${keys.size} claves · ${missing.length} sin traducción al inglés · ${unused.length} traducciones sin uso`);
if (missing.length && !process.argv.includes("--listar")) console.error("Faltan traducciones (ejecuta con --listar):\n" + missing.slice(0, 20).map((k) => "  " + JSON.stringify(k)).join("\n"));
process.exit(missing.length || problems.length ? 1 : 0);
