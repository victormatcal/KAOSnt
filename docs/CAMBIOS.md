# Cambios en la 0.3.0

| Observación | Qué se ha hecho |
|---|---|
| 1. Deshacer | Aviso inferior con «Deshacer» y barra de progreso (8 s por defecto, configurable 3–60 s) tras marcar hecha, cancelar, archivar, mover de columna, promover, saltar ocurrencia, resolver una espera, atender/posponer/descartar un recordatorio, archivar o enviar una nota a la papelera, archivado masivo y cumplir un hito. El servidor guarda una instantánea de la fila completa (`undo_log`) y la restaura exactamente (incluidos `completed_at`, `started_at`, `position`). Caduca a los 15 min y solo se aplica una vez. El borrado definitivo mantiene su confirmación y no tiene deshacer. |
| 2. Modo oscuro | Claro, Oscuro o Según el sistema (escucha `prefers-color-scheme`). Todos los colores fijos del CSS pasan a variables. El último aspecto se aplica antes del primer render desde `localStorage` y, sin él, el CSS respeta el modo oscuro del sistema (sin destello blanco). |
| 3. Temas JSON | Formato declarativo `kaosnt-theme` v1 validado en servidor (`themes.py`) y cliente (`lib/theme.ts`): solo colores #hex/rgb(a)/hsl(a), fuente de lista cerrada y radio 0–16. Integrados: Predeterminado, Minimalista, Cupertino, Retro y Alto contraste, todos con contraste de texto ≥ 4,5:1 en claro y oscuro (comprobado en pruebas). Importar, usar, eliminar y «Descargar plantilla del tema actual». Carpeta `temas/` con ejemplo y [TEMAS.md](TEMAS.md). |
| 4. Festivos en bloque | Pegar texto o subir CSV «día;nombre;oficina» (`;`, `,` o tabulador; cabecera opcional; dd/mm/aaaa o AAAA-MM-DD; vacío o «Común» = todas). Vista previa por línea (se importará / duplicado / error con motivo). «Crear oficinas que no existan»; una oficina desconocida nunca se convierte en festivo común. |
| 5. Fechas | Formato configurable (dd/mm/aaaa por defecto, aaaa-mm-dd, mm/dd/aaaa) e inicio de semana lunes o domingo en calendarios. Nuevos `DateInput` (texto + calendario emergente, se aplica en cuanto la fecha es válida), `TimeInput` (24 h) y `DateTimeInput` (zona configurada). Ya no queda ningún `input type="date/time/datetime-local"`. Internamente sigue AAAA-MM-DD y la planificación es de lunes a domingo. |
| 6. Recordatorios visibles | Centro en la campana 🔔: Pendientes, Programados (futuros y pospuestos) y Resueltos; editar y cancelar los manuales, reabrir los resueltos. En Hoy, «Programados esta semana». En el detalle de la tarea, sus recordatorios. El aviso de creación indica dónde verlo. |
| 7. Archivar todas | En la columna Hecha visible: confirmación, endpoint masivo en una transacción (`/api/tasks/archive-bulk`) y deshacer en conjunto. |
| 8. Español e inglés | `t("texto", {vars})` con el español como clave y `src/i18n/en.ts`; si falta, se muestra el español. Selector persistente en Configuración. Textos del servidor (tipos de recordatorio, motivos) traducidos en el cliente. `tools/i18n-keys.mjs` en `npm test` (también detecta `t` usado como variable y `t()` con plantillas). |
| 9. Recurrentes sin saturar | Kanban y Lista: una tarjeta por serie y estado (abierta más antigua o terminada más reciente) con «↻ +N», desplegable; interruptor «Agrupar series recurrentes». Calendario: todas, en cursiva con ↻. Hoy: una entrada por serie con «+N esta semana». Avisos automáticos solo de la ocurrencia abierta más antigua; los repetidos se agrupan. |
| 10. Herencia completa | Migración 003 `recurrences.template`. Se hereda todo lo pedido (incluidos pasos sin marcar y recordatorios manuales) y las fechas mantienen su relación con la fecha límite. Antes de crear la serie se guardan los cambios pendientes. «Aplicar estos datos a la serie» actualiza la plantilla y las ocurrencias futuras pendientes. Referencias borradas se descartan sin romper la generación. |
| 11. Eliminar series | Conservar las ocurrencias como tareas normales o eliminar también las pendientes (no iniciadas y saltadas). Las hechas (y las en curso o en revisión) se conservan siempre. Confirmación explícita. |
| 12. Borrar todo | «Zona de peligro»: escribir el nombre de la aplicación o «BORRAR TODO», copia `…-previa-borrado.db` previa e informada, queda como recién instalada con «Yo». En demo, opción de recargar los datos ficticios. |
| 13. Horario por día | Ajuste `work_schedule` por día ISO (inicio/fin o no laborable), migrado desde `workdays`/`work_start`/`work_end`. Lo usan `add_hours`, `business_hours_between`, las recurrencias de laborables, la disponibilidad (proporcional a las horas reales de cada día) y el texto «Laborables: L–J 09:00–19:00 · V 09:00–15:00». Pruebas con viernes corto y cambio de hora. |
| 14. Eliminar proyectos | «Eliminar proyecto» con copia previa y dos opciones: desvincular (tareas, notas y recurrencias se conservan sin proyecto) o eliminar (tareas y recurrencias se eliminan; notas a la papelera). |
| 15. Reordenar notas abiertas | Arrastrar y soltar las pestañas (se mantiene Alt+←/→ como alternativa de teclado). El orden se guarda en la sesión. |
| 16. Filtrar notas | Texto (título y contenido, solo título o solo contenido; sin distinguir mayúsculas ni acentos), proyecto (incluido «Sin proyecto»), tipo y etiqueta. «Quitar filtros». |
| 17. Nota eliminada abierta | Al eliminarla definitivamente se quita de las pestañas y del panel dividido; si una pestaña apunta a una nota que ya no existe (404), también se cierra sola. |
| 18. Pantalla dividida | «◫ Pantalla dividida»: dos notas editables a la vez, cada una con su autoguardado. Rejilla `minmax(0,1fr)` sin scroll horizontal; por debajo de 1100 px se apilan. La nota derecha se elige de las abiertas y se recuerda. |

