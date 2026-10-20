import { dueLabel, todayIn } from "../lib/dates";
import { CONDITION, PRIORITY, PRIORITY_MARK, SIGNAL, STATUS } from "../lib/labels";
import { useApp } from "../lib/store";
import type { Task } from "../lib/types";
import { Chip } from "./ui";

export function TaskCard({ task, showStatus, showProject = true, actions, draggable, onDragStart }: {
  task: Task; showStatus?: boolean; showProject?: boolean; actions?: any; draggable?: boolean; onDragStart?: (e: any) => void;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const project = app.project(task.project_id);
  const assignee = app.person(task.assignee_id);
  const overdue = task.due_date && task.due_date < today;
  const approvals = (task.signals || []).filter((s) => s.startsWith("aprobacion"));
  return (
    <article className={`card prio-${task.priority}${task.condition ? " has-condition" : ""}${task.parent_id ? " is-sub" : ""}`}
      draggable={draggable} onDragStart={onDragStart} data-task-id={task.id}>
      {task.parent_id && (
        <button className="card-parent linklike" onClick={() => app.openTask(task.parent_id!)} title="Abrir la tarea principal">
          ↳ Subtarea de «{task.parent_title}»
        </button>
      )}
      <button className="card-title linklike" onClick={() => app.openTask(task.id)} title="Abrir detalle">
        {PRIORITY_MARK[task.priority] && <span className="prio-mark" aria-label={`Prioridad ${PRIORITY[task.priority]}`}>{PRIORITY_MARK[task.priority]} </span>}
        {task.title}
      </button>
      <div className="card-meta">
        {showStatus && <Chip>{STATUS[task.status]}</Chip>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"} title={task.wait_on || undefined}>{task.condition === "bloqueada" ? "⛔" : "⏸"} {CONDITION[task.condition]}{task.wait_on ? `: ${task.wait_on}` : ""}</Chip>}
        {task.due_date && <Chip tone={overdue ? "danger" : task.due_date === today ? "warn" : "neutral"}>📅 {dueLabel(task.due_date, today)}</Chip>}
        {task.status === "backlog" && !showStatus && <Chip>Backlog</Chip>}
        {task.open_blockers > 0 && <Chip tone="warn" title="Depende de tareas no terminadas">⛓ espera {task.open_blockers}</Chip>}
        {task.open_dependents > 0 && <Chip tone="info" title="Otras tareas dependen de esta">➜ bloquea {task.open_dependents}</Chip>}
        {approvals.map((s) => <Chip key={s} tone="warn">{SIGNAL[s]}</Chip>)}
        {task.steps_total > 0 && <Chip title="Pasos completados">☑ {task.steps_done}/{task.steps_total} pasos</Chip>}
        {task.subtasks_total > 0 && <Chip title="Subtareas cerradas">⊞ {task.subtasks_closed}/{task.subtasks_total} subtareas</Chip>}
        {task.recurrence_id && <Chip title="Tarea recurrente">↻</Chip>}
      </div>
      <div className="card-foot">
        {showProject && project && <span className="muted">{project.name}</span>}
        <span className="muted">{assignee ? assignee.name : "Sin asignar"}</span>
        {task.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
      </div>
      {actions && <div className="card-actions">{actions}</div>}
    </article>
  );
}
