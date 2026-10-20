// Preferencias de interfaz (idioma, formato de fecha, inicio de semana y aspecto) aplicadas antes del primer
// render: al arrancar se usan las últimas conocidas (localStorage) y, al cargar la configuración, las del servidor.
import { setDateConfig } from "./dates";
import { setLang } from "./i18n";
import { applyAppearance, effectiveMode, findTheme, resolveAppearance } from "./theme";
import type { Settings } from "./types";

const KEY = "kaosnt-preferencias";

export function applyCachedPrefs(): void {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (p) { setLang(p.language); setDateConfig(p.date_format, p.week_start); }
  } catch { /* sin almacenamiento local */ }
}

let lastKey = "";

export function applyPrefs(s: Pick<Settings, "language" | "date_format" | "week_start" | "theme_mode" | "theme_id" | "custom_themes">, systemDark?: boolean): void {
  const key = JSON.stringify([s.language, s.date_format, s.week_start, s.theme_mode, s.theme_id, s.custom_themes, systemDark]);
  if (key === lastKey) return;
  lastKey = key;
  setLang(s.language);
  setDateConfig(s.date_format, s.week_start);
  if (typeof document !== "undefined") {
    document.documentElement.lang = s.language === "en" ? "en" : "es";
    const theme = findTheme(s.theme_id, s.custom_themes || []);
    applyAppearance(resolveAppearance(theme, effectiveMode(s.theme_mode, systemDark)));
  }
  try { localStorage.setItem(KEY, JSON.stringify({ language: s.language, date_format: s.date_format, week_start: s.week_start })); } catch { /* */ }
}
