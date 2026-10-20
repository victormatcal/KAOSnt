// Genera src/lib/themes-data.ts a partir de los temas integrados de la carpeta temas/ (raíz del proyecto).
// Uso: node tools/gen-themes.mjs. Una prueba (logic.test) verifica que el archivo generado coincide con temas/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.resolve(root, "..", "temas");
const ORDER = ["predeterminado", "minimalista", "cupertino", "retro", "alto-contraste"];
const themes = ORDER.map((id) => JSON.parse(fs.readFileSync(path.join(dir, id + ".json"), "utf8")));
const out = `// GENERADO por tools/gen-themes.mjs desde temas/*.json. No editar a mano.\nimport type { ThemeDef } from "./theme";\n\nexport const BUILTIN_THEMES: ThemeDef[] = ${JSON.stringify(themes, null, 1)};\n`;
fs.writeFileSync(path.join(root, "src", "lib", "themes-data.ts"), out);
console.log(`Temas integrados: ${themes.length} → src/lib/themes-data.ts`);
