import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { elapsedSinceStart, fmtDate, fmtDateTime, sinceLabel, todayIn, utcToZonedInput, weekStart, zonedToUtc } from "../lib/dates";
import { t } from "../lib/i18n";
import { APPROVAL, CONDITION, KIND, PRIORITY, STATUS, STATUS_ORDER, describeRule, describeSchedule } from "../lib/labels";
import { Markdown } from "../lib/markdown";
import { useApp } from "../lib/store";
import type { HistoryEntry, Task, TaskDetail } from "../lib/types";
import { DateInput, DateTimeInput } from "./DateInput";
import { DeleteSeriesDialog, emptyRule, RuleEditor, ruleIsValid, RuleValue } from "./Recurrences";
import { TaskReminders } from "./ReminderCenter";
import { ReminderForm } from "./ReminderForm";
import { AccItem, AutoText, Chip, ErrorBox, Field, LinksEditor, PersonSelect, ProjectSelect, TagPicker, TaskPicker } from "./ui";

const EDITABLE: (keyof TaskDetail)[] = [
  "title", "description", "kind", "project_id", "workstream_id", "phase_id", "deliverable_id",
  "assignee_id", "reviewer_id", "due_date", "planned_date", "estimate_hours", "approval", "condition",
  "wait_reason", "wait_on", "wait_on_person_id", "wait_next_action", "follow_up_at", "follow_up_every_days",
  "next_review_at", "review_after_start_hours", "review_after_idle_hours", "review_hours_mode", "links", "started_at",
];
const KEEP_EMPTY_STRING = new Set(["title", "description", "wait_reason", "wait_on", "wait_next_action"]);

/** PATCH de tarea; si la aprobación comercial está pendiente, pide confirmación explícita.
 * Con undo=true el servidor guarda una instantánea y devuelve undo_id para «Deshacer». */
export async function patchTask(id: number, body: Record<string, unknown>, undo = false): Promise<TaskDetail | null> {
  const url = `/api/tasks/${id}${undo ? "?undo=1" : ""}`;
  try {
    return await api.patch<TaskDetail>(url, body);
  } catch (e) {
    if (e instanceof ApiError && e.code === "aprobacion_pendiente") {
      return window.confirm(e.message) ? api.patch<TaskDetail>(url, { ...body, force: true }) : null;
    }
    throw e;
  }
}

function pick(task: TaskDetail): Record<string, any> {
  const o: Record<string, any> = {};
  for (const k of EDITABLE) o[k as string] = (task as any)[k];
  return o;
}

/** Fecha y hora UTC ↔ campo local en la zona configurada. */
function UtcDateTime({ value, onChange, label }: { value: string | null; onChange: (v: string | null) => void; label: string }) {
  const app = useApp();
  return <DateTimeInput label={label} value={utcToZonedInput(value, app.tz) || null} onChange={(v) => onChange(v ? zonedToUtc(v, app.tz) : null)} />;
}

