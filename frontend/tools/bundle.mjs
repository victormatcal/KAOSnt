// Micro-empaquetador CommonJS → un único archivo para el navegador.
// Toma la salida de `tsc` (build/src) y las dependencias de React desde node_modules.
// Sin dependencias adicionales (no requiere Vite/webpack/esbuild) y sin acceso a Internet.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(root, "build", "src", "main.js");
const dist = path.join(root, "dist");
const searchDirs = [path.join(root, "node_modules"), ...(process.env.NODE_PATH || "").split(path.delimiter).filter(Boolean)];

// Se usan directamente las compilaciones de producción de React
const ALIASES = {
  "react": "react/cjs/react.production.js",
  "react/jsx-runtime": "react/cjs/react-jsx-runtime.production.js",
  "react-dom": "react-dom/cjs/react-dom.production.js",
  "react-dom/client": "react-dom/cjs/react-dom-client.production.js",
  "scheduler": "scheduler/cjs/scheduler.production.js",
};

function resolvePkg(spec) {
  const rel = ALIASES[spec];
  if (!rel) throw new Error(`Dependencia no permitida en el bundle: ${spec}`);
  for (const d of searchDirs) {
    const p = path.join(d, rel);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`No se encuentra ${spec} (${rel}). Ejecuta npm install en frontend/.`);
}

function resolve(from, spec) {
  if (spec.startsWith(".")) {
    const base = path.resolve(path.dirname(from), spec);
    for (const c of [base, base + ".js", path.join(base, "index.js")]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    throw new Error(`No se resuelve ${spec} desde ${from}`);
  }
  return resolvePkg(spec);
}

const modules = new Map();
function add(file) {
  if (modules.has(file)) return modules.get(file).id;
  const id = modules.size;
  const rec = { id, code: "", deps: {} };
  modules.set(file, rec);
  let code = fs.readFileSync(file, "utf8").replace(/process\.env\.NODE_ENV/g, '"production"');
  code = code.replace(/^\/\/# sourceMappingURL=.*$/m, "");
  const re = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
  let m;
  while ((m = re.exec(code))) {
    const spec = m[1];
    if (!(spec in rec.deps)) rec.deps[spec] = add(resolve(file, spec));
  }
  rec.code = code;
  return id;
}

const entryId = add(entry);
let out = `/* Centro de trabajo — bundle local generado por tools/bundle.mjs. Incluye React (licencia MIT). */\n(function(){"use strict";\nvar process={env:{NODE_ENV:"production"}};\nvar defs={};var cache={};\nfunction req(id){if(cache[id])return cache[id].exports;var m={exports:{}};cache[id]=m;defs[id][0].call(m.exports,m,m.exports,function(s){var d=defs[id][1][s];if(d===undefined)throw new Error("Módulo no encontrado: "+s);return req(d);});return m.exports;}\n`;
for (const [file, rec] of modules) {
  out += `defs[${rec.id}]=[function(module,exports,require){\n${rec.code}\n},${JSON.stringify(rec.deps)}]; // ${path.relative(root, file).replace(/\\/g, "/")}\n`;
}
out += `req(${entryId});\n})();\n`;

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });
fs.writeFileSync(path.join(dist, "assets", "app.js"), out);
fs.copyFileSync(path.join(root, "src", "styles.css"), path.join(dist, "assets", "styles.css"));
fs.copyFileSync(path.join(root, "public", "index.html"), path.join(dist, "index.html"));
console.log(`Bundle: ${modules.size} módulos, ${(out.length / 1024).toFixed(0)} KB → dist/`);
