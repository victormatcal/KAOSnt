import { t, tr } from "./i18n";
import type { Priority, Rule, TaskStatus, WorkSchedule } from "./types";

export const STATUS: Record<TaskStatus, string> = tr({
  backlog: "Backlog", pendiente: "Pendiente", en_curso: "En curso", en_revision: "En revisión", hecha: "Hecha", cancelada: "Cancelada",
});
export const BOARD_COLUMNS: TaskStatus[] = ["pendiente", "en_curso", "en_revision", "hecha"];
export const STATUS_ORDER: TaskStatus[] = ["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"];
export const PRIORITY: Record<Priority, string> = tr({ urgente: "Urgente", alta: "Alta", normal: "Normal", baja: "Baja" });
export const PRIORITY_MARK: Record<Priority, string> = { urgente: "‼", alta: "!", normal: "", baja: "↓" };
export const CONDITION: Record<string, string> = tr({ espera: "En espera", bloqueada: "Bloqueada" });
export const KIND: Record<string, string> = tr({ tarea: "Tarea", peticion: "Petición", incidencia: "Incidencia", mejora: "Mejora", evolutivo: "Evolutivo" });
export const APPROVAL: Record<string, string> = tr({ no_requerida: "No requerida", pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" });
export const PROJECT_STATUS: Record<string, string> = tr({ activo: "Activo", pausado: "Pausado", cerrado: "Cerrado", archivado: "Archivado" });
export const HEALTH: Record<string, string> = tr({ normal: "Normal", atencion: "Requiere atención", bloqueado: "Bloqueado" });
export const PROJECT_TYPE: Record<string, string> = tr({
  implementacion: "Implementación", mantenimiento: "Mantenimiento", id: "I+D", consultoria: "Consultoría",
  benchmark: "Benchmark", propuesta: "Propuesta comercial", otro: "Otro",
});
export const NOTE_KIND: Record<string, string> = tr({ acta: "Acta", decision: "Decisión", documentacion: "Documentación" });
export const MILESTONE_KIND: Record<string, string> = tr({ hito: "Hito", decision: "Decisión pendiente", compromiso: "Compromiso" });
export const GROUPING_KIND: Record<string, string> = tr({ linea: "Línea de trabajo", fase: "Fase", entregable: "Entregable" });
export const SIGNAL: Record<string, string> = tr({
  vencida: "Vencida", vence_hoy: "Vence hoy", vence_semana: "Vence esta semana", espera: "En espera", bloqueada: "Bloqueada",
  bloqueada_por_dependencia: "Depende de otra tarea", bloquea_otras: "Bloquea otras tareas", backlog: "En backlog",
  aprobacion_pendiente: "Aprobación pendiente", aprobacion_rechazada: "Aprobación rechazada",
});
export const RULE: Record<Rule, string> = tr({ diaria: "Todos los días", laborables: "Días laborables", semanal: "Semanal (días concretos)", cada_n_dias: "Cada X días" });
export const NONWORK: Record<string, string> = tr({ saltar: "Saltar ese día", siguiente_laborable: "Mover al siguiente laborable", mantener: "Mantener la fecha" });
const DAYS_SHORT_ES = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_LONG_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
/** Días ISO (1 = lunes); se traducen al leerlos. */
export const DAYS_SHORT: string[] = new Proxy(DAYS_SHORT_ES, { get: (a, k) => (typeof k === "string" && /^\d+$/.test(k) ? t(a[Number(k)]) : (a as any)[k]) });
export const DAYS_LONG: string[] = new Proxy(DAYS_LONG_ES, { get: (a, k) => (typeof k === "string" && /^\d+$/.test(k) ? t(a[Number(k)]) : (a as any)[k]) });
export const REMINDER_RULE = tr({
  vence: "Vencimiento próximo", revision: "Fecha de revisión alcanzada", inicio: "Duración desde el inicio superada",
  inactividad: "Sin actualización significativa", seguimiento: "Seguimiento pendiente", manual: "Recordatorio",
} as Record<string, string>);
export const CONFLICT_REASON = tr({ ausencia: "ausencia", festivo: "festivo" } as Record<string, string>);

export function projectTypeLabel(type: string): string { return PROJECT_TYPE[type] || type; }

export function describeRule(r: { rule: Rule; weekdays?: number[]; interval_days?: number | null }): string {
  if (r.rule === "semanal") return t("Cada semana: {dias}", { dias: [...(r.weekdays || [])].sort().map((d) => DAYS_LONG[d - 1].toLowerCase()).join(", ") || "—" });
  if (r.rule === "cada_n_dias") return t("Cada {n} días", { n: r.interval_days || 1 });
  return RULE[r.rule];
}

/** «L–J 09:00–19:00 · V 09:00–15:00» (días consecutivos con el mismo horario se agrupan). */
export function describeSchedule(sch: WorkSchedule | undefined): string {
  if (!sch) return "";
  const parts: string[] = [];
  let i = 1;
  while (i <= 7) {
    const w = sch[String(i) as keyof WorkSchedule];
    if (!w) { i++; continue; }
    let j = i;
    while (j < 7) { const n = sch[String(j + 1) as keyof WorkSchedule]; if (n && n.start === w.start && n.end === w.end) j++; else break; }
    parts.push(`${DAYS_SHORT[i - 1]}${j > i ? "–" + DAYS_SHORT[j - 1] : ""} ${w.start}–${w.end}`);
    i = j + 1;
  }
  return parts.join(" · ") || t("sin días laborables");
}
