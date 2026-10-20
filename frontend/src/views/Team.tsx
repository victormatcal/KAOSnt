import { useState } from "react";
import { api } from "../lib/api";
import { addDays, fmtDate, fmtDateTime, todayIn, weekStart } from "../lib/dates";
import { t } from "../lib/i18n";
import { CONFLICT_REASON } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Person, Task } from "../lib/types";
import { TaskCard } from "../components/TaskCard";
import { DateInput } from "../components/DateInput";
import { Chip, Empty, ErrorBox, Field, LocationSelect, Modal, Section } from "../components/ui";

interface PersonView extends Person {
  location_name: string | null;
  projects: { id: number; name: string; status: string; role: string; dedication_pct: number | null }[];
  active_tasks: Task[]; in_review: Task[]; upcoming_due: Task[]; blocked: Task[]; planned_week: Task[];
  estimate: { known_hours: number | null; tasks_with_estimate: number; tasks_without_estimate: number };
  absences: { id: number; start_date: string; end_date: string; label: string }[];
  holidays: { date: string; name: string; location: string | null }[];
  recent_updates: { at: string; kind: string; text: string; task_id: number; title: string }[];
}

export function TeamView({ personId }: { personId?: number }) {
  const app = useApp();
  const [tab, setTab] = useState<"personas" | "plan">("personas");
  const [editing, setEditing] = useState<Person | "nueva" | null>(null);
  const people = app.boot.people;
  const sel = personId ?? people.find((p) => p.is_me)?.id ?? people[0]?.id;
  return (
    <div className="view">
      <header className="view-head row">
        <h1>{t("Equipo")}</h1>
        <div role="tablist" className="tabs-inline" aria-label={t("Secciones de equipo")}>
          <button role="tab" aria-selected={tab === "personas"} className={tab === "personas" ? "active" : ""} onClick={() => setTab("personas")}>{t("Personas")}</button>
          <button role="tab" aria-selected={tab === "plan"} className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>{t("Planificación semanal")}</button>
        </div>
        <span className="spacer" />
        <button className="primary" onClick={() => setEditing("nueva")}>{t("Nueva persona")}</button>
      </header>
      <p className="hint">{t("Vista operativa de los datos registrados. No se muestran rankings, puntuaciones ni valoraciones de desempeño.")}</p>
      {tab === "personas" ? (
        <div className="split">
          <nav className="side-list" aria-label={t("Personas")}><ul className="plain">{people.map((p) => (
            <li key={p.id}><button className={"side-item" + (p.id === sel ? " active" : "")} aria-current={p.id === sel} onClick={() => app.navigate(`#/equipo/${p.id}`)}>
              {p.name}{p.is_me ? " " + t("(yo)") : ""}{!p.active && " · " + t("inactiva")}</button></li>))}</ul></nav>
          {sel ? <PersonDetail id={sel} onEdit={(p) => setEditing(p)} /> : <Empty>{t("Añade personas del equipo.")}</Empty>}
        </div>
      ) : <WeekPlan />}
      {editing && <PersonForm person={editing === "nueva" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function PersonDetail({ id, onEdit }: { id: number; onEdit: (p: Person) => void }) {
  const app = useApp();
  const { data: p, error, reload } = useApi<PersonView>(`/api/people/${id}/view`);
  const [abs, setAbs] = useState<{ start_date: string | null; end_date: string | null; label: string }>({ start_date: null, end_date: null, label: "" });
  const [err, setErr] = useState("");
  if (!p) return <div><ErrorBox error={error} onRetry={reload} /></div>;
  const list = (ts: Task[], empty: string) => ts.length ? <div className="cards">{ts.map((x) => <TaskCard key={x.id} task={x} showStatus />)}</div> : <p className="muted">{empty}</p>;
  const addAbs = async () => {
    try { await api.post("/api/absences", { person_id: id, ...abs }); setAbs({ start_date: null, end_date: null, label: "" }); reload(); app.changed(); setErr(""); }
    catch (e: any) { setErr(e.message); }
  };
  return (
    <div className="person-detail">
      <div className="row">
        <h2>{p.name}{p.is_me ? " " + t("(yo)") : ""}</h2>{p.role && <span className="muted">{p.role}</span>}
        <span className="spacer" />
        <button onClick={() => app.quickTask({ assignee_id: p.id })}>{p.is_me ? t("Nueva tarea para mí") : t("Nueva tarea para {nombre}", { nombre: p.name })}</button>
        <button onClick={() => onEdit(p)}>{t("Editar")}</button>
      </div>
      <p className="muted">{t("Oficina")}: {p.location_name || t("no informada")} · {t("Capacidad semanal")}: {p.weekly_capacity_hours !== null ? `${p.weekly_capacity_hours} h` : t("no informada")} ·{" "}
        {t("Esfuerzo estimado registrado (no backlog)")}: {p.estimate.known_hours !== null ? t("{h} h en {n} tareas", { h: p.estimate.known_hours, n: p.estimate.tasks_with_estimate }) : t("no informado")}
        {p.estimate.tasks_without_estimate > 0 && " · " + t("{n} sin estimación", { n: p.estimate.tasks_without_estimate })}</p>
      <p className="muted">{t("Proyectos")}: {p.projects.length ? p.projects.map((x) => `${x.name}${x.dedication_pct !== null ? ` (${x.dedication_pct}%)` : ""}`).join(", ") : t("ninguno vinculado")}</p>
      {!p.active_tasks.length && !p.in_review.length && <p className="empty">{t("Sin tareas activas registradas.")}</p>}
      <div className="grid2">
        <Section title={t("Tareas activas")} count={p.active_tasks.length}>{list(p.active_tasks, t("Sin tareas activas registradas."))}</Section>
        <Section title={t("En revisión")} count={p.in_review.length}>{list(p.in_review, t("Ninguna."))}</Section>
        <Section title={t("Próximos vencimientos (14 días)")} count={p.upcoming_due.length}>{list(p.upcoming_due, t("Ninguno registrado."))}</Section>
        <Section title={t("Con espera o bloqueo")} count={p.blocked.length}>{list(p.blocked, t("Ninguna."))}</Section>
        <Section title={t("Planificado esta semana")} count={p.planned_week.length}>{list(p.planned_week, t("Nada planificado con fecha esta semana."))}</Section>
        <Section title={t("Ausencias y festivos registrados")}>
          {p.absences.length ? <ul className="plain">{p.absences.map((a) => <li key={a.id}>{t("Ausencia")} {fmtDate(a.start_date)} – {fmtDate(a.end_date)} {a.label && <span className="muted">· {a.label}</span>}
            <button className="ghost small" onClick={async () => { if (window.confirm(t("¿Eliminar esta ausencia?"))) { await api.del(`/api/absences/${a.id}`); reload(); app.changed(); } }}>{t("Eliminar")}</button></li>)}</ul>
            : <p className="muted">{t("Sin ausencias registradas.")}</p>}
          {p.holidays.length > 0 && <p className="muted small">{t("Festivos próximos")}: {p.holidays.map((h) => `${fmtDate(h.date)}${h.location ? "" : " " + t("(común)")}`).join(", ")}</p>}
          <div className="row">
            <DateInput label={t("Desde")} value={abs.start_date} onChange={(v) => setAbs({ ...abs, start_date: v, end_date: abs.end_date || v })} />
            <DateInput label={t("Hasta")} value={abs.end_date} onChange={(v) => setAbs({ ...abs, end_date: v })} />
            <input className="grow" aria-label={t("Etiqueta opcional")} placeholder={t("Etiqueta (opcional)")} value={abs.label} onChange={(e: any) => setAbs({ ...abs, label: e.target.value })} />
            <button disabled={!abs.start_date || !abs.end_date} onClick={addAbs}>{t("Registrar ausencia")}</button>
          </div>
          <p className="hint">{t("No se piden motivos. Las tareas no se reasignan automáticamente.")}</p>
          <ErrorBox error={err} />
        </Section>
      </div>
      <Section title={t("Últimas actualizaciones de sus tareas")}>
        {p.recent_updates.length ? <ul className="history">{p.recent_updates.map((u, i) => <li key={i}><div className="h-meta"><time>{fmtDateTime(u.at, app.tz)}</time> · <button className="linklike" onClick={() => app.openTask(u.task_id)}>{u.title}</button></div><div className="h-text">{u.text}</div></li>)}</ul>
          : <p className="muted">{t("Sin actualizaciones registradas.")}</p>}
      </Section>
    </div>
  );
}

interface PlanPerson {
  person_id: number | null; name: string; capacity_hours: number | null; counted_hours: number | null;
  availability: { nominal_days: number; holiday_days: number; absence_days: number; available_days: number; available_hours: number | null } | null;
  counted: (Task & { counted_hours: number; source: string })[]; unestimated: Task[]; split_into_subtasks: Task[];
  by_project: { project_id: number | null; name: string; dedication_pct: number | null; dedication_hours: number | null; counted_hours: number | null; unestimated: number }[];
  absences: { id: number; start_date: string; end_date: string }[];
  conflicts: { task_id: number; title: string; field: string; date: string; reason: string }[];
}

function WeekPlan() {
  const app = useApp();
  const [week, setWeek] = useState(weekStart(todayIn(app.tz)));
  const { data, error, reload } = useApi<{ week_start: string; week_end: string; people: PlanPerson[] }>(`/api/planning?week=${week}`);
  return (
    <div>
      <div className="row">
        <button onClick={() => setWeek(addDays(week, -7))} aria-label={t("Semana anterior")}>◀</button>
        <button onClick={() => setWeek(weekStart(todayIn(app.tz)))}>{t("Esta semana")}</button>
        <button onClick={() => setWeek(addDays(week, 7))} aria-label={t("Semana siguiente")}>▶</button>
        <strong>{t("Semana del {desde} al {hasta}", { desde: fmtDate(week), hasta: fmtDate(addDays(week, 6)) })}</strong>
      </div>
      <details className="mini"><summary>{t("¿Cómo se calcula?")}</summary>
        <ul className="hint">
          <li><strong>{t("Esfuerzo registrado")}</strong>: {t("estimación de las tareas planificadas esa semana (o el reparto semanal explícito si lo hay). Las tareas sin estimación se listan aparte; nunca cuentan como 0.")}</li>
          <li><strong>{t("Disponible")}</strong>: {t("capacidad semanal × proporción de las horas del horario laboral de la semana que quedan tras festivos (comunes y de su oficina) y ausencias registrados. La semana es siempre de lunes a domingo.")}</li>
          <li><strong>{t("Por proyecto")}</strong>: {t("dedicación (% de su capacidad, definido en cada proyecto) frente al esfuerzo estimado de las tareas de ese proyecto.")}</li>
          <li>{t("Son datos de referencia para planificar; no miden rendimiento ni horas trabajadas.")}</li>
        </ul></details>
      <ErrorBox error={error} onRetry={reload} />
      <div className="plan">
        {data?.people.map((p) => {
          const av = p.availability;
          return <article key={String(p.person_id)} className="plan-person">
            <h3>{p.name}</h3>
            <dl className="facts">
              <dt>{t("Esfuerzo registrado")}</dt><dd><strong>{p.counted_hours !== null ? `${p.counted_hours} h` : t("no informado")}</strong>{p.unestimated.length > 0 && <span className="muted"> + {p.unestimated.length} {t("sin estimar")}</span>}</dd>
              {av && <><dt>{t("Disponible")}</dt><dd>{av.available_hours !== null ? `${av.available_hours} h` : t("capacidad no informada")} <span className="muted small">({t("{a} de {n} días laborables", { a: av.available_days, n: av.nominal_days })}{av.holiday_days ? " · " + t("{n} festivo(s)", { n: av.holiday_days }) : ""}{av.absence_days ? " · " + t("{n} de ausencia", { n: av.absence_days }) : ""})</span></dd></>}
            </dl>
            {av?.available_hours != null && p.counted_hours !== null && p.counted_hours > av.available_hours && <p><Chip tone="warn">{t("El esfuerzo registrado supera lo disponible")}</Chip></p>}
            {p.by_project.length > 0 && <table className="list compact"><thead><tr><th>{t("Proyecto")}</th><th>{t("Dedicación")}</th><th>{t("Estimado")}</th></tr></thead>
              <tbody>{p.by_project.map((b) => <tr key={String(b.project_id)}>
                <td className="wrap">{b.name}</td>
                <td>{b.dedication_pct !== null ? `${b.dedication_pct}%${b.dedication_hours !== null ? ` · ${b.dedication_hours} h` : ""}` : "—"}</td>
                <td>{b.counted_hours !== null ? `${b.counted_hours} h` : "—"}{b.unestimated ? <span className="muted"> +{b.unestimated} {t("sin est.")}</span> : null}
                  {b.dedication_hours !== null && b.counted_hours !== null && b.counted_hours > b.dedication_hours && <span title={t("Supera la dedicación registrada")}> ⚠</span>}</td>
              </tr>)}</tbody></table>}
            {p.conflicts.length > 0 && <div className="warn-box" role="note"><strong>{t("Coincide con festivo o ausencia registrados")}:</strong>
              <ul className="plain">{p.conflicts.map((c, i) => <li key={i}><button className="linklike" onClick={() => app.openTask(c.task_id)}>{c.title}</button> · {c.field === "due_date" ? t("vence el {fecha}", { fecha: fmtDate(c.date) }) : t("planificada el {fecha}", { fecha: fmtDate(c.date) })} ({CONFLICT_REASON[c.reason] || c.reason})</li>)}</ul></div>}
            <details className="mini"><summary>{t("Tareas de la semana ({n})", { n: p.counted.length + p.unestimated.length + p.split_into_subtasks.length })}</summary>
              <ul className="plain">{p.counted.map((x) => <li key={x.id}><button className="linklike" onClick={() => app.openTask(x.id)}>{x.title}</button> · {x.counted_hours} h <span className="muted small">({x.source === "reparto" ? t("reparto semanal") : t("estimación")})</span></li>)}
                {p.unestimated.map((x) => <li key={x.id}><button className="linklike" onClick={() => app.openTask(x.id)}>{x.title}</button> · <span className="muted">{t("sin estimación")}</span></li>)}
                {p.split_into_subtasks.map((x) => <li key={x.id} className="muted">{x.title} · {t("se cuentan sus subtareas")}</li>)}</ul>
            </details>
          </article>;
        })}
      </div>
    </div>
  );
}

function PersonForm({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const app = useApp();
  const [name, setName] = useState(person?.name || "");
  const [role, setRole] = useState(person?.role || "");
  const [cap, setCap] = useState(person?.weekly_capacity_hours?.toString() || "");
  const [loc, setLoc] = useState<number | null>(person?.location_id ?? null);
  const [active, setActive] = useState(person ? !!person.active : true);
  const [error, setError] = useState("");
  const submit = async () => {
    const body = { name: name.trim(), role, weekly_capacity_hours: cap === "" ? null : Number(cap), location_id: loc, active };
    try { if (person) await api.patch(`/api/people/${person.id}`, body); else await api.post("/api/people", body); await app.reloadBoot(); app.changed(); onClose(); }
    catch (e: any) { setError(e.message); }
  };
  return (
    <Modal title={person ? t("Editar persona") : t("Nueva persona")} onClose={onClose}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
        <Field label={t("Nombre")}><input value={name} onChange={(e: any) => setName(e.target.value)} required /></Field>
        <Field label={t("Rol (opcional)")}><input value={role} onChange={(e: any) => setRole(e.target.value)} /></Field>
        <Field label={t("Oficina (opcional)")} hint={t("Determina qué festivos locales le aplican. Gestiona oficinas en Configuración.")}><LocationSelect value={loc} onChange={setLoc} /></Field>
        <Field label={t("Capacidad semanal en horas (opcional)")} hint={t("Vacío = no informada. Se combina con la dedicación por proyecto y con festivos/ausencias en la Planificación semanal.")}>
          <input type="number" min="0" max="168" value={cap} onChange={(e: any) => setCap(e.target.value)} /></Field>
        {person && <label className="check"><input type="checkbox" checked={active} onChange={(e: any) => setActive(e.target.checked)} /> {t("Activa (desmarca para ocultarla sin borrar su historial)")}</label>}
        <ErrorBox error={error} />
        <div className="modal-foot"><button className="primary" type="submit" disabled={!name.trim()}>{t("Guardar")}</button><button type="button" onClick={onClose}>{t("Cancelar")}</button></div>
      </form>
    </Modal>
  );
}
