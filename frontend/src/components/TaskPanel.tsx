import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { elapsedSinceStart, fmtDate, fmtDateTime, sinceLabel, todayIn, utcToZonedInput, weekStart, zonedToUtc } from "../lib/dates";
import { APPROVAL, CONDITION, KIND, PRIORITY, STATUS, STATUS_ORDER, describeRule } from "../lib/labels";
import { Markdown } from "../lib/markdown";
import { useApp } from "../lib/store";
import type { HistoryEntry, Task, TaskDetail } from "../lib/types";
import { emptyRule, RuleEditor, ruleIsValid, RuleValue } from "./Recurrences";
import { ReminderForm } from "./ReminderForm";
import { AccItem, AutoText, Chip, ErrorBox, Field, LinksEditor, PersonSelect, ProjectSelect, TagPicker, TaskPicker } from "./ui";

const EDITABLE: (keyof TaskDetail)[] = [
  "title", "description", "kind", "project_id", "workstream_id", "phase_id", "deliverable_id",
  "assignee_id", "reviewer_id", "due_date", "planned_date", "estimate_hours", "approval", "condition",
  "wait_reason", "wait_on", "wait_on_person_id", "wait_next_action", "follow_up_at", "follow_up_every_days",
  "next_review_at", "review_after_start_hours", "review_after_idle_hours", "review_hours_mode", "links", "started_at",
];
const KEEP_EMPTY_STRING = new Set(["title", "description", "wait_reason", "wait_on", "wait_next_action"]);

/** PATCH de tarea; si la aprobación comercial está pendiente, pide confirmación explícita. */
export async function patchTask(id: number, body: Record<string, unknown>): Promise<TaskDetail | null> {
  try {
    return await api.patch<TaskDetail>(`/api/tasks/${id}`, body);
  } catch (e) {
    if (e instanceof ApiError && e.code === "aprobacion_pendiente") {
      return window.confirm(e.message) ? api.patch<TaskDetail>(`/api/tasks/${id}`, { ...body, force: true }) : null;
    }
    throw e;
  }
}

function pick(t: TaskDetail): Record<string, any> {
  const o: Record<string, any> = {};
  for (const k of EDITABLE) o[k as string] = (t as any)[k];
  return o;
}

