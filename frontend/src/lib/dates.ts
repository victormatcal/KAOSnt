// Fechas: instantes en UTC o 'YYYY-MM-DD'. Se muestran en la zona configurada (Europe/Madrid por defecto).
const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MON = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

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

export function weekStart(iso: string): string { return addDays(iso, -((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7)); }
export function isoDow(iso: string): number { return ((new Date(iso + "T12:00:00Z").getUTCDay() + 6) % 7) + 1; }

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "sin fecha";
  const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
  return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

export function fmtDateTime(utc: string | null | undefined, tz: string): string {
  if (!utc) return "no informado";
  const p = parts(new Date(utc), tz);
  return `${fmtDate(`${p.year}-${pad(p.month)}-${pad(p.day)}`)} ${p.year} ${pad(p.hour)}:${pad(p.minute)}`;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);
}

export function dueLabel(due: string, today: string): string {
  const d = daysBetween(today, due);
  if (d < 0) return `venció hace ${-d} d`;
  if (d === 0) return "vence hoy";
  if (d === 1) return "vence mañana";
  return `vence ${fmtDate(due)}`;
}

/** Duración natural legible. Nunca se presenta como horas trabajadas. */
export function fmtDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const min = Math.floor(ms / 60000);
  const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

export function elapsedSinceStart(startedAt: string | null, completedAt: string | null, now: Date = new Date()): string {
  if (!startedAt) return "no informado (sin fecha de inicio)";
  const end = completedAt ? Date.parse(completedAt) : now.getTime();
  return `${fmtDuration(end - Date.parse(startedAt))} de tiempo natural transcurrido${completedAt ? " (hasta la finalización)" : ""}`;
}

export function sinceLabel(utc: string | null | undefined, now: Date = new Date()): string {
  return utc ? `hace ${fmtDuration(now.getTime() - Date.parse(utc))}` : "no informado";
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
  const start = weekStart(iso.slice(0, 8) + "01");
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
