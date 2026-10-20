import { useState } from "react";
import { api } from "../lib/api";
import { addDays, fmtDate, fmtDateTime, todayIn, zonedToUtc } from "../lib/dates";
import { MILESTONE_KIND } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Reminder, Task, TodayData } from "../lib/types";
import { TaskCard } from "../components/TaskCard";
import { patchTask } from "../components/TaskPanel";
import { Chip, Empty, ErrorBox, Section } from "../components/ui";
import { ReminderForm } from "../components/ReminderForm";

export function TodayView() {
  const app = useApp();
  const { data, error, reload } = useApi<TodayData>("/api/today");
  if (!data) return <div className="view"><ErrorBox error={error} onRetry={reload} />{!error && <p className="muted">Cargando…</p>}</div>;
  const s = data.sections;
  const nothing = !s.vence.length && !s.revisar.length && !s.bloqueos_externos.length && !s.depende_de_mi.length && !data.reminders.length;
  const quickDone = async (t: Task) => { try { if (await patchTask(t.id, { status: "hecha" })) { app.changed(); app.toast("Marcada como hecha", "ok"); } } catch (e: any) { app.toast(e.message, "error"); } };
  const actions = (t: Task) => <>
    {t.status === "backlog" && <button className="ghost small" onClick={async () => { await patchTask(t.id, { status: "pendiente" }); app.changed(); }}>Promover</button>}
    <button className="ghost small" onClick={() => quickDone(t)}>Hecha</button>
  </>;
  return (
    <div className="view today">
      <header className="view-head">
        <h1>Hoy · {fmtDate(data.today)}</h1>
        <p className="muted">Resumen de atención. Cada tarea aparece una sola vez; las demás señales se indican en la tarjeta.</p>
      </header>
      <ErrorBox error={error} onRetry={reload} />
      {nothing && <Empty>Nada requiere acción según los datos registrados. Esto no significa que todo esté bien: revisa los proyectos si hace tiempo que no los actualizas.</Empty>}
      <div className="today-grid">
        <Section title="Vence hoy y esta semana" count={s.vence.length} id="sec-vence">
          {s.vence.length ? <div className="cards">{s.vence.map((t) => <TaskCard key={t.id} task={t} showStatus actions={actions(t)} />)}</div>
            : <Empty>Sin vencimientos registrados hasta el {fmtDate(data.week_end)}.</Empty>}
          {data.milestones.length > 0 && <>
            <h3>Hitos y compromisos</h3>
            <ul className="plain">{data.milestones.map((m) => (
              <li key={m.id}><Chip>{MILESTONE_KIND[m.kind]}</Chip> {fmtDate(m.date)} · <button className="linklike" onClick={() => app.navigate(`#/proyectos/${m.project_id}`)}>{m.project_name}</button>: {m.title}</li>))}
            </ul></>}
        </Section>
        <Section title="Revisiones y recordatorios" count={s.revisar.length + data.reminders.length} id="sec-rev">
          {s.revisar.length > 0 && <>
            <h3>Pendientes de mi revisión</h3>
            <div className="cards">{s.revisar.map((t) => <TaskCard key={t.id} task={t} showStatus />)}</div>
          </>}
          <Reminders items={data.reminders} onChange={reload} />
          {!s.revisar.length && !data.reminders.length && <Empty>Sin revisiones ni recordatorios pendientes.</Empty>}
          <details><summary>Programar un recordatorio</summary><ReminderForm onCreated={reload} /></details>
        </Section>
        <Section title="Bloqueos externos" count={s.bloqueos_externos.length} id="sec-bloq">
          {s.bloqueos_externos.length ? <div className="cards">{s.bloqueos_externos.map((t) => <TaskCard key={t.id} task={t} showStatus />)}</div>
            : <Empty>Sin esperas ni bloqueos registrados.</Empty>}
        </Section>
        <Section title="Tareas que dependen de mí" count={s.depende_de_mi.length} id="sec-mi">
          {app.meId === null && <Empty>Configura quién eres en Equipo.</Empty>}
          {s.depende_de_mi.length ? <div className="cards">{s.depende_de_mi.map((t) => <TaskCard key={t.id} task={t} showStatus />)}</div>
            : <Empty>Ninguna tarea registrada está esperando por ti (fuera de las secciones anteriores).</Empty>}
        </Section>
        <Section title="Resumen operativo del equipo" id="sec-eq">
          <table className="list compact">
            <thead><tr><th>Persona</th><th>Activas</th><th>En revisión</th><th>Con espera/bloqueo</th><th>Vencen esta semana</th><th>Ausencias registradas</th></tr></thead>
            <tbody>{data.team.map((p) => (
              <tr key={p.person_id}>
                <td><button className="linklike" onClick={() => app.navigate(`#/equipo/${p.person_id}`)}>{p.name}{p.is_me ? " (yo)" : ""}</button></td>
                <td>{p.active || "Sin tareas activas registradas"}</td><td>{p.in_review}</td><td>{p.blocked}</td><td>{p.due_this_week}</td>
                <td>{p.absences.length ? p.absences.map((a) => `${fmtDate(a.start_date)}–${fmtDate(a.end_date)}`).join(", ") : "—"}</td>
              </tr>))}
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

export function Reminders({ items, onChange }: { items: Reminder[]; onChange: () => void }) {
  const app = useApp();
  const [err, setErr] = useState("");
  if (!items.length) return null;
  const groups = new Map<string, Reminder[]>();
  for (const r of items) groups.set(r.rule_label, [...(groups.get(r.rule_label) || []), r]);
  const act = async (r: Reminder, action: string, until?: string) => {
    try { await api.post(`/api/reminders/${r.id}/action`, { action, until }); onChange(); app.changed(); } catch (e: any) { setErr(e.message); }
  };
  const tomorrow9 = zonedToUtc(addDays(todayIn(app.tz), 1) + "T09:00", app.tz);
  const in2h = new Date(Date.now() + 2 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  return (
    <div className="reminders">
      <ErrorBox error={err} />
      {[...groups.entries()].map(([label, rs]) => (
        <div key={label} className="rem-group">
          <h3>{label} <span className="count">({rs.length})</span></h3>
          <ul className="plain">
            {rs.map((r) => (
              <li key={r.id} className="rem">
                <div>
                  {r.task_id ? <button className="linklike" onClick={() => app.openTask(r.task_id!)}>{r.task_title}</button> : <strong>{r.title}</strong>}
                  {r.task_id && <span className="muted"> · {r.title}</span>}
                  {r.project_name && <span className="muted"> · {r.project_name}</span>}
                  <span className="muted"> · desde {fmtDateTime(r.due_at, app.tz)}</span>
                  {r.task_shown_elsewhere && <span className="muted"> (la tarea aparece también arriba)</span>}
                </div>
                <div className="row tight">
                  <button className="small" onClick={() => act(r, "atendido")}>Atendido</button>
                  <button className="small" onClick={() => act(r, "posponer", in2h)}>Posponer 2 h</button>
                  <button className="small" onClick={() => act(r, "posponer", tomorrow9)}>Mañana 9:00</button>
                  <button className="small ghost" onClick={() => act(r, "descartar")}>Descartar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
