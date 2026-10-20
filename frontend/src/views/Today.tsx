import { useState } from "react";
import { api } from "../lib/api";
import { addDays, fmtDate, fmtDateTime, todayIn, zonedToUtc } from "../lib/dates";
import { MILESTONE_KIND } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Reminder, Task, TodayData } from "../lib/types";
import { ReminderForm } from "../components/ReminderForm";
import { TaskCard } from "../components/TaskCard";
import { patchTask } from "../components/TaskPanel";
import { Chip, Empty, ErrorBox, Section } from "../components/ui";

export function TodayView() {
  const app = useApp();
  const { data, error, reload } = useApi<TodayData>("/api/today");
  if (!data) return <div className="view"><ErrorBox error={error} onRetry={reload} />{!error && <p className="muted">Cargando…</p>}</div>;
  const s = data.sections;
  const nothing = !s.vence.length && !s.revisar.length && !s.bloqueos_externos.length && !s.depende_de_mi.length && !data.reminders.length;
  const act = async (t: Task, body: Record<string, unknown>, msg: string) => {
    try { if (await patchTask(t.id, body)) { app.changed(); app.toast(msg, "ok"); } } catch (e: any) { app.toast(e.message, "error"); }
  };
  const actions = (t: Task) => <>
    {t.status === "backlog" && <button className="ghost small" onClick={() => act(t, { status: "pendiente" }, "Promovida a Pendiente")}>Promover</button>}
    <button className="ghost small" onClick={() => act(t, { status: "hecha" }, "Marcada como hecha")}>Hecha</button>
  </>;
  return (
    <div className="view today">
      <header className="view-head">
        <h1>Hoy · {fmtDate(data.today)}</h1>
        <p className="muted">Resumen de atención. Cada tarea aparece una sola vez; las demás señales se indican en la tarjeta.</p>
      </header>
      {nothing && <Empty>Nada requiere acción según los datos registrados. Esto no significa que todo esté bien: revisa los proyectos si hace tiempo que no los actualizas.</Empty>}
      <div className="today-grid">
        <Section title="Vence hoy y esta semana" count={s.vence.length} id="sec-vence">
          {s.vence.length ? <div className="cards">{s.vence.map((t) => <TaskCard key={t.id} task={t} showStatus actions={actions(t)} />)}</div>
            : <Empty>Sin vencimientos registrados hasta el {fmtDate(data.week_end)}.</Empty>}
          {data.milestones.length > 0 && <>
            <h3>Hitos y compromisos</h3>
            <ul className="plain">{data.milestones.map((m) => (
              <li key={m.id}><Chip>{MILESTONE_KIND[m.kind]}</Chip> {fmtDate(m.date)} · <button className="linklike" onClick={() => app.navigate(`#/proyectos/${m.project_id}`)}>{m.project_name}</button>: {m.title}</li>))}</ul></>}
        </Section>
        <Section title="Revisiones y recordatorios" count={s.revisar.length + data.reminders.length} id="sec-rev">
          {s.revisar.length > 0 && <><h3>Pendientes de mi revisión</h3>
            <div className="cards">{s.revisar.map((t) => <TaskCard key={t.id} task={t} showStatus />)}</div></>}
          <Reminders items={data.reminders} onChange={reload} />
          {!s.revisar.length && !data.reminders.length && <Empty>Sin revisiones ni recordatorios pendientes.</Empty>}
          <details className="mini"><summary>Programar un recordatorio</summary><ReminderForm onCreated={reload} /></details>
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
          <ul className="plain team-list">{data.team.map((p) => {
            const counts = [p.active ? `${p.active} activas` : "", p.in_review ? `${p.in_review} en revisión` : "",
              p.blocked ? `${p.blocked} con espera/bloqueo` : "", p.due_this_week ? `${p.due_this_week} vencen esta semana` : ""].filter(Boolean);
            return <li key={p.person_id}>
              <button className="linklike strong" onClick={() => app.navigate(`#/equipo/${p.person_id}`)}>{p.name}{p.is_me ? " (yo)" : ""}</button>
              <span className="muted"> · {counts.length ? counts.join(" · ") : "Sin tareas activas registradas"}</span>
              {(p.absences.length > 0 || p.holidays.length > 0) && <div className="team-avail">
                {p.absences.map((a) => <span key={"a" + a.id}>Ausencia {fmtDate(a.start_date)}{a.end_date !== a.start_date ? `–${fmtDate(a.end_date)}` : ""}</span>)}
                {p.holidays.map((h) => <span key={"h" + h.date}>Festivo {fmtDate(h.date)}{h.location ? ` (${h.location})` : ""}</span>)}
              </div>}
            </li>;
          })}</ul>
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
          <ul className="plain">{rs.map((r) => (
            <li key={r.id} className="rem">
              <div className="rem-text">
                {r.task_id ? <button className="linklike" onClick={() => app.openTask(r.task_id!)}>{r.task_title}</button> : <strong>{r.title}</strong>}
                <span className="muted small"> · {r.task_id ? r.title : ""}{r.project_name ? ` · ${r.project_name}` : ""} · desde {fmtDateTime(r.due_at, app.tz)}{r.task_shown_elsewhere ? " · también arriba" : ""}</span>
              </div>
              <div className="row tight">
                <button className="small" onClick={() => act(r, "atendido")}>Atendido</button>
                <button className="small" onClick={() => act(r, "posponer", in2h)}>+2 h</button>
                <button className="small" onClick={() => act(r, "posponer", tomorrow9)}>Mañana 9:00</button>
                <button className="small ghost" onClick={() => act(r, "descartar")}>Descartar</button>
              </div>
            </li>))}</ul>
        </div>))}
    </div>
  );
}
