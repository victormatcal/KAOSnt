// Traducción mínima: t("texto en español", {vars}). El español es la clave; el inglés está en src/i18n/en.ts.
// Si falta una traducción se muestra el español. Los datos del usuario nunca se traducen.
// Nota: no uses «t» como nombre de variable en el código para no tapar esta función.
import { EN } from "../i18n/en";

export type Lang = "es" | "en";
let lang: Lang = "es";

export function setLang(l: string | null | undefined): void { lang = l === "en" ? "en" : "es"; }
export function getLang(): Lang { return lang; }

export function t(es: string, vars?: Record<string, string | number | null | undefined>): string {
  let s = lang === "en" ? (EN[es] ?? es) : es;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k] ?? "") : m));
  return s;
}

/** Diccionario de etiquetas cuyos valores (en español) se traducen al leerlos. */
export function tr<K extends string>(map: Record<K, string>): Record<K, string> {
  return new Proxy(map, {
    get(target, key) { const v = (target as any)[key as any]; return typeof v === "string" ? t(v) : v; },
  });
}

/** Locale para Intl según el idioma. */
export function locale(): string { return lang === "en" ? "en-GB" : "es-ES"; }

// Textos generados por el servidor (en español): se traducen en el cliente por patrón.
const SERVER_PATTERNS: [RegExp, string][] = [
  [/^Vence el (\d{4}-\d{2}-\d{2})$/, "Vence el {0}"],
  [/^Revisar en la fecha indicada$/, "Revisar en la fecha indicada"],
  [/^Han pasado ([\d.,]+) h (laborables|naturales) desde el inicio$/, "Han pasado {0} h {1} desde el inicio"],
  [/^([\d.,]+) h (laborables|naturales) sin actualización significativa$/, "{0} h {1} sin actualización significativa"],
  [/^Seguimiento periódico pendiente$/, "Seguimiento periódico pendiente"],
  [/^Fecha de seguimiento alcanzada$/, "Fecha de seguimiento alcanzada"],
];

export function translateServer(text: string | null | undefined): string {
  if (!text) return "";
  if (lang === "es") return text;
  for (const [re, key] of SERVER_PATTERNS) {
    const m = re.exec(text);
    if (m) return t(key).replace(/\{(\d)\}/g, (_, i) => t(m[Number(i) + 1]));
  }
  return text;
}
