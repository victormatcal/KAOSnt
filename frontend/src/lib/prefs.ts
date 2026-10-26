// Interface preferences (language, date format, week start and appearance) applied before the first
// render: on start the last known ones are used (localStorage) and, once the settings load, the server ones.
import { setDateConfig } from "./dates";
import { setLang } from "./i18n";
import { applyAppearance, effectiveMode, findTheme, resolveAppearance } from "./theme";
import type { Settings } from "./types";

const KEY = "kaosnt-preferencias";

export function applyCachedPrefs(): void {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (p) { setLang(p.language); setDateConfig(p.date_format, p.week_start); }
  } catch { /* no local storage */ }
}

let lastKey = "";

export function applyPrefs(s: Pick<Settings, "language" | "date_format" | "week_start" | "theme_mode" | "theme_id" | "custom_themes">, systemDark?: boolean): void {
  const key = JSON.stringify([s.language, s.date_format, s.week_start, s.theme_mode, s.theme_id, s.custom_themes, systemDark]);
  if (key === lastKey) return;
  lastKey = key;
  setLang(s.language);
  setDateConfig(s.date_format, s.week_start);
  if (typeof document !== "undefined") {
    document.documentElement.lang = s.language === "es" ? "es" : "en";
    const theme = findTheme(s.theme_id, s.custom_themes || []);
    applyAppearance(resolveAppearance(theme, effectiveMode(s.theme_mode, systemDark)));
  }
  try { localStorage.setItem(KEY, JSON.stringify({ language: s.language, date_format: s.date_format, week_start: s.week_start })); } catch { /* */ }
}
