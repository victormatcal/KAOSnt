# Pruebas

## Entorno donde se ejecutaron
Linux (contenedor de desarrollo) · Python 3.12 · FastAPI 0.136.3 · Uvicorn 0.35.0 · Pydantic 2.12.5 · SQLite 3.44 ·
Node 24 · TypeScript 6.0 · React 19.2.1. **No se ha ejecutado en Windows** y no había navegador disponible.

## Pruebas automatizadas ejecutadas (todas superadas)

### Servidor — `backend/tests` (pytest): 39 de 39
| Criterio | Prueba | Qué comprueba |
|---|---|---|
| 1 | `test_01_*` | Nota sin título ni proyecto; contenido y pestañas (orden y activa) tras **reiniciar la aplicación**; cerrar pestaña no archiva; título manual no se sobrescribe |
| 2 | `test_02_*` | Conflicto de versión (409) y dato inválido no alteran el texto guardado |
| 3 | `test_03_*` | Tarea solo con título; asignación posterior con historial; título vacío rechazado |
| 4 | `test_04_*` | Persona en 2 proyectos, una sola ficha |
| 5 | `test_05_*` | Backlog con vencimiento en Hoy, sin cambiar estado; oculto del tablero por defecto |
| 6 | `test_06_*` | En revisión + bloqueada; filtro de bloqueadas conserva la fase; seguimiento no resuelve |
| 7 | `test_07_*` | Dependencia mía en «Depende de mí»; completar no cambia estados ajenos |
| 8 | `test_08_*` | Autodependencia, ciclos de 2 y 3 tareas y ciclos de subtareas rechazados |
| 9 | `test_09_*` | La API no expone campos de «horas trabajadas» |
| 10 | `test_10_*`, `test_10b_*` | Abrir, consultar Hoy, reordenar y cambiar prioridad no reinician; un cambio de estado sí |
| 11 | `test_11_*`, `11b`, `11c` | Sin duplicados al reiniciar; descartado no reaparece; tareas hechas sin avisos; un solo aviso por ciclo de seguimiento (sin avalancha); posponer |
| 12 | `test_12_*`, `12b` | Ocurrencias sin duplicar al reiniciar; histórico intacto; tras ausencia larga solo la última perdida; editar futuras; festivo registrado → siguiente laborable |
| 13 | `test_13_*` | Sin estimación = «no informado» (no 0); padre/subtareas sin doble conteo; reparto explícito; sin reparto automático |
| 14 | `test_14_*` | Conflicto ausencia/planificación; sin capacidad inventada; sin reasignación; resumen de equipo sin campos valorativos |
| 15 | `test_15_*` | Nota→tarea con vínculo y fragmento; nota intacta; sin duplicar contenido |
| 16 | `test_16_*` | Frase exacta en nota sin título manual; sin acentos/mayúsculas; papelera filtrada y recuperable |
| 17 | `test_17_*` | Kanban y rango de calendario devuelven la misma tarea una vez; mover no duplica |
| 18 | `test_18_*`, `18b`, `18c` | Exportar→modificar→restaurar recupera notas, dependencias, etiquetas, vínculos, preferencias y pestañas; copia previa; rechazo de relaciones rotas, columnas desconocidas y exportaciones de proyecto; restauración desde copia `.db`; nombres de copia maliciosos |
| 19/20 | `test_19_20_*` | Escucha en 127.0.0.1; el frontend compilado no contiene recursos remotos (fetch/import/url()/CDN/fuentes) |
| — | seguridad | Host ajeno (421), escritura sin cabecera / con Origin ajeno / cross-site (403), CSP, enlaces `javascript:`/`data:`/`vbscript:` rechazados, campos desconocidos rechazados |
| — | lógica | Aviso de aprobación pendiente (409 + confirmación), CSV anti-fórmulas, ZIP de notas, copia diaria única y retención, copia previa a migración, horas laborables con cambio de hora (25/10/2026), título sugerido, recordatorio manual |

### Frontend — `frontend/tests` (node:test): 15 de 15
- Autoguardado (criterio 2): un fallo muestra «error», conserva el texto y la copia de emergencia, nunca marca «guardado» sin confirmación; reintento; ediciones durante el guardado; conflicto y sobrescritura explícita.
- Criterio 9: el texto es «tiempo natural transcurrido», nunca «horas trabajadas/dedicación».
- Fechas en Europe/Madrid con horario de verano/invierno; horario silencioso que cruza medianoche; validación de enlaces; rutas.
- Renderizado (React en servidor, con respuestas reales de la API sobre datos ficticios): App completa con atajos visibles; Hoy sin tarjetas repetidas; Kanban por defecto con Backlog/Hechas ocultos; lista y calendario; proyecto sin porcentajes; equipo sin términos valorativos; notas y configuración.
- Markdown: `<script>`/`<img onerror>` como texto, sin atributos `on*`, `javascript:` bloqueado, imágenes no cargadas, tablas, listas de tareas.

### Comprobaciones manuales ejecutadas (con el servidor real `python -m centro`)
- Arranque, servido de `index.html`, bundle y cabecera CSP; `Host` ajeno → 421; escritura sin cabecera → 403.
- Nota y pestañas creadas, **cierre controlado** por API, nuevo proceso → nota y pestañas recuperadas; el proceso termina limpiamente.
- Copia automática diaria creada al arrancar en la carpeta `copias`.
- Búsqueda en el código del servidor de clientes HTTP salientes: solo la comprobación de instancia única contra `127.0.0.1`.

## No ejecutado (pendiente de verificar en tu equipo)
- **Windows**: `instalar.bat`, `iniciar.bat`, `detener.bat`, rutas en `%LOCALAPPDATA%`, consola minimizada, `tzdata`.
- **Navegador real**: interacción (clics, teclado, foco, arrastrar y soltar, diálogos `confirm`), autoguardado con red real, aviso al cerrar la pestaña, recuperación desde la copia de emergencia, descarga de exportaciones, selector de archivo de restauración.
- **Notificaciones del sistema** (permisos de Edge/Chrome).
- **Funcionamiento con el adaptador de red desactivado** (criterio 19): verificado indirectamente (sin recursos ni llamadas externas), no con la red físicamente cortada.
- `npm install` + `npm run typecheck` con los **tipos oficiales** de React (`@types/react`): aquí se compiló con tipos mínimos propios (`tools/sandbox`) por no tener acceso al registro npm. Puede aparecer algún aviso de tipos que no afecta al bundle entregado.
- Python 3.10/3.11 (solo se probó 3.12).
- Rendimiento con volúmenes grandes (miles de notas).
- Lectores de pantalla y contraste medido con herramienta.

## Limitaciones conocidas
- Sin alertas con la aplicación cerrada; al reabrir se recalculan y agrupan.
- Búsqueda lineal en Python (adecuada para un usuario; con decenas de miles de notas podría ralentizarse).
- Restauración solo completa (sin fusión); exige la misma versión de esquema que la exportación.
- Sin cifrado propio de la base de datos ni de las copias; sin autenticación.
- Las horas laborables usan un único horario continuo por día (sin pausa de comida).
- La edición de una recurrencia no cambia su regla ni su inicio (crear una nueva si cambian).
- El orden manual del Kanban es global por estado (no por línea de trabajo).
- Editor de notas en texto plano con vista previa (sin resaltado de sintaxis ni barra de formato).
- Una sola ventana recomendada: con dos pestañas sobre la misma nota se detecta el conflicto, pero no se fusiona.
