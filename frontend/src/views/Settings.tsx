import { useState } from "react";
import { api } from "../lib/api";
import { fmtDate, fmtDateTime, todayIn } from "../lib/dates";
import { DAYS_LONG } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Holiday, Location, Settings, Tag } from "../lib/types";
import { Empty, ErrorBox, Field, LocationSelect, Section } from "../components/ui";

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
        workdays: draft.workdays, work_start: draft.work_start, work_end: draft.work_end, backup_retention: Number(draft.backup_retention),
        quiet_start: draft.quiet_start, quiet_end: draft.quiet_end, notifications_discreet: draft.notifications_discreet,
        recurrence_horizon_days: Number(draft.recurrence_horizon_days),
      });
      await app.reloadBoot(); app.changed(); app.toast("Configuración guardada", "ok"); setErr("");
    } catch (e: any) { setErr(e.message); }
  };
  const enableNotifications = async () => {
    if (!("Notification" in window)) { setNotifMsg("Este navegador no admite notificaciones del sistema. Los recordatorios siguen disponibles dentro de la aplicación."); return; }
    if (Notification.permission === "denied") { setNotifMsg("El permiso está denegado en el navegador. No se volverá a solicitar; puedes cambiarlo en la configuración del sitio."); return; }
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") { await api.patch("/api/settings", { notifications_enabled: true }); await app.reloadBoot(); setNotifMsg("Notificaciones activadas."); }
    else setNotifMsg("Permiso no concedido. Los recordatorios internos siguen funcionando.");
  };
  const pickFile = async (e: any) => {
    const f: File | undefined = e.target.files?.[0];
    setPreview(null); setRestoreData(null); setErr("");
    if (!f) return;
    try { const data = JSON.parse(await f.text()); setPreview(await api.post("/api/restore/preview", data)); setRestoreData(data); }
    catch (ex: any) { setErr(ex instanceof SyntaxError ? "El archivo no es un JSON válido" : ex.message); }
  };
  const doRestore = async () => {
    if (!window.confirm("Se sustituirán TODOS los datos actuales por los del archivo. Antes se creará una copia de seguridad. ¿Continuar?")) return;
    try { const r: any = await api.post("/api/restore", { data: restoreData, confirm: true }); app.toast(`Restauración completada. Copia previa: ${r.previous_backup}`, "ok"); setTimeout(() => window.location.reload(), 800); }
    catch (e: any) { setErr(e.message); }
  };
  const restoreBackup = async (name: string) => {
    if (!window.confirm(`Se sustituirán todos los datos actuales por la copia ${name}. Antes se creará una copia del estado actual. ¿Continuar?`)) return;
    try { const r: any = await api.post(`/api/backups/${encodeURIComponent(name)}/restore`); app.toast(`Copia restaurada. Copia previa: ${r.previous_backup}`, "ok"); setTimeout(() => window.location.reload(), 800); }
    catch (e: any) { setErr(e.message); }
  };
  const shutdown = async () => {
    if (!window.confirm("¿Cerrar la aplicación? Los datos ya están guardados en la base de datos local.")) return;
    try { await api.post("/api/system/shutdown"); document.body.textContent = `${s.app_name} se ha cerrado correctamente. Puedes cerrar esta pestaña.`; }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="view settings">
      <header className="view-head row"><h1>Configuración</h1><span className="spacer" /><button className="primary" onClick={save}>Guardar configuración</button></header>
      <ErrorBox error={err} />
      <div className="settings-grid">
        <Section title="General">
          <Field label="Nombre de la aplicación"><input value={draft.app_name} maxLength={40} onChange={(e: any) => set("app_name", e.target.value)} /></Field>
          <Field label="Pantalla de apertura" hint="También es el destino al pulsar el nombre de la aplicación.">
            <select value={draft.start_view} onChange={(e: any) => set("start_view", e.target.value)}>
              <option value="hoy">Hoy</option><option value="proyectos">Proyectos</option><option value="trabajo">Trabajo</option>
              <option value="equipo">Equipo</option><option value="notas">Notas</option><option value="ultima">Recordar la última vista</option></select></Field>
          <Field label="Zona horaria" hint="Identificador IANA. Por defecto Europe/Madrid (incluye cambios de horario)."><input value={draft.timezone} onChange={(e: any) => set("timezone", e.target.value)} /></Field>
          <Field label="Generar ocurrencias recurrentes con antelación (días)"><input type="number" min="0" max="60" value={draft.recurrence_horizon_days} onChange={(e: any) => set("recurrence_horizon_days", e.target.value)} /></Field>
        </Section>
        <Section title="Horario laboral">
          <fieldset className="weekdays"><legend>Días laborables</legend>
            {DAYS_LONG.map((d, i) => <label key={d} className="check"><input type="checkbox" checked={draft.workdays.includes(i + 1)}
              onChange={(e: any) => set("workdays", e.target.checked ? [...draft.workdays, i + 1].sort() : draft.workdays.filter((x) => x !== i + 1))} />{d}</label>)}
          </fieldset>
          <div className="row">
            <Field label="Inicio"><input type="time" value={draft.work_start} onChange={(e: any) => set("work_start", e.target.value)} /></Field>
            <Field label="Fin"><input type="time" value={draft.work_end} onChange={(e: any) => set("work_end", e.target.value)} /></Field>
          </div>
          <p className="hint">Los festivos se gestionan por oficina en la sección «Oficinas y festivos».</p>
        </Section>
        <Section title="Recordatorios y notificaciones">
          <Field label="Avisar de vencimientos con (días) de antelación"><input type="number" min="0" max="30" value={draft.due_soon_days} onChange={(e: any) => set("due_soon_days", e.target.value)} /></Field>
          <div className="row">
            <Field label="Horario silencioso desde"><input type="time" value={draft.quiet_start} onChange={(e: any) => set("quiet_start", e.target.value)} /></Field>
            <Field label="hasta"><input type="time" value={draft.quiet_end} onChange={(e: any) => set("quiet_end", e.target.value)} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={draft.notifications_discreet} onChange={(e: any) => set("notifications_discreet", e.target.checked)} /> Contenido discreto (sin títulos ni datos de cliente)</label>
          <p>Notificaciones del sistema: <strong>{s.notifications_enabled ? "activadas" : "desactivadas"}</strong>. Opcionales y solo con la aplicación abierta; el centro de recordatorios interno funciona siempre.</p>
          {s.notifications_enabled ? <button onClick={async () => { await api.patch("/api/settings", { notifications_enabled: false }); await app.reloadBoot(); setNotifMsg("Notificaciones desactivadas."); }}>Desactivar notificaciones</button>
            : <button onClick={enableNotifications}>Activar notificaciones del sistema</button>}
          {notifMsg && <p className="hint" role="status">{notifMsg}</p>}
        </Section>
        <OfficesAndHolidays />
        <TagsManager />
        <Section title="Copias de seguridad">
          <dl className="paths"><dt>Datos</dt><dd><code>{app.boot.data_dir}</code></dd><dt>Copias</dt><dd><code>{backups?.dir}</code></dd></dl>
          <Field label="Copias automáticas diarias a conservar"><input type="number" min="1" max="365" value={draft.backup_retention} onChange={(e: any) => set("backup_retention", e.target.value)} /></Field>
          <button onClick={async () => { try { const r: any = await api.post("/api/backups"); app.toast(`Copia creada: ${r.name}`, "ok"); reloadBackups(); } catch (e: any) { setErr(e.message); } }}>Crear copia ahora</button>
          <ul className="plain backups">{backups?.items.slice(0, 30).map((b) => (
            <li key={b.name}><code>{b.name}</code> <span className="muted small">{(b.size / 1024).toFixed(0)} KB · {fmtDateTime(b.modified, app.tz)}</span>
              <button className="small ghost" onClick={() => restoreBackup(b.name)}>Restaurar</button></li>))}</ul>
          <p className="warn-box">Las copias locales están en el mismo equipo: no protegen ante pérdida, robo o avería del portátil. Guarda periódicamente la exportación completa en una ubicación autorizada por tu organización.</p>
        </Section>
        <Section title="Exportar">
          <ul className="plain export-list">
            <li><a className="button" href="/api/export/full" download>Exportación completa (JSON)</a> <span className="hint">Única exportación restaurable.</span></li>
            <li><a className="button" href="/api/export/notes.zip" download>Notas en Markdown (ZIP)</a></li>
            <li><a className="button" href="/api/export/tasks.csv" download>Tareas en CSV</a> <span className="hint">Para consulta; no es copia completa.</span></li>
          </ul>
          <p className="hint">La exportación por proyecto está en la pantalla de cada proyecto.</p>
        </Section>
        <Section title="Restaurar desde exportación completa">
          <p className="hint">Restauración completa (sin fusión). Se valida el archivo, se muestra qué se restaurará y se crea una copia previa.</p>
          <input type="file" accept="application/json,.json" aria-label="Archivo de exportación completa" onChange={pickFile} />
          {preview && <div className="subtle-box">
            <p>Exportado: {fmtDateTime(preview.exported_at, app.tz)} · versión {preview.app_version}</p>
            <div className="table-wrap"><table className="list compact"><thead><tr><th>Tabla</th><th>Actual</th><th>Tras restaurar</th></tr></thead>
              <tbody>{Object.keys(preview.incoming).map((k) => <tr key={k}><td>{k}</td><td>{preview.current[k]}</td><td>{preview.incoming[k]}</td></tr>)}</tbody></table></div>
            <button className="danger" onClick={doRestore}>Restaurar (sustituye todos los datos)</button>
          </div>}
        </Section>
        <Section title="Sistema">
          <p>Versión {app.boot.version}{app.boot.demo ? " · MODO DEMO (datos ficticios)" : ""}. Escucha solo en 127.0.0.1. Sin conexiones externas ni telemetría.</p>
          <p className="hint">Sin inicio de sesión: cualquier persona con acceso a tu sesión de Windows puede abrir la aplicación. Protege tu equipo con las medidas de tu organización.</p>
          <button className="danger" onClick={shutdown}>Cerrar aplicación</button>
        </Section>
      </div>
      <div className="sticky-save"><button className="primary" onClick={save}>Guardar configuración</button></div>
    </div>
  );
}

