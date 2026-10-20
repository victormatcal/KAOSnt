// Temas declarativos y modo claro/oscuro. Solo colores (#hex, rgb[a], hsl[a]), fuente de una lista cerrada y radio.
// Se aplican por CSSOM (style.setProperty), compatible con la CSP estricta (sin estilos en línea en el HTML).
import { t } from "./i18n";
import { BUILTIN_THEMES } from "./themes-data";

export type ThemeMode = "sistema" | "claro" | "oscuro";
export type FontKey = "sistema" | "serif" | "mono" | "redondeada";
export interface ThemeDef {
  format: "kaosnt-theme"; version: 1; id: string; name: string; description: string;
  font: FontKey; radius: number; light: Record<string, string>; dark: Record<string, string>;
}

export const COLOR_VARS = ["bg", "surface", "surface-2", "border", "text", "muted", "accent", "accent-text", "accent-soft",
  "danger", "danger-soft", "warn", "warn-soft", "info", "info-soft", "ok", "ok-soft", "subtle", "focus",
  "toast-bg", "toast-text", "code-bg", "shadow"] as const;
export const FONTS: Record<FontKey, string> = {
  sistema: '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'Consolas, "Cascadia Mono", "SF Mono", Menlo, "Courier New", monospace',
  redondeada: '"Segoe UI Variable Display", "SF Pro Rounded", "Arial Rounded MT Bold", "Segoe UI", system-ui, sans-serif',
};
export { BUILTIN_THEMES };
export const BASE = BUILTIN_THEMES[0];

const NUM = String.raw`\s*-?\d{1,3}(\.\d+)?%?\s*`;
const ALPHA = String.raw`\s*(0|1|0?\.\d+|\d{1,3}%)\s*`;
const COLOR_RE = new RegExp(String.raw`^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}` +
  String.raw`|rgba?\(${NUM},${NUM},${NUM}(,${ALPHA})?\)|hsla?\(${NUM},${NUM},${NUM}(,${ALPHA})?\))$`);

export function isColor(v: unknown): boolean { return typeof v === "string" && v.length <= 60 && COLOR_RE.test(v.trim()); }

/** Validación en el cliente (la misma que backend/kaosnt/themes.py). Devuelve el mensaje de error o "". */
export function validateTheme(x: any): string {
  if (!x || typeof x !== "object" || Array.isArray(x)) return t("El tema debe ser un objeto JSON");
  const allowed = ["format", "version", "id", "name", "description", "font", "radius", "light", "dark"];
  const extra = Object.keys(x).filter((k) => !allowed.includes(k));
  if (extra.length) return t("Campos no admitidos en el tema: {campos}", { campos: extra.join(", ") });
  if (x.format !== "kaosnt-theme") return t('El archivo no es un tema de KAOSnt (format debe ser "kaosnt-theme")');
  if (x.version !== 1) return t("Versión de tema no compatible: {v}", { v: String(x.version) });
  if (typeof x.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(x.id)) return t("Identificador de tema no válido (minúsculas, números y guiones; máx. 40)");
  if (typeof x.name !== "string" || !x.name.trim() || x.name.length > 60) return t("El nombre del tema es obligatorio (máx. 60 caracteres)");
  if (x.description !== undefined && (typeof x.description !== "string" || x.description.length > 300)) return t("Descripción no válida (máx. 300 caracteres)");
  if (x.font !== undefined && !(x.font in FONTS)) return t("Fuente no admitida: usa {fuentes}", { fuentes: Object.keys(FONTS).join(", ") });
  if (x.radius !== undefined && !(Number.isInteger(x.radius) && x.radius >= 0 && x.radius <= 16)) return t("El radio debe ser un número entero entre 0 y 16");
  for (const mode of ["light", "dark"]) {
    const v = x[mode] ?? {};
    if (typeof v !== "object" || Array.isArray(v)) return t("«{modo}» debe ser un objeto de variables", { modo: mode });
    const bad = Object.keys(v).filter((k) => !(COLOR_VARS as readonly string[]).includes(k));
    if (bad.length) return t("Variables desconocidas en «{modo}»: {vars}", { modo: mode, vars: bad.join(", ") });
    for (const [k, c] of Object.entries(v)) if (!isColor(c)) return t("Color no válido en «{campo}»: solo #hex, rgb(a) o hsl(a)", { campo: `${mode}.${k}` });
  }
  return "";
}

