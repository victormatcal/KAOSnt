# Pruebas

## Entorno de ejecución
Linux (contenedor de desarrollo) · Python 3.12 · FastAPI 0.136.3 · Uvicorn 0.35.0 · Pydantic 2.12.5 · SQLite 3.44 ·
Node 24 · TypeScript 6 · React 19.2.1. **No se ha ejecutado en Windows ni en un navegador real** (no había navegador disponible).

## Versión 0.3 — ejecutadas y superadas

### Servidor: 82 de 82 (49 anteriores + 33 nuevas en `tests/test_v03.py`)
- Horario por día: viernes corto (L–J 9–19, V 9–15) con `add_hours` y `business_hours_between` en la semana del cambio de hora (25/10/2026); semana completa = 46 h; validación del ajuste; disponibilidad proporcional (46 h × 40/46 con el viernes festivo); recurrencias de laborables.
- Migración desde una base 0.2 (esquema 2): copia previa, `workdays/work_start/work_end` → `work_schedule`, serie sin plantilla sigue generando.
- Deshacer: campos exactos (`status`, `completed_at`, `started_at`, `position`, `last_significant_update`, `archived`), una sola vez, caducidad, mover de columna, resolver espera (recupera `wait_since`), saltar ocurrencia, nota a la papelera, recordatorio atendido, hito cumplido; archivado masivo en una transacción con deshacer conjunto.
- Temas: integrados válidos y con contraste ≥ 4,5:1; rechazo de URLs, CSS libre, variables y fuentes desconocidas, id reservado; importar, seleccionar y borrar; validación de idioma, formato de fecha, inicio de semana, modo y segundos de deshacer.
- Festivos en bloque: cabecera, separadores `;`/`,`/tab, ISO y dd/mm/aaaa, duplicados (existente y repetido), fecha imposible, oficina desconocida nunca común, vista previa sin guardar, creación de oficinas.
- Centro de recordatorios: programados (también por tarea y «esta semana» en Hoy), editar, atender, resueltos, reabrir, cancelar; los automáticos no se editan ni cancelan.
- Recurrentes: herencia completa con desplazamiento de planificada, revisión y recordatorios; pasos sin marcar; referencias borradas sin romper la generación; «Aplicar a la serie»; eliminar serie (conservar / eliminar pendientes); una entrada por serie en Hoy y aviso solo de la más antigua.
- Borrar todo (confirmación, copia previa, «Yo», nombre por defecto) y en demo con recarga de datos ficticios; eliminar proyecto (desvincular / eliminar, copia previa, notas a la papelera).
- Notas: filtros por texto (título/contenido, sin acentos), proyecto y «sin proyecto»; pestañas con `split`; nota purgada desaparece de las pestañas.
- Restauración de una exportación con esquema 2 (convierte el horario antiguo).

### Frontend: 26 de 26 (19 anteriores + 7 nuevas en `tests/v03.test.tsx`) y `tools/i18n-keys.mjs` (949 claves, todas traducidas)
- Formatos de fecha y validación; inicio de semana en calendarios sin afectar a la planificación; `DateInput` con el formato configurado y ausencia de `input type="date|time|datetime-local"`.
- Inglés con fallback al español, etiquetas y textos del servidor traducidos, Hoy renderizado en inglés.
- Temas integrados válidos, contraste, validación cliente, plantilla, y que `themes-data.ts` coincide con `temas/*.json`.
- Agrupación de series (abierta más antigua / terminada más reciente, «↻ +N», desplegada) y botón «Archivar todas».
- Consulta de filtros de notas y reordenación de pestañas por arrastre; texto «Laborables» por día; Configuración con Aspecto, Zona de peligro, idioma, festivos en bloque y horario.
- El fixture `demo-api.json` se ha regenerado y ahora usa una fecha fija (martes de la semana actual), porque con la fecha real (un viernes) los festivos ficticios quedaban fuera de la semana y dos pruebas de la 0.2 fallaban según el día.

### Servidor real (`python -m kaosnt`)
- Base creada con el **servidor 0.2 real** (tarea + horario L–J 9–17) abierta con la 0.3: copia `…-previa-migracion.db`, `user_version` 3, horario convertido, tarea conservada.
- `--demo`: Hoy, recordatorios, planificación y filtros de notas responden; importación de festivos; borrar todo con recarga de la demo; cierre controlado.
- `index.html` y `app.js` servidos con la CSP; Host ajeno 421; escritura sin cabecera 403.
- Detector de cadenas en español sin `t()` ejecutado (`npm run i18n`); solo queda «Español»/«English» en el selector de idioma, a propósito.

## Pendiente de verificar en tu equipo (0.3)
- **No he podido abrir un navegador real.** Sin verificar visualmente: modo oscuro y los cinco temas, destello inicial, barra de progreso del aviso, calendario emergente (teclado y posición junto al borde), pantalla dividida sin scroll horizontal, arrastre de pestañas, tablero con series agrupadas, Configuración (tabla del horario, lista de temas), textos en inglés que puedan desbordar.
- Windows (`.bat`, rutas, `%LOCALAPPDATA%`) y la migración con **tus** datos reales de la 0.2 (se crea copia previa).
- Arrastrar y soltar de pestañas y notificaciones del sistema dependen del navegador.

## Versión 0.2 — ejecutadas y superadas

