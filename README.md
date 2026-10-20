# Centro de trabajo · v0.1.0

Aplicación web **local** para organizar trabajo propio y de equipo: captura rápida de tareas y notas, resumen
«Hoy», proyectos con «Dónde lo dejamos», Kanban/lista/calendario, equipo y planificación semanal sencilla.

- Un único usuario, sin cuentas. Funciona **sin Internet** una vez instalada.
- Escucha solo en `127.0.0.1`. Sin telemetría, sin CDN, sin IA integrada, sin APIs externas.
- No es una herramienta oficial de ninguna organización y no usa logotipos corporativos.

> **Sin inicio de sesión no significa seguro.** Cualquier persona o proceso con acceso a tu sesión de Windows
> puede abrir la aplicación y leer la base de datos. Ver [Seguridad y límites](docs/SEGURIDAD.md).

---

## 1. Decisiones principales

| Tema | Decisión | Motivo |
|---|---|---|
| Backend | Python 3.10+ · FastAPI · SQLite (WAL) | Ligero, un solo proceso, validación con Pydantic. |
| Frontend | React 19 + TypeScript, **compilado y entregado** en `frontend/dist` | El uso diario no necesita Node: el backend sirve el bundle. |
| Empaquetado | `tsc` + micro-empaquetador propio (`frontend/tools/bundle.mjs`) | Sin Vite/webpack: menos dependencias, todo local. |
| Docker | No se usa | No aporta en un único equipo Windows y añade mantenimiento. |
| Datos | `%LOCALAPPDATA%\CentroTrabajo\` (fuera del código) | Actualizar la app nunca toca los datos. |
| Migraciones | SQL numerado + `PRAGMA user_version`, copia previa automática | Evolución segura del esquema. |
| Búsqueda | Por contenido en Python, insensible a acentos y mayúsculas | Simple y suficiente para un usuario. |
| Markdown | Renderizador propio que genera elementos React (nunca `innerHTML`) | Bloquea HTML/scripts y no descarga recursos. |

Detalles menores adoptados (documentados para revisión):
- Una tarea nueva entra en **Pendiente** (o Backlog si se elige). Al pasar a *En curso* se registra la fecha de inicio real si no existía; al pasar a *Hecha*, la de finalización. Ambas son editables.
- **Actualización significativa** = cambio de estado, de condición (espera/bloqueo), de descripción, «Registrar actualización» o «Seguimiento realizado». Abrir, reordenar, cambiar prioridad o fechas **no** reinicia el seguimiento.
- **Hoy**: cada tarea aparece una sola vez, en la primera sección que le corresponde (Vence → Revisar → Bloqueos externos → Depende de mí); el resto de señales se muestran como etiquetas en la tarjeta.
- **Hitos** tienen tipo: hito, decisión pendiente o compromiso (una sola entidad).
- **Recurrencias**: se generan ocurrencias hasta 7 días vista (configurable). Tras un periodo cerrada, solo se crea la última ocurrencia perdida.
- **Planificación**: cuenta el reparto semanal explícito o, si no hay, la estimación completa en la semana de la fecha planificada. Nunca reparte automáticamente.

## 2. Estructura

```
centro-trabajo/
├─ instalar.bat · iniciar.bat · iniciar-demo.bat · detener.bat · ejecutar-pruebas.bat
├─ requirements.txt · requirements-dev.txt
├─ backend/
│  ├─ centro/
│  │  ├─ __main__.py        arranque (puerto, navegador, instancia única, cierre)
│  │  ├─ app.py             API REST, seguridad (Host/Origin/cabecera), servido del frontend
│  │  ├─ config.py · db.py · settings.py · timeutil.py · schemas.py · errors.py
│  │  ├─ tasks.py           tareas, condición espera/bloqueo, dependencias sin ciclos, historial
│  │  ├─ notes.py           notas, título sugerido, versión, papelera, nota→tarea
│  │  ├─ recurrence.py      plantillas y ocurrencias
│  │  ├─ reminders.py       centro de recordatorios con deduplicación persistente
│  │  ├─ views.py           Hoy, proyecto, persona, planificación semanal
│  │  ├─ search.py · backup.py (copias, exportación, restauración) · demo.py
│  │  └─ migrations/001_inicial.sql
│  ├─ tests/                pytest (criterios de aceptación, seguridad, lógica)
│  └─ tools/gen_frontend_fixture.py
├─ frontend/
│  ├─ src/ (App.tsx, views/, components/, lib/)   código fuente React + TS
│  ├─ dist/                 bundle compilado que sirve el backend (incluido)
│  ├─ tests/                pruebas node:test (lógica y renderizado sin navegador)
│  └─ tools/bundle.mjs · tools/sandbox/ (tipos mínimos para compilar sin npm)
└─ docs/ GUIA_USO.md · MODELO_DATOS.md · PRUEBAS.md · SEGURIDAD.md
```

## 3. Instalación en Windows (una vez, con conexión)

Requisitos: **Python 3.10 o superior** (`py -3 --version`). Node **no** es necesario para usar la aplicación.

1. Copia la carpeta `centro-trabajo` a una ruta tuya, p. ej. `C:\Users\<tú>\Apps\centro-trabajo`.
2. Doble clic en **`instalar.bat`**. Crea `.venv` y descarga FastAPI, Uvicorn, Pydantic y tzdata.
   - Si tu red usa proxy: `set HTTPS_PROXY=http://proxy:puerto` antes de ejecutarlo, o pide el paquete de dependencias autorizado.