/** Oficinas y festivos: comunes (todas las oficinas) o de una oficina concreta. Se guardan al momento. */
function OfficesAndHolidays() {
  const app = useApp();
  const [year, setYear] = useState(Number(todayIn(app.tz).slice(0, 4)));
  const { data: locations, reload: reloadLoc } = useApi<Location[]>("/api/locations");
  const { data: holidays, reload: reloadHol } = useApi<Holiday[]>(`/api/holidays?year=${year}`);
  const [locName, setLocName] = useState("");
  const [h, setH] = useState<{ date: string; name: string; location_id: number | null }>({ date: "", name: "", location_id: null });
  const [err, setErr] = useState("");
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reloadLoc(); reloadHol(); await app.reloadBoot(); app.changed(); setErr(""); return true; } catch (e: any) { setErr(e.message); return false; } };
  return (
    <Section title="Oficinas y festivos">
      <p className="hint">Asigna a cada persona su oficina (Equipo → Editar). Un festivo «común» aplica a todas. No se infieren festivos: solo cuentan los registrados aquí.</p>
      <ErrorBox error={err} />
      <h3>Oficinas</h3>
      <ul className="plain">{locations?.map((l) => (
        <li key={l.id} className="row"><strong className="grow">{l.name}</strong><span className="muted small">{l.people} persona(s) · {l.holidays} festivo(s)</span>
          <button className="ghost small" onClick={() => { const n = window.prompt("Nuevo nombre de la oficina:", l.name); if (n?.trim()) void call(() => api.patch(`/api/locations/${l.id}`, { name: n.trim() })); }}>Renombrar</button>
          <button className="ghost small" onClick={() => { if (window.confirm(`¿Eliminar «${l.name}»? Se eliminan sus festivos locales y sus personas quedan sin oficina.`)) void call(() => api.del(`/api/locations/${l.id}`)); }}>Eliminar</button></li>))}</ul>
      {locations && !locations.length && <p className="muted">Sin oficinas: todos los festivos serán comunes.</p>}
      <form className="row" onSubmit={async (e: any) => { e.preventDefault(); if (await call(() => api.post("/api/locations", { name: locName.trim() }))) setLocName(""); }}>
        <input className="grow" aria-label="Nueva oficina" placeholder="Nueva oficina (p. ej. Zaragoza)" value={locName} onChange={(e: any) => setLocName(e.target.value)} />
        <button type="submit" disabled={!locName.trim()}>Añadir oficina</button>
      </form>
      <h3 className="row">Festivos <span className="spacer" />
        <button className="ghost small" onClick={() => setYear(year - 1)} aria-label="Año anterior">◀</button><span>{year}</span>
        <button className="ghost small" onClick={() => setYear(year + 1)} aria-label="Año siguiente">▶</button></h3>
      {holidays && !holidays.length && <Empty>Sin festivos registrados en {year}.</Empty>}
      <ul className="plain holidays">{holidays?.map((x) => (
        <li key={x.id} className="row"><span className="nowrap">{fmtDate(x.date)}</span><span className="grow">{x.name || "Festivo"}</span>
          <span className={"chip " + (x.location ? "chip-info" : "chip-neutral")}>{x.location || "Común"}</span>
          <button className="ghost small" aria-label={`Eliminar festivo ${x.date}`} onClick={() => call(() => api.del(`/api/holidays/${x.id}`))}>✕</button></li>))}</ul>
      <form className="row" onSubmit={async (e: any) => { e.preventDefault(); if (await call(() => api.post("/api/holidays", { date: h.date, name: h.name.trim(), location_id: h.location_id }))) setH({ ...h, date: "", name: "" }); }}>
        <input type="date" aria-label="Fecha del festivo" value={h.date} onChange={(e: any) => setH({ ...h, date: e.target.value })} />
        <input className="grow" aria-label="Nombre del festivo" placeholder="Nombre (opcional)" value={h.name} onChange={(e: any) => setH({ ...h, name: e.target.value })} />
        <LocationSelect value={h.location_id} onChange={(v) => setH({ ...h, location_id: v })} emptyLabel="Común (todas)" />
        <button type="submit" disabled={!h.date}>Añadir festivo</button>
      </form>
    </Section>
  );
}

