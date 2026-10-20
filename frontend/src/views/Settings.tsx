import { useState } from "react";
import { api } from "../lib/api";
import { fmtDate, fmtDateTime, todayIn } from "../lib/dates";
import { t } from "../lib/i18n";
import { DAYS_LONG, describeSchedule } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import { BASE, BUILTIN_THEMES, contrastIssues, effectiveMode, findTheme, resolveAppearance, themeTemplate, validateTheme } from "../lib/theme";
import type { ThemeDef } from "../lib/theme";
import type { Holiday, Location, Settings, Tag, WorkSchedule } from "../lib/types";
import { DateInput, TimeInput } from "../components/DateInput";
import { Empty, ErrorBox, Field, LocationSelect, Modal, Section } from "../components/ui";

const DAY_KEYS = ["1", "2", "3", "4", "5", "6", "7"] as const;

export function SettingsView() {
  const app = useApp();
  const s = app.boot.settings;
  const [draft, setDraft] = useState<Settings>(s);
  const [err, setErr] = useState("");
  const { data: backups, reload: reloadBackups } = useApi<{ dir: string; items: { name: string; size: number; reason: string; modified: string }[] }>("/api/backups");
  const [restoreData, setRestoreData] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [notifMsg, setNotifMsg] = useState("");
  const set = (k: keyof Settings, v: any) => setDraft({ ...draft, [k]: v });
  const save = async () => {
    try {
      await api.patch("/api/settings", {
        app_name: draft.app_name.trim(), start_view: draft.start_view, timezone: draft.timezone, due_soon_days: Number(draft.due_soon_days),
        work_schedule: draft.work_schedule, backup_retention: Number(draft.backup_retention),
        quiet_start: draft.quiet_start, quiet_end: draft.quiet_end, notifications_discreet: draft.notifications_discreet,
        recurrence_horizon_days: Number(draft.recurrence_horizon_days), language: draft.language, date_format: draft.date_format,
        week_start: Number(draft.week_start), undo_seconds: Number(draft.undo_seconds),
      });
      await app.reloadBoot(); app.changed(); app.toast(t("Configuración guardada"), "ok"); setErr("");
    } catch (e: any) { setErr(e.message); }
  };
  const enableNotifications = async () => {
    if (!("Notification" in window)) { setNotifMsg(t("Este navegador no admite notificaciones del sistema. Los recordatorios siguen disponibles dentro de la aplicación.")); return; }
    if (Notification.permission === "denied") { setNotifMsg(t("El permiso está denegado en el navegador. No se volverá a solicitar; puedes cambiarlo en la configuración del sitio.")); return; }
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") { await api.patch("/api/settings", { notifications_enabled: true }); await app.reloadBoot(); setNotifMsg(t("Notificaciones activadas.")); }
    else setNotifMsg(t("Permiso no concedido. Los recordatorios internos siguen funcionando."));
  };
  const pickFile = async (e: any) => {
    const f: File | undefined = e.target.files?.[0];
    setPreview(null); setRestoreData(null); setErr("");
    if (!f) return;
    try { const data = JSON.parse(await f.text()); setPreview(await api.post("/api/restore/preview", data)); setRestoreData(data); }
    catch (ex: any) { setErr(ex instanceof SyntaxError ? t("El archivo no es un JSON válido") : ex.message); }
  };
  const doRestore = async () => {
    if (!window.confirm(t("Se sustituirán TODOS los datos actuales por los del archivo. Antes se creará una copia de seguridad. ¿Continuar?"))) return;
    try { const r: any = await api.post("/api/restore", { data: restoreData, confirm: true }); app.toast(t("Restauración completada. Copia previa: {copia}", { copia: r.previous_backup }), "ok"); setTimeout(() => window.location.reload(), 800); }
    catch (e: any) { setErr(e.message); }
  };
  const restoreBackup = async (name: string) => {
    if (!window.confirm(t("Se sustituirán todos los datos actuales por la copia {copia}. Antes se creará una copia del estado actual. ¿Continuar?", { copia: name }))) return;
    try { const r: any = await api.post(`/api/backups/${encodeURIComponent(name)}/restore`); app.toast(t("Copia restaurada. Copia previa: {copia}", { copia: r.previous_backup }), "ok"); setTimeout(() => window.location.reload(), 800); }
    catch (e: any) { setErr(e.message); }
  };
  const shutdown = async () => {
    if (!window.confirm(t("¿Cerrar la aplicación? Los datos ya están guardados en la base de datos local."))) return;
    try { await api.post("/api/system/shutdown"); document.body.textContent = t("{app} se ha cerrado correctamente. Puedes cerrar esta pestaña.", { app: s.app_name }); }
    catch (e: any) { setErr(e.message); }
  };
  const setDay = (k: typeof DAY_KEYS[number], v: { start: string; end: string } | null) => set("work_schedule", { ...draft.work_schedule, [k]: v } as WorkSchedule);
  return (
    <div className="view settings">
      <header className="view-head row"><h1>{t("Configuración")}</h1><span className="spacer" /><button className="primary" onClick={save}>{t("Guardar configuración")}</button></header>
      <ErrorBox error={err} />
      <div className="settings-grid">
        <Section title={t("General")}>
          <Field label={t("Nombre de la aplicación")}><input value={draft.app_name} maxLength={40} onChange={(e: any) => set("app_name", e.target.value)} /></Field>
          <Field label={t("Idioma de la interfaz")} hint={t("Los datos que escribes no se traducen.")}>
            <select value={draft.language} onChange={(e: any) => set("language", e.target.value)}><option value="es">Español</option><option value="en">English</option></select></Field>
          <Field label={t("Pantalla de apertura")} hint={t("También es el destino al pulsar el nombre de la aplicación.")}>
            <select value={draft.start_view} onChange={(e: any) => set("start_view", e.target.value)}>
              <option value="hoy">{t("Hoy")}</option><option value="proyectos">{t("Proyectos")}</option><option value="trabajo">{t("Trabajo")}</option>
              <option value="equipo">{t("Equipo")}</option><option value="notas">{t("Notas")}</option><option value="ultima">{t("Recordar la última vista")}</option></select></Field>
          <Field label={t("Zona horaria")} hint={t("Identificador IANA. Por defecto Europe/Madrid (incluye cambios de horario).")}><input value={draft.timezone} onChange={(e: any) => set("timezone", e.target.value)} /></Field>
          <div className="grid2">
            <Field label={t("Formato de fecha")}><select value={draft.date_format} onChange={(e: any) => set("date_format", e.target.value)}>
              <option value="dd/mm/aaaa">{t("dd/mm/aaaa")}</option><option value="aaaa-mm-dd">{t("aaaa-mm-dd")}</option><option value="mm/dd/aaaa">{t("mm/dd/aaaa")}</option></select></Field>
            <Field label={t("La semana empieza en")} hint={t("Solo en calendarios; la planificación semanal es siempre de lunes a domingo.")}>
              <select value={draft.week_start} onChange={(e: any) => set("week_start", Number(e.target.value))}>
                <option value={1}>{t("Lunes")}</option><option value={7}>{t("Domingo")}</option></select></Field>
          </div>
          <Field label={t("Generar ocurrencias recurrentes con antelación (días)")}><input type="number" min="0" max="60" value={draft.recurrence_horizon_days} onChange={(e: any) => set("recurrence_horizon_days", e.target.value)} /></Field>
          <Field label={t("Tiempo para «Deshacer» (segundos)")} hint={t("Duración del aviso con «Deshacer» tras una acción directa (3–60 s).")}>
            <input type="number" min="3" max="60" value={draft.undo_seconds} onChange={(e: any) => set("undo_seconds", e.target.value)} /></Field>
        </Section>
        <AppearanceSection />
        <Section title={t("Horario laboral")}>
          <p className="hint">{t("Horario de cada día. Se usa en las horas laborables de las revisiones, en las recurrencias de días laborables y en la disponibilidad de la planificación.")}</p>
          <div className="table-wrap"><table className="list compact schedule">
            <thead><tr><th>{t("Día")}</th><th>{t("Laborable")}</th><th>{t("Inicio")}</th><th>{t("Fin")}</th></tr></thead>
            <tbody>{DAY_KEYS.map((k, i) => {
              const w = draft.work_schedule[k];
              return <tr key={k}><td>{DAYS_LONG[i]}</td>
                <td><input type="checkbox" aria-label={t("{dia} laborable", { dia: DAYS_LONG[i] })} checked={!!w} onChange={(e: any) => setDay(k, e.target.checked ? { start: "09:00", end: "18:00" } : null)} /></td>
                <td>{w ? <TimeInput label={t("{dia}: inicio", { dia: DAYS_LONG[i] })} value={w.start} onChange={(v) => v && setDay(k, { ...w, start: v })} /> : "—"}</td>
                <td>{w ? <TimeInput label={t("{dia}: fin", { dia: DAYS_LONG[i] })} value={w.end} onChange={(v) => v && setDay(k, { ...w, end: v })} /> : "—"}</td></tr>;
            })}</tbody></table></div>
          <p className="hint">{t("Resumen: {horario}", { horario: describeSchedule(draft.work_schedule) })}</p>
          <p className="hint">{t("Los festivos se gestionan por oficina en la sección «Oficinas y festivos».")}</p>
        </Section>
        <Section title={t("Recordatorios y notificaciones")}>
          <Field label={t("Avisar de vencimientos con (días) de antelación")}><input type="number" min="0" max="30" value={draft.due_soon_days} onChange={(e: any) => set("due_soon_days", e.target.value)} /></Field>
          <div className="row">
            <Field label={t("Horario silencioso desde")}><TimeInput label={t("Horario silencioso desde")} value={draft.quiet_start} onChange={(v) => v && set("quiet_start", v)} /></Field>
            <Field label={t("hasta")}><TimeInput label={t("Horario silencioso hasta")} value={draft.quiet_end} onChange={(v) => v && set("quiet_end", v)} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={draft.notifications_discreet} onChange={(e: any) => set("notifications_discreet", e.target.checked)} /> {t("Contenido discreto (sin títulos ni datos de cliente)")}</label>
          <p>{t("Notificaciones del sistema:")} <strong>{s.notifications_enabled ? t("activadas") : t("desactivadas")}</strong>. {t("Opcionales y solo con la aplicación abierta; el centro de recordatorios interno funciona siempre.")}</p>
          {s.notifications_enabled ? <button onClick={async () => { await api.patch("/api/settings", { notifications_enabled: false }); await app.reloadBoot(); setNotifMsg(t("Notificaciones desactivadas.")); }}>{t("Desactivar notificaciones")}</button>
            : <button onClick={enableNotifications}>{t("Activar notificaciones del sistema")}</button>}
          {notifMsg && <p className="hint" role="status">{notifMsg}</p>}
        </Section>
        <OfficesAndHolidays />
        <TagsManager />
        <Section title={t("Copias de seguridad")}>
          <dl className="paths"><dt>{t("Datos")}</dt><dd><code>{app.boot.data_dir}</code></dd><dt>{t("Copias")}</dt><dd><code>{backups?.dir}</code></dd></dl>
          <Field label={t("Copias automáticas diarias a conservar")}><input type="number" min="1" max="365" value={draft.backup_retention} onChange={(e: any) => set("backup_retention", e.target.value)} /></Field>
          <button onClick={async () => { try { const r: any = await api.post("/api/backups"); app.toast(t("Copia creada: {copia}", { copia: r.name }), "ok"); reloadBackups(); } catch (e: any) { setErr(e.message); } }}>{t("Crear copia ahora")}</button>
          <ul className="plain backups">{backups?.items.slice(0, 30).map((b) => (
            <li key={b.name}><code>{b.name}</code> <span className="muted small">{(b.size / 1024).toFixed(0)} KB · {fmtDateTime(b.modified, app.tz)}</span>
              <button className="small ghost" onClick={() => restoreBackup(b.name)}>{t("Restaurar")}</button></li>))}</ul>
          <p className="warn-box">{t("Las copias locales están en el mismo equipo: no protegen ante pérdida, robo o avería del portátil. Guarda periódicamente la exportación completa en una ubicación autorizada por tu organización.")}</p>
        </Section>
        <Section title={t("Exportar")}>
          <ul className="plain export-list">
            <li><a className="button" href="/api/export/full" download>{t("Exportación completa (JSON)")}</a> <span className="hint">{t("Única exportación restaurable.")}</span></li>
            <li><a className="button" href="/api/export/notes.zip" download>{t("Notas en Markdown (ZIP)")}</a></li>
            <li><a className="button" href="/api/export/tasks.csv" download>{t("Tareas en CSV")}</a> <span className="hint">{t("Para consulta; no es copia completa.")}</span></li>
          </ul>
          <p className="hint">{t("La exportación por proyecto está en la pantalla de cada proyecto.")}</p>
        </Section>
        <Section title={t("Restaurar desde exportación completa")}>
          <p className="hint">{t("Restauración completa (sin fusión). Se valida el archivo, se muestra qué se restaurará y se crea una copia previa. Se admiten exportaciones de esta versión y de la 0.2.")}</p>
          <input type="file" accept="application/json,.json" aria-label={t("Archivo de exportación completa")} onChange={pickFile} />
          {preview && <div className="subtle-box">
            <p>{t("Exportado: {fecha} · versión {version}", { fecha: fmtDateTime(preview.exported_at, app.tz), version: preview.app_version })}</p>
            <div className="table-wrap"><table className="list compact"><thead><tr><th>{t("Tabla")}</th><th>{t("Actual")}</th><th>{t("Tras restaurar")}</th></tr></thead>
              <tbody>{Object.keys(preview.incoming).map((k) => <tr key={k}><td>{k}</td><td>{preview.current[k]}</td><td>{preview.incoming[k]}</td></tr>)}</tbody></table></div>
            <button className="danger" onClick={doRestore}>{t("Restaurar (sustituye todos los datos)")}</button>
          </div>}
        </Section>
        <Section title={t("Sistema")}>
          <p>{t("Versión {version}", { version: app.boot.version })}{app.boot.demo ? " · " + t("MODO DEMO (datos ficticios)") : ""}. {t("Escucha solo en 127.0.0.1. Sin conexiones externas ni telemetría.")}</p>
          <p className="hint">{t("Sin inicio de sesión: cualquier persona con acceso a tu sesión de Windows puede abrir la aplicación. Protege tu equipo con las medidas de tu organización.")}</p>
          <button className="danger" onClick={shutdown}>{t("Cerrar aplicación")}</button>
        </Section>
        <DangerZone />
      </div>
      <div className="sticky-save"><button className="primary" onClick={save}>{t("Guardar configuración")}</button></div>
    </div>
  );
}

