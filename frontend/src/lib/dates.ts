// Fechas: instantes en UTC o 'YYYY-MM-DD'. Se muestran en la zona configurada (Europe/Madrid por defecto)
// y en el formato configurado (dd/mm/aaaa por defecto). Internamente siempre AAAA-MM-DD.
import { getLang, t } from "./i18n";

export type DateFormat = "dd/mm/aaaa" | "aaaa-mm-dd" | "mm/dd/aaaa";
const cfg: { format: DateFormat; weekStart: 1 | 7 } = { format: "dd/mm/aaaa", weekStart: 1 };
export function setDateConfig(format?: string, weekStartDay?: number): void {
  cfg.format = format === "aaaa-mm-dd" || format === "mm/dd/aaaa" ? format : "dd/mm/aaaa";
  cfg.weekStart = weekStartDay === 7 ? 7 : 1;
}
export function dateConfig(): { format: DateFormat; weekStart: 1 | 7 } { return { ...cfg }; }

const DOW_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function dowShort(jsDay: number): string { return (getLang() === "en" ? DOW_EN : DOW_ES)[jsDay]; }
export function monthName(m0: number): string { return (getLang() === "en" ? MONTHS_EN : MONTHS_ES)[m0]; }
/** Cabeceras de la semana (lun…dom o dom…sáb según configuración). */
export function weekHeaders(): string[] {
  const order = cfg.weekStart === 7 ? [0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 0];
  return order.map(dowShort);
}

function parts(d: Date, tz: string): Record<string, number> {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  const out: Record<string, number> = {};
  for (const p of f.formatToParts(d)) if (p.type !== "literal") out[p.type] = parseInt(p.value, 10);
  return out;
}

export function pad(n: number): string { return n < 10 ? "0" + n : String(n); }

export function todayIn(tz: string, now: Date = new Date()): string {
  const p = parts(now, tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Lunes de la semana (planificación: siempre lunes-domingo). */
export function weekStart(iso: string): string { return addDays(iso, -((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7)); }
/** Primer día de la semana para presentación (lunes o domingo, configurable). */
export function viewWeekStart(iso: string): string {
  return cfg.weekStart === 7 ? addDays(iso, -new Date(iso + "T12:00:00Z").getUTCDay()) : weekStart(iso);
}
export function isoDow(iso: string): number { return ((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7) + 1; }

/** AAAA-MM-DD → texto en el formato configurado (o el indicado). */
export function formatIso(iso: string, format: DateFormat = cfg.format): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  return format === "aaaa-mm-dd" ? `${y}-${m}-${d}` : format === "mm/dd/aaaa" ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}

/** Texto en el formato configurado → AAAA-MM-DD, o null si no es una fecha válida. Acepta también AAAA-MM-DD. */
export function parseDateText(text: string, format: DateFormat = cfg.format): string | null {
  const s = (text || "").trim();
  let y: number, m: number, d: number;
  let mt = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (mt) { y = +mt[1]; m = +mt[2]; d = +mt[3]; }
  else {
    mt = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
    if (!mt) return null;
    if (format === "mm/dd/aaaa") { m = +mt[1]; d = +mt[2]; } else { d = +mt[1]; m = +mt[2]; }
    y = +mt[3];
  }
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Placeholder del formato configurado (dd/mm/aaaa, …; en inglés dd/mm/yyyy). */
export function formatHint(format: DateFormat = cfg.format): string {
  return getLang() === "en" ? format.replace("aaaa", "yyyy") : format;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return t("sin fecha");
  return formatIso(iso.slice(0, 10));
}

/** Con día de la semana: «mié 14/10/2026». */
export function fmtDateDow(iso: string | null | undefined): string {
  if (!iso) return t("sin fecha");
  const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
  return `${dowShort(d.getUTCDay())} ${formatIso(iso.slice(0, 10))}`;
}

export function fmtDateTime(utc: string | null | undefined, tz: string): string {
  if (!utc) return t("no informado");
  const p = parts(new Date(utc), tz);
  return `${formatIso(`${p.year}-${pad(p.month)}-${pad(p.day)}`)} ${pad(p.hour)}:${pad(p.minute)}`;
}

/** «HH:MM» válido en 24 h. */
export function parseTimeText(text: string): string | null {
  const m = /^(\d{1,2})(?::|\.|h)?(\d{2})$/.exec((text || "").trim());
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  return h < 24 && mi < 60 ? `${pad(h)}:${pad(mi)}` : null;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}

export function dueLabel(due: string, today: string): string {
  const d = daysBetween(today, due);
  if (d < 0) return t("venció hace {n} d", { n: -d });
  if (d === 0) return t("vence hoy");
  if (d === 1) return t("vence mañana");
  return t("vence {fecha}", { fecha: fmtDateDow(due) });
}

/** Duración natural legible. Nunca se presenta como horas trabajadas. */
export function fmtDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const min = Math.floor(ms / 60000);
  const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
  if (d > 0) return t("{d} d {h} h", { d, h });
  if (h > 0) return t("{h} h {m} min", { h, m });
  return t("{m} min", { m });
}

export function elapsedSinceStart(startedAt: string | null, completedAt: string | null, now: Date = new Date()): string {
  if (!startedAt) return t("no informado (sin fecha de inicio)");
  const end = completedAt ? Date.parse(completedAt) : now.getTime();
  return completedAt ? t("{dur} de tiempo natural transcurrido (hasta la finalización)", { dur: fmtDuration(end - Date.parse(startedAt)) })
    : t("{dur} de tiempo natural transcurrido", { dur: fmtDuration(end - Date.parse(startedAt)) });
}

export function sinceLabel(utc: string | null | undefined, now: Date = new Date()): string {
  return utc ? t("hace {dur}", { dur: fmtDuration(now.getTime() - Date.parse(utc)) }) : t("no informado");
}

export function zonedToUtc(local: string, tz: string): string {
  const [d, t] = local.split("T");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = (t || "00:00").split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, da, h, mi);
  let guess = wall;
  for (let i = 0; i < 3; i++) {
    const p = parts(new Date(guess), tz);
    const diff = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - wall;
    if (diff === 0) break;
    guess -= diff;
  }
  return new Date(guess).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function utcToZonedInput(utc: string | null | undefined, tz: string): string {
  if (!utc) return "";
  const p = parts(new Date(utc), tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function inQuietHours(start: string, end: string, tz: string, now: Date = new Date()): boolean {
  const p = parts(now, tz);
  const cur = p.hour * 60 + p.minute;
  const [sh, sm] = start.split(":").map(Number), [eh, em] = end.split(":").map(Number);
  const s = sh * 60 + sm, e = eh * 60 + em;
  if (s === e) return false;
  return s < e ? cur >= s && cur < e : cur >= s || cur < e;
}

export function monthGrid(iso: string): string[] {
  const start = viewWeekStart(iso.slice(0, 8) + "01");
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