## 4. Uso diario

- **Iniciar**: doble clic en `iniciar.bat`. Se abre una consola minimizada y el navegador en `http://127.0.0.1:8765`.
  Si ya estaba en marcha, solo abre el navegador. Funciona sin Internet.
- **Cerrar** (controlado; vacía el registro de SQLite): *Configuración → Cerrar aplicación*, o `detener.bat`, o `Ctrl+C` en la consola.
- **Demo con datos ficticios**: `iniciar-demo.bat` (carpeta `%LOCALAPPDATA%\CentroTrabajo-demo`, puerto 8766). Nunca toca tus datos reales.
- Opciones: `iniciar.bat --port 8800`, `--data-dir D:\MisDatos\Centro`, `--no-browser`. También variables `CENTRO_DATA_DIR` y `CENTRO_PORT`.

## 5. Actualización

1. Haz una **exportación completa** (Configuración → Exportar) por precaución.
2. Cierra la aplicación.
3. Sustituye las carpetas `backend/`, `frontend/` y los `.bat` por los de la nueva versión. **No borres** `%LOCALAPPDATA%\CentroTrabajo`.
4. Ejecuta `instalar.bat` (actualiza dependencias si cambiaron) e `iniciar.bat`.
5. Si hay migraciones de esquema, se aplican solas y antes se crea `copias\centro-…-previa-migracion.db`.

## 6. Copias y restauración

Resumen (detalle en [docs/GUIA_USO.md](docs/GUIA_USO.md#copias-exportación-y-restauración)):

- **Automática diaria** mientras la app está abierta (al arrancar y cada 5 min se comprueba), con retención configurable (14 por defecto).
- **Manual**: Configuración → *Crear copia ahora*.
- **Antes de restaurar o migrar**: copia automática previa.
- Las copias usan la API de copia en línea de SQLite (consistente con la base abierta) y se verifican con `integrity_check`.
- **Exportación completa** (JSON versionado, restaurable), **por proyecto** (JSON con relaciones), **notas** (ZIP de Markdown) y **tareas** (CSV para consulta).
- **Restauración** completa desde una copia `.db` o una exportación completa: valida formato y versión, muestra el resumen, crea copia previa, restaura en una transacción y comprueba relaciones e integridad.

> Las copias locales están en el mismo portátil: **no sustituyen** una estrategia autorizada de protección ante pérdida, robo o avería. Guarda periódicamente la exportación completa en una ubicación autorizada por tu organización.

## 7. Desarrollo (opcional, solo para modificar el frontend)

```bat
cd frontend
npm install
npm run build      :: compila TypeScript y genera frontend\dist
npm run typecheck
npm test
```
Pruebas del servidor: `.venv\Scripts\python.exe -m pip install -r requirements-dev.txt` y `ejecutar-pruebas.bat`.
Si cambian las respuestas de la API, regenera el fixture del frontend: `python backend\tools\gen_frontend_fixture.py`.

## 8. Estado de esta versión

**Implementado (bloques A–E):** persistencia SQLite con migraciones; clientes, proyectos, personas, agrupaciones, hitos;
tareas con estados, condición espera/bloqueo, dependencias sin ciclos, subtareas, historial, aprobación comercial,
reparto semanal; notas con autoguardado verificable, pestañas restaurables, papelera, búsqueda y conversión en tarea;
Hoy, Kanban, lista, calendario semanal/mensual, filtros y vistas guardadas; revisiones y recordatorios con
deduplicación; recurrencias; planificación semanal y ausencias; copias, exportaciones y restauración; notificaciones
del sistema opcionales; datos ficticios separados.

Pruebas ejecutadas y no ejecutadas: [docs/PRUEBAS.md](docs/PRUEBAS.md). Limitaciones conocidas: [docs/PRUEBAS.md#limitaciones-conocidas](docs/PRUEBAS.md#limitaciones-conocidas).
