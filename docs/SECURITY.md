# Security and limits

KAOSnt does **not** claim compliance with any corporate policy. Before storing client data, check with your organisation
whether its use is authorised.

## What it does
- Listens only on `127.0.0.1`; rejects foreign `Host` headers (mitigates *DNS rebinding*).
- Writes: require the `X-KAOSnt: 1` header (it cannot be sent from another site without CORS, which is not enabled) and reject a
  foreign `Origin` and `Sec-Fetch-Site: cross-site`.
- Strict CSP (`default-src 'self'`, no inline scripts), `X-Frame-Options: DENY`, `nosniff`, `no-referrer`.
- Strict input validation (unknown fields rejected, lengths and dates validated).
- Markdown as React elements: HTML is shown as text; images are not loaded.
- Links only `http`, `https`, `mailto` and `file`; opened only on click, with `noopener noreferrer`.
- CSV protected against formula injection. Contents are never logged.
- No outgoing connections: no CDN, remote fonts, telemetry or AI.
- **Themes (0.3)**: declarative JSON validated on the server and the client; only colours, a font from a closed list and a radius.
  No free CSS, URLs or remote fonts; applied through CSSOM (`style.setProperty`), compatible with the CSP.
- **Bulk deletions (0.3/0.4)**: «Delete everything», «Delete project» and «Delete person» create a verified backup first;
  «Delete everything» requires typing the application name or «BORRAR TODO»; «Delete person» requires explicit confirmation and
  cannot delete «me».
- **Task panel width (0.4)**: applied as a CSS custom property through CSSOM (React `style`), no inline styles in the HTML.

## What it does NOT do
- It does not encrypt the database or the backups (it relies on disk encryption and your Windows session).
- There is no authentication: any process or person with access to your session can use it.
- It stores no attachments; it sends no emails or messages; it does not replace an authorised off-computer backup.

## Recommendations
Do not store credentials, tokens or client secrets. Use `start-demo.bat` for demonstrations. Review the content before sharing exports.