export function TaskPanel({ id, onClose }: { id: number; onClose: () => void }) {
  const app = useApp();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("basico");
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const load = () => api.get<TaskDetail>(`/api/tasks/${id}`).then((t) => { setTask(t); setDraft(pick(t)); setError(""); }, (e) => setError(e.message));
  useEffect(() => { void load(); }, [id]);
  useEffect(() => { api.get<Task[]>("/api/tasks?include_backlog=1").then(setAllTasks, () => undefined); }, [id, app.dataVersion]);

  const dirtyKeys = useMemo(() => task ? EDITABLE.filter((k) => JSON.stringify(draft[k as string] ?? null) !== JSON.stringify((task as any)[k] ?? null)) : [], [draft, task]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); void save(); }
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
    // conserva los cambios del borrador que no tocaba esta acción
    setTask(t);
    setDraft((d: Record<string, any>) => { const base = pick(t); for (const k of dirtyKeys) base[k as string] = d[k as string]; return base; });
    app.changed();
    if (msg) app.toast(msg, "ok");
  };
  const run = async (fn: () => Promise<TaskDetail | null>, msg?: string) => {
    setError("");
    try { after(await fn(), msg); return true; } catch (e: any) { setError(e.message); return false; }
  };
  async function save() {
    if (!task || !dirtyKeys.length) return;
    const body: Record<string, any> = {};
    for (const k of dirtyKeys) body[k as string] = draft[k as string] === "" && !KEEP_EMPTY_STRING.has(k as string) ? null : draft[k as string];
    if (typeof body.title === "string" && !body.title.trim()) { setError("El título es obligatorio"); return; }
    setSaving(true);
    setError("");
    try { const t = await patchTask(task.id, body); if (t) { setTask(t); setDraft(pick(t)); app.changed(); app.toast("Tarea guardada", "ok"); } }
    catch (e: any) { setError(e.message); }
    setSaving(false);
  }
  const quick = (body: Record<string, unknown>, msg: string) => run(() => patchTask(task.id, body), msg);
  const setTags = async (tags: string[]) => {
    if (await run(() => api.patch<TaskDetail>(`/api/tasks/${task.id}`, { tags }))) await app.reloadBoot();
  };

  const groupings = app.boot.groupings.filter((g) => g.project_id === draft.project_id);
  const deps = allTasks.filter((t) => t.id !== task.id);
  const acc = { open, setOpen };

  return (
    <aside className="panel" aria-label={`Detalle de la tarea ${task.title}`}>
      <div className="panel-head">
        <div className="grow">
          {task.parent_id && <p className="parent-line">↳ Subtarea de <button className="linklike" onClick={() => app.openTask(task.parent_id!)}>«{task.parent_title}»</button>
            <button className="ghost small" onClick={() => quick({ parent_id: null }, "Ya no es subtarea")} title="Convertir en tarea independiente">Independizar</button></p>}
          <AutoText className="title-input autotext" aria-label="Título" value={draft.title} maxRows={4} onChange={(v: string) => set("title", v.replace(/\n/g, " "))} />
        </div>
        <button className="ghost" onClick={() => { if (!dirtyKeys.length || window.confirm("Hay cambios sin guardar. ¿Cerrar sin guardar?")) onClose(); }} aria-label="Cerrar detalle (Esc)">✕</button>
      </div>
      <div className="panel-bar">
        <label className="inline">Estado <select value={task.status} onChange={(e: any) => quick({ status: e.target.value }, "Estado actualizado")}>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}</select></label>
        <label className="inline">Prioridad <select value={task.priority} onChange={(e: any) => quick({ priority: e.target.value }, "Prioridad actualizada")}>
          {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        {task.status === "backlog" && <button onClick={() => quick({ status: "pendiente" }, "Promovida a Pendiente")}>Promover a Pendiente</button>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{CONDITION[task.condition]}</Chip>}
        {task.recurrence && <Chip title={describeRule(task.recurrence)}>↻ recurrente</Chip>}
        {task.archived && <Chip>Archivada</Chip>}
      </div>
      <ErrorBox error={error} />

      <div className="panel-body">
        <AccItem id="basico" title="Básico" {...acc}>
          <DescriptionField value={draft.description || ""} onChange={(v) => set("description", v)} />
          <div className="grid2">
            <Field label="Proyecto"><ProjectSelect value={draft.project_id} onChange={(v) => setDraft((d: any) => ({ ...d, project_id: v, workstream_id: null, phase_id: null, deliverable_id: null }))} /></Field>
            <Field label="Tipo"><select value={draft.kind} onChange={(e: any) => set("kind", e.target.value)}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            {(["linea", "fase", "entregable"] as const).map((kind) => {
              const opts = groupings.filter((g) => g.kind === kind);
              if (!opts.length) return null;
              const key = kind === "linea" ? "workstream_id" : kind === "fase" ? "phase_id" : "deliverable_id";
              return <Field key={kind} label={kind === "linea" ? "Línea de trabajo" : kind === "fase" ? "Fase" : "Entregable"}>
                <select value={draft[key] ?? ""} onChange={(e: any) => set(key, e.target.value ? Number(e.target.value) : null)}>
                  <option value="">—</option>{opts.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>;
            })}
            <Field label="Responsable de ejecución"><PersonSelect value={draft.assignee_id} onChange={(v) => set("assignee_id", v)} /></Field>
            <Field label="Persona revisora"><PersonSelect value={draft.reviewer_id} onChange={(v) => set("reviewer_id", v)} emptyLabel="Sin revisor" /></Field>
            <Field label="Fecha límite"><input type="date" value={draft.due_date || ""} onChange={(e: any) => set("due_date", e.target.value || null)} /></Field>
            <Field label="Fecha planificada"><input type="date" value={draft.planned_date || ""} onChange={(e: any) => set("planned_date", e.target.value || null)} /></Field>
            <Field label="Esfuerzo estimado (h)" hint="Vacío = no informado (no cuenta como 0)">
              <input type="number" min="0" step="0.5" value={draft.estimate_hours ?? ""} onChange={(e: any) => set("estimate_hours", e.target.value === "" ? null : Number(e.target.value))} /></Field>
          </div>
          <Field label="Etiquetas" hint="Se guardan al momento. Gestiona (renombrar/eliminar) en Configuración."><TagPicker value={task.tags} onChange={setTags} /></Field>
        </AccItem>

        <AccItem id="pasos" title="Pasos y subtareas" badge={(task.steps_total + task.subtasks.length) > 0 ? <span className="count">({task.steps_done}/{task.steps_total} pasos · {task.subtasks.length} subtareas)</span> : null} {...acc}>
          <StepsAndSubtasks task={task} run={run} reload={load} />
        </AccItem>

        <AccItem id="espera" title="Espera o bloqueo" badge={task.condition ? <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{CONDITION[task.condition]}</Chip> : null} {...acc}>
          <p className="hint">Condición adicional: la tarea conserva su estado ({STATUS[task.status]}).</p>
          <div className="grid2">
            <Field label="Condición"><select value={draft.condition ?? ""} onChange={(e: any) => set("condition", e.target.value || null)}>
              <option value="">Ninguna</option><option value="espera">En espera</option><option value="bloqueada">Bloqueada</option></select></Field>
            <Field label="Depende de (persona del equipo)"><PersonSelect value={draft.wait_on_person_id} onChange={(v) => set("wait_on_person_id", v)} emptyLabel="—" /></Field>
            <Field label="Depende de (tercero)"><input value={draft.wait_on} onChange={(e: any) => set("wait_on", e.target.value)} placeholder="p. ej. sistemas del cliente" /></Field>
            <Field label="Fecha de seguimiento"><input type="datetime-local" value={utcToZonedInput(draft.follow_up_at, app.tz)} onChange={(e: any) => set("follow_up_at", e.target.value ? zonedToUtc(e.target.value, app.tz) : null)} /></Field>
            <Field label="Recordar seguimiento cada (días)"><input type="number" min="1" value={draft.follow_up_every_days ?? ""} onChange={(e: any) => set("follow_up_every_days", e.target.value ? Number(e.target.value) : null)} /></Field>
          </div>
          <Field label="Motivo"><AutoText value={draft.wait_reason} minRows={2} onChange={(v: string) => set("wait_reason", v)} placeholder="Qué falta y por qué" /></Field>
          <Field label="Próxima acción"><AutoText value={draft.wait_next_action} minRows={2} onChange={(v: string) => set("wait_next_action", v)} placeholder="Qué harás para desbloquearlo" /></Field>
          {task.condition && <FollowUp task={task} run={run} quick={quick} />}
        </AccItem>

        <AccItem id="tiempos" title="Tiempos, revisiones y recordatorios" {...acc}>
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
            <Field label="Cómputo de esas horas" hint={`Laborables: ${app.boot.settings.work_start}–${app.boot.settings.work_end}, días y festivos registrados`}>
              <select value={draft.review_hours_mode} onChange={(e: any) => set("review_hours_mode", e.target.value)}>
                <option value="natural">Tiempo natural</option><option value="laborable">Horas laborables</option></select></Field>
            <Field label="Inicio real (corregir)"><input type="datetime-local" value={utcToZonedInput(draft.started_at, app.tz)} onChange={(e: any) => set("started_at", e.target.value ? zonedToUtc(e.target.value, app.tz) : null)} /></Field>
          </div>
          <p className="hint">Zona horaria: {app.tz}. Abrir o consultar la tarea no reinicia ningún contador.</p>
          <h4>Recordatorio puntual</h4>
          <ReminderForm taskId={task.id} defaultTitle={task.wait_on ? `Contactar con ${task.wait_on}` : ""} />
        </AccItem>

        <AccItem id="repeticion" title="Repetición" badge={task.recurrence ? <span className="count">({describeRule(task.recurrence)})</span> : null} {...acc}>
          <Repetition task={task} run={run} />
        </AccItem>

        <AccItem id="aprobacion" title="Aprobación comercial" badge={task.approval !== "no_requerida" ? <Chip tone={task.approval === "aprobada" ? "neutral" : "warn"}>{APPROVAL[task.approval]}</Chip> : null} {...acc}>
          <Field label="Aprobación (independiente del estado de ejecución)" hint="Puedes preparar el análisis antes; al iniciar la ejecución sin aprobación se pide confirmación.">
            <select value={draft.approval} onChange={(e: any) => set("approval", e.target.value)}>{Object.entries(APPROVAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        </AccItem>

        <AccItem id="dependencias" title="Dependencias" badge={task.blocked_by.length + task.blocks.length ? <span className="count">({task.blocked_by.length} de las que depende · bloquea {task.blocks.length})</span> : null} {...acc}>
          <h4>Esta tarea depende de</h4>
          {task.blocked_by.length === 0 && <p className="muted">Ninguna</p>}
          <ul className="plain">{task.blocked_by.map((d) => (
            <li key={d.id} className="ref-row"><TaskRefLabel t={d} />
              {d.assignee_id === app.meId && d.status !== "hecha" && <Chip tone="info">pendiente de mí</Chip>}
              <button className="ghost small" onClick={() => run(() => api.del<TaskDetail>(`/api/tasks/${task.id}/dependencies/${d.id}`))}>Quitar</button></li>))}</ul>
          <TaskPicker tasks={deps} exclude={task.blocked_by.map((d) => d.id)} placeholder="Añadir dependencia: buscar tarea…"
            onPick={(depId) => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/dependencies`, { depends_on_id: depId }), "Dependencia añadida")} />
          <h4>Bloquea a</h4>
          {task.blocks.length === 0 ? <p className="muted">Ninguna tarea depende de esta</p> :
            <ul className="plain">{task.blocks.map((d) => <li key={d.id} className="ref-row"><TaskRefLabel t={d} /></li>)}</ul>}
        </AccItem>

        <AccItem id="notas" title="Notas vinculadas" badge={task.notes.length ? <span className="count">({task.notes.length})</span> : null} {...acc}>
          {task.notes.length === 0 && <p className="muted">Sin notas vinculadas</p>}
          <ul className="plain">{task.notes.map((n) => <li key={n.id}>
            <button className="linklike" onClick={() => app.navigate(`#/notas/${n.id}`)}>{n.display_title}</button>
            {n.excerpt && <blockquote className="excerpt">{n.excerpt}</blockquote>}</li>)}</ul>
          <button onClick={async () => {
            try { const n = await api.post<{ id: number }>("/api/notes", { task_id: task.id }); app.changed(); app.navigate(`#/notas/${n.id}`); }
            catch (e: any) { setError(e.message); }
          }}>+ Nueva nota vinculada</button>
        </AccItem>

        <AccItem id="enlaces" title="Enlaces" badge={task.links.length ? <span className="count">({task.links.length})</span> : null} {...acc}>
          <LinksEditor value={draft.links || []} onChange={(v) => set("links", v)} />
          <p className="hint">Solo enlaces a los archivos y recursos originales; no se almacenan adjuntos.</p>
        </AccItem>

        {task.estimate_hours !== null && (
          <AccItem id="reparto" title="Repartir esfuerzo entre semanas (opcional)" {...acc}>
            <Allocation task={task} run={run} />
          </AccItem>)}

        <AccItem id="historial" title="Historial y actualizaciones" {...acc}>
          <History task={task} run={run} />
        </AccItem>
      </div>

      <div className="panel-foot">
        <button className="primary" disabled={!dirtyKeys.length || saving} onClick={save}>{saving ? "Guardando…" : dirtyKeys.length ? `Guardar cambios (${dirtyKeys.length})` : "Sin cambios"}</button>
        {dirtyKeys.length > 0 && <button onClick={() => setDraft(pick(task))}>Descartar</button>}
        <span className="spacer" />
        {task.recurrence_id && task.status !== "hecha" && task.status !== "cancelada" &&
          <button onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/skip`), "Ocurrencia saltada")}>Saltar ocurrencia</button>}
        {task.status !== "cancelada" && <button onClick={() => quick({ status: "cancelada" }, "Tarea cancelada")}>Cancelar tarea</button>}
        {!task.archived ? <button onClick={() => quick({ archived: true }, "Tarea archivada (Trabajo → Archivadas)")}>Archivar</button> : <>
          <button onClick={() => quick({ archived: false }, "Tarea restaurada")}>Restaurar</button>
          <button className="danger" onClick={async () => {
            if (!window.confirm("¿Eliminar definitivamente esta tarea? No se puede deshacer.")) return;
            try { await api.del(`/api/tasks/${task.id}`); app.changed(); onClose(); app.toast("Tarea eliminada", "ok"); } catch (e: any) { setError(e.message); }
          }}>Eliminar definitivamente</button></>}
      </div>
      <p className="hint pad">Ctrl+S guarda · Esc cierra</p>
    </aside>
  );
}

function TaskRefLabel({ t }: { t: { id: number; title: string; status: string; project_id: number | null; assignee_id: number | null } }) {
  const app = useApp();
  return <span className="ref">
    <button className="linklike" onClick={() => app.openTask(t.id)}>{t.title}</button>
    <span className="muted small"> · {[app.project(t.project_id)?.name, STATUS[t.status as keyof typeof STATUS], app.person(t.assignee_id)?.name].filter(Boolean).join(" · ")}</span>
  </span>;
}

function DescriptionField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="field">
      <div className="row tight"><span className="field-label">Descripción</span><span className="spacer" />
        <button className="ghost small" onClick={() => setPreview(!preview)} aria-pressed={preview}>{preview ? "Editar" : "Vista previa"}</button></div>
      {preview ? <Markdown text={value} /> : <AutoText value={value} minRows={3} maxRows={14} onChange={onChange} aria-label="Descripción" placeholder="Texto libre (admite Markdown)" />}
    </div>
  );
}

type Run = (fn: () => Promise<TaskDetail | null>, msg?: string) => Promise<boolean>;

function StepsAndSubtasks({ task, run }: { task: TaskDetail; run: Run; reload: () => void }) {
  const app = useApp();
  const [text, setText] = useState("");
  const addStep = async () => { if (text.trim() && await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/steps`, { text: text.trim() }))) setText(""); };
  const addSub = async () => {
    if (!text.trim()) return;
    try {
      const sub = await api.post<TaskDetail>("/api/tasks", { title: text.trim(), parent_id: task.id, project_id: task.project_id, assignee_id: task.assignee_id });
      setText(""); app.changed(); app.toast(`Subtarea creada: ${sub.title}`, "ok", { label: "Abrir", run: () => app.openTask(sub.id) });
      await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`));
    } catch (e: any) { app.toast(e.message, "error"); }
  };
  return (
    <div>
      <div className="row">
        <input className="grow" aria-label="Nuevo paso o subtarea" placeholder="Describe el paso o la subtarea…" value={text} onChange={(e: any) => setText(e.target.value)}
          onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); if (e.ctrlKey || e.metaKey) void addSub(); else void addStep(); } }} />
        <button disabled={!text.trim()} onClick={addStep} title="Enter">Añadir paso</button>
        <button disabled={!text.trim()} onClick={addSub} title="Ctrl+Enter">Añadir subtarea</button>
      </div>
      <p className="hint"><strong>Paso</strong>: casilla dentro de esta tarea (no aparece en tablero, lista ni calendario). <strong>Subtarea</strong>: tarea completa con su responsable y fechas, visible en todas las vistas con la marca «↳ Subtarea de…». Completar pasos o subtareas no completa esta tarea.</p>
      {task.steps.length > 0 && <>
        <h4>Pasos ({task.steps.filter((s) => s.done).length}/{task.steps.length})</h4>
        <ul className="plain steps">{task.steps.map((s) => (
          <li key={s.id} className={s.done ? "done" : ""}>
            <label className="check grow"><input type="checkbox" checked={s.done} onChange={(e: any) => run(() => api.patch<TaskDetail>(`/api/steps/${s.id}`, { done: e.target.checked }))} /><span className="step-text">{s.text}</span></label>
            <button className="ghost small" onClick={() => { const v = window.prompt("Editar paso:", s.text); if (v?.trim()) void run(() => api.patch<TaskDetail>(`/api/steps/${s.id}`, { text: v.trim() })); }}>Editar</button>
            <button className="ghost small" title="Convertir en subtarea completa" onClick={async () => {
              try { const sub = await api.post<TaskDetail>(`/api/steps/${s.id}/promote`); app.changed(); app.toast(`Convertido en subtarea: ${sub.title}`, "ok"); await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`)); }
              catch (e: any) { app.toast(e.message, "error"); }
            }}>→ Subtarea</button>
            <button className="ghost small" aria-label={`Eliminar paso ${s.text}`} onClick={() => run(() => api.del<TaskDetail>(`/api/steps/${s.id}`))}>✕</button>
          </li>))}</ul></>}
      {task.subtasks.length > 0 && <>
        <h4>Subtareas ({task.subtasks.filter((s) => s.status === "hecha" || s.status === "cancelada").length}/{task.subtasks.length})</h4>
        <ul className="plain">{task.subtasks.map((s) => (
          <li key={s.id} className="ref-row"><TaskRefLabel t={s} />{s.due_date && <span className="muted small"> · {fmtDate(s.due_date)}</span>}
            {s.estimate_hours !== null && <span className="muted small"> · {s.estimate_hours} h</span>}</li>))}</ul></>}
    </div>
  );
}

