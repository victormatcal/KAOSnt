import { dueLabel, todayIn } from "../lib/dates";
import { t } from "../lib/i18n";
import { CONDITION, PRIORITY, PRIORITY_MARK, SIGNAL, STATUS } from "../lib/labels";
import { useApp } from "../lib/store";
import type { SeriesTask } from "../lib/series";
import { Chip } from "./ui";

export function TaskCard({ task, showStatus, showProject = true, actions, draggable, onDragStart, onExpandSeries, seriesLabel }: {
  task: SeriesTask; showStatus?: boolean; showProject?: boolean; actions?: any; draggable?: boolean; onDragStart?: (e: any) => void;
  onExpandSeries?: () => void; seriesLabel?: string;
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
        <button className="card-parent linklike" onClick={() => app.openTask(task.parent_id!)} title={t("Abrir la tarea principal")}>
          ↳ {t("Subtarea de «{titulo}»", { titulo: task.parent_title || "" })}
        </button>
      )}
      <button className="card-title linklike" onClick={() => app.openTask(task.id)} title={t("Abrir detalle")}>
        {PRIORITY_MARK[task.priority] && <span className="prio-mark" aria-label={t("Prioridad {p}", { p: PRIORITY[task.priority] })}>{PRIORITY_MARK[task.priority]} </span>}
        {task.title}
      </button>
      <div className="card-meta">
        {showStatus && <Chip>{STATUS[task.status]}</Chip>}
        {task.condition && <Chip tone={task.condition === "bloqueada" ? "danger" : "warn"} title={task.wait_on || undefined}>{task.condition === "bloqueada" ? "⛔" : "⏸"} {CONDITION[task.condition]}{task.wait_on ? `: ${task.wait_on}` : ""}</Chip>}
        {task.due_date && <Chip tone={overdue ? "danger" : task.due_date === today ? "warn" : "neutral"}>📅 {dueLabel(task.due_date, today)}</Chip>}
        {task.status === "backlog" && !showStatus && <Chip>{STATUS.backlog}</Chip>}
        {task.open_blockers > 0 && <Chip tone="warn" title={t("Depende de tareas no terminadas")}>⛓ {t("espera {n}", { n: task.open_blockers })}</Chip>}
        {task.open_dependents > 0 && <Chip tone="info" title={t("Otras tareas dependen de esta")}>➜ {t("bloquea {n}", { n: task.open_dependents })}</Chip>}
        {approvals.map((s) => <Chip key={s} tone="warn">{SIGNAL[s]}</Chip>)}
        {task.steps_total > 0 && <Chip title={t("Pasos completados")}>☑ {t("{hechos}/{total} pasos", { hechos: task.steps_done, total: task.steps_total })}</Chip>}
        {task.subtasks_total > 0 && <Chip title={t("Subtareas cerradas")}>⊞ {t("{cerradas}/{total} subtareas", { cerradas: task.subtasks_closed, total: task.subtasks_total })}</Chip>}
        {task.recurrence_id && (task.series_more ? (onExpandSeries
          ? <button className="chip chip-info series-more" onClick={onExpandSeries} title={t("Desplegar la serie")} aria-label={t("Serie recurrente: {n} ocurrencias más. Desplegar", { n: task.series_more })}>↻ +{task.series_more}{seriesLabel ? ` ${seriesLabel}` : ""}</button>
          : <Chip tone="info" title={t("Tarea recurrente")}>↻ +{task.series_more}{seriesLabel ? ` ${seriesLabel}` : ""}</Chip>)
          : <Chip title={t("Tarea recurrente")}>↻</Chip>)}
      </div>
      <div className="card-foot">
        {showProject && project && <span className="muted">{project.name}</span>}
        <span className="muted">{assignee ? assignee.name : t("Sin asignar")}</span>
        {task.tags.map((x) => <span key={x} className="tag">#{x}</span>)}
      </div>
      {actions && <div className="card-actions">{actions}</div>}
    </article>
  );
}
