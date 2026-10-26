import { fmtDate, fmtDateDow, fmtDateTime } from "../lib/dates";
import { t, translateServer } from "../lib/i18n";
import { MILESTONE_KIND } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Task, TodayData } from "../lib/types";
import { ReminderForm } from "../components/ReminderForm";
import { reminderLabel, ReminderList } from "../components/ReminderCenter";
import { TaskCard } from "../components/TaskCard";
import { patchTask } from "../components/TaskPanel";
import { Chip, Empty, ErrorBox, Section } from "../components/ui";

export function TodayView() {
  const app = useApp();
  const { data, error, reload } = useApi<TodayData>("/api/today");
  if (!data) return <div className="view"><ErrorBox error={error} onRetry={reload} />{!error && <p className="muted">{t("Cargando…")}</p>}</div>;
  const s = data.sections;
  const scheduled = data.scheduled || [];
  const nothing = !s.vence.length && !s.revisar.length && !s.bloqueos_externos.length && !s.depende_de_mi.length && !data.reminders.length;
  const act = async (task: Task, body: Record<string, unknown>, msg: string) => {
    try { const r = await patchTask(task.id, body, true); if (r) { app.changed(); app.undoable(msg, r.undo_id); } } catch (e: any) { app.toast(e.message, "error"); }
  };
  const actions = (task: Task) => <>
    {task.status === "backlog" && <button className="ghost small" onClick={() => act(task, { status: "pendiente" }, t("Promovida a Pendiente"))}>{t("Promover")}</button>}
    <button className="ghost small" onClick={() => act(task, { status: "hecha" }, t("Marcada como hecha"))}>{t("Hecha")}</button>
  </>;
  const card = (task: Task, withActions = false) => <TaskCard key={task.id} task={task} showStatus actions={withActions ? actions(task) : undefined} seriesLabel={t("esta semana")} />;
  return (
    <div className="view today">
      <header className="view-head">
        <h1>{t("Hoy")} · {fmtDateDow(data.today)}</h1>
        <p className="muted">{t("Resumen de atención. Cada tarea aparece una sola vez; las demás señales se indican en la tarjeta. Las series recurrentes se muestran una vez con «↻ +N esta semana».")}</p>
      </header>
      {nothing && <Empty>{t("Nada requiere acción según los datos registrados. Esto no significa que todo esté bien: revisa los proyectos si hace tiempo que no los actualizas.")}</Empty>}
      <div className="today-grid">
        <Section title={t("Vence hoy y esta semana")} count={s.vence.length} id="sec-vence">
          {s.vence.length ? <div className="cards">{s.vence.map((x) => card(x, true))}</div>
            : <Empty>{t("Sin vencimientos registrados hasta el {fecha}.", { fecha: fmtDate(data.week_end) })}</Empty>}
          {data.milestones.length > 0 && <>
            <h3>{t("Hitos y compromisos")}</h3>
            <ul className="plain">{data.milestones.map((m) => (
              <li key={m.id}><Chip>{MILESTONE_KIND[m.kind]}</Chip> {fmtDate(m.date)} · <button className="linklike" onClick={() => app.navigate(`#/proyectos/${m.project_id}`)}>{m.project_name}</button>: {m.title}</li>))}</ul></>}
        </Section>
        <Section title={t("Revisiones y recordatorios")} count={s.revisar.length + data.reminders.length} id="sec-rev"
          actions={<button className="ghost small" onClick={() => app.openReminders("pending")}>{t("Centro de recordatorios")}</button>}>
          {s.revisar.length > 0 && <><h3>{t("Pendientes de mi revisión")}</h3>
            <div className="cards">{s.revisar.map((x) => card(x))}</div></>}
          {data.reminders.length > 0 && <ReminderList items={data.reminders} mode="pending" onChange={reload} />}
          {!s.revisar.length && !data.reminders.length && <Empty>{t("Sin revisiones ni recordatorios pendientes.")}</Empty>}
          <h3>{t("Programados esta semana")} <span className="count">({scheduled.length})</span></h3>
          {scheduled.length ? <ul className="plain scheduled">{scheduled.map((r) => (
            <li key={r.id}><span className="chip">{reminderLabel(r)}</span> {fmtDateTime(r.snoozed_until || r.due_at, app.tz)} · {r.task_id
              ? <><button className="linklike" onClick={() => app.openTask(r.task_id!)}>{r.task_title}</button> <span className="muted">· {translateServer(r.title)}</span></>
              : <strong>{translateServer(r.title)}</strong>}</li>))}</ul>
            : <p className="muted small">{t("Ningún recordatorio programado para lo que queda de semana.")}</p>}
          <details className="mini"><summary>{t("Programar un recordatorio")}</summary><ReminderForm onCreated={reload} /></details>
        </Section>
        <Section title={t("Bloqueos externos")} count={s.bloqueos_externos.length} id="sec-bloq">
          {s.bloqueos_externos.length ? <div className="cards">{s.bloqueos_externos.map((x) => card(x))}</div>
            : <Empty>{t("Sin esperas ni bloqueos registrados.")}</Empty>}
        </Section>
        <Section title={t("Tareas que dependen de mí")} count={s.depende_de_mi.length} id="sec-mi">
          {app.meId === null && <Empty>{t("Configura quién eres en Equipo.")}</Empty>}
          {s.depende_de_mi.length ? <div className="cards">{s.depende_de_mi.map((x) => card(x))}</div>
            : <Empty>{t("Ninguna tarea registrada está esperando por ti (fuera de las secciones anteriores).")}</Empty>}
        </Section>
        <Section title={t("Resumen operativo del equipo")} id="sec-eq">
          <ul className="plain team-list">{data.team.map((p) => {
            const counts = [p.active ? t("{n} activas", { n: p.active }) : "", p.in_review ? t("{n} en revisión", { n: p.in_review }) : "",
              p.blocked ? t("{n} con espera/bloqueo", { n: p.blocked }) : "", p.due_this_week ? t("{n} vencen esta semana", { n: p.due_this_week }) : ""].filter(Boolean);
            return <li key={p.person_id}>
              <button className="linklike strong" onClick={() => app.navigate(`#/equipo/${p.person_id}`)}>{p.name}{p.is_me ? " " + t("(yo)") : ""}</button>
              <span className="muted"> · {counts.length ? counts.join(" · ") : t("Sin tareas activas registradas")}</span>
              {(p.absences.length > 0 || p.holidays.length > 0) && <div className="team-avail">
                {p.absences.map((a) => <span key={"a" + a.id}>{t("Ausencia")} {fmtDate(a.start_date)}{a.end_date !== a.start_date ? `–${fmtDate(a.end_date)}` : ""}</span>)}
                {p.holidays.map((h) => <span key={"h" + h.date}>{t("Festivo")} {fmtDate(h.date)}{h.location ? ` (${h.location})` : ""}</span>)}
              </div>}
            </li>;
          })}</ul>
        </Section>
      </div>
    </div>
  );
}
