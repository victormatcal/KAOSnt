# Seguridad y límites

KAOSnt **no** afirma cumplir ninguna política corporativa. Antes de guardar datos de clientes, valida con tu organización si su uso está autorizado.

## Qué hace
- Escucha solo en `127.0.0.1`; rechaza cabeceras `Host` ajenas (mitiga *DNS rebinding*).
- Escrituras: exigen la cabecera `X-KAOSnt: 1` (no enviable desde otra web sin CORS, que no se habilita) y rechazan `Origin` ajeno y `Sec-Fetch-Site: cross-site`.
- CSP estricta (`default-src 'self'`, sin scripts en línea), `X-Frame-Options: DENY`, `nosniff`, `no-referrer`.
- Validación estricta de entradas (campos desconocidos rechazados, longitudes y fechas validadas).
- Markdown como elementos React: el HTML se muestra como texto; las imágenes no se cargan.
- Enlaces solo `http`, `https`, `mailto` y `file`; se abren solo al hacer clic, con `noopener noreferrer`.
- CSV protegido frente a inyección de fórmulas. Sin registro de contenidos en logs.
- Sin conexiones salientes: ni CDN, ni fuentes remotas, ni telemetría, ni IA.

- **Temas (0.3)**: JSON declarativo validado en servidor y cliente; solo colores, fuente de lista cerrada y radio. Sin CSS libre, URLs ni fuentes remotas; se aplican por CSSOM (`style.setProperty`), compatible con la CSP.
- **Borrados masivos (0.3)**: «Borrar todo» y «Eliminar proyecto» crean antes una copia verificada; «Borrar todo» exige escribir el nombre de la aplicación o «BORRAR TODO».

## Qué NO hace
- No cifra la base de datos ni las copias (depende del cifrado de disco y de tu sesión de Windows).
- No hay autenticación: cualquier proceso o persona con acceso a tu sesión puede usarla.
- No almacena adjuntos; no envía correos ni mensajes; no sustituye una copia autorizada fuera del equipo.

## Recomendaciones
No guardes credenciales, tokens ni secretos de clientes. Usa `iniciar-demo.bat` para demostraciones. Revisa el contenido antes de compartir exportaciones.
