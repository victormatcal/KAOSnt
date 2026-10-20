# Temas de personalización

Los temas son archivos JSON **declarativos**: solo colores, una familia de fuente de una lista cerrada y el radio de las esquinas.
No admiten CSS libre, URLs, imágenes ni fuentes remotas, de modo que respetan la CSP estricta y el funcionamiento sin Internet.
Se validan en el servidor (`backend/kaosnt/themes.py`) y en el cliente (`frontend/src/lib/theme.ts`).

## Formato

```json
{
  "format": "kaosnt-theme",
  "version": 1,
  "id": "mi-tema",
  "name": "Mi tema",
  "description": "Opcional (máx. 300 caracteres)",
  "font": "sistema",
  "radius": 6,
  "light": { "accent": "#1d6b36" },
  "dark":  { "accent": "#7ad69a" }
}
```

| Campo | Valores |
|---|---|
| `id` | minúsculas, números y guiones (máx. 40). No puede coincidir con un tema integrado |
| `font` | `sistema`, `serif`, `mono`, `redondeada` (fuentes instaladas en el equipo) |
| `radius` | entero 0–16 (px) |
| `light`, `dark` | variables de color; las ausentes se toman del tema **Predeterminado** |
| Colores | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()/rgba()`, `hsl()/hsla()` |

Variables: `bg`, `surface`, `surface-2`, `border`, `text`, `muted`, `accent`, `accent-text`, `accent-soft`, `danger`, `danger-soft`,
`warn`, `warn-soft`, `info`, `info-soft`, `ok`, `ok-soft`, `subtle`, `focus`, `toast-bg`, `toast-text`, `code-bg`, `shadow`.
(`--radius` y `--font` se derivan de `radius` y `font`).

## Contraste
Al importar se comprueba el contraste WCAG de los pares de texto (texto/fondo, atenuado/fondo, acento/superficie, avisos, etc.).
Si alguno queda por debajo de **4,5:1** se importa igualmente, pero se muestra un aviso con los pares afectados.
Los cinco temas integrados cumplen 4,5:1 en claro y en oscuro (lo comprueban las pruebas).

## Uso
1. *Configuración → Aspecto → Descargar plantilla del tema actual* (todas las variables explícitas).
2. Edita el JSON (cambia `id` y `name`).
3. *Importar tema (JSON)*: se valida, se guarda en los ajustes y se aplica.

Carpeta `temas/`: los cinco temas integrados (`predeterminado`, `minimalista`, `cupertino`, `retro`, `alto-contraste`) y
`ejemplo-mi-tema.json`. Los integrados se copian en `frontend/src/lib/themes-data.ts` con `node frontend/tools/gen-themes.mjs`
(lo hace `npm run build`; una prueba comprueba que coinciden).
