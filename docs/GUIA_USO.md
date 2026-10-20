# Guía breve de uso

## Atajos

| Acción | Atajo |
|---|---|
| Nueva tarea (solo el título es obligatorio) | `Alt+T` |
| Nueva nota (vacía, sin título ni proyecto) | `Alt+N` |
| Buscar en tareas, proyectos y notas | `Ctrl+K` o `/` |
| Ir a Hoy / Proyectos / Trabajo / Equipo / Notas | `Alt+1` … `Alt+5` |
| Volver a la pantalla de inicio | clic en el nombre de la aplicación |
| Guardar el detalle de una tarea | `Ctrl+S` |
| Registrar actualización / guardar texto largo | `Ctrl+Enter` |
| Cerrar panel o diálogo | `Esc` |
| Crear tarea desde el texto seleccionado de una nota | `Alt+Shift+T` |
| Cerrar pestaña de nota (no la borra) | `Alt+W` |

En el Kanban, cada tarjeta tiene botones ◀ ▲ ▼ ▶ además de arrastrar y soltar.

## Flujo recomendado
1. **Captura sin clasificar**: `Alt+N` y escribe (se guarda solo: *Guardando… / ✓ Guardado / ⚠ Error*), o `Alt+T` con solo el título.
2. **Clasifica después**: en *Notas → Sin clasificar* vincula a proyecto, marca como acta/decisión/documentación, añade etiquetas o crea una tarea desde un fragmento.
3. **Empieza el día en Hoy**: vencimientos de la semana (incluido Backlog con fecha), revisiones y recordatorios, bloqueos externos, lo que depende de ti y el equipo con sus ausencias y festivos.
4. **Trabaja en Trabajo**: Kanban, Lista, Calendario o Archivadas, con filtros y vistas guardadas.
5. **Antes de una reunión**, abre el proyecto: «Dónde lo dejamos», siguiente acción, señales, decisiones, compromisos, tareas y notas.

## Tareas
- **Estado** (Backlog → Pendiente → En curso → En revisión → Hecha; Cancelada) y **condición** independiente (En espera / Bloqueada).
- El detalle se organiza en secciones plegables; solo una abierta a la vez.
- **Pasos** (casillas internas) o **subtareas** (tareas completas, visibles en todas las vistas con «↳ Subtarea de…»). Un paso puede convertirse en subtarea.
- **Repetición**: «Hacer recurrente» con la regla que quieras (p. ej. lunes y miércoles). Cada ocurrencia es una tarea propia: complétala o «Saltar ocurrencia». Gestiona todas las series en *Trabajo → ↻ Recurrentes*.
- **Historial**: tus actualizaciones (editables) y los cambios automáticos (solo lectura).
- **Etiquetas**: escribe y elige una existente o pulsa Enter para crearla. Renómbralas o elimínalas en *Configuración → Etiquetas*.
- **Archivar** oculta la tarea; en *Trabajo → Archivadas* puedes restaurarla o eliminarla definitivamente.
- **Repartir esfuerzo entre semanas** (opcional, solo con estimación): para tareas grandes que ocupan varias semanas; sin reparto, la planificación cuenta la estimación entera en la semana de la fecha planificada.

## Equipo, oficinas y festivos
- *Configuración → Oficinas y festivos*: crea oficinas y registra festivos **comunes** o **de una oficina**.
- *Equipo → Editar persona*: oficina y capacidad semanal (opcionales).
- *Proyecto → Personas y dedicación*: % de la capacidad de cada persona dedicado a ese proyecto.
- *Equipo → Planificación semanal*: esfuerzo estimado registrado, disponibilidad (capacidad × días laborables tras festivos y ausencias) y desglose por proyecto. Las tareas sin estimación se listan aparte; nada se reparte ni reasigna automáticamente. No mide rendimiento.

## Proyectos y clientes
- *Proyectos → Clientes*: crear, renombrar o eliminar clientes. En cada proyecto se cambia el cliente con su selector.
- «Por qué» del estado general: explicación visible en la lista de proyectos.

## Notas
- Cerrar una pestaña no borra ni archiva. Al reabrir se restauran pestañas, orden y nota activa.
- Título sugerido por la primera línea; el título manual nunca se sobrescribe.
- Si el guardado falla, el texto se conserva (también en una copia de emergencia del navegador) y puedes reintentar.
- Archivo y papelera recuperables; eliminación definitiva solo desde la papelera.

## Copias, exportación y restauración

| Qué | Dónde |
|---|---|
| Copia automática diaria | `%LOCALAPPDATA%\KAOSnt\copias\kaosnt-AAAAMMDD-HHMMSS-auto.db` (retención configurable) |
| Copia manual | Configuración → *Crear copia ahora* |
| Copia previa | `…-previa-restauracion.db` / `…-previa-migracion.db` |
| Exportación completa (restaurable) | Configuración → Exportar (JSON) |
| Proyecto / Notas / Tareas | Pantalla del proyecto · ZIP de Markdown · CSV (`;`, UTF-8) |

**Restaurar**: desde una copia (botón *Restaurar*) o desde una exportación completa (se muestra «Actual / Tras restaurar» antes de confirmar).
Siempre se crea antes una copia del estado actual. Manualmente, con la app cerrada: copia un `.db` de `copias\` sobre `kaosnt.db` y elimina `kaosnt.db-wal`/`-shm`.
