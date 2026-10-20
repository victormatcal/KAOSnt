import type { Priority, TaskStatus } from "./types";

export const STATUS: Record<TaskStatus, string> = {
  backlog: "Backlog", pendiente: "Pendiente", en_curso: "En curso", en_revision: "En revisión",
  hecha: "Hecha", cancelada: "Cancelada",
};
export const BOARD_COLUMNS: TaskStatus[] = ["pendiente", "en_curso", "en_revision", "hecha"];
export const STATUS_ORDER: TaskStatus[] = ["backlog", "pendiente", "en_curso", "en_revision", "hecha", "cancelada"];

export const PRIORITY: Record<Priority, string> = { urgente: "Urgente", alta: "Alta", normal: "Normal", baja: "Baja" };
// Marcadores textuales para no depender solo del color
export const PRIORITY_MARK: Record<Priority, string> = { urgente: "‼", alta: "!", normal: "", baja: "↓" };

export const CONDITION: Record<string, string> = { espera: "En espera", bloqueada: "Bloqueada" };
export const KIND: Record<string, string> = {
  tarea: "Tarea", peticion: "Petición", incidencia: "Incidencia", mejora: "Mejora", evolutivo: "Evolutivo",
};
export const APPROVAL: Record<string, string> = {
  no_requerida: "No requerida", pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada",
};
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
  vencida: "Vencida", vence_hoy: "Vence hoy", vence_semana: "Vence esta semana", espera: "En espera",
  bloqueada: "Bloqueada", bloqueada_por_dependencia: "Depende de otra tarea", bloquea_otras: "Bloquea otras tareas",
  backlog: "En backlog", aprobacion_pendiente: "Aprobación pendiente", aprobacion_rechazada: "Aprobación rechazada",
};

export function projectTypeLabel(t: string): string { return PROJECT_TYPE[t] || t; }
