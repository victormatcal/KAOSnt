import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { elapsedSinceStart, fmtDateTime, sinceLabel, utcToZonedInput, weekStart, zonedToUtc, todayIn, fmtDate } from "../lib/dates";
import { APPROVAL, CONDITION, KIND, PRIORITY, STATUS, STATUS_ORDER } from "../lib/labels";
import { Markdown } from "../lib/markdown";
import { useApp } from "../lib/store";
import type { Task, TaskDetail } from "../lib/types";
import { Chip, ErrorBox, Field, LinksEditor, PersonSelect, ProjectSelect, TagsInput } from "./ui";
import { ReminderForm } from "./ReminderForm";

const EDITABLE: (keyof TaskDetail)[] = [
  "title", "description", "kind", "project_id", "workstream_id", "phase_id", "deliverable_id", "parent_id",
  "assignee_id", "reviewer_id", "priority", "due_date", "planned_date", "estimate_hours", "approval", "condition",
  "wait_reason", "wait_on", "wait_on_person_id", "wait_next_action", "follow_up_at", "follow_up_every_days",
  "next_review_at", "review_after_start_hours", "review_after_idle_hours", "review_hours_mode", "links", "tags",
  "started_at", "completed_at",
];

/** Envía un PATCH; si la aprobación comercial está pendiente, pide confirmación explícita. */
export async function patchTask(id: number, body: Record<string, unknown>): Promise<TaskDetail | null> {
  try {
    return await api.patch<TaskDetail>(`/api/tasks/${id}`, body);
  } catch (e) {
    if (e instanceof ApiError && e.code === "aprobacion_pendiente") {
      if (window.confirm(e.message)) return api.patch<TaskDetail>(`/api/tasks/${id}`, { ...body, force: true });
      return null;
    }
    throw e;
  }
}

