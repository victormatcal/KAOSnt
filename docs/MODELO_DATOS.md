# Modelo de datos

Esquema: [`001_inicial.sql`](../backend/kaosnt/migrations/001_inicial.sql) + [`002_v02.sql`](../backend/kaosnt/migrations/002_v02.sql). Versión actual: **2** (`PRAGMA user_version`).

## Convenciones
- Instantes en UTC ISO-8601; fechas de calendario `YYYY-MM-DD`. Zona de presentación configurable (Europe/Madrid).
- Desconocido = `NULL`, mostrado como «no informado» (nunca como 0).

## Entidades

| Tabla | Propósito |
|---|---|
| `clients` | Cliente opcional (1:N proyectos; borrar → proyectos sin cliente) |
| `locations` | Oficina (nombre único sin distinguir mayúsculas) — *0.2* |
| `holidays` | Festivo: fecha, nombre, `location_id` (NULL = común). Único por (fecha, oficina) — *0.2* |
| `people` | Personas (incluida «yo»), capacidad semanal opcional, `location_id` opcional (*0.2*) |
| `projects` | Proyecto/propuesta: estado de actividad, estado general manual + explicación, resumen y fecha, siguiente acción… |
| `project_people` | N:M persona-proyecto con `role` y `dedication_pct` (*0.2*) |
| `groupings` | Línea de trabajo / fase / entregable por proyecto |
| `milestones` | Hito, decisión pendiente o compromiso |
| `tasks` | Tarea (solo `title` obligatorio): estado + condición, responsable, revisor, prioridad y posición manuales, fechas, estimación, aprobación, espera/seguimiento, revisiones, `parent_id`, ocurrencia de recurrencia, `archived` |
| `task_steps` | Pasos (lista de comprobación) de una tarea — *0.2* |
| `task_dependencies` | «task_id depende de depends_on_id»; sin autodependencias ni ciclos |
| `task_history` | Historial: `cambio` (automático), `actualizacion` (manual, editable, `edited_at` *0.2*), `seguimiento` |
| `task_allocations` | Reparto semanal explícito de esfuerzo |
| `notes`, `note_task_links` | Notas Markdown (versión para autoguardado) y vínculos con fragmento |
| `tags`, `task_tags`, `note_tags` | Etiquetas únicas reutilizables |
| `absences` | Ausencias por fechas (sin motivo obligatorio) |
| `recurrences` | Plantillas recurrentes |
| `reminders` | Recordatorios con clave de deduplicación persistente |
| `saved_views`, `settings` | Vistas guardadas y preferencias/sesión (JSON) |

## Reglas principales
- La prioridad nunca cambia sola; las dependencias nunca cambian estados; completar pasos o subtareas no completa la principal.
- Actualización significativa: estado, condición, descripción, actualización manual, seguimiento o paso completado. Abrir, reordenar, prioridad o fechas no.
- Festivos aplicables a una persona = comunes + los de su oficina. Se usan en recurrencias, horas laborables, disponibilidad y conflictos.
- Planificación: reparto explícito o estimación completa en la semana planificada; subtareas estimadas sustituyen al padre; sin estimación → aparte.

## Migración 002
Crea `locations`, `holidays`, `task_steps`; añade `people.location_id`, `project_people.dedication_pct`, `task_history.edited_at`;
convierte la lista de festivos de la 0.1 en festivos comunes y cambia el nombre por defecto a «KAOSnt». Antes se crea una copia previa.

## Exportación completa
`{"format": "kaosnt", "kind": "completa", "format_version": 1, "schema_version": 2, "app_version": "0.2.0", "exported_at": …, "tables": {…}}`.
La restauración exige el mismo `schema_version`; rechaza tablas/columnas desconocidas y relaciones rotas.
