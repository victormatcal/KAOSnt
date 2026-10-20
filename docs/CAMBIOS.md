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
