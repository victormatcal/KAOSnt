// Centro de recordatorios (🔔): Pendientes, Programados (futuros y pospuestos) y Resueltos.
// Los manuales se pueden editar y cancelar; los resueltos se pueden reabrir. «Recordar contactar» no envía nada.
import { useState } from "react";
import { api } from "../lib/api";
import { addDays, fmtDateTime, todayIn, utcToZonedInput, zonedToUtc } from "../lib/dates";
import { t, translateServer } from "../lib/i18n";
import { REMINDER_RULE } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Reminder, ReminderBuckets } from "../lib/types";
import { DateTimeInput } from "./DateInput";
import { Empty, ErrorBox, Modal } from "./ui";

export type ReminderTab = "pendientes" | "programados" | "resueltos";

export function ReminderCenter({ initial = "pendientes", onClose }: { initial?: ReminderTab; onClose: () => void }) {
  const [tab, setTab] = useState<ReminderTab>(initial);
  const { data, error, reload } = useApi<ReminderBuckets>("/api/reminders");
  const tabs: [ReminderTab, string, number | undefined][] = [
    ["pendientes", t("Pendientes"), data?.active.length], ["programados", t("Programados"), data?.scheduled.length], ["resueltos", t("Resueltos"), data?.resolved.length]];
  const items = !data ? [] : tab === "pendientes" ? data.active : tab === "programados" ? data.scheduled : data.resolved;
  return (
    <Modal title={t("Recordatorios")} onClose={onClose} wide>
      <div role="tablist" className="tabs-inline" aria-label={t("Bandejas de recordatorios")}>
        {tabs.map(([k, label, n]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{label}{n !== undefined ? ` (${n})` : ""}</button>)}
      </div>
      <p className="hint">{tab === "pendientes" ? t("Avisos ya vencidos. Atiende, pospón o descarta.")
        : tab === "programados" ? t("Recordatorios futuros y pospuestos. Los manuales se pueden editar o cancelar.")
          : t("Últimos atendidos o descartados. Puedes reabrirlos.")}</p>
      <ErrorBox error={error} onRetry={reload} />
      {data && !items.length && <Empty>{tab === "pendientes" ? t("No hay recordatorios pendientes.") : tab === "programados" ? t("No hay recordatorios programados.") : t("No hay recordatorios resueltos.")}</Empty>}
      <ReminderList items={items} mode={tab} onChange={reload} />
    </Modal>
  );
}

export function reminderLabel(r: Reminder): string { return REMINDER_RULE[r.rule] || r.rule_label; }

export function ReminderList({ items, mode, onChange, hideTask }: { items: Reminder[]; mode: ReminderTab; onChange: () => void; hideTask?: boolean }) {
  const app = useApp();
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<{ id: number; title: string; when: string | null } | null>(null);
  const act = async (r: Reminder, action: string, until?: string) => {
    try {
      const res = await api.post<{ undo_id: number | null }>(`/api/reminders/${r.id}/action?undo=1`, { action, until, also_ids: r.grouped_ids || [] });
      onChange(); app.changed(); setErr("");
      const msg: Record<string, string> = { atendido: t("Recordatorio atendido"), descartar: t("Recordatorio descartado"), posponer: t("Recordatorio pospuesto"), reabrir: t("Recordatorio reabierto") };
      app.undoable(msg[action], res.undo_id);
    } catch (e: any) { setErr(e.message); }
  };
  const save = async () => {
    if (!editing || !editing.title.trim() || !editing.when) return;
    try { await api.patch(`/api/reminders/${editing.id}`, { title: editing.title.trim(), due_at: zonedToUtc(editing.when, app.tz) }); setEditing(null); onChange(); app.changed(); app.toast(t("Recordatorio actualizado"), "ok"); }
    catch (e: any) { setErr(e.message); }
  };
  const tomorrow9 = zonedToUtc(addDays(todayIn(app.tz), 1) + "T09:00", app.tz);
  const in2h = new Date(Date.now() + 2 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  return (
    <div className="reminders">
      <ErrorBox error={err} />
      <ul className="plain">{items.map((r) => (
        <li key={r.id} className="rem">
          {editing?.id === r.id ? <form className="row" onSubmit={(e: any) => { e.preventDefault(); void save(); }}>
            <input className="grow" aria-label={t("Texto del recordatorio")} value={editing.title} onChange={(e: any) => setEditing({ ...editing, title: e.target.value })} />
            <DateTimeInput label={t("Fecha y hora")} value={editing.when} onChange={(v) => setEditing({ ...editing, when: v })} />
            <button type="submit" className="small primary" disabled={!editing.title.trim() || !editing.when}>{t("Guardar")}</button>
            <button type="button" className="small" onClick={() => setEditing(null)}>{t("Cancelar")}</button>
          </form> : <>
            <div className="rem-text">
              <span className="chip">{reminderLabel(r)}</span>{" "}
              {r.task_id && !hideTask ? <button className="linklike" onClick={() => app.openTask(r.task_id!)}>{r.task_title}</button> : <strong>{translateServer(r.title)}</strong>}
              <span className="muted small"> · {r.task_id && !hideTask ? translateServer(r.title) + " · " : ""}{r.project_name ? `${r.project_name} · ` : ""}
                {mode === "resueltos" ? t("{estado} el {fecha}", { estado: r.status === "atendido" ? t("Atendido") : t("Descartado"), fecha: fmtDateTime(r.resolved_at, app.tz) })
                  : r.snoozed_until && mode === "programados" ? t("pospuesto hasta {fecha}", { fecha: fmtDateTime(r.snoozed_until, app.tz) })
                    : mode === "programados" ? t("programado para {fecha}", { fecha: fmtDateTime(r.due_at, app.tz) })
                      : t("desde {fecha}", { fecha: fmtDateTime(r.due_at, app.tz) })}
                {(r.grouped || 1) > 1 ? " · " + t("{n} avisos agrupados de la misma serie", { n: r.grouped! }) : ""}
                {r.task_shown_elsewhere ? " · " + t("también arriba") : ""}</span>
            </div>
            <div className="row tight">
              {mode === "pendientes" && <>
                <button className="small" onClick={() => act(r, "atendido")}>{t("Atendido")}</button>
                <button className="small" onClick={() => act(r, "posponer", in2h)}>{t("+2 h")}</button>
                <button className="small" onClick={() => act(r, "posponer", tomorrow9)}>{t("Mañana 9:00")}</button>
                <button className="small ghost" onClick={() => act(r, "descartar")}>{t("Descartar")}</button></>}
              {mode === "resueltos" && <button className="small" onClick={() => act(r, "reabrir")}>{t("Reabrir")}</button>}
              {mode !== "resueltos" && r.rule === "manual" && <>
                <button className="small ghost" onClick={() => setEditing({ id: r.id, title: r.title, when: utcToZonedInput(r.snoozed_until || r.due_at, app.tz) })}>{t("Editar")}</button>
                <button className="small ghost" onClick={async () => {
                  if (!window.confirm(t("¿Cancelar el recordatorio «{titulo}»? Se elimina y no se puede deshacer.", { titulo: r.title }))) return;
                  try { await api.del(`/api/reminders/${r.id}`); onChange(); app.changed(); app.toast(t("Recordatorio cancelado"), "ok"); } catch (e: any) { setErr(e.message); }
                }}>{t("Cancelar recordatorio")}</button></>}
            </div>
          </>}
        </li>))}</ul>
    </div>
  );
}

/** Recordatorios de una tarea (en su detalle). */
export function TaskReminders({ taskId }: { taskId: number }) {
  const { data, reload } = useApi<ReminderBuckets>(`/api/tasks/${taskId}/reminders`);
  if (!data) return null;
  const total = data.active.length + data.scheduled.length + data.resolved.length;
  if (!total) return <p className="muted small">{t("Esta tarea no tiene recordatorios.")}</p>;
  return <div className="task-reminders">
    {data.active.length > 0 && <><h4>{t("Pendientes")}</h4><ReminderList items={data.active} mode="pendientes" onChange={reload} hideTask /></>}
    {data.scheduled.length > 0 && <><h4>{t("Programados")}</h4><ReminderList items={data.scheduled} mode="programados" onChange={reload} hideTask /></>}
    {data.resolved.length > 0 && <details className="mini"><summary>{t("Resueltos ({n})", { n: data.resolved.length })}</summary><ReminderList items={data.resolved} mode="resueltos" onChange={reload} hideTask /></details>}
  </div>;
}
