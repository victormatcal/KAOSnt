import { useState } from "react";
import { api } from "../lib/api";
import { addDays, todayIn, zonedToUtc } from "../lib/dates";
import { useApp } from "../lib/store";

/** Recordatorio manual («recordar contactar» no envía nada: solo avisa dentro de la aplicación). */
export function ReminderForm({ taskId, projectId, defaultTitle = "", onCreated }: {
  taskId?: number; projectId?: number; defaultTitle?: string; onCreated?: () => void;
}) {
  const app = useApp();
  const [title, setTitle] = useState(defaultTitle);
  const [when, setWhen] = useState(addDays(todayIn(app.tz), 1) + "T09:00");
  const [err, setErr] = useState("");
  const submit = async () => {
    try {
      await api.post("/api/reminders", { title: title.trim(), due_at: zonedToUtc(when, app.tz), task_id: taskId ?? null, project_id: projectId ?? null });
      app.toast("Recordatorio programado", "ok"); setErr(""); onCreated?.(); app.changed();
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <form className="row" onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
      <input aria-label="Texto del recordatorio" placeholder="Recordarme… (p. ej. llamar a sistemas)" value={title} onChange={(e: any) => setTitle(e.target.value)} />
      <input type="datetime-local" aria-label={`Fecha y hora (${app.tz})`} value={when} onChange={(e: any) => setWhen(e.target.value)} />
      <button type="submit" disabled={!title.trim() || !when}>Programar</button>
      {err && <span className="field-error">{err}</span>}
    </form>
  );
}