/** Aspecto: claro / oscuro / según el sistema y temas declarativos (integrados o importados). Se aplica al momento. */
function AppearanceSection() {
  const app = useApp();
  const s = app.boot.settings;
  const custom = s.custom_themes || [];
  const [err, setErr] = useState("");
  const [warn, setWarn] = useState("");
  const patch = async (body: Record<string, unknown>) => { try { await api.patch("/api/settings", body); await app.reloadBoot(); setErr(""); } catch (e: any) { setErr(e.message); } };
  const current = findTheme(s.theme_id, custom);
  const importFile = async (e: any) => {
    const f: File | undefined = e.target.files?.[0];
    e.target.value = "";
    setErr(""); setWarn("");
    if (!f) return;
    let theme: any;
    try { theme = JSON.parse(await f.text()); } catch { setErr(t("El archivo no es un JSON válido")); return; }
    const msg = validateTheme(theme);
    if (msg) { setErr(t("Tema no válido: {motivo}", { motivo: msg })); return; }
    const issues = [...contrastIssues(resolveAppearance(theme as ThemeDef, "light").vars), ...contrastIssues(resolveAppearance(theme as ThemeDef, "dark").vars)];
    try {
      const saved = await api.post<ThemeDef>("/api/themes", theme);
      await api.patch("/api/settings", { theme_id: saved.id });
      await app.reloadBoot();
      app.toast(t("Tema «{nombre}» importado y aplicado", { nombre: saved.name }), "ok");
      if (issues.length) setWarn(t("Aviso de contraste (texto por debajo de 4,5:1): {pares}", { pares: issues.join(" · ") }));
    } catch (ex: any) { setErr(ex.message); }
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(themeTemplate(current), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kaosnt-tema-${current.id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const all: ThemeDef[] = [...BUILTIN_THEMES, ...custom];
  const mode = effectiveMode(s.theme_mode);
  return (
    <Section title={t("Aspecto")}>
      <ErrorBox error={err} />
      {warn && <p className="warn-box">{warn}</p>}
      <Field label={t("Modo")}>
        <div className="tabs-inline" role="radiogroup" aria-label={t("Modo")}>
          {([["claro", t("Claro")], ["oscuro", t("Oscuro")], ["sistema", t("Según el sistema")]] as const).map(([k, label]) => (
            <button key={k} role="radio" aria-checked={s.theme_mode === k} className={s.theme_mode === k ? "active" : ""} onClick={() => patch({ theme_mode: k })}>{label}</button>))}
        </div>
      </Field>
      <p className="hint">{t("Ahora se ve en modo {modo}.", { modo: mode === "dark" ? t("oscuro") : t("claro") })}</p>
      <ul className="plain theme-list">{all.map((th) => {
        const v = { ...BASE[mode], ...th[mode] };
        const builtin = BUILTIN_THEMES.some((b) => b.id === th.id);
        return <li key={th.id} className={"theme-item" + (th.id === current.id ? " active" : "")}>
          <span className="theme-swatches" aria-hidden="true">{["bg", "surface", "accent", "text"].map((k) => <span key={k} className="swatch" style={{ background: v[k] }} />)}</span>
          <span className="grow"><strong>{builtin ? t(th.name) : th.name}</strong><span className="muted small"> · {builtin ? t(th.description) : th.description}</span></span>
          {th.id === current.id ? <span className="chip chip-info">{t("En uso")}</span> : <button className="small" onClick={() => patch({ theme_id: th.id })}>{t("Usar")}</button>}
          {!builtin && <button className="small ghost" onClick={async () => { if (window.confirm(t("¿Eliminar el tema «{nombre}»?", { nombre: th.name }))) { try { await api.del(`/api/themes/${th.id}`); await app.reloadBoot(); } catch (e: any) { setErr(e.message); } } }}>{t("Eliminar")}</button>}
        </li>;
      })}</ul>
      <div className="row">
        <label className="button">{t("Importar tema (JSON)")}<input type="file" accept="application/json,.json" className="sr" aria-label={t("Importar tema (JSON)")} onChange={importFile} /></label>
        <button onClick={download}>{t("Descargar plantilla del tema actual")}</button>
      </div>
      <p className="hint">{t("Los temas solo admiten colores (#hex, rgb[a], hsl[a]), una fuente de la lista (sistema, serif, mono, redondeada) y el radio de las esquinas. Nada de CSS libre, URLs ni fuentes remotas. Consulta docs/TEMAS.md.")}</p>
    </Section>
  );
}

/** Oficinas y festivos: comunes (todas las oficinas) o de una oficina concreta. Se guardan al momento. */
function OfficesAndHolidays() {
  const app = useApp();
  const [year, setYear] = useState(Number(todayIn(app.tz).slice(0, 4)));
  const { data: locations, reload: reloadLoc } = useApi<Location[]>("/api/locations");
  const { data: holidays, reload: reloadHol } = useApi<Holiday[]>(`/api/holidays?year=${year}`);
  const [locName, setLocName] = useState("");
  const [h, setH] = useState<{ date: string | null; name: string; location_id: number | null }>({ date: null, name: "", location_id: null });
  const [err, setErr] = useState("");
  const [bulk, setBulk] = useState(false);
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reloadLoc(); reloadHol(); await app.reloadBoot(); app.changed(); setErr(""); return true; } catch (e: any) { setErr(e.message); return false; } };
  return (
    <Section title={t("Oficinas y festivos")}>
      <p className="hint">{t("Asigna a cada persona su oficina (Equipo → Editar). Un festivo «común» aplica a todas. No se infieren festivos: solo cuentan los registrados aquí.")}</p>
      <ErrorBox error={err} />
      <h3>{t("Oficinas")}</h3>
      <ul className="plain">{locations?.map((l) => (
        <li key={l.id} className="row"><strong className="grow">{l.name}</strong><span className="muted small">{t("{p} persona(s) · {h} festivo(s)", { p: l.people ?? 0, h: l.holidays ?? 0 })}</span>
          <button className="ghost small" onClick={() => { const n = window.prompt(t("Nuevo nombre de la oficina:"), l.name); if (n?.trim()) void call(() => api.patch(`/api/locations/${l.id}`, { name: n.trim() })); }}>{t("Renombrar")}</button>
          <button className="ghost small" onClick={() => { if (window.confirm(t("¿Eliminar «{nombre}»? Se eliminan sus festivos locales y sus personas quedan sin oficina.", { nombre: l.name }))) void call(() => api.del(`/api/locations/${l.id}`)); }}>{t("Eliminar")}</button></li>))}</ul>
      {locations && !locations.length && <p className="muted">{t("Sin oficinas: todos los festivos serán comunes.")}</p>}
      <form className="row" onSubmit={async (e: any) => { e.preventDefault(); if (await call(() => api.post("/api/locations", { name: locName.trim() }))) setLocName(""); }}>
        <input className="grow" aria-label={t("Nueva oficina")} placeholder={t("Nueva oficina (p. ej. Zaragoza)")} value={locName} onChange={(e: any) => setLocName(e.target.value)} />
        <button type="submit" disabled={!locName.trim()}>{t("Añadir oficina")}</button>
      </form>
      <h3 className="row">{t("Festivos")} <span className="spacer" />
        <button className="ghost small" onClick={() => setYear(year - 1)} aria-label={t("Año anterior")}>◀</button><span>{year}</span>
        <button className="ghost small" onClick={() => setYear(year + 1)} aria-label={t("Año siguiente")}>▶</button></h3>
      {holidays && !holidays.length && <Empty>{t("Sin festivos registrados en {anio}.", { anio: year })}</Empty>}
      <ul className="plain holidays">{holidays?.map((x) => (
        <li key={x.id} className="row"><span className="nowrap">{fmtDate(x.date)}</span><span className="grow">{x.name || t("Festivo")}</span>
          <span className={"chip " + (x.location ? "chip-info" : "chip-neutral")}>{x.location || t("Común")}</span>
          <button className="ghost small" aria-label={t("Eliminar festivo {fecha}", { fecha: fmtDate(x.date) })} onClick={() => call(() => api.del(`/api/holidays/${x.id}`))}>✕</button></li>))}</ul>
      <form className="row" onSubmit={async (e: any) => { e.preventDefault(); if (h.date && await call(() => api.post("/api/holidays", { date: h.date, name: h.name.trim(), location_id: h.location_id }))) setH({ ...h, date: null, name: "" }); }}>
        <DateInput label={t("Fecha del festivo")} value={h.date} onChange={(v) => setH({ ...h, date: v })} />
        <input className="grow" aria-label={t("Nombre del festivo")} placeholder={t("Nombre (opcional)")} value={h.name} onChange={(e: any) => setH({ ...h, name: e.target.value })} />
        <LocationSelect value={h.location_id} onChange={(v) => setH({ ...h, location_id: v })} emptyLabel={t("Común (todas)")} />
        <button type="submit" disabled={!h.date}>{t("Añadir festivo")}</button>
      </form>
      <button onClick={() => setBulk(true)}>{t("Importar festivos en bloque…")}</button>
      {bulk && <HolidayImport onClose={() => setBulk(false)} onDone={() => { setBulk(false); reloadLoc(); reloadHol(); void app.reloadBoot(); app.changed(); }} />}
    </Section>
  );
}

interface ImportLine { line: number; text: string; date: string | null; name: string; location: string | null; status: "importar" | "duplicado" | "error"; reason_code: string; reason: string; new_location: boolean }

const IMPORT_REASON: Record<string, (l: ImportLine) => string> = {
  existe: () => t("Ya está registrado"), repetido: () => t("Repetido en el texto"),
  fecha: (l) => t("Fecha no válida: «{texto}» (usa dd/mm/aaaa o AAAA-MM-DD)", { texto: l.text.split(/[;,\t]/)[0] }),
  oficina: (l) => t("Oficina desconocida: «{oficina}» (no se importa como común)", { oficina: l.location || "" }),
  columnas: () => t("Demasiadas columnas: usa día;nombre;oficina"), nueva_oficina: () => t("Se creará la oficina"),
};

/** Festivos en bloque: pegar texto o subir CSV «día;nombre;oficina»; vista previa por línea antes de guardar. */
function HolidayImport({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const app = useApp();
  const [text, setText] = useState("");
  const [create, setCreate] = useState(false);
  const [result, setResult] = useState<{ lines: ImportLine[]; summary: Record<string, number> } | null>(null);
  const [err, setErr] = useState("");
  const previewImport = async (txt = text, cr = create) => {
    try { setResult(await api.post("/api/holidays/import", { text: txt, create_locations: cr, dry_run: true })); setErr(""); } catch (e: any) { setErr(e.message); }
  };
  const file = async (e: any) => {
    const f: File | undefined = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    setText(txt); void previewImport(txt);
  };
  const save = async () => {
    try {
      const r = await api.post<{ created: number }>("/api/holidays/import", { text, create_locations: create, dry_run: false });
      app.toast(t("{n} festivo(s) importado(s)", { n: r.created }), "ok"); onDone();
    } catch (e: any) { setErr(e.message); }
  };
  const label = { importar: t("Se importará"), duplicado: t("Duplicado"), error: t("Error") };
  return (
    <Modal title={t("Importar festivos en bloque")} onClose={onClose} wide>
      <p className="hint">{t("Formato por línea: día;nombre;oficina. Fecha dd/mm/aaaa (también AAAA-MM-DD). Nombre opcional. Oficina vacía o «Común» = todas las oficinas. Separador «;», «,» o tabulador; cabecera opcional.")}</p>
      <pre className="example">{"día;nombre;oficina\n12/10/2026;Fiesta Nacional;\n29/01/2026;San Valero;Zaragoza"}</pre>
      <textarea aria-label={t("Festivos a importar")} rows={8} value={text} onChange={(e: any) => { setText(e.target.value); setResult(null); }} placeholder={t("Pega aquí las líneas…")} />
      <div className="row">
        <label className="button">{t("Subir CSV…")}<input type="file" accept=".csv,.txt,text/csv,text/plain" className="sr" aria-label={t("Subir CSV")} onChange={file} /></label>
        <label className="check"><input type="checkbox" checked={create} onChange={(e: any) => { setCreate(e.target.checked); if (result) void previewImport(text, e.target.checked); }} /> {t("Crear oficinas que no existan")}</label>
        <button onClick={() => previewImport()} disabled={!text.trim()}>{t("Vista previa")}</button>
      </div>
      <ErrorBox error={err} />
      {result && <>
        <p>{t("{a} se importarán · {d} duplicados · {e} con error", { a: result.summary.importar, d: result.summary.duplicado, e: result.summary.error })}</p>
        <div className="table-wrap"><table className="list compact">
          <thead><tr><th>{t("Línea")}</th><th>{t("Fecha")}</th><th>{t("Nombre")}</th><th>{t("Oficina")}</th><th>{t("Resultado")}</th></tr></thead>
          <tbody>{result.lines.map((l) => <tr key={l.line} className={"imp-" + l.status}>
            <td>{l.line}</td><td>{l.date ? fmtDate(l.date) : <code>{l.text.split(/[;,\t]/)[0]}</code>}</td><td className="wrap">{l.name}</td>
            <td>{l.location || (l.status !== "error" ? t("Común") : "")}{l.new_location ? " " + t("(nueva)") : ""}</td>
            <td><span className={"chip " + (l.status === "importar" ? "chip-info" : l.status === "error" ? "chip-danger" : "chip-warn")}>{label[l.status]}</span>
              {l.reason_code && <span className="muted small"> {(IMPORT_REASON[l.reason_code] || (() => l.reason))(l)}</span>}</td></tr>)}</tbody>
        </table></div>
      </>}
      <div className="modal-foot">
        <button className="primary" disabled={!result || !result.summary.importar} onClick={save}>{t("Importar {n} festivo(s)", { n: result?.summary.importar ?? 0 })}</button>
        <button onClick={onClose}>{t("Cancelar")}</button>
      </div>
    </Modal>
  );
}

function TagsManager() {
  const app = useApp();
  const { data, reload } = useApi<Tag[]>("/api/tags");
  const [err, setErr] = useState("");
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reload(); await app.reloadBoot(); app.changed(); setErr(""); } catch (e: any) { setErr(e.message); } };
  return (
    <Section title={t("Etiquetas")} count={data?.length}>
      <p className="hint">{t("Se crean al escribirlas en una tarea o nota. Renombrar a un nombre existente fusiona ambas. Eliminar la quita de todas las tareas y notas.")}</p>
      <ErrorBox error={err} />
      {data && !data.length && <Empty>{t("Sin etiquetas.")}</Empty>}
      <ul className="plain">{data?.map((tag) => (
        <li key={tag.id} className="row"><span className="tagchip">#{tag.name}</span><span className="muted small grow">{t("{tareas} tarea(s) · {notas} nota(s)", { tareas: tag.tasks, notas: tag.notes })}</span>
          <button className="ghost small" onClick={() => { const n = window.prompt(t("Nuevo nombre de la etiqueta:"), tag.name); if (n?.trim() && n.trim() !== tag.name) void call(() => api.patch(`/api/tags/${tag.id}`, { name: n.trim() })); }}>{t("Renombrar")}</button>
          <button className="ghost small" onClick={() => { if (window.confirm(t("¿Eliminar la etiqueta «{nombre}»? Se quitará de {tareas} tarea(s) y {notas} nota(s).", { nombre: tag.name, tareas: tag.tasks, notas: tag.notes }))) void call(() => api.del(`/api/tags/${tag.id}`)); }}>{t("Eliminar")}</button></li>))}</ul>
    </Section>
  );
}

