// Series recurrentes sin saturar la interfaz: una tarjeta por serie y estado.
// Representante: la ocurrencia abierta más antigua o, entre las terminadas (hecha/cancelada), la más reciente.
import type { Task } from "./types";

export interface SeriesTask extends Task { series_more?: number; series_key?: string }

export function groupSeries(tasks: Task[], expanded: Set<number> = new Set()): SeriesTask[] {
  const groups = new Map<string, Task[]>();
  for (const x of tasks) {
    if (x.recurrence_id === null || expanded.has(x.recurrence_id)) continue;
    const key = `${x.recurrence_id}:${x.status}`;
    groups.set(key, [...(groups.get(key) || []), x]);
  }
  const rep = new Map<number, SeriesTask>();
  for (const [key, items] of groups) {
    const closed = items[0].status === "hecha" || items[0].status === "cancelada";
    const sorted = [...items].sort((a, b) => (a.occurrence_date || "").localeCompare(b.occurrence_date || "") || a.id - b.id);
    const pick = closed ? sorted[sorted.length - 1] : sorted[0];
    rep.set(pick.id, { ...pick, series_more: items.length - 1, series_key: key });
  }
  const out: SeriesTask[] = [];
  for (const x of tasks) {
    if (x.recurrence_id === null || expanded.has(x.recurrence_id)) out.push(x);
    else if (rep.has(x.id)) out.push(rep.get(x.id)!);
  }
  return out;
}
