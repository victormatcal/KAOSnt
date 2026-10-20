import { useState } from "react";
import { api } from "../lib/api";
import { addDays, fmtDateTime, todayIn, zonedToUtc } from "../lib/dates";
import { t } from "../lib/i18n";
import { useApp } from "../lib/store";
import { DateTimeInput } from "./DateInput";

/** Recordatorio manual. «Recordar contactar» no envía nada: solo avisa dentro de la aplicación. */
export function ReminderForm({ taskId, projectId, defaultTitle = "", onCreated }: { taskId?: number; projectId?: number; defaultTitle?: string; onCreated?: () => void }) {
  const app = useApp();
  const [title, setTitle] = useState(defaultTitle);
  const [when, setWhen] = useState<string | null>(addDays(todayIn(app.tz), 1) + "T09:00");
  const [err, setErr] = useState("");
  const submit = async () => {
    if (!when) return;
    try {
      const due = zonedToUtc(when, app.tz);
      await api.post("/api/reminders", { title: title.trim(), due_at: due, task_id: taskId ?? null, project_id: projectId ?? null });
      app.toast(t("Recordatorio programado para el {fecha}. Lo verás en 🔔 → Programados (y en Hoy si es esta semana).", { fecha: fmtDateTime(due, app.tz) }), "ok",
        { label: t("Ver"), run: () => app.openReminders("programados") });
      setErr(""); setTitle(defaultTitle); onCreated?.(); app.changed();
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <form className="row" onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
      <input className="grow" aria-label={t("Texto del recordatorio")} placeholder={t("Recordarme… (p. ej. llamar a sistemas)")} value={title} onChange={(e: any) => setTitle(e.target.value)} />
      <DateTimeInput label={t("Fecha y hora ({zona})", { zona: app.tz })} value={when} onChange={setWhen} />
      <button type="submit" disabled={!title.trim() || !when}>{t("Programar")}</button>
      {err && <span className="field-error">{err}</span>}
    </form>
  );
}
