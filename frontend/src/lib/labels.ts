import type { Priority, Rule, TaskStatus } from "./types";

export const STATUS: Record<TaskStatus, string> = {
  backlog: "Backlog", pendiente: "Pendiente", en_curso: "En curso", en_revision: "En revisión", hecha: "Hecha", cancelada: "Cancelada",
};
export const BOARD_COLUMNS: TaskStatus[] = ["pendiente", "en_curso", "en_revision", "hecha"];
export const STATUS_ORDER: TaskStatus[] = ["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"];
export const PRIORITY: Record<Priority, string> = { urgente: "Urgente", alta: "Alta", normal: "Normal", baja: "Baja" };
export const PRIORITY_MARK: Record<Priority, string> = { urgente: "‼", alta: "!", normal: "", baja: "↓" };
export const CONDITION: Record<string, string> = { espera: "En espera", bloqueada: "Bloqueada" };
export const KIND: Record<string, string> = { tarea: "Tarea", peticion: "Petición", incidencia: "Incidencia", mejora: "Mejora", evolutivo: "Evolutivo" };
export const APPROVAL: Record<string, string> = { no_requerida: "No requerida", pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
export const PROJECT_STATUS: Record<string, string> = { activo: "Activo", pausado: "Pausado", cerrado: "Cerrado", archivado: "Archivado" };
export const HEALTH: Record<string, string> = { normal: "Normal", atencion: "Requiere atención", bloqueado: "Bloqueado" };
export const PROJECT_TYPE: Record<string, string> = {
  implementacion: "Implementación", mantenimiento: "Mantenimiento", id: "I+D", consultoria: "Consultoría",
  benchmark: "Benchmark", propuesta: "Propuesta comercial", otro: "Otro",
};
export const NOTE_KIND: Record<string, string> = { acta: "Acta", decision: "Decisión", documentacion: "Documentación" };
export const MILESTONE_KIND: Record<string, string> = { hito: "Hito", decision: "Decisión pendiente", compromiso: "Compromiso" };
export const GROUPING_KIND: Record<string, string> = { linea: "Línea de trabajo", fase: "Fase", entregable: "Entregable" };
export const SIGNAL: Record<string, string> = {
  vencida: "Vencida", vence_hoy: "Vence hoy", vence_semana: "Vence esta semana", espera: "En espera", bloqueada: "Bloqueada",
  bloqueada_por_dependencia: "Depende de otra tarea", bloquea_otras: "Bloquea otras tareas", backlog: "En backlog",
  aprobacion_pendiente: "Aprobación pendiente", aprobacion_rechazada: "Aprobación rechazada",
};
export const RULE: Record<Rule, string> = { diaria: "Todos los días", laborables: "Días laborables", semanal: "Semanal (días concretos)", cada_n_dias: "Cada X días" };
export const NONWORK: Record<string, string> = { saltar: "Saltar ese día", siguiente_laborable: "Mover al siguiente laborable", mantener: "Mantener la fecha" };
export const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
export const DAYS_LONG = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function projectTypeLabel(t: string): string { return PROJECT_TYPE[t] || t; }

export function describeRule(r: { rule: Rule; weekdays?: number[]; interval_days?: number | null }): string {
  if (r.rule === "semanal") return "Cada semana: " + ([...(r.weekdays || [])].sort().map((d) => DAYS_LONG[d - 1].toLowerCase()).join(", ") || "—");
  if (r.rule === "cada_n_dias") return `Cada ${r.interval_days || 1} días`;
  return RULE[r.rule];
}
