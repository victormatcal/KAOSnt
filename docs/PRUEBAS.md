# Pruebas

## Entorno de ejecución
Linux (contenedor de desarrollo) · Python 3.12 · FastAPI 0.136.3 · Uvicorn 0.35.0 · Pydantic 2.12.5 · SQLite 3.44 ·
Node 24 · TypeScript 6 · React 19.2.1. **No se ha ejecutado en Windows ni en un navegador real** (no había navegador disponible).

## Ejecutadas y superadas

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
- Restauración solo completa y con el mismo esquema (para datos de la 0.1, usa una copia `.db`).
- Sin cifrado propio ni autenticación.
- Horas laborables con un único tramo por día (sin pausa de comida).
- Los festivos se registran a mano (no se importan calendarios oficiales).
- La regla e inicio de una serie recurrente no se editan (se pausa y se crea otra).
- Los pasos no tienen responsable ni fechas (para eso, convertir en subtarea); su orden es el de creación.
- El orden manual del Kanban es global por estado.
