# Guía breve de uso

## Atajos (visibles en la barra superior)

| Acción | Atajo |
|---|---|
| Nueva tarea (solo título obligatorio) | `Alt+T` |
| Nueva nota (vacía, sin título ni proyecto) | `Alt+N` |
| Buscar en tareas, proyectos y notas | `Ctrl+K` o `/` |
| Ir a Hoy / Proyectos / Trabajo / Equipo / Notas | `Alt+1` … `Alt+5` |
| Guardar el detalle de una tarea | `Ctrl+S` |
| Cerrar panel o diálogo | `Esc` |
| Crear tarea desde el texto seleccionado de una nota | `Alt+Shift+T` |
| Cerrar pestaña de nota (no la borra) | `Alt+W` |
| Reordenar pestaña de nota | `Alt+←` / `Alt+→` sobre la pestaña |

Todo se puede hacer con teclado: en el Kanban, cada tarjeta tiene botones ◀ ▲ ▼ ▶ además de arrastrar y soltar.

## Flujo recomendado

1. **Captura sin clasificar.** Llega un correo, un chat o una reunión: `Alt+N` y escribe. La nota se guarda sola
   (indicador *Guardando… / ✓ Guardado / ⚠ Error*). Para tareas, `Alt+T` y solo el título.
2. **Clasifica después.** En *Notas → Sin clasificar*, vincula la nota a un proyecto, márcala como acta/decisión/documentación,
   o selecciona un fragmento y pulsa *Crear tarea desde selección*: la tarea queda vinculada a la nota y al fragmento.
3. **Empieza el día en Hoy.** Vencimientos de la semana (incluido Backlog con fecha), revisiones y recordatorios,
   bloqueos externos, tareas que dependen de ti y resumen del equipo. Puedes marcar *Hecha* o *Promover* directamente.
4. **Trabaja en Trabajo** (Kanban por defecto, lista o calendario). Filtra por proyecto, persona, estado, condición,
   prioridad o etiqueta; guarda combinaciones como *vistas guardadas*. Backlog y terminadas están ocultos por defecto.
5. **Antes de una reunión de proyecto**, abre el proyecto: *Dónde lo dejamos* con su fecha, siguiente acción, señales
   objetivas, decisiones pendientes, compromisos de 14 días, tareas (agrupadas por línea de trabajo) y notas.

## Conceptos

- **Estado** (fase de trabajo): Backlog → Pendiente → En curso → En revisión → Hecha (Cancelada como acción secundaria).
- **Condición** (independiente del estado): *En espera* o *Bloqueada*, con motivo, de quién depende, desde cuándo,
  próxima acción, fecha de seguimiento y «recordar cada X días». *Seguimiento realizado* reinicia el ciclo sin resolver la espera.
- **Dependencias**: «esta tarea depende de…». Se rechazan ciclos. Completar una dependencia nunca cambia estados por sí solo.
- **Tiempos**: el panel distingue esfuerzo estimado, tiempo natural transcurrido desde el inicio (no son horas
  trabajadas), tiempo desde la última actualización significativa, fecha límite, planificada y de revisión.
- **Revisiones**: en fecha concreta, tras X horas desde el inicio, tras X horas sin actualización (en tiempo natural
  u horas laborables según el horario configurado) y seguimiento cada X días mientras dure la espera.
- **Aprobación comercial** (mejoras/evolutivos): no requerida, pendiente, aprobada o rechazada. Puedes preparar el
  análisis antes; al iniciar la ejecución con aprobación pendiente o rechazada se pide confirmación.
- **Recurrentes** (botón en *Trabajo*): diaria, días laborables, semanal o cada X días; para cualquier persona.
  Cada ocurrencia es una tarea propia; puedes completarla, saltarla, editar solo esa o las futuras.
- **Equipo**: vista operativa por persona (sin valoraciones), ausencias por fechas sin motivo y planificación
  semanal con capacidad opcional; las tareas sin estimación se listan aparte y los conflictos con ausencias se señalan.
- **Recordatorios**: centro interno en *Hoy* (agrupados por tipo): *Atendido*, *Posponer* o *Descartar*.
  Las notificaciones del sistema son opcionales (Configuración), discretas, respetan el horario silencioso y
  solo funcionan con la aplicación abierta. Nada se envía por correo ni mensaje.

## Notas

- Cerrar una pestaña no borra ni archiva. Al reabrir la app se restauran pestañas, orden y nota activa.
- Título: si no escribes uno, se sugiere desde la primera línea con contenido; si está vacía, «Nota del dd/mm/aaaa hh:mm».
  Un título manual nunca se sobrescribe.
- Si el guardado falla, el texto permanece en el editor y en una copia de emergencia del navegador; pulsa *Reintentar*.
  Si la nota se modificó en otra ventana, verás *Conflicto* con opciones explícitas (nunca se sobrescribe en silencio).
- Archivo y papelera son recuperables. Solo se elimina definitivamente desde la papelera, con confirmación.
- Markdown opcional: `# título`, `- lista`, `- [ ] casilla`, `**negrita**`, `[texto](https://…)`, tablas con `|`, bloques con <code>```</code>.
  El HTML se muestra como texto; las imágenes no se cargan (solo un enlace).

## Copias, exportación y restauración

| Qué | Dónde | Para qué |
|---|---|---|
| Copia automática diaria | `%LOCALAPPDATA%\CentroTrabajo\copias\centro-AAAAMMDD-HHMMSS-auto.db` | Volver a un día anterior. Retención configurable. |
| Copia manual | Configuración → *Crear copia ahora* | Antes de cambios grandes. |
| Copia previa | `…-previa-restauracion.db` / `…-previa-migracion.db` | Automática antes de restaurar o migrar. |
| Exportación completa | Configuración → Exportar (JSON) | Llevar los datos a otro equipo / guardar fuera del portátil. **Restaurable.** |
| Exportación de proyecto | Pantalla del proyecto → *Exportar proyecto* | Consulta o archivo de un proyecto con sus relaciones. |
| Notas en Markdown | Configuración → Exportar (ZIP) | Leer las notas con cualquier editor. |
| Tareas en CSV | Configuración → Exportar | Consulta en Excel (separador `;`, UTF-8). No es una copia completa. |

**Restaurar** (Configuración):
- *Desde una copia*: pulsa *Restaurar* junto a la copia → confirma. Se crea antes una copia del estado actual.
- *Desde exportación completa*: elige el JSON → revisa la tabla «Actual / Tras restaurar» → *Restaurar*.
  Si el archivo tiene relaciones rotas o no corresponde a la versión, no se modifica nada.
- Manualmente con la app cerrada: copia un `.db` de `copias\` sobre `centro.db` (y elimina `centro.db-wal`/`-shm`).