export function TaskPanel({ id, onClose }: { id: number; onClose: () => void }) {
  const app = useApp();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [followText, setFollowText] = useState("");
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [depId, setDepId] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [allocWeek, setAllocWeek] = useState(weekStart(todayIn(app.tz)));
  const [allocHours, setAllocHours] = useState("");

  const load = () => api.get<TaskDetail>(`/api/tasks/${id}`).then((t) => { setTask(t); setDraft(pick(t)); setError(""); },
    (e) => setError(e.message));
  useEffect(() => { void load(); }, [id]);
  useEffect(() => {
    api.get<Task[]>("/api/tasks?include_backlog=1").then(setAllTasks, () => undefined);
  }, [id]);

  const dirtyKeys = useMemo(() => task ? EDITABLE.filter((k) => JSON.stringify(draft[k as string] ?? null) !== JSON.stringify((task as any)[k] ?? null)) : [], [draft, task]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "Enter")) { e.preventDefault(); void save(); }
      if (e.key === "Escape" && !document.querySelector(".modal")) {
        if (dirtyKeys.length && !window.confirm("Hay cambios sin guardar en la tarea. ¿Cerrar sin guardar?")) return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!task) return <aside className="panel" aria-label="Detalle de tarea"><ErrorBox error={error} onRetry={load} />{!error && <p className="muted pad">Cargando…</p>}</aside>;

  const set = (k: string, v: any) => setDraft((d: Record<string, any>) => ({ ...d, [k]: v }));
  const after = (t: TaskDetail | null, msg?: string) => {
    if (!t) return;
    setTask(t); setDraft(pick(t)); app.changed();
    if (msg) app.toast(msg, "ok");
  };
  const run = async (fn: () => Promise<TaskDetail | null>, msg?: string) => {
    setError("");
    try { after(await fn(), msg); } catch (e: any) { setError(e.message); }
  };
  async function save() {
    if (!task || !dirtyKeys.length) return;
    const body: Record<string, any> = {};
    for (const k of dirtyKeys) body[k as string] = draft[k as string] === "" && k !== "title" && k !== "description" && !String(k).startsWith("wait_") ? null : draft[k as string];
    if (typeof body.title === "string" && !body.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true);
    await run(() => patchTask(task.id, body), "Tarea guardada");
    setSaving(false);
  }
  const quick = (body: Record<string, unknown>, msg: string) => run(() => patchTask(task.id, body), msg);

  const project = app.boot.projects.find((p) => p.id === draft.project_id);
  const groupings = app.boot.groupings.filter((g) => g.project_id === draft.project_id);
  const candidates = allTasks.filter((t) => t.id !== task.id && !task.blocked_by.some((b) => b.id === t.id));
  const me = app.meId;

  return (
    <aside className="panel" aria-label={`Detalle de la tarea ${task.title}`}>
      <div className="panel-head">
        <input className="title-input" aria-label="Título" value={draft.title} onChange={(e: any) => set("title", e.target.value)} />
        <button className="ghost" onClick={() => { if (!dirtyKeys.length || window.confirm("Hay cambios sin guardar. ¿Cerrar sin guardar?")) onClose(); }} aria-label="Cerrar detalle (Esc)">✕</button>
      </div>
      <div className="panel-bar">
        <label className="inline">Estado{" "}
          <select value={task.status} onChange={(e: any) => quick({ status: e.target.value }, "Estado actualizado")}>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
          </select>
        </label>
        <label className="inline">Prioridad{" "}
          <select value={task.priority} onChange={(e: any) => quick({ priority: e.target.value }, "Prioridad actualizada")}>
            {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        {task.status === "backlog" && <button onClick={() => quick({ status: "pendiente" }, "Promovida a Pendiente")}>Promover a Pendiente</button>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{CONDITION[task.condition]}</Chip>}
        {task.archived && <Chip>Archivada</Chip>}
      </div>
      <ErrorBox error={error} />

      <div className="panel-body">
        <details open>
          <summary>Básico</summary>
          <Field label="Descripción">
            <div className="row tight">
              <button className="ghost small" onClick={() => setPreview(!preview)} aria-pressed={preview}>{preview ? "Editar" : "Vista previa"}</button>
            </div>
            {preview ? <Markdown text={draft.description || ""} /> :
              <textarea rows={4} value={draft.description} onChange={(e: any) => set("description", e.target.value)} placeholder="Texto libre (admite Markdown)" />}
          </Field>
          <div className="grid2">
            <Field label="Proyecto"><ProjectSelect value={draft.project_id} onChange={(v) => setDraft((d: any) => ({ ...d, project_id: v, workstream_id: null, phase_id: null, deliverable_id: null }))} /></Field>
            <Field label="Tipo">
              <select value={draft.kind} onChange={(e: any) => set("kind", e.target.value)}>
                {Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            {project && (["linea", "fase", "entregable"] as const).map((kind) => {
              const opts = groupings.filter((g) => g.kind === kind);
              if (!opts.length) return null;
              const key = kind === "linea" ? "workstream_id" : kind === "fase" ? "phase_id" : "deliverable_id";
              return (
                <Field key={kind} label={kind === "linea" ? "Línea de trabajo" : kind === "fase" ? "Fase" : "Entregable"}>
                  <select value={draft[key] ?? ""} onChange={(e: any) => set(key, e.target.value ? Number(e.target.value) : null)}>
                    <option value="">—</option>
                    {opts.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </Field>
              );
            })}
            <Field label="Responsable de ejecución"><PersonSelect value={draft.assignee_id} onChange={(v) => set("assignee_id", v)} /></Field>
            <Field label="Persona revisora"><PersonSelect value={draft.reviewer_id} onChange={(v) => set("reviewer_id", v)} emptyLabel="Sin revisor" /></Field>
            <Field label="Fecha límite"><input type="date" value={draft.due_date || ""} onChange={(e: any) => set("due_date", e.target.value || null)} /></Field>
            <Field label="Fecha planificada"><input type="date" value={draft.planned_date || ""} onChange={(e: any) => set("planned_date", e.target.value || null)} /></Field>
            <Field label="Esfuerzo estimado (h)" hint="Vacío = no informado (no cuenta como 0)">
              <input type="number" min="0" step="0.5" value={draft.estimate_hours ?? ""} onChange={(e: any) => set("estimate_hours", e.target.value === "" ? null : Number(e.target.value))} />
            </Field>
            <Field label="Etiquetas"><TagsInput value={draft.tags || []} onChange={(v) => set("tags", v)} /></Field>
          </div>
        </details>

        <details open={!!task.condition}>
          <summary>Espera o bloqueo {task.condition ? `· ${CONDITION[task.condition]}` : ""}</summary>
          <p className="hint">Condición adicional: la tarea conserva su estado ({STATUS[task.status]}).</p>
          <div className="grid2">
            <Field label="Condición">
              <select value={draft.condition ?? ""} onChange={(e: any) => set("condition", e.target.value || null)}>
                <option value="">Ninguna</option><option value="espera">En espera</option><option value="bloqueada">Bloqueada</option>
              </select>
            </Field>
            <Field label="Depende de (persona del equipo)"><PersonSelect value={draft.wait_on_person_id} onChange={(v) => set("wait_on_person_id", v)} emptyLabel="—" /></Field>
            <Field label="Depende de (tercero)"><input value={draft.wait_on} onChange={(e: any) => set("wait_on", e.target.value)} placeholder="p. ej. sistemas del cliente" /></Field>
            <Field label="Motivo"><input value={draft.wait_reason} onChange={(e: any) => set("wait_reason", e.target.value)} /></Field>
            <Field label="Próxima acción"><input value={draft.wait_next_action} onChange={(e: any) => set("wait_next_action", e.target.value)} /></Field>
            <Field label="Fecha de seguimiento"><input type="datetime-local" value={utcToZonedInput(draft.follow_up_at, app.tz)} onChange={(e: any) => set("follow_up_at", e.target.value ? zonedToUtc(e.target.value, app.tz) : null)} /></Field>
            <Field label="Recordar seguimiento cada (días)"><input type="number" min="1" value={draft.follow_up_every_days ?? ""} onChange={(e: any) => set("follow_up_every_days", e.target.value ? Number(e.target.value) : null)} /></Field>
          </div>
          {task.condition && (
            <div className="subtle-box">
              <p>Desde: {fmtDateTime(task.wait_since, app.tz)} · Último seguimiento: {task.last_follow_up_at ? fmtDateTime(task.last_follow_up_at, app.tz) : "ninguno registrado"}</p>
              <div className="row">
                <input aria-label="Nota del seguimiento" placeholder="Nota del seguimiento (opcional)" value={followText} onChange={(e: any) => setFollowText(e.target.value)} />
                <button onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/follow-up`, { text: followText }), "Seguimiento registrado (la espera continúa)").then(() => setFollowText(""))}>Seguimiento realizado</button>
                <button onClick={() => quick({ condition: null }, "Espera/bloqueo resuelto")}>Marcar resuelto</button>
              </div>
              <p className="hint">«Recordar contactar» no envía nada: solo te lo recuerda.</p>
            </div>
          )}
        </details>

        <details>
          <summary>Tiempos y revisiones</summary>
          <dl className="facts">
            <dt>Tiempo desde el inicio</dt><dd>{elapsedSinceStart(task.started_at, task.completed_at)} <span className="hint">(no equivale a dedicación ni a horas trabajadas)</span></dd>
            <dt>Última actualización significativa</dt><dd>{sinceLabel(task.last_significant_update)} · {fmtDateTime(task.last_significant_update, app.tz)}</dd>
            <dt>Inicio real</dt><dd>{task.started_at ? fmtDateTime(task.started_at, app.tz) : "no informado"}</dd>
            <dt>Finalización</dt><dd>{task.completed_at ? fmtDateTime(task.completed_at, app.tz) : "—"}</dd>
          </dl>
          <div className="grid2">
            <Field label="Revisar en fecha y hora"><input type="datetime-local" value={utcToZonedInput(draft.next_review_at, app.tz)} onChange={(e: any) => set("next_review_at", e.target.value ? zonedToUtc(e.target.value, app.tz) : null)} /></Field>
            <Field label="Revisar tras (h) desde el inicio"><input type="number" min="1" value={draft.review_after_start_hours ?? ""} onChange={(e: any) => set("review_after_start_hours", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Revisar tras (h) sin actualización"><input type="number" min="1" value={draft.review_after_idle_hours ?? ""} onChange={(e: any) => set("review_after_idle_hours", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Cómputo de esas horas" hint={`Laborables: según horario ${app.boot.settings.work_start}–${app.boot.settings.work_end} y días configurados`}>
              <select value={draft.review_hours_mode} onChange={(e: any) => set("review_hours_mode", e.target.value)}>
                <option value="natural">Tiempo natural</option><option value="laborable">Horas laborables</option>
              </select>
            </Field>
            <Field label="Inicio real (corregir)"><input type="datetime-local" value={utcToZonedInput(draft.started_at, app.tz)} onChange={(e: any) => set("started_at", e.target.value ? zonedToUtc(e.target.value, app.tz) : null)} /></Field>
          </div>
          <p className="hint">Zona horaria: {app.tz}. Abrir o consultar la tarea no reinicia ningún contador.</p>
          <h3>Recordatorio puntual</h3>
          <ReminderForm taskId={task.id} defaultTitle={task.wait_on ? `Contactar con ${task.wait_on}` : ""} />
        </details>

        <details open={task.approval !== "no_requerida"}>
          <summary>Aprobación comercial · {APPROVAL[task.approval]}</summary>
          <Field label="Aprobación (independiente del estado de ejecución)">
            <select value={draft.approval} onChange={(e: any) => set("approval", e.target.value)}>
              {Object.entries(APPROVAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
        </details>

        <details open={task.blocked_by.length + task.blocks.length + task.subtasks.length + task.notes.length > 0}>
          <summary>Relaciones</summary>
          <h3>Depende de</h3>
          {task.blocked_by.length === 0 && <p className="muted">Ninguna dependencia</p>}
          <ul className="plain">{task.blocked_by.map((d) => (
            <li key={d.id}>
              <button className="linklike" onClick={() => app.openTask(d.id)}>#{d.id} {d.title}</button> <Chip>{STATUS[d.status]}</Chip>
              {d.assignee_id === me && d.status !== "hecha" && <Chip tone="info">pendiente de mí</Chip>}
              <button className="ghost small" onClick={() => run(() => api.del<TaskDetail>(`/api/tasks/${task.id}/dependencies/${d.id}`))}>Quitar</button>
            </li>))}
          </ul>
          <div className="row">
            <select aria-label="Añadir dependencia" value={depId} onChange={(e: any) => setDepId(e.target.value)}>
              <option value="">Elegir tarea de la que depende…</option>
              {candidates.map((t) => <option key={t.id} value={t.id}>#{t.id} {t.title}</option>)}
            </select>
            <button disabled={!depId} onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/dependencies`, { depends_on_id: Number(depId) })).then(() => setDepId(""))}>Añadir</button>
          </div>
          <h3>Bloquea a</h3>
          {task.blocks.length === 0 ? <p className="muted">Ninguna tarea depende de esta</p> :
            <ul className="plain">{task.blocks.map((d) => <li key={d.id}><button className="linklike" onClick={() => app.openTask(d.id)}>#{d.id} {d.title}</button> <Chip>{STATUS[d.status]}</Chip></li>)}</ul>}
          <h3>Subtareas</h3>
          {task.parent_id && <p>Subtarea de <button className="linklike" onClick={() => app.openTask(task.parent_id!)}>#{task.parent_id}</button></p>}
          <ul className="plain">{task.subtasks.map((s) => <li key={s.id}><button className="linklike" onClick={() => app.openTask(s.id)}>{s.title}</button> <Chip>{STATUS[s.status]}</Chip>{s.estimate_hours !== null && <span className="muted"> {s.estimate_hours} h</span>}</li>)}</ul>
          <div className="row">
            <input aria-label="Nueva subtarea" placeholder="Nueva subtarea" value={subTitle} onChange={(e: any) => setSubTitle(e.target.value)}
              onKeyDown={(e: any) => { if (e.key === "Enter" && subTitle.trim()) { e.preventDefault(); addSub(); } }} />
            <button disabled={!subTitle.trim()} onClick={addSub}>Añadir subtarea</button>
          </div>
          <p className="hint">Completar todas las subtareas no completa la tarea principal.</p>
          <h3>Notas vinculadas</h3>
          {task.notes.length === 0 ? <p className="muted">Sin notas vinculadas</p> :
            <ul className="plain">{task.notes.map((n) => <li key={n.id}>
              <button className="linklike" onClick={() => app.navigate(`#/notas/${n.id}`)}>{n.display_title}</button>
              {n.excerpt && <blockquote className="excerpt">{n.excerpt}</blockquote>}
            </li>)}</ul>}
        </details>

        <details open={task.links.length > 0}>
          <summary>Enlaces ({task.links.length})</summary>
          <LinksEditor value={draft.links || []} onChange={(v) => set("links", v)} />
          <p className="hint">Solo enlaces a los archivos y recursos originales; no se almacenan adjuntos.</p>
        </details>

        <details>
          <summary>Reparto semanal de esfuerzo</summary>
          <p className="hint">Opcional y explícito. Sin reparto, la estimación completa se asocia a la semana de la fecha planificada.</p>
          <ul className="plain">{task.allocations.map((a) => <li key={a.week_start}>Semana del {fmtDate(a.week_start)}: {a.hours} h
            <button className="ghost small" onClick={() => run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: a.week_start, hours: 0 }))}>Quitar</button></li>)}</ul>
          <div className="row">
            <input type="date" aria-label="Lunes de la semana" value={allocWeek} onChange={(e: any) => setAllocWeek(e.target.value ? weekStart(e.target.value) : "")} />
            <input type="number" min="0" step="0.5" aria-label="Horas" placeholder="horas" value={allocHours} onChange={(e: any) => setAllocHours(e.target.value)} />
            <button disabled={!allocWeek || allocHours === ""} onClick={() => run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: allocWeek, hours: Number(allocHours) })).then(() => setAllocHours(""))}>Guardar reparto</button>
          </div>
        </details>

        <details>
          <summary>Historial y actualizaciones</summary>
          <div className="row">
            <input aria-label="Registrar actualización" placeholder="Qué ha cambiado (cuenta como actualización significativa)" value={updateText} onChange={(e: any) => setUpdateText(e.target.value)} />
            <button disabled={!updateText.trim()} onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/update`, { text: updateText }), "Actualización registrada").then(() => setUpdateText(""))}>Registrar</button>
          </div>
          <ul className="history">{task.history.map((h, i) => <li key={i}><time>{fmtDateTime(h.at, app.tz)}</time> <span>{h.text}</span></li>)}</ul>
        </details>
      </div>

      <div className="panel-foot">
        <button className="primary" disabled={!dirtyKeys.length || saving} onClick={save}>{saving ? "Guardando…" : dirtyKeys.length ? `Guardar cambios (${dirtyKeys.length})` : "Sin cambios"}</button>
        {dirtyKeys.length > 0 && <button onClick={() => setDraft(pick(task))}>Descartar cambios</button>}
        <span className="spacer" />
        {task.recurrence_id && task.status !== "hecha" && task.status !== "cancelada" &&
          <button onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/skip`), "Ocurrencia saltada")}>Saltar ocurrencia</button>}
        {task.status !== "cancelada" && <button onClick={() => quick({ status: "cancelada" }, "Tarea cancelada")}>Cancelar tarea</button>}
        {!task.archived ? <button onClick={() => quick({ archived: true }, "Tarea archivada")}>Archivar</button> : <>
          <button onClick={() => quick({ archived: false }, "Tarea restaurada")}>Restaurar</button>
          <button className="danger" onClick={async () => {
            if (!window.confirm("¿Eliminar definitivamente esta tarea? Esta acción no se puede deshacer.")) return;
            try { await api.del(`/api/tasks/${task.id}`); app.changed(); onClose(); app.toast("Tarea eliminada", "ok"); } catch (e: any) { setError(e.message); }
          }}>Eliminar definitivamente</button></>}
      </div>
      <p className="hint pad">Ctrl+S guarda · Esc cierra</p>
    </aside>
  );

  async function addSub() {
    if (!task) return;
    try {
      await api.post("/api/tasks", { title: subTitle.trim(), parent_id: task.id, project_id: task.project_id });
      setSubTitle(""); await load(); app.changed();
    } catch (e: any) { setError(e.message); }
  }
}

function pick(t: TaskDetail): Record<string, any> {
  const o: Record<string, any> = {};
  for (const k of EDITABLE) o[k as string] = (t as any)[k];
  return o;
}
