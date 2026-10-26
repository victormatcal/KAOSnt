# Customisation themes

Themes are **declarative** JSON files: only colours, a font family from a closed list and the corner radius.
They do not accept free CSS, URLs, images or remote fonts, so they respect the strict CSP and work without Internet.
They are validated on the server (`backend/kaosnt/themes.py`) and in the client (`frontend/src/lib/theme.ts`).

## Format

```json
{
  "format": "kaosnt-theme",
  "version": 1,
  "id": "my-theme",
  "name": "My theme",
  "description": "Optional (max. 300 characters)",
  "font": "sistema",
  "radius": 6,
  "light": { "accent": "#1d6b36" },
  "dark":  { "accent": "#7ad69a" }
}
```

| Field | Values |
|---|---|
| `id` | lowercase letters, digits and hyphens (max. 40). It cannot match a built-in theme |
| `font` | `sistema` (system), `serif`, `mono`, `redondeada` (rounded) — fonts installed on the computer |
| `radius` | integer 0–16 (px) |
| `light`, `dark` | colour variables; missing ones are taken from the **Default** theme (`predeterminado`) |
| Colours | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()/rgba()`, `hsl()/hsla()` |

Variables: `bg`, `surface`, `surface-2`, `border`, `text`, `muted`, `accent`, `accent-text`, `accent-soft`, `danger`, `danger-soft`,
`warn`, `warn-soft`, `info`, `info-soft`, `ok`, `ok-soft`, `subtle`, `focus`, `toast-bg`, `toast-text`, `code-bg`, `shadow`.
(`--radius` and `--font` come from `radius` and `font`.)

The `font` values and the built-in theme ids are stored values, so they keep their original (Spanish) names.

## Contrast
When importing, the WCAG contrast of the text pairs is checked (text/background, muted/background, accent/surface, notices…).
If any pair is below **4.5:1** the theme is still imported, but a warning lists the affected pairs.
The five built-in themes reach 4.5:1 in light and dark (checked by the tests).

## Usage
1. *Settings → Appearance → Download template of current theme* (every variable explicit).
2. Edit the JSON (change `id` and `name`).
3. *Import theme (JSON)*: it is validated, saved in the settings and applied.

`themes/` folder: the five built-in themes (`predeterminado`, `minimalista`, `cupertino`, `retro`, `alto-contraste`) and
`example-my-theme.json`. The built-in names and descriptions are translation keys (shown in the interface language).
The built-in themes are copied into `frontend/src/lib/themes-data.ts` with `node frontend/tools/gen-themes.mjs`
(`npm run build` does it; a test checks that they match).