### Servidor — `backend/tests` (pytest): 49 de 49
- **Criterios 1–18** (`test_criterios.py`): los mismos de la 0.1, adaptados. Además: el historial de dependencias muestra títulos, no números; la exportación/restauración conserva pasos, oficinas, festivos y dedicación.
- **Seguridad y lógica** (`test_seguridad_y_logica.py`): Host ajeno (421); escritura sin cabecera `X-KAOSnt`, con Origin ajeno o cross-site (403); CSP; enlaces peligrosos; campos desconocidos; aviso de aprobación pendiente; CSV anti-fórmulas; ZIP de notas; copia diaria única y retención (también con copias de la 0.1); horas laborables con cambio de hora; título sugerido; recordatorio manual; criterios 19/20 (solo 127.0.0.1 y sin recursos externos en el bundle).
- **Novedades 0.2** (`test_v02.py`):
  - Migración real de una base 0.1 (`centro.db`, esquema 1): renombrado, copia previa, festivos convertidos en comunes, nombre KAOSnt, datos conservados.
  - Festivos por oficina: unicidad, contexto de calendario (a quién afecta cada festivo, ausencias por día), disponibilidad semanal (5 − 2 festivos = 3 días → 24 h de 40), conflicto de planificación en festivo, recurrencias de «laborables» que respetan el festivo local de cada persona, festivos en el resumen de Hoy, borrado de oficina.
  - Clientes: renombrar, cambiar el cliente de un proyecto, recuento, eliminar sin perder el proyecto.
  - Dedicación por proyecto: horas derivadas, desglose en planificación, límites de validación.
  - Hacer recurrente una tarea existente: la tarea es la primera ocurrencia, sin duplicados; reglas incompletas rechazadas.
  - Historial: actualizaciones manuales editables (sin contar como nueva actualización); automáticas no editables.
  - Pasos y subtareas: los pasos no aparecen como tareas; completar pasos no completa la tarea; conversión de paso en subtarea; nombre de la tarea principal; búsqueda en pasos.
  - Archivadas: listado y eliminación.
  - Etiquetas: sin duplicados por mayúsculas, renombrado, fusión, eliminación.
  - Nota vinculada creada desde la tarea (hereda proyecto).

### Frontend — `frontend/tests` (node:test): 19 de 19
- Autoguardado (fallo, reintento, ediciones durante el guardado, conflicto), tiempo natural, fechas Europe/Madrid, horario silencioso, enlaces seguros, destino de inicio configurable, descripción de repeticiones.
- Renderizado en servidor con datos reales de la API: nombre KAOSnt enlazado a la pantalla de inicio; Hoy sin tarjetas repetidas y con el equipo como lista (sin tabla ancha) que incluye ausencias y festivos; Trabajo con Archivadas, Recurrentes y franja de disponibilidad; calendario con festivos y ausencias; tarjeta de subtarea con el nombre de la principal y contadores; acordeón con una sola sección abierta; selector de etiquetas con chips; proyecto con cliente editable, dedicación, explicación del estado y siguiente acción en áreas de texto; Configuración con oficinas, festivos y etiquetas; Markdown seguro.

### Comprobaciones manuales con el servidor real (`python -m kaosnt`)
- Arranque desde una carpeta 0.1 simulada (`CentroTrabajo-demo` con `centro.db` en esquema 1): renombrado a `KAOSnt-demo`, copia `…-previa-migracion.db`, migración aplicada, datos y festivos conservados.
- Demo nueva desde cero: datos ficticios cargados; Hoy, proyectos y recordatorios responden.
- `index.html` servido; cabecera de escritura obligatoria (403 sin ella, 201 con ella); Host ajeno 421; cierre controlado por API con salida limpia.

## No ejecutado (pendiente de verificar en tu equipo)
- **Aspecto en un navegador real**: desbordamientos y ausencia de scroll horizontal (corregidos en CSS pero no medidos), autoajuste de altura de las áreas de texto, desplegables de etiquetas y tareas, acordeón, arrastrar y soltar, diálogos, notificaciones.
- **Windows**: `.bat`, renombrado de `%LOCALAPPDATA%\CentroTrabajo` (si la 0.1 sigue abierta, no se renombra y se usa la carpeta antigua), `tzdata`.
- Funcionamiento con la red físicamente desconectada (verificado indirectamente).
- `npm install` + `npm run build` con los tipos oficiales de React (aquí se compiló con tipos mínimos propios en `frontend/tools/sandbox`).
- Python 3.10/3.11 (solo 3.12), volúmenes grandes, lectores de pantalla.

## Limitaciones conocidas
- Sin alertas con la aplicación cerrada; al reabrir se recalculan y agrupan.
- Restauración solo completa; admite el mismo esquema o el de la 0.2 (para datos de la 0.1, usa una copia `.db`).
- «Deshacer» caduca a los 15 min y no cubre ediciones de contenido de notas ni el borrado definitivo.
- Las series creadas en la 0.2 no tienen plantilla completa hasta pulsar «Aplicar estos datos a la serie» en una ocurrencia.
- Sin cifrado propio ni autenticación.
- Horas laborables con un único tramo por día (sin pausa de comida), ahora distinto para cada día.
- Los festivos se registran a mano (no se importan calendarios oficiales).
- La regla e inicio de una serie recurrente no se editan (se pausa y se crea otra).
- Los pasos no tienen responsable ni fechas (para eso, convertir en subtarea); su orden es el de creación.
- El orden manual del Kanban es global por estado.