function FollowUp({ task, run, quick }: { task: TaskDetail; run: Run; quick: (b: Record<string, unknown>, m: string) => Promise<boolean> }) {
  const app = useApp();
  const [text, setText] = useState("");
  return (
    <div className="subtle-box">
      <p>Desde: {fmtDateTime(task.wait_since, app.tz)} · Último seguimiento: {task.last_follow_up_at ? fmtDateTime(task.last_follow_up_at, app.tz) : "ninguno registrado"}</p>
      <AutoText value={text} onChange={setText} minRows={1} aria-label="Nota del seguimiento" placeholder="Nota del seguimiento (opcional)" />
      <div className="row">
        <button onClick={async () => { if (await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/follow-up`, { text }), "Seguimiento registrado (la espera continúa)")) setText(""); }}>Seguimiento realizado</button>
        <button onClick={() => quick({ condition: null }, "Espera/bloqueo resuelto")}>Marcar resuelto</button>
      </div>
      <p className="hint">«Recordar contactar» no envía nada: solo te lo recuerda.</p>
    </div>
  );
}

function Repetition({ task, run }: { task: TaskDetail; run: Run }) {
  const app = useApp();
  const [rule, setRule] = useState<RuleValue>(emptyRule(task.due_date || todayIn(app.tz)));
  if (task.recurrence) {
    const r = task.recurrence;
    return <div>
      <p><strong>{describeRule(r)}</strong> · desde {fmtDate(r.start_date)}{r.end_date ? ` hasta ${fmtDate(r.end_date)}` : ""} · {r.active ? "activa" : "pausada"}</p>
      <p className="hint">Esta tarea es una ocurrencia de la serie (fecha {fmtDate(task.occurrence_date)}). Lo que cambies aquí solo afecta a esta ocurrencia.</p>
      <div className="row">
        <button onClick={async () => { await api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`), r.active ? "Serie pausada: no se generarán más ocurrencias" : "Serie reactivada"); }}>{r.active ? "Pausar la serie" : "Reactivar la serie"}</button>
        <button onClick={async () => {
          const fields = { title: task.title, assignee_id: task.assignee_id, priority: task.priority, estimate_hours: task.estimate_hours, project_id: task.project_id };
          if (!window.confirm("¿Aplicar título, responsable, proyecto, prioridad y estimación de esta tarea a la serie y a sus ocurrencias futuras pendientes?")) return;
          await api.patch(`/api/recurrences/${r.id}`, { ...fields, apply_to_future: true });
          await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`), "Aplicado a esta y a las futuras");
        }}>Aplicar estos datos a las futuras</button>
      </div>
    </div>;
  }
  return <div>
    <p className="hint">Convierte esta tarea en la primera de una serie. Las siguientes se crean solas (hasta {app.boot.settings.recurrence_horizon_days} días vista) con el mismo título, responsable, proyecto y prioridad.</p>
    <RuleEditor value={rule} onChange={setRule} />
    <button className="primary" disabled={!ruleIsValid(rule)} onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/recurrence`, {
      rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [], interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null,
      start_date: rule.start_date, end_date: rule.end_date, non_working: rule.non_working }), "La tarea ahora se repite")}>Hacer recurrente</button>
  </div>;
}