/** Zona de peligro: borrar todo el entorno (copia previa automática y confirmación muy explícita). */
function DangerZone() {
  const app = useApp();
  const name = app.boot.settings.app_name || "KAOSnt";
  const [text, setText] = useState("");
  const [reseed, setReseed] = useState(app.boot.demo);
  const [err, setErr] = useState("");
  const ok = text.trim().toLowerCase() === name.trim().toLowerCase() || text.trim().toLowerCase() === "borrar todo";
  const run = async () => {
    if (!window.confirm(t("Última confirmación: se borrarán TODOS los datos (tareas, proyectos, notas, personas, festivos y configuración). Antes se creará una copia. ¿Continuar?"))) return;
    try {
      const r = await api.post<{ previous_backup: string; reseeded: boolean }>("/api/system/reset", { confirm_text: text, reseed_demo: app.boot.demo && reseed });
      window.alert(t("Datos borrados. Copia previa: {copia} (en la carpeta de copias; se puede restaurar desde «Copias de seguridad»).", { copia: r.previous_backup }));
      window.location.hash = "#/hoy"; window.location.reload();
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <Section title={t("Zona de peligro")}>
      <div className="danger-zone">
        <p><strong>{t("Borrar todo el entorno")}</strong>: {t("elimina todos los datos y deja la aplicación como recién instalada (con la persona «Yo»). Antes se crea una copia automática y se informa de su nombre.")}</p>
        <Field label={t("Para confirmar, escribe «{nombre}» o «BORRAR TODO»", { nombre: name })}>
          <input value={text} onChange={(e: any) => setText(e.target.value)} autoComplete="off" />
        </Field>
        {app.boot.demo && <label className="check"><input type="checkbox" checked={reseed} onChange={(e: any) => setReseed(e.target.checked)} /> {t("Volver a cargar los datos ficticios de la demo")}</label>}
        <ErrorBox error={err} />
        <button className="danger" disabled={!ok} onClick={run}>{t("Borrar todo")}</button>
      </div>
    </Section>
  );
}