export function findTheme(id: string, custom: ThemeDef[] = []): ThemeDef {
  return BUILTIN_THEMES.find((x) => x.id === id) || custom.find((x) => x.id === id) || BASE;
}

export function prefersDark(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function effectiveMode(mode: ThemeMode, systemDark = prefersDark()): "light" | "dark" {
  return mode === "oscuro" ? "dark" : mode === "claro" ? "light" : systemDark ? "dark" : "light";
}

export interface Appearance { mode: "light" | "dark"; vars: Record<string, string>; font: string; radius: string }

/** Variables completas: base del modo + las del tema (las ausentes se toman del tema base). */
export function resolveAppearance(theme: ThemeDef, mode: "light" | "dark"): Appearance {
  const vars: Record<string, string> = { ...BASE[mode], ...(theme[mode] || {}) };
  return { mode, vars, font: FONTS[theme.font] || FONTS.sistema, radius: `${theme.radius ?? 6}px` };
}

const CACHE = "kaosnt-aspecto";

export function applyAppearance(a: Appearance, cache = true): void {
  if (typeof document === "undefined") return;
  const st = document.documentElement.style;
  for (const [k, v] of Object.entries(a.vars)) st.setProperty(`--${k}`, v);
  st.setProperty("--font", a.font);
  st.setProperty("--radius", a.radius);
  document.documentElement.setAttribute("data-mode", a.mode);
  if (cache) { try { localStorage.setItem(CACHE, JSON.stringify(a)); } catch { /* sin almacenamiento local */ } }
}

/** Al arrancar: aplica el último aspecto conocido antes del primer render. */
export function applyCachedAppearance(): void {
  try { const a = JSON.parse(localStorage.getItem(CACHE) || "null"); if (a && a.vars) applyAppearance(a, false); } catch { /* */ }
}

/** Plantilla descargable del tema actual (todas las variables explícitas). */
export function themeTemplate(theme: ThemeDef): ThemeDef {
  return {
    format: "kaosnt-theme", version: 1, id: theme.id === "predeterminado" ? "mi-tema" : theme.id + "-copia",
    name: theme.name + " (copia)", description: theme.description, font: theme.font, radius: theme.radius,
    light: { ...BASE.light, ...theme.light }, dark: { ...BASE.dark, ...theme.dark },
  };
}

// Contraste WCAG (para avisar al importar)
function rgb(c: string): number[] | null {
  c = c.trim();
  if (c.startsWith("#")) {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((x) => x + x).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  }
  const m = /^rgba?\(([^)]*)\)/.exec(c);
  if (m) return m[1].split(",").slice(0, 3).map((x) => (x.trim().endsWith("%") ? parseFloat(x) * 2.55 : parseFloat(x)) / 255);
  const hm = /^hsla?\(([^)]*)\)/.exec(c);
  if (hm) {
    const [h, s, l] = hm[1].split(",").slice(0, 3).map((x) => parseFloat(x));
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => { const k = (n + h / 30) % 12; return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return [f(0), f(8), f(4)];
  }
  return null;
}
export function contrast(a: string, b: string): number {
  const lum = (c: number[]) => { const [r, g, bl] = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const ca = rgb(a), cb = rgb(b);
  if (!ca || !cb) return 0;
  const la = lum(ca), lb = lum(cb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
export const CONTRAST_PAIRS: [string, string][] = [["text", "bg"], ["text", "surface"], ["text", "surface-2"], ["muted", "bg"], ["muted", "surface"],
  ["accent", "surface"], ["accent", "accent-soft"], ["accent-text", "accent"], ["danger", "danger-soft"], ["danger", "surface"], ["warn", "warn-soft"],
  ["info", "info-soft"], ["ok", "ok-soft"], ["toast-text", "toast-bg"], ["text", "code-bg"]];
export function contrastIssues(vars: Record<string, string>): string[] {
  return CONTRAST_PAIRS.filter(([f, b]) => vars[f] && vars[b] && contrast(vars[f], vars[b]) < 4.5)
    .map(([f, b]) => `${f}/${b} ${contrast(vars[f], vars[b]).toFixed(2)}:1`);
}
