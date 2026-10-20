# Seguridad y límites

Esta aplicación **no** afirma cumplir ninguna política corporativa. Antes de guardar datos de clientes,
valida con tu organización si su uso está autorizado y en qué condiciones.

## Qué hace
- Escucha solo en `127.0.0.1` (no accesible desde la red).
- Rechaza peticiones con cabecera `Host` distinta de `127.0.0.1:<puerto>`/`localhost:<puerto>` (mitiga *DNS rebinding*).
- Operaciones de escritura: exigen la cabecera `X-Centro: 1` (no enviable por otra web sin CORS, que no se habilita),
  y rechazan `Origin` ajeno y `Sec-Fetch-Site: cross-site`.
- Cabeceras: CSP estricta (`default-src 'self'`, sin scripts en línea), `X-Frame-Options: DENY`, `nosniff`, `no-referrer`.
- Validación de entradas con esquemas estrictos (campos desconocidos rechazados, longitudes y fechas validadas).
- Markdown renderizado como elementos React: el HTML se muestra como texto y nunca se ejecuta; imágenes no se cargan.
- Enlaces: solo `http`, `https`, `mailto` y `file`; se abren solo al hacer clic, con `noopener noreferrer`.
- CSV con protección frente a inyección de fórmulas.
- Sin registro de accesos ni de contenidos (solo errores técnicos sin datos).
- Sin conexiones salientes: ni CDN, ni fuentes remotas, ni telemetría, ni IA.

## Qué NO hace
- **No cifra** la base de datos ni las copias. La protección depende del cifrado de disco y de tu sesión de Windows.
- **No hay autenticación**: cualquier proceso o persona con acceso a tu sesión puede usarla.
- No almacena adjuntos ni importa archivos: solo enlaces a los originales.
- No envía correos ni mensajes.
- No sustituye una copia de seguridad autorizada fuera del equipo.

## Recomendaciones
- No guardes credenciales, tokens ni secretos de clientes en notas o tareas.
- Usa `iniciar-demo.bat` (datos ficticios) para demostraciones.
- Revisa el contenido antes de exportar o compartir un JSON/ZIP/CSV.