export function TaskPanel({ id, onClose }: { id: number; onClose: () => void }) {
  const app = useApp();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState<string | null>("basico");
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const load = () => api.get<TaskDetail>(`/api/tasks/${id}`).then((x) => { setTask(x); setDraft(pick(x)); setError(""); }, (e) => setError(e.message));
  useEffect(() => { void load(); }, [id]);
  useEffect(() => { api.get<Task[]>("/api/tasks?include_backlog=1").then(setAllTasks, () => undefined); }, [id, app.dataVersion]);

  const dirtyKeys = useMemo(() => task ? EDITABLE.filter((k) => JSON.stringify(draft[k as string] ?? null) !== JSON.stringify((task as any)[k] ?? null)) : [], [draft, task]);
  // Tras «Deshacer» u otros cambios externos se recarga la tarea (si no hay cambios sin guardar en el formulario)
  useEffect(() => { if (task && !dirtyKeys.length) void load(); }, [app.dataVersion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); void save(); }
      if (e.key === "Escape" && !document.querySelector(".modal") && !document.querySelector(".date-popup")) {
        if (dirtyKeys.length && !window.confirm(t("Hay cambios sin guardar en la tarea. ¿Cerrar sin guardar?"))) return;
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!task) return <aside className="panel" aria-label={t("Detalle de tarea")}><ErrorBox error={error} onRetry={load} />{!error && <p className="muted pad">{t("Cargando…")}</p>}</aside>;

  const set = (k: string, v: any) => setDraft((d: Record<string, any>) => ({ ...d, [k]: v }));
  const after = (x: TaskDetail | null, msg?: string) => {
    if (!x) return;
    // conserva los cambios del borrador que no tocaba esta acción
    setTask(x);
    setDraft((d: Record<string, any>) => { const base = pick(x); for (const k of dirtyKeys) base[k as string] = d[k as string]; return base; });
    app.changed();
    if (msg) { if (x.undo_id) app.undoable(msg, x.undo_id); else app.toast(msg, "ok"); }
  };
  const run = async (fn: () => Promise<TaskDetail | null>, msg?: string) => {
    setError("");
    try { after(await fn(), msg); return true; } catch (e: any) { setError(e.message); return false; }
  };
  /** Guarda los cambios pendientes del formulario. Devuelve false si hay un error. */
  async function save(): Promise<boolean> {
    if (!task || !dirtyKeys.length) return true;
    const body: Record<string, any> = {};
    for (const k of dirtyKeys) body[k as string] = draft[k as string] === "" && !KEEP_EMPTY_STRING.has(k as string) ? null : draft[k as string];
    if (typeof body.title === "string" && !body.title.trim()) { setError(t("El título es obligatorio")); return false; }
    setSaving(true);
    setError("");
    let ok = false;
    try { const x = await patchTask(task.id, body); if (x) { setTask(x); setDraft(pick(x)); app.changed(); app.toast(t("Tarea guardada"), "ok"); ok = true; } }
    catch (e: any) { setError(e.message); }
    setSaving(false);
    return ok;
  }
  /** Acción directa con «Deshacer». */
  const quick = (body: Record<string, unknown>, msg: string) => run(() => patchTask(task.id, body, true), msg);
  const setTags = async (tags: string[]) => {
    if (await run(() => api.patch<TaskDetail>(`/api/tasks/${task.id}`, { tags }))) await app.reloadBoot();
  };

  const groupings = app.boot.groupings.filter((g) => g.project_id === draft.project_id);
  const deps = allTasks.filter((x) => x.id !== task.id);
  const acc = { open, setOpen };

  return (
    <aside className="panel" aria-label={t("Detalle de la tarea {titulo}", { titulo: task.title })}>
      <div className="panel-head">
        <div className="grow">
          {task.parent_id && <p className="parent-line">↳ {t("Subtarea de")} <button className="linklike" onClick={() => app.openTask(task.parent_id!)}>«{task.parent_title}»</button>
            <button className="ghost small" onClick={() => run(() => patchTask(task.id, { parent_id: null }), t("Ya no es subtarea"))} title={t("Convertir en tarea independiente")}>{t("Independizar")}</button></p>}
          <AutoText className="title-input autotext" aria-label={t("Título")} value={draft.title} maxRows={4} onChange={(v: string) => set("title", v.replace(/\n/g, " "))} />
        </div>
        <button className="ghost" onClick={() => { if (!dirtyKeys.length || window.confirm(t("Hay cambios sin guardar. ¿Cerrar sin guardar?"))) onClose(); }} aria-label={t("Cerrar detalle (Esc)")}>✕</button>
      </div>
      <div className="panel-bar">
        <label className="inline">{t("Estado")} <select value={task.status} onChange={(e: any) => quick({ status: e.target.value }, t("Estado: {estado}", { estado: STATUS[e.target.value as keyof typeof STATUS] }))}>
          {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}</select></label>
        <label className="inline">{t("Prioridad")} <select value={task.priority} onChange={(e: any) => run(() => patchTask(task.id, { priority: e.target.value }), t("Prioridad actualizada"))}>
          {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        {task.status === "backlog" && <button onClick={() => quick({ status: "pendiente" }, t("Promovida a Pendiente"))}>{t("Promover a Pendiente")}</button>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{CONDITION[task.condition]}</Chip>}
        {task.recurrence && <Chip title={describeRule(task.recurrence)}>↻ {t("recurrente")}</Chip>}
        {task.archived && <Chip>{t("Archivada")}</Chip>}
      </div>
      <ErrorBox error={error} />

      <div className="panel-body">
        <AccItem id="basico" title={t("Básico")} {...acc}>
          <DescriptionField value={draft.description || ""} onChange={(v) => set("description", v)} />
          <div className="grid2">
            <Field label={t("Proyecto")}><ProjectSelect value={draft.project_id} onChange={(v) => setDraft((d: any) => ({ ...d, project_id: v, workstream_id: null, phase_id: null, deliverable_id: null }))} /></Field>
            <Field label={t("Tipo")}><select value={draft.kind} onChange={(e: any) => set("kind", e.target.value)}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            {(["linea", "fase", "entregable"] as const).map((kind) => {
              const opts = groupings.filter((g) => g.kind === kind);
              if (!opts.length) return null;
              const key = kind === "linea" ? "workstream_id" : kind === "fase" ? "phase_id" : "deliverable_id";
              return <Field key={kind} label={kind === "linea" ? t("Línea de trabajo") : kind === "fase" ? t("Fase") : t("Entregable")}>
                <select value={draft[key] ?? ""} onChange={(e: any) => set(key, e.target.value ? Number(e.target.value) : null)}>
                  <option value="">—</option>{opts.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>;
            })}
            <Field label={t("Responsable de ejecución")}><PersonSelect value={draft.assignee_id} onChange={(v) => set("assignee_id", v)} /></Field>
            <Field label={t("Persona revisora")}><PersonSelect value={draft.reviewer_id} onChange={(v) => set("reviewer_id", v)} emptyLabel={t("Sin revisor")} /></Field>
            <Field label={t("Fecha límite")}><DateInput label={t("Fecha límite")} value={draft.due_date} onChange={(v) => set("due_date", v)} /></Field>
            <Field label={t("Fecha planificada")}><DateInput label={t("Fecha planificada")} value={draft.planned_date} onChange={(v) => set("planned_date", v)} /></Field>
            <Field label={t("Esfuerzo estimado (h)")} hint={t("Vacío = no informado (no cuenta como 0)")}>
              <input type="number" min="0" step="0.5" value={draft.estimate_hours ?? ""} onChange={(e: any) => set("estimate_hours", e.target.value === "" ? null : Number(e.target.value))} /></Field>
          </div>
          <Field label={t("Etiquetas")} hint={t("Se guardan al momento. Gestiona (renombrar/eliminar) en Configuración.")}><TagPicker value={task.tags} onChange={setTags} /></Field>
        </AccItem>
        <AccItem id="pasos" title={t("Pasos y subtareas")} badge={(task.steps_total + task.subtasks.length) > 0 ? <span className="count">({t("{hechos}/{total} pasos · {n} subtareas", { hechos: task.steps_done, total: task.steps_total, n: task.subtasks.length })})</span> : null} {...acc}>
          <StepsAndSubtasks task={task} run={run} reload={load} />
        </AccItem>
        <AccItem id="espera" title={t("Espera o bloqueo")} badge={task.condition ? <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{CONDITION[task.condition]}</Chip> : null} {...acc}>
          <p className="hint">{t("Condición adicional: la tarea conserva su estado ({estado}).", { estado: STATUS[task.status] })}</p>
          <div className="grid2">
            <Field label={t("Condición")}><select value={draft.condition ?? ""} onChange={(e: any) => set("condition", e.target.value || null)}>
              <option value="">{t("Ninguna")}</option><option value="espera">{t("En espera")}</option><option value="bloqueada">{t("Bloqueada")}</option></select></Field>
            <Field label={t("Depende de (persona del equipo)")}><PersonSelect value={draft.wait_on_person_id} onChange={(v) => set("wait_on_person_id", v)} emptyLabel="—" /></Field>
            <Field label={t("Depende de (tercero)")}><input value={draft.wait_on} onChange={(e: any) => set("wait_on", e.target.value)} placeholder={t("p. ej. sistemas del cliente")} /></Field>
            <Field label={t("Fecha de seguimiento")}><UtcDateTime label={t("Fecha de seguimiento")} value={draft.follow_up_at} onChange={(v) => set("follow_up_at", v)} /></Field>
            <Field label={t("Recordar seguimiento cada (días)")}><input type="number" min="1" value={draft.follow_up_every_days ?? ""} onChange={(e: any) => set("follow_up_every_days", e.target.value ? Number(e.target.value) : null)} /></Field>
          </div>
          <Field label={t("Motivo")}><AutoText value={draft.wait_reason} minRows={2} onChange={(v: string) => set("wait_reason", v)} placeholder={t("Qué falta y por qué")} /></Field>
          <Field label={t("Próxima acción")}><AutoText value={draft.wait_next_action} minRows={2} onChange={(v: string) => set("wait_next_action", v)} placeholder={t("Qué harás para desbloquearlo")} /></Field>
          {task.condition && <FollowUp task={task} run={run} quick={quick} />}
        </AccItem>
        <AccItem id="tiempos" title={t("Tiempos, revisiones y recordatorios")} {...acc}>
          <dl className="facts">
            <dt>{t("Tiempo desde el inicio")}</dt><dd>{elapsedSinceStart(task.started_at, task.completed_at)} <span className="hint">{t("(no equivale a dedicación ni a horas trabajadas)")}</span></dd>
            <dt>{t("Última actualización significativa")}</dt><dd>{sinceLabel(task.last_significant_update)} · {fmtDateTime(task.last_significant_update, app.tz)}</dd>
            <dt>{t("Inicio real")}</dt><dd>{task.started_at ? fmtDateTime(task.started_at, app.tz) : t("no informado")}</dd>
            <dt>{t("Finalización")}</dt><dd>{task.completed_at ? fmtDateTime(task.completed_at, app.tz) : "—"}</dd>
          </dl>
          <div className="grid2">
            <Field label={t("Revisar en fecha y hora")}><UtcDateTime label={t("Revisar en fecha y hora")} value={draft.next_review_at} onChange={(v) => set("next_review_at", v)} /></Field>
            <Field label={t("Revisar tras (h) desde el inicio")}><input type="number" min="1" value={draft.review_after_start_hours ?? ""} onChange={(e: any) => set("review_after_start_hours", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label={t("Revisar tras (h) sin actualización")}><input type="number" min="1" value={draft.review_after_idle_hours ?? ""} onChange={(e: any) => set("review_after_idle_hours", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label={t("Cómputo de esas horas")} hint={t("Laborables: {horario}; sin festivos registrados", { horario: describeSchedule(app.boot.settings.work_schedule) })}>
              <select value={draft.review_hours_mode} onChange={(e: any) => set("review_hours_mode", e.target.value)}>
                <option value="natural">{t("Tiempo natural")}</option><option value="laborable">{t("Horas laborables")}</option></select></Field>
            <Field label={t("Inicio real (corregir)")}><UtcDateTime label={t("Inicio real (corregir)")} value={draft.started_at} onChange={(v) => set("started_at", v)} /></Field>
          </div>
          <p className="hint">{t("Zona horaria: {zona}. Abrir o consultar la tarea no reinicia ningún contador.", { zona: app.tz })}</p>
          <h4>{t("Recordatorios de esta tarea")}</h4>
          <TaskReminders key={app.dataVersion} taskId={task.id} />
          <h4>{t("Recordatorio puntual")}</h4>
          <ReminderForm taskId={task.id} defaultTitle={task.wait_on ? t("Contactar con {quien}", { quien: task.wait_on }) : ""} />
        </AccItem>
        <AccItem id="repeticion" title={t("Repetición")} badge={task.recurrence ? <span className="count">({describeRule(task.recurrence)})</span> : null} {...acc}>
          <Repetition task={task} run={run} saveFirst={save} dirty={dirtyKeys.length > 0} onDeleted={() => { void load(); app.changed(); }} />
        </AccItem>
        <AccItem id="aprobacion" title={t("Aprobación comercial")} badge={task.approval !== "no_requerida" ? <Chip tone={task.approval === "aprobada" ? "neutral" : "warn"}>{APPROVAL[task.approval]}</Chip> : null} {...acc}>
          <Field label={t("Aprobación (independiente del estado de ejecución)")} hint={t("Puedes preparar el análisis antes; al iniciar la ejecución sin aprobación se pide confirmación.")}>
            <select value={draft.approval} onChange={(e: any) => set("approval", e.target.value)}>{Object.entries(APPROVAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        </AccItem>
        <AccItem id="dependencias" title={t("Dependencias")} badge={task.blocked_by.length + task.blocks.length ? <span className="count">({t("{n} de las que depende · bloquea {m}", { n: task.blocked_by.length, m: task.blocks.length })})</span> : null} {...acc}>
          <h4>{t("Esta tarea depende de")}</h4>
          {task.blocked_by.length === 0 && <p className="muted">{t("Ninguna")}</p>}
          <ul className="plain">{task.blocked_by.map((d) => (
            <li key={d.id} className="ref-row"><TaskRefLabel task={d} />
              {d.assignee_id === app.meId && d.status !== "hecha" && <Chip tone="info">{t("pendiente de mí")}</Chip>}
              <button className="ghost small" onClick={() => run(() => api.del<TaskDetail>(`/api/tasks/${task.id}/dependencies/${d.id}`))}>{t("Quitar")}</button></li>))}</ul>
          <TaskPicker tasks={deps} exclude={task.blocked_by.map((d) => d.id)} placeholder={t("Añadir dependencia: buscar tarea…")}
            onPick={(depId) => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/dependencies`, { depends_on_id: depId }), t("Dependencia añadida"))} />
          <h4>{t("Bloquea a")}</h4>
          {task.blocks.length === 0 ? <p className="muted">{t("Ninguna tarea depende de esta")}</p> :
            <ul className="plain">{task.blocks.map((d) => <li key={d.id} className="ref-row"><TaskRefLabel task={d} /></li>)}</ul>}
        </AccItem>
        <AccItem id="notas" title={t("Notas vinculadas")} badge={task.notes.length ? <span className="count">({task.notes.length})</span> : null} {...acc}>
          {task.notes.length === 0 && <p className="muted">{t("Sin notas vinculadas")}</p>}
          <ul className="plain">{task.notes.map((n) => <li key={n.id}>
            <button className="linklike" onClick={() => app.navigate(`#/notas/${n.id}`)}>{n.display_title}</button>
            {n.excerpt && <blockquote className="excerpt">{n.excerpt}</blockquote>}</li>)}</ul>
          <button onClick={async () => {
            try { const n = await api.post<{ id: number }>("/api/notes", { task_id: task.id }); app.changed(); app.navigate(`#/notas/${n.id}`); }
            catch (e: any) { setError(e.message); }
          }}>{t("+ Nueva nota vinculada")}</button>
        </AccItem>
        <AccItem id="enlaces" title={t("Enlaces")} badge={task.links.length ? <span className="count">({task.links.length})</span> : null} {...acc}>
          <LinksEditor value={draft.links || []} onChange={(v) => set("links", v)} />
          <p className="hint">{t("Solo enlaces a los archivos y recursos originales; no se almacenan adjuntos.")}</p>
        </AccItem>
        {task.estimate_hours !== null && (
          <AccItem id="reparto" title={t("Repartir esfuerzo entre semanas (opcional)")} {...acc}>
            <Allocation task={task} run={run} />
          </AccItem>)}
        <AccItem id="historial" title={t("Historial y actualizaciones")} {...acc}>
          <History task={task} run={run} />
        </AccItem>
      </div>
      <div className="panel-foot">
        <button className="primary" disabled={!dirtyKeys.length || saving} onClick={() => void save()}>{saving ? t("Guardando…") : dirtyKeys.length ? t("Guardar cambios ({n})", { n: dirtyKeys.length }) : t("Sin cambios")}</button>
        {dirtyKeys.length > 0 && <button onClick={() => setDraft(pick(task))}>{t("Descartar")}</button>}
        <span className="spacer" />
        {task.recurrence_id && task.status !== "hecha" && task.status !== "cancelada" &&
          <button onClick={() => run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/skip?undo=1`), t("Ocurrencia saltada"))}>{t("Saltar ocurrencia")}</button>}
        {task.status !== "cancelada" && <button onClick={() => quick({ status: "cancelada" }, t("Tarea cancelada"))}>{t("Cancelar tarea")}</button>}
        {!task.archived ? <button onClick={() => quick({ archived: true }, t("Tarea archivada (Trabajo → Archivadas)"))}>{t("Archivar")}</button> : <>
          <button onClick={() => quick({ archived: false }, t("Tarea restaurada"))}>{t("Restaurar")}</button>
          <button className="danger" onClick={async () => {
            if (!window.confirm(t("¿Eliminar definitivamente esta tarea? No se puede deshacer."))) return;
            try { await api.del(`/api/tasks/${task.id}`); app.changed(); onClose(); app.toast(t("Tarea eliminada"), "ok"); } catch (e: any) { setError(e.message); }
          }}>{t("Eliminar definitivamente")}</button></>}
      </div>
      <p className="hint pad">{t("Ctrl+S guarda · Esc cierra")}</p>
    </aside>
  );
}

function TaskRefLabel({ task }: { task: { id: number; title: string; status: string; project_id: number | null; assignee_id: number | null } }) {
  const app = useApp();
  return <span className="ref">
    <button className="linklike" onClick={() => app.openTask(task.id)}>{task.title}</button>
    <span className="muted small"> · {[app.project(task.project_id)?.name, STATUS[task.status as keyof typeof STATUS], app.person(task.assignee_id)?.name].filter(Boolean).join(" · ")}</span>
  </span>;
}

function DescriptionField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="field">
      <div className="row tight"><span className="field-label">{t("Descripción")}</span><span className="spacer" />
        <button className="ghost small" onClick={() => setPreview(!preview)} aria-pressed={preview}>{preview ? t("Editar") : t("Vista previa")}</button></div>
      {preview ? <Markdown text={value} /> : <AutoText value={value} minRows={3} maxRows={14} onChange={onChange} aria-label={t("Descripción")} placeholder={t("Texto libre (admite Markdown)")} />}
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
      setText(""); app.changed(); app.toast(t("Subtarea creada: {titulo}", { titulo: sub.title }), "ok", { label: t("Abrir"), run: () => app.openTask(sub.id) });
      await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`));
    } catch (e: any) { app.toast(e.message, "error"); }
  };
  return (
    <div>
      <div className="row">
        <input className="grow" aria-label={t("Nuevo paso o subtarea")} placeholder={t("Describe el paso o la subtarea…")} value={text} onChange={(e: any) => setText(e.target.value)}
          onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); if (e.ctrlKey || e.metaKey) void addSub(); else void addStep(); } }} />
        <button disabled={!text.trim()} onClick={addStep} title="Enter">{t("Añadir paso")}</button>
        <button disabled={!text.trim()} onClick={addSub} title="Ctrl+Enter">{t("Añadir subtarea")}</button>
      </div>
      <p className="hint">{t("Paso: casilla dentro de esta tarea (no aparece en tablero, lista ni calendario). Subtarea: tarea completa con su responsable y fechas, visible en todas las vistas con la marca «↳ Subtarea de…». Completar pasos o subtareas no completa esta tarea.")}</p>
      {task.steps.length > 0 && <>
        <h4>{t("Pasos ({hechos}/{total})", { hechos: task.steps.filter((s) => s.done).length, total: task.steps.length })}</h4>
        <ul className="plain steps">{task.steps.map((s) => (
          <li key={s.id} className={s.done ? "done" : ""}>
            <label className="check grow"><input type="checkbox" checked={s.done} onChange={(e: any) => run(() => api.patch<TaskDetail>(`/api/steps/${s.id}`, { done: e.target.checked }))} /><span className="step-text">{s.text}</span></label>
            <button className="ghost small" onClick={() => { const v = window.prompt(t("Editar paso:"), s.text); if (v?.trim()) void run(() => api.patch<TaskDetail>(`/api/steps/${s.id}`, { text: v.trim() })); }}>{t("Editar")}</button>
            <button className="ghost small" title={t("Convertir en subtarea completa")} onClick={async () => {
              try { const sub = await api.post<TaskDetail>(`/api/steps/${s.id}/promote`); app.changed(); app.toast(t("Convertido en subtarea: {titulo}", { titulo: sub.title }), "ok"); await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`)); }
              catch (e: any) { app.toast(e.message, "error"); }
            }}>{t("→ Subtarea")}</button>
            <button className="ghost small" aria-label={t("Eliminar paso {texto}", { texto: s.text })} onClick={() => run(() => api.del<TaskDetail>(`/api/steps/${s.id}`))}>✕</button>
          </li>))}</ul></>}
      {task.subtasks.length > 0 && <>
        <h4>{t("Subtareas ({cerradas}/{total})", { cerradas: task.subtasks.filter((s) => s.status === "hecha" || s.status === "cancelada").length, total: task.subtasks.length })}</h4>
        <ul className="plain">{task.subtasks.map((s) => (
          <li key={s.id} className="ref-row"><TaskRefLabel task={s} />{s.due_date && <span className="muted small"> · {fmtDate(s.due_date)}</span>}
            {s.estimate_hours !== null && <span className="muted small"> · {s.estimate_hours} h</span>}</li>))}</ul></>}
    </div>
  );
}

function FollowUp({ task, run, quick }: { task: TaskDetail; run: Run; quick: (b: Record<string, unknown>, m: string) => Promise<boolean> }) {
  const app = useApp();
  const [text, setText] = useState("");
  return (
    <div className="subtle-box">
      <p>{t("Desde: {fecha} · Último seguimiento: {ultimo}", { fecha: fmtDateTime(task.wait_since, app.tz), ultimo: task.last_follow_up_at ? fmtDateTime(task.last_follow_up_at, app.tz) : t("ninguno registrado") })}</p>
      <AutoText value={text} onChange={setText} minRows={1} aria-label={t("Nota del seguimiento")} placeholder={t("Nota del seguimiento (opcional)")} />
      <div className="row">
        <button onClick={async () => { if (await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/follow-up`, { text }), t("Seguimiento registrado (la espera continúa)"))) setText(""); }}>{t("Seguimiento realizado")}</button>
        <button onClick={() => quick({ condition: null }, t("Espera/bloqueo resuelto"))}>{t("Marcar resuelto")}</button>
      </div>
      <p className="hint">{t("«Recordar contactar» no envía nada: solo te lo recuerda.")}</p>
    </div>
  );
}

function Repetition({ task, run, saveFirst, dirty, onDeleted }: { task: TaskDetail; run: Run; saveFirst: () => Promise<boolean>; dirty: boolean; onDeleted: () => void }) {
  const app = useApp();
  const [rule, setRule] = useState<RuleValue>(emptyRule(task.due_date || todayIn(app.tz)));
  const [deleting, setDeleting] = useState(false);
  if (task.recurrence) {
    const r = task.recurrence;
    return <div>
      <p><strong>{describeRule(r)}</strong> · {t("desde {fecha}", { fecha: fmtDate(r.start_date) })}{r.end_date ? " " + t("hasta {fecha}", { fecha: fmtDate(r.end_date) }) : ""} · {r.active ? t("activa") : t("pausada")}</p>
      <p className="hint">{t("Esta tarea es una ocurrencia de la serie (fecha {fecha}). Lo que cambies aquí solo afecta a esta ocurrencia, salvo que pulses «Aplicar estos datos a la serie».", { fecha: fmtDate(task.occurrence_date) })}</p>
      <div className="row">
        <button onClick={async () => { await api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); await run(() => api.get<TaskDetail>(`/api/tasks/${task.id}`), r.active ? t("Serie pausada: no se generarán más ocurrencias") : t("Serie reactivada")); }}>{r.active ? t("Pausar la serie") : t("Reactivar la serie")}</button>
        <button onClick={async () => {
          if (!window.confirm(t("¿Aplicar los datos de esta tarea (título, proyecto, responsable, revisor, tipo, prioridad, estimación, descripción, agrupaciones, aprobación, revisiones, enlaces, etiquetas, pasos y recordatorios) a la serie y a sus ocurrencias futuras pendientes?"))) return;
          if (dirty && !(await saveFirst())) return;
          try { const res = await api.post<TaskDetail & { updated_occurrences: number }>(`/api/tasks/${task.id}/apply-to-series`); await run(async () => res, t("Aplicado a la serie y a {n} ocurrencia(s) futura(s)", { n: res.updated_occurrences })); }
          catch (e: any) { app.toast(e.message, "error"); }
        }}>{t("Aplicar estos datos a la serie")}</button>
        <button className="danger" onClick={() => setDeleting(true)}>{t("Eliminar serie")}</button>
      </div>
      {deleting && <DeleteSeriesDialog rec={{ id: r.id, title: task.title }} onClose={() => setDeleting(false)} onDone={() => { setDeleting(false); onDeleted(); }} />}
    </div>;
  }
  return <div>
    <p className="hint">{t("Convierte esta tarea en la primera de una serie. Las siguientes se crean solas (hasta {n} días vista) y heredan todo: proyecto, responsable, revisor, tipo, prioridad, estimación, descripción, agrupaciones, tarea principal, aprobación, revisiones, enlaces, etiquetas, pasos (sin marcar) y recordatorios. Las fechas mantienen su relación con la fecha límite.", { n: app.boot.settings.recurrence_horizon_days })}</p>
    {dirty && <p className="warn-box">{t("Hay cambios sin guardar: se guardarán antes de crear la serie.")}</p>}
    <RuleEditor value={rule} onChange={setRule} />
    <button className="primary" disabled={!ruleIsValid(rule)} onClick={async () => {
      if (dirty && !(await saveFirst())) return;
      await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/recurrence`, {
        rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [], interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null,
        start_date: rule.start_date, end_date: rule.end_date, non_working: rule.non_working }), t("La tarea ahora se repite"));
    }}>{t("Hacer recurrente")}</button>
  </div>;
}

function Allocation({ task, run }: { task: TaskDetail; run: Run }) {
  const app = useApp();
  const [week, setWeek] = useState<string | null>(weekStart(task.planned_date || todayIn(app.tz)));
  const [hours, setHours] = useState("");
  const assigned = task.allocations.reduce((a, b) => a + b.hours, 0);
  return <div>
    <p className="hint">{t("Solo es útil para tareas grandes que ocupan varias semanas. En la Planificación semanal de Equipo, una tarea suma su estimación completa ({h} h) en la semana de su fecha planificada. Si va a repartirse (p. ej. 30 h en 3 semanas), indica aquí cuántas horas corresponden a cada semana y la planificación usará esas cifras. Nada se reparte automáticamente.", { h: task.estimate_hours })}</p>
    {task.allocations.length > 0 && <ul className="plain">{task.allocations.map((a) => <li key={a.week_start}>{t("Semana del {fecha}: {h} h", { fecha: fmtDate(a.week_start), h: a.hours })}
      <button className="ghost small" onClick={() => run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: a.week_start, hours: 0 }))}>{t("Quitar")}</button></li>)}</ul>}
    {task.allocations.length > 0 && <p className="muted small">{t("Repartidas {a} h de {e} h estimadas.", { a: assigned, e: task.estimate_hours })}</p>}
    <div className="row">
      <span className="inline">{t("Semana del (lunes)")} <DateInput label={t("Semana del (lunes)")} value={week} onChange={(v) => setWeek(v ? weekStart(v) : null)} /></span>
      <input type="number" min="0" step="0.5" aria-label={t("Horas")} placeholder={t("horas")} value={hours} onChange={(e: any) => setHours(e.target.value)} />
      <button disabled={!week || hours === ""} onClick={async () => { if (await run(() => api.put<TaskDetail>(`/api/tasks/${task.id}/allocations`, { week_start: week, hours: Number(hours) }))) setHours(""); }}>{t("Guardar")}</button>
    </div>
  </div>;
}

function History({ task, run }: { task: TaskDetail; run: Run }) {
  const app = useApp();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);
  const add = async () => { if (text.trim() && await run(() => api.post<TaskDetail>(`/api/tasks/${task.id}/update`, { text: text.trim() }), t("Actualización registrada"))) setText(""); };
  const saveEdit = async () => { if (editing && editing.text.trim() && await run(() => api.patch<TaskDetail>(`/api/tasks/${task.id}/history/${editing.id}`, { text: editing.text.trim() }), t("Actualización corregida"))) setEditing(null); };
  const kindLabel = (h: HistoryEntry) => h.kind === "actualizacion" ? t("Nota") : h.kind === "seguimiento" ? t("Seguimiento") : t("Auto");
  return <div>
    <AutoText value={text} onChange={setText} minRows={3} maxRows={12} aria-label={t("Registrar actualización")}
      placeholder={t("Qué se ha hecho, qué ha cambiado o una nota personal (cuenta como actualización significativa). Ctrl+Enter para registrar.")}
      onKeyDown={(e: any) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void add(); } }} />
    <div className="row"><button disabled={!text.trim()} onClick={add}>{t("Registrar actualización")}</button>
      <span className="hint">{t("Tus notas se pueden editar; los cambios automáticos no (sirven de registro).")}</span></div>
    <ul className="history">{task.history.map((h) => (
      <li key={h.id} className={`h-${h.kind}`}>
        <div className="h-meta"><span className={`h-kind h-kind-${h.kind}`}>{kindLabel(h)}</span> <time>{fmtDateTime(h.at, app.tz)}</time>
          {h.edited_at && <span className="muted small"> · {t("editada {fecha}", { fecha: fmtDateTime(h.edited_at, app.tz) })}</span>}
          {h.editable && editing?.id !== h.id && <button className="ghost small" onClick={() => setEditing({ id: h.id, text: h.text })}>{t("Editar")}</button>}</div>
        {editing?.id === h.id ? <div>
          <AutoText value={editing.text} onChange={(v: string) => setEditing({ id: h.id, text: v })} minRows={2} maxRows={12} aria-label={t("Editar actualización")}
            onKeyDown={(e: any) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void saveEdit(); } if (e.key === "Escape") { e.stopPropagation(); setEditing(null); } }} />
          <div className="row tight"><button className="small primary" onClick={saveEdit}>{t("Guardar")}</button><button className="small" onClick={() => setEditing(null)}>{t("Cancelar")}</button></div>
        </div> : <div className="h-text">{h.text}</div>}
      </li>))}</ul>
  </div>;
}