---

# Cambios en la 0.2.0 (a partir del feedback de la 0.1)

| Observación | Qué se ha hecho |
|---|---|
| Nombre «KAOSnt» | Nombre por defecto, título de la pestaña, scripts, carpetas de datos (`KAOSnt`, `KAOSnt-demo`), copias (`kaosnt-…db`), paquete Python `kaosnt`. Migración automática desde la 0.1. |
| Festivos por localidad | Nueva entidad **Oficina**. Festivos **comunes** o **de una oficina**; cada persona tiene oficina opcional. Recurrencias, horas laborables, disponibilidad y conflictos usan los festivos que aplican a cada persona. |
| Festivos y ausencias visibles en Trabajo | Calendario: línea gris discreta por día («Festivo Oficina X», «Ausente: Ana»; al pasar el ratón, a quién afecta). Kanban/Lista: franja de una línea «No disponibles esta semana». Hoy: festivos y ausencias de la semana bajo cada persona. |
| Nombre de la app → inicio | El nombre del encabezado lleva a la pantalla de apertura configurada (o la última vista, si así se configuró). |
| Gestión de clientes | *Proyectos → Clientes*: crear, renombrar y eliminar (los proyectos se conservan). En cada proyecto, selector de cliente editable con «+ Nuevo cliente…». |
| «Explicación breve» del estado | Ahora es un área de texto ancha que crece con el contenido (con límite) y se **muestra** en la tarjeta del proyecto en la lista. |
| «Siguiente acción» pequeña | Área de texto a todo el ancho que crece con el contenido. Igual para objetivo, fase, motivo y próxima acción de esperas, descripción, actualizaciones y seguimiento. |
| Capacidad semanal | Ahora tiene uso real: **disponible** = capacidad × días laborables tras festivos y ausencias registrados. Nueva **dedicación por proyecto** (% de la capacidad) y desglose por proyecto en la planificación (dedicación frente a esfuerzo estimado). |
| Tareas recurrentes | Sección **Repetición** en el detalle de cualquier tarea («Hacer recurrente»: diaria, laborables, días concretos de la semana —p. ej. lunes y miércoles— o cada X días). También en «+ Tarea → Más campos → Se repite» y en *Trabajo → ↻ Recurrentes*. |
| Historial editable | Las actualizaciones manuales se pueden editar (queda marca «editada»); las automáticas no. Se distinguen visualmente. Área de texto grande con Ctrl+Enter. |
| Reparto semanal confuso | Renombrado a «Repartir esfuerzo entre semanas (opcional)», con explicación, total repartido y solo visible si la tarea tiene estimación. |
| Subtareas | Dos opciones: **Paso** (casilla dentro de la tarea, no aparece en vistas) o **Subtarea** (tarea completa, visible en todas las vistas con «↳ Subtarea de «Título»»). Un paso se puede convertir en subtarea. La tarea principal muestra contadores. Corregido el «#1»: se muestra el nombre. |
| Ver tareas archivadas | *Trabajo → Archivadas*: lista con Restaurar y Eliminar definitivamente. |
| Etiquetas | Selector con sugerencias de las existentes; Enter crea una nueva; chips con ×. Únicas sin distinguir mayúsculas. Gestión en *Configuración → Etiquetas* (renombrar —fusiona si coincide— y eliminar). Filtro por etiqueta también en Notas. |
| Menús de la tarea | Acordeón: al abrir una sección se cierra la anterior. |
| Notas vinculadas | Botón «+ Nueva nota vinculada» (hereda el proyecto de la tarea). |
| `#número` delante de tareas | Eliminado. Las tareas se buscan y muestran por título con contexto (proyecto · estado · responsable), también en el historial. |
| Desbordamientos y scroll horizontal | Textos con ajuste de línea, rejillas que se adaptan al ancho, rutas largas partidas, tablas con desplazamiento propio y resumen de equipo de Hoy como lista compacta. La página solo desplaza en vertical. |