function TagsManager() {
  const app = useApp();
  const { data, reload } = useApi<Tag[]>("/api/tags");
  const [err, setErr] = useState("");
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reload(); await app.reloadBoot(); app.changed(); setErr(""); } catch (e: any) { setErr(e.message); } };
  return (
    <Section title="Etiquetas" count={data?.length}>
      <p className="hint">Se crean al escribirlas en una tarea o nota. Renombrar a un nombre existente fusiona ambas. Eliminar la quita de todas las tareas y notas.</p>
      <ErrorBox error={err} />
      {data && !data.length && <Empty>Sin etiquetas.</Empty>}
      <ul className="plain">{data?.map((t) => (
        <li key={t.id} className="row"><span className="tagchip">#{t.name}</span><span className="muted small grow">{t.tasks} tarea(s) · {t.notes} nota(s)</span>
          <button className="ghost small" onClick={() => { const n = window.prompt("Nuevo nombre de la etiqueta:", t.name); if (n?.trim() && n.trim() !== t.name) void call(() => api.patch(`/api/tags/${t.id}`, { name: n.trim() })); }}>Renombrar</button>
          <button className="ghost small" onClick={() => { if (window.confirm(`¿Eliminar la etiqueta «${t.name}»? Se quitará de ${t.tasks} tarea(s) y ${t.notes} nota(s).`)) void call(() => api.del(`/api/tags/${t.id}`)); }}>Eliminar</button></li>))}</ul>
    </Section>
  );
}