function Allocation({ task, run }: { task: TaskDetail; run: Run }) {
  const app = useApp();
  const [week, setWeek] = useState(weekStart(task.planned_date || todayIn(app.tz)));
  const [hours, setHours] = useState("");
  const assigned = task.allocations.reduce((a, b) => a + b.hours, 0);
  return <div>
    <p className="hint">Solo es útil para tareas grandes que ocupan varias semanas. En la <em>Planificación semanal</em> de Equipo, una tarea suma su
      estimación completa ({task.estimate_hours} h) en la semana de su fecha planificada. Si va a repartirse (p. ej. 30 h en 3 semanas), indica aquí
      cuántas horas corresponden a cada semana y la planificación usará esas cifras. Nada se reparte automáticamente.</p>
    {task.allocations.length > 0 && <ul className="plain">{task.allocations.map((a) => <li key={a.week_start}>Semana del {fmtDate(a.week_start)}: {a.hours} h
      <button className="ghost small" onClick={() => run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: a.week_start, hours: 0 }))}>Quitar</button></li>)}</ul>}
    {task.allocations.length > 0 && <p className="muted small">Repartidas {assigned} h de {task.estimate_hours} h estimadas.</p>}
    <div className="row">
      <label className="inline">Semana del <input type="date" value={week} onChange={(e: any) => setWeek(e.target.value ? weekStart(e.target.value) : "")} /></label>
      <input type="number" min="0" step="0.5" aria-label="Horas" placeholder="horas" value={hours} onChange={(e: any) => setHours(e.target.value)} />
      <button disabled={!week || hours === ""} onClick={async () => { if (await run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: week, hours: Number(hours) }))) setHours(""); }}>Guardar</button>
    </div>
  </div>;
}

