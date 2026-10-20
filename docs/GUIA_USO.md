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

**Deshacer (0.3)**: tras marcar hecha, cancelar, archivar, mover de columna, promover, saltar una ocurrencia, resolver una espera,
atender/posponer/descartar un recordatorio, archivar o mandar una nota a la papelera, «Archivar todas» o cumplir un hito, el aviso
de abajo muestra «Deshacer» con una barra de progreso (8 s por defecto; *Configuración → General*). El borrado definitivo no se deshace.

**Fechas (0.3)**: se escriben y se muestran en el formato configurado (dd/mm/aaaa por defecto) con un calendario emergente (📅 o `Alt+↓`;
flechas para moverse, `RePág/AvPág` para cambiar de mes). Horas en 24 h (HH:MM).

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
- **Repetición**: «Hacer recurrente» con la regla que quieras (p. ej. lunes y miércoles). Las ocurrencias heredan todo (proyecto, responsable, revisor, tipo, prioridad, estimación, descripción, agrupaciones, tarea principal, aprobación, revisiones, enlaces, etiquetas, pasos sin marcar y recordatorios) y las fechas mantienen su relación con la fecha límite. En una ocurrencia, «Aplicar estos datos a la serie» actualiza la serie y las futuras pendientes. «Eliminar serie»: conservar las ocurrencias como tareas normales o eliminar también las pendientes. Gestiona todas las series en *Trabajo → ↻ Recurrentes*.
- **Series en Kanban y Lista**: una tarjeta por serie y estado con «↻ +N»; pulsa para desplegarla (↻ − para agruparla). Interruptor «Agrupar series recurrentes». En el calendario se ven todas, en cursiva con ↻.
- **Archivar todas**: con la columna Hecha visible, botón en su cabecera (con confirmación y deshacer).
- **Recordatorios**: la campana 🔔 abre el centro (Pendientes, Programados, Resueltos). En Hoy, «Programados esta semana»; en el detalle de la tarea, los suyos.
- **Historial**: tus actualizaciones (editables) y los cambios automáticos (solo lectura).
- **Etiquetas**: escribe y elige una existente o pulsa Enter para crearla. Renómbralas o elimínalas en *Configuración → Etiquetas*.
- **Archivar** oculta la tarea; en *Trabajo → Archivadas* puedes restaurarla o eliminarla definitivamente.
- **Repartir esfuerzo entre semanas** (opcional, solo con estimación): para tareas grandes que ocupan varias semanas; sin reparto, la planificación cuenta la estimación entera en la semana de la fecha planificada.

## Equipo, oficinas y festivos
- *Configuración → Oficinas y festivos*: crea oficinas y registra festivos **comunes** o **de una oficina**.
- *Equipo → Editar persona*: oficina y capacidad semanal (opcionales).
- *Proyecto → Personas y dedicación*: % de la capacidad de cada persona dedicado a ese proyecto.
- *Configuración → Oficinas y festivos → Importar festivos en bloque*: pega o sube un CSV `día;nombre;oficina` (p. ej. `29/01/2026;San Valero;Zaragoza`), revisa la vista previa por línea e importa. Activa «Crear oficinas que no existan» si procede.
- *Configuración → Horario laboral*: horario por día (p. ej. L–J 9:00–19:00, V 9:00–15:00, S–D no laborables).
- *Equipo → Planificación semanal*: esfuerzo estimado registrado, disponibilidad (capacidad × proporción de las horas del horario de la semana que quedan tras festivos y ausencias) y desglose por proyecto. Las tareas sin estimación se listan aparte; nada se reparte ni reasigna automáticamente. No mide rendimiento.

## Proyectos y clientes
- *Proyectos → Clientes*: crear, renombrar o eliminar clientes. En cada proyecto se cambia el cliente con su selector.
- «Por qué» del estado general: explicación visible en la lista de proyectos.
- **Eliminar proyecto** (además de archivarlo): desvincular su contenido o eliminarlo (las notas van a la papelera). Antes se crea una copia.

## Notas
- Cerrar una pestaña no borra ni archiva. Al reabrir se restauran pestañas, orden y nota activa.
- Título sugerido por la primera línea; el título manual nunca se sobrescribe.
- Si el guardado falla, el texto se conserva (también en una copia de emergencia del navegador) y puedes reintentar.
- Archivo y papelera recuperables; eliminación definitiva solo desde la papelera (la nota desaparece de las pestañas).
- **Filtros**: texto (título y/o contenido), proyecto (o «Sin proyecto»), tipo y etiqueta.
- **Reordenar pestañas** arrastrándolas (o `Alt+←/→`).
- **Pantalla dividida** (◫): dos notas editables lado a lado; elige la de la derecha entre las abiertas. En pantallas estrechas se apilan.

## Aspecto e idioma
- *Configuración → General*: idioma (español/inglés), formato de fecha e inicio de semana.
- *Configuración → Aspecto*: Claro, Oscuro o Según el sistema; temas integrados o importados (ver [TEMAS.md](TEMAS.md)).

## Zona de peligro
*Configuración → Zona de peligro → Borrar todo*: escribe el nombre de la aplicación o «BORRAR TODO». Antes se crea `…-previa-borrado.db`
(se informa del nombre) y la aplicación queda como recién instalada. En la demo puedes recargar los datos ficticios.

## Copias, exportación y restauración

| Qué | Dónde |
|---|---|
| Copia automática diaria | `%LOCALAPPDATA%\KAOSnt\copias\kaosnt-AAAAMMDD-HHMMSS-auto.db` (retención configurable) |
| Copia manual | Configuración → *Crear copia ahora* |
| Copia previa | `…-previa-restauracion.db` / `…-previa-migracion.db` / `…-previa-borrado.db` |
| Exportación completa (restaurable) | Configuración → Exportar (JSON) |
| Proyecto / Notas / Tareas | Pantalla del proyecto · ZIP de Markdown · CSV (`;`, UTF-8) |

**Restaurar**: desde una copia (botón *Restaurar*) o desde una exportación completa (se muestra «Actual / Tras restaurar» antes de confirmar).
Siempre se crea antes una copia del estado actual. Manualmente, con la app cerrada: copia un `.db` de `copias\` sobre `kaosnt.db` y elimina `kaosnt.db-wal`/`-shm`.
