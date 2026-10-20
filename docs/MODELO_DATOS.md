# Modelo de datos

Esquema completo: [`backend/centro/migrations/001_inicial.sql`](../backend/centro/migrations/001_inicial.sql).
Versión del esquema en `PRAGMA user_version` (actual: **1**).

## Convenciones
- Instantes en UTC ISO-8601 (`2026-10-13T08:00:00Z`); fechas de calendario como `YYYY-MM-DD` (fecha local).
- La zona horaria de presentación y de «hoy» es configurable (`Europe/Madrid` por defecto, con cambios de horario).
- Valores desconocidos = `NULL` (se muestran como «no informado», nunca como 0): estimaciones, capacidad, fechas.
- Una única fuente de verdad por relación: nada se duplica entre vistas.

## Entidades

| Tabla | Propósito | Claves y relaciones |
|---|---|---|
| `clients` | Cliente opcional | 1:N con `projects` (borrar cliente → proyecto sin cliente) |
| `projects` | Proyecto (incluye propuestas) | `client_id?`; estado de actividad; estado general manual + nota; resumen «Dónde lo dejamos» con fecha; siguiente acción; objetivo/fase; enlaces (JSON) |
| `people` | Personas (incluida «yo», `is_me`) | Capacidad semanal opcional; `active` para ocultar sin perder historial |
| `project_people` | Personas vinculadas a proyectos | N:M; una persona en varios proyectos sin duplicarse |
| `groupings` | Línea de trabajo / fase / entregable | Por proyecto; una tarea referencia hasta una de cada tipo (opcionales) |
| `milestones` | Hito, decisión pendiente o compromiso | Por proyecto; fecha y estado |
| `tasks` | Tarea | Todo opcional salvo `title`. Estado (fase) + `condition` (espera/bloqueada) independientes; responsable, revisor, prioridad manual, posición manual, fechas (límite, planificada, inicio real, fin), estimación, aprobación comercial, campos de espera y seguimiento, reglas de revisión, `last_significant_update`, enlaces, `parent_id` (subtareas), `recurrence_id`+`occurrence_date` (único), `archived` |
| `task_dependencies` | «task_id depende de depends_on_id» | Sin autodependencias (CHECK) ni ciclos (validación) |
| `task_history` | Historial breve | Cambios significativos y actualizaciones manuales |
| `task_allocations` | Reparto semanal explícito de esfuerzo | (tarea, lunes de la semana) → horas |
| `notes` | Notas Markdown | Título manual opcional, tipo (acta/decisión/documentación), proyecto opcional, fijada, estado (activa/archivada/papelera), `version` para el autoguardado |
| `note_task_links` | Vínculo nota ↔ tarea | Con `excerpt` cuando la tarea nace de un fragmento |
| `tags`, `task_tags`, `note_tags` | Etiquetas transversales | N:M |
| `absences` | Ausencias por fechas | Sin motivo obligatorio |
| `recurrences` | Plantilla recurrente | Regla, días, inicio/fin, regla de días no laborables, `generated_until` |
| `reminders` | Recordatorios | `dedup_key` única (persistente), estado pendiente/pospuesto/descartado/atendido, `snoozed_until`, `notified` |
| `saved_views` | Vistas guardadas | Tipo de vista + filtros (JSON) |
| `settings` | Preferencias y sesión | Clave → JSON (incluye pestañas de notas abiertas) |

## Reglas implementadas en el servidor
- Crear tarea: solo título; posición al final de su columna; historial «Creada».
- `update_task`: no modifica la prioridad por su cuenta; no cambia estados por dependencias; exige confirmación (`force`) para iniciar con aprobación pendiente/rechazada.
- Recordatorios: claves `vence:{id}:{fecha}`, `revision:{id}:{instante}`, `inicio:{id}:{inicio}:{h}`, `inactividad:{id}:{última actualización}:{h}`, `seguimiento:{id}:{base}:{días}`, `seguimiento_fecha:{id}:{instante}`, `manual:{uuid}`. Se ignoran tareas hechas, canceladas o archivadas.
- Recurrencias: índice único `(recurrence_id, occurrence_date)`; solo la última ocurrencia pasada perdida.

## Migraciones
Archivos `NNN_descripcion.sql` en `backend/centro/migrations/`. Al arrancar se aplican las pendientes en orden, cada una en
una transacción; si la base ya tenía datos se crea antes `copias/…-previa-migracion.db`.

## Formato de exportación completa
```json
{ "format": "centro-trabajo", "kind": "completa", "format_version": 1, "schema_version": 1,
  "app_version": "0.1.0", "exported_at": "…Z", "tables": { "tasks": [ … ], "notes": [ … ], … } }
```
La restauración exige `kind = completa`, la misma `format_version` y el mismo `schema_version`; rechaza tablas o columnas desconocidas y relaciones rotas.
