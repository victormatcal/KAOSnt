import { dueLabel, todayIn } from "../lib/dates";
import { CONDITION, PRIORITY, PRIORITY_MARK, SIGNAL, STATUS } from "../lib/labels";
import { useApp } from "../lib/store";
import type { Task } from "../lib/types";
import { Chip } from "./ui";

export function TaskCard({ task, showStatus, showProject = true, actions, draggable, onDragStart }: {
  task: Task; showStatus?: boolean; showProject?: boolean; actions?: any; draggable?: boolean;
  onDragStart?: (e: any) => void;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const project = app.project(task.project_id);
  const assignee = app.person(task.assignee_id);
  const overdue = task.due_date && task.due_date < today;
  const extraSignals = (task.signals || []).filter((s) => !["vencida", "vence_hoy", "vence_semana", "espera", "bloqueada", "backlog"].includes(s));
  return (
    <article className={`card prio-${task.priority}${task.condition ? " has-condition" : ""}`} draggable={draggable}
      onDragStart={onDragStart} data-task-id={task.id}>
      <button className="card-title linklike" onClick={() => app.openTask(task.id)} title="Abrir detalle">
        {PRIORITY_MARK[task.priority] && <span className="prio-mark" aria-label={`Prioridad ${PRIORITY[task.priority]}`}>{PRIORITY_MARK[task.priority]} </span>}
        {task.title}
      </button>
      <div className="card-meta">
        {showStatus && <Chip>{STATUS[task.status]}</Chip>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"}>{task.condition === "bloqueada" ? "⛔" : "⏸"} {CONDITION[task.condition]}{task.wait_on ? `: ${task.wait_on}` : ""}</Chip>}
        {task.due_date && <Chip tone={overdue ? "danger" : task.due_date === today ? "warn" : "neutral"}>📅 {dueLabel(task.due_date, today)}</Chip>}
        {task.status === "backlog" && <Chip>Backlog</Chip>}
        {task.open_blockers > 0 && <Chip tone="warn" title="Depende de tareas no terminadas">⛓ espera {task.open_blockers}</Chip>}
        {task.open_dependents > 0 && <Chip tone="info" title="Otras tareas dependen de esta">➜ bloquea {task.open_dependents}</Chip>}
        {extraSignals.filter((s) => s.startsWith("aprobacion")).map((s) => <Chip key={s} tone="warn">{SIGNAL[s]}</Chip>)}
        {task.subtasks_total > 0 && <Chip>☑ {task.subtasks_closed}/{task.subtasks_total}</Chip>}
        {task.recurrence_id && <Chip title="Ocurrencia de una tarea recurrente">↻</Chip>}
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