function History({ task, run }: { task: TaskDetail; run: Run }) {
  const app = useApp();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const add = async () => { if (text.trim() && await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/update`, { text: text.trim() }), "Actualización registrada")) setText(""); };
  const saveEdit = async () => { if (editing && editing.text.trim() && await run(() => api.patch<TaskDetail>(`/api/tasks/${task.id}/history/${editing.id}`, { text: editing.text.trim() }), "Actualización corregida")) setEditing(null); };
  const kindLabel = (h: HistoryEntry) => h.kind === "actualizacion" ? "Nota" : h.kind === "seguimiento" ? "Seguimiento" : "Auto";
  return <div>
    <AutoText value={text} onChange={setText} minRows={3} maxRows={12} aria-label="Registrar actualización"
      placeholder="Qué se ha hecho, qué ha cambiado o una nota personal (cuenta como actualización significativa). Ctrl+Enter para registrar."
      onKeyDown={(e: any) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void add(); } }} />
    <div className="row"><button disabled={!text.trim()} onClick={add}>Registrar actualización</button>
      <span className="hint">Tus notas se pueden editar; los cambios automáticos no (sirven de registro).</span></div>
    <ul className="history">{task.history.map((h) => (
      <li key={h.id} className={`h-${h.kind}`}>
        <div className="h-meta"><span className={`h-kind h-kind-${h.kind}`}>{kindLabel(h)}</span> <time>{fmtDateTime(h.at, app.tz)}</time>
          {h.edited_at && <span className="muted small"> · editada {fmtDateTime(h.edited_at, app.tz)}</span>}
          {h.editable && editing?.id !== h.id && <button className="ghost small" onClick={() => setEditing({ id: h.id, text: h.text })}>Editar</button>}</div>
        {editing?.id === h.id ? <div>
          <AutoText value={editing.text} onChange={(v: string) => setEditing({ id: h.id, text: v })} minRows={2} maxRows={12} aria-label="Editar actualización"
            onKeyDown={(e: any) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void saveEdit(); } if (e.key === "Escape") { e.stopPropagation(); setEditing(null); } }} />
          <div className="row tight"><button className="small primary" onClick={saveEdit}>Guardar</button><button className="small" onClick={() => setEditing(null)}>Cancelar</button></div>
        </div> : <div className="h-text">{h.text}</div>}
      </li>))}</ul>
  </div>;
}
