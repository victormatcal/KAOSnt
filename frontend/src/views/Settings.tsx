import { useState } from "react";
import { api } from "../lib/api";
import { fmtDateTime } from "../lib/dates";
import { useApi, useApp } from "../lib/store";
import type { Settings } from "../lib/types";
import { ErrorBox, Field, Section } from "../components/ui";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function SettingsView() {
  const app = useApp();
  const s = app.boot.settings;
  const [draft, setDraft] = useState<Settings>(s);
  const [holidays, setHolidays] = useState(s.holidays.join("\n"));
  const [err, setErr] = useState("");
  const { data: backups, reload: reloadBackups } = useApi<{ dir: string; items: { name: string; size: number; reason: string; modified: string }[] }>("/api/backups");
  const [restoreData, setRestoreData] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [notifMsg, setNotifMsg] = useState("");

  const set = (k: keyof Settings, v: any) => setDraft({ ...draft, [k]: v });
  const save = async () => {
    try {
      const hol = holidays.split(/\s+/).map((x: string) => x.trim()).filter(Boolean);
      await api.patch("/api/settings", {
        app_name: draft.app_name, start_view: draft.start_view, timezone: draft.timezone, due_soon_days: Number(draft.due_soon_days),
        workdays: draft.workdays, work_start: draft.work_start, work_end: draft.work_end, holidays: hol,
        backup_retention: Number(draft.backup_retention), quiet_start: draft.quiet_start, quiet_end: draft.quiet_end,
        notifications_discreet: draft.notifications_discreet, recurrence_horizon_days: Number(draft.recurrence_horizon_days),
      });
      await app.reloadBoot(); app.changed(); app.toast("Configuración guardada", "ok"); setErr("");
    } catch (e: any) { setErr(e.message); }
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) { setNotifMsg("Este navegador no admite notificaciones del sistema. Los recordatorios siguen disponibles dentro de la aplicación."); return; }
    if (Notification.permission === "denied") { setNotifMsg("El permiso está denegado en el navegador. No se volverá a solicitar; puedes cambiarlo en la configuración del sitio si lo deseas."); return; }
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") { await api.patch("/api/settings", { notifications_enabled: true }); await app.reloadBoot(); setNotifMsg("Notificaciones activadas."); }
    else setNotifMsg("Permiso no concedido. Los recordatorios internos siguen funcionando.");
  };
  const disableNotifications = async () => { await api.patch("/api/settings", { notifications_enabled: false }); await app.reloadBoot(); setNotifMsg("Notificaciones desactivadas."); };

  const pickFile = async (e: any) => {
    const f: File | undefined = e.target.files?.[0];
    setPreview(null); setRestoreData(null); setErr("");
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const p = await api.post("/api/restore/preview", data);
      setRestoreData(data); setPreview(p);
    } catch (ex: any) { setErr(ex instanceof SyntaxError ? "El archivo no es un JSON válido" : ex.message); }
  };
  const doRestore = async () => {
    if (!window.confirm("Se sustituirán TODOS los datos actuales por los del archivo. Antes se creará una copia de seguridad. ¿Continuar?")) return;
    try {
      const r: any = await api.post("/api/restore", { data: restoreData, confirm: true });
      app.toast(`Restauración completada. Copia previa: ${r.previous_backup}`, "ok");
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) { setErr(e.message); }
  };
  const restoreBackup = async (name: string) => {
    if (!window.confirm(`Se sustituirán todos los datos actuales por la copia ${name}. Antes se creará una copia de seguridad del estado actual. ¿Continuar?`)) return;
    try { const r: any = await api.post(`/api/backups/${encodeURIComponent(name)}/restore`); app.toast(`Copia restaurada. Copia previa: ${r.previous_backup}`, "ok"); setTimeout(() => window.location.reload(), 800); }
    catch (e: any) { setErr(e.message); }
  };
  const shutdown = async () => {
    if (!window.confirm("¿Cerrar la aplicación? Los datos ya están guardados en la base de datos local.")) return;
    try { await api.post("/api/system/shutdown"); document.body.textContent = "Centro de trabajo se ha cerrado correctamente. Puedes cerrar esta pestaña."; }
    catch (e: any) { setErr(e.message); }
  };

  return (
    <div className="view settings">
      <header className="view-head"><h1>Configuración</h1></header>
      <ErrorBox error={err} />
      <div className="grid2">
        <Section title="General">
          <Field label="Nombre de la aplicación"><input value={draft.app_name} onChange={(e: any) => set("app_name", e.target.value)} /></Field>
          <Field label="Pantalla de apertura">
            <select value={draft.start_view} onChange={(e: any) => set("start_view", e.target.value)}>
              <option value="hoy">Hoy</option><option value="proyectos">Proyectos</option><option value="trabajo">Trabajo</option>
              <option value="equipo">Equipo</option><option value="notas">Notas</option><option value="ultima">Recordar la última vista</option>
            </select>
          </Field>
          <Field label="Zona horaria" hint="Identificador IANA. Por defecto Europe/Madrid (incluye cambios de horario)."><input value={draft.timezone} onChange={(e: any) => set("timezone", e.target.value)} /></Field>
          <Field label="Generar ocurrencias recurrentes con antelación (días)"><input type="number" min="0" max="60" value={draft.recurrence_horizon_days} onChange={(e: any) => set("recurrence_horizon_days", e.target.value)} /></Field>
        </Section>
        <Section title="Horario laboral">
          <fieldset className="weekdays"><legend>Días laborables</legend>
            {DAYS.map((d, i) => <label key={d} className="check"><input type="checkbox" checked={draft.workdays.includes(i + 1)}
              onChange={(e: any) => set("workdays", e.target.checked ? [...draft.workdays, i + 1].sort() : draft.workdays.filter((x) => x !== i + 1))} />{d}</label>)}
          </fieldset>
          <div className="row">
            <Field label="Inicio"><input type="time" value={draft.work_start} onChange={(e: any) => set("work_start", e.target.value)} /></Field>
            <Field label="Fin"><input type="time" value={draft.work_end} onChange={(e: any) => set("work_end", e.target.value)} /></Field>
          </div>
          <Field label="Festivos registrados (AAAA-MM-DD, uno por línea)" hint="No se infieren festivos: solo cuentan los que registres aquí.">
            <textarea rows={4} value={holidays} onChange={(e: any) => setHolidays(e.target.value)} />
          </Field>
        </Section>
        <Section title="Recordatorios y notificaciones">
          <Field label="Avisar de vencimientos con (días) de antelación"><input type="number" min="0" max="30" value={draft.due_soon_days} onChange={(e: any) => set("due_soon_days", e.target.value)} /></Field>
          <div className="row">
            <Field label="Horario silencioso desde"><input type="time" value={draft.quiet_start} onChange={(e: any) => set("quiet_start", e.target.value)} /></Field>
            <Field label="hasta"><input type="time" value={draft.quiet_end} onChange={(e: any) => set("quiet_end", e.target.value)} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={draft.notifications_discreet} onChange={(e: any) => set("notifications_discreet", e.target.checked)} /> Contenido discreto (sin títulos ni datos de cliente)</label>
          <p>Notificaciones del sistema: <strong>{s.notifications_enabled ? "activadas" : "desactivadas"}</strong>. Son opcionales: el centro de recordatorios interno funciona siempre. Solo se avisa mientras la aplicación está abierta.</p>
          {s.notifications_enabled ? <button onClick={disableNotifications}>Desactivar notificaciones</button> : <button onClick={enableNotifications}>Activar notificaciones del sistema</button>}
          {notifMsg && <p className="hint" role="status">{notifMsg}</p>}
        </Section>
        <Section title="Copias de seguridad">
          <p className="hint">Carpeta de datos: <code>{app.boot.data_dir}</code><br />Copias: <code>{backups?.dir}</code></p>
          <Field label="Copias automáticas diarias a conservar"><input type="number" min="1" max="365" value={draft.backup_retention} onChange={(e: any) => set("backup_retention", e.target.value)} /></Field>
          <button onClick={async () => { try { const r: any = await api.post("/api/backups"); app.toast(`Copia creada: ${r.name}`, "ok"); reloadBackups(); } catch (e: any) { setErr(e.message); } }}>Crear copia ahora</button>
          <ul className="plain backups">{backups?.items.slice(0, 30).map((b) => (
            <li key={b.name}><code>{b.name}</code> <span className="muted">{(b.size / 1024).toFixed(0)} KB · {fmtDateTime(b.modified, app.tz)}</span>
              <button className="small ghost" onClick={() => restoreBackup(b.name)}>Restaurar</button></li>))}</ul>
          <p className="warn-box">Las copias locales están en el mismo equipo: no protegen ante pérdida, robo o avería del portátil. Copia periódicamente la exportación completa a una ubicación autorizada por tu organización.</p>
        </Section>
        <Section title="Exportar">
          <ul className="plain">
            <li><a className="button" href="/api/export/full" download>Exportación completa (JSON versionado)</a> <span className="hint">Única exportación restaurable.</span></li>
            <li><a className="button" href="/api/export/notes.zip" download>Notas en Markdown (ZIP)</a></li>
            <li><a className="button" href="/api/export/tasks.csv" download>Tareas en CSV (consulta, no es copia completa)</a></li>
          </ul>
          <p className="hint">La exportación por proyecto está en la pantalla de cada proyecto.</p>
        </Section>
        <Section title="Restaurar desde exportación completa">
          <p className="hint">Restauración completa (sin fusión). Se valida el archivo, se muestra qué se restaurará y se crea una copia previa.</p>
          <input type="file" accept="application/json,.json" aria-label="Archivo de exportación completa" onChange={pickFile} />
          {preview && <div className="subtle-box">
            <p>Exportado: {fmtDateTime(preview.exported_at, app.tz)} · versión {preview.app_version}</p>
            <table className="list compact"><thead><tr><th>Tabla</th><th>Actual</th><th>Tras restaurar</th></tr></thead>
              <tbody>{Object.keys(preview.incoming).map((k) => <tr key={k}><td>{k}</td><td>{preview.current[k]}</td><td>{preview.incoming[k]}</td></tr>)}</tbody></table>
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
