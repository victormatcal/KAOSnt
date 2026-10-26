import { useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { addDays, fmtDate, isoDow, monthGrid, monthName, todayIn, utcToZonedInput, viewWeekStart, weekHeaders, weekStart } from "../lib/dates";
import { t } from "../lib/i18n";
import { groupSeries } from "../lib/series";
import { foldSubtasks } from "../lib/subtasks";
import { useViewSet } from "../lib/viewstate";
import { BOARD_COLUMNS, CONDITION, GROUPING_KIND, PRIORITY, PRIORITY_MARK, STATUS } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { DayContext, Filters, Task, TaskStatus } from "../lib/types";
import { askScope, OccurrenceScope } from "./ScopeDialog";
import { TaskCard } from "./TaskCard";
import { Empty, MultiSelect, splitMulti } from "./ui";

export type GroupField = "assignee_id" | "project_id" | "workstream_id" | "phase_id" | "deliverable_id";
export interface MoveBody { status?: TaskStatus; before_id?: number; after_id?: number; group?: { field: GroupField; value: number | null }; scope?: OccurrenceScope }

/** Move/reorder a task; if the approval is pending, asks for explicit confirmation.
 * When the column or the group changes, returns the identifier for «Undo». */
export async function moveTask(id: number, body: MoveBody): Promise<false | { undo_id?: number | null }> {
  const url = `/api/tasks/${id}/reorder${body.status || body.group ? "?undo=1" : ""}`;
  try {
    return await api.post<{ undo_id?: number | null }>(url, body);
  } catch (e) {
    if (e instanceof ApiError && e.code === "aprobacion_pendiente") {
      if (!window.confirm(e.message)) return false;
      return await api.post<{ undo_id?: number | null }>(url, { ...body, force: true });
    }
    throw e;
  }
}

export type GroupBy = "ninguna" | "linea" | "fase" | "entregable" | "proyecto" | "persona";
/** Task field changed when a card is moved to another group (0.5). */
export const GROUP_FIELD: Record<Exclude<GroupBy, "ninguna">, GroupField> = {
  persona: "assignee_id", proyecto: "project_id", linea: "workstream_id", fase: "phase_id", entregable: "deliverable_id",
};
export const groupValue = (x: Task, groupBy: GroupBy): number | null =>
  groupBy === "ninguna" ? null : ((x as any)[GROUP_FIELD[groupBy]] ?? null);

/** Groups a task can be moved to (for the keyboard «Move to…» menu). Groupings only of the task's own project. */
export function groupTargets(groupBy: GroupBy, task: Task, boot: { people: { id: number; name: string; active: boolean | number }[]; projects: { id: number; name: string }[]; groupings: { id: number; name: string; kind: string; project_id: number }[] }): { value: number | null; label: string }[] {
  if (groupBy === "ninguna") return [];
  if (groupBy === "persona") return [{ value: null, label: t("Sin asignar") }, ...boot.people.filter((p) => p.active).map((p) => ({ value: p.id, label: p.name }))];
  if (groupBy === "proyecto") return [{ value: null, label: t("Sin proyecto") }, ...boot.projects.map((p) => ({ value: p.id, label: p.name }))];
  return [{ value: null, label: t("Sin {agrupacion}", { agrupacion: GROUPING_KIND[groupBy].toLowerCase() }) },
    ...boot.groupings.filter((g) => g.kind === groupBy && g.project_id === task.project_id).map((g) => ({ value: g.id, label: g.name }))];
}

export function Board({ tasks: allTasks, showBacklog, showDone, groupBy = "ninguna", showProject = true, groupRecurring = true, groupSubtasks = true, stateKey = "board" }: {
  tasks: Task[]; showBacklog: boolean; showDone: boolean; groupBy?: GroupBy; showProject?: boolean; groupRecurring?: boolean;
  groupSubtasks?: boolean; stateKey?: string;
}) {
  const app = useApp();
  const [drag, setDrag] = useState<{ id: number; lane: string } | null>(null);
  const [expanded, toggleSeries] = useViewSet(stateKey + ".series");
  const [openSubs, toggleSubs] = useViewSet(stateKey + ".subtasks");
  const [moving, setMoving] = useState<number | null>(null);
  const tasks = useMemo(() => (groupRecurring ? groupSeries(allTasks, expanded) : allTasks), [allTasks, groupRecurring, expanded]);
  const doneIds = allTasks.filter((x) => x.status === "hecha").map((x) => x.id);
  const archiveAll = async () => {
    if (!window.confirm(t("¿Archivar las {n} tareas de la columna Hecha? Podrás deshacerlo durante unos segundos y verlas en Trabajo → Archivadas.", { n: doneIds.length }))) return;
    try { const r = await api.post<{ archived: number; undo_id: number }>("/api/tasks/archive-bulk", { ids: doneIds }); app.changed(); app.undoable(t("{n} tareas archivadas", { n: r.archived }), r.undo_id); }
    catch (e: any) { app.toast(e.message, "error"); }
  };
  const columns: TaskStatus[] = [...(showBacklog ? ["backlog" as TaskStatus] : []), ...BOARD_COLUMNS.filter((c) => c !== "hecha" || showDone)];
  const labelOf = (k: number | null): string => {
    if (groupBy === "ninguna") return "";
    if (k === null) return groupBy === "persona" ? t("Sin asignar") : groupBy === "proyecto" ? t("Sin proyecto") : t("Sin {agrupacion}", { agrupacion: GROUPING_KIND[groupBy].toLowerCase() });
    if (groupBy === "proyecto") return app.project(k)?.name || "—";
    if (groupBy === "persona") return app.person(k)?.name || "—";
    return app.boot.groupings.find((g) => g.id === k)?.name || "—";
  };
  const lanes = useMemo(() => {
    if (groupBy === "ninguna") return [{ key: "all", value: null as number | null, label: "", tasks }];
    const map = new Map<number | null, Task[]>();
    for (const x of tasks) { const k = groupValue(x, groupBy); map.set(k, [...(map.get(k) || []), x]); }
    return [...map.entries()].sort((a, b) => (a[0] === null ? 1 : b[0] === null ? -1 : labelOf(a[0]).localeCompare(labelOf(b[0]))))
      .map(([k, ts]) => ({ key: String(k), value: k, label: labelOf(k), tasks: ts }));
  }, [tasks, groupBy, app.boot]);
  const act = async (id: number, body: MoveBody) => {
    const task = allTasks.find((x) => x.id === id);
    if (body.group && task && task.recurrence_id !== null) {  // recurring: which occurrences change group (0.5)
      const scope = await askScope("occurrence");
      if (!scope) return;
      body = { ...body, scope };
    }
    try {
      const r = await moveTask(id, body);
      if (!r) return;
      app.changed();
      if (body.group) {
        const to = body.group.field === GROUP_FIELD[groupBy as Exclude<GroupBy, "ninguna">] ? labelOf(body.group.value) : "";
        const extra = body.group.field === "project_id" && task && (task.workstream_id || task.phase_id || task.deliverable_id) ? " " + t("(se quitan la línea, fase y entregable del proyecto anterior)") : "";
        app.undoable(t("Movida a «{grupo}»", { grupo: to }) + extra, r.undo_id);
      } else if (body.status && r.undo_id) app.undoable(t("Movida a «{columna}»", { columna: STATUS[body.status] }), r.undo_id);
    } catch (e: any) { app.toast(e.message, "error"); }
  };
  /** Drop on a lane/column: status change and, if the lane is another group, group change in the same operation. */
  const dropTo = (lane: { key: string; value: number | null }, col: TaskStatus, pos: { before_id?: number; after_id?: number }) => {
    if (!drag) return;
    const body: MoveBody = { status: col, ...pos };
    if (groupBy !== "ninguna" && lane.key !== drag.lane) body.group = { field: GROUP_FIELD[groupBy], value: lane.value };
    const id = drag.id;
    setDrag(null);
    void act(id, body);
  };
  if (!tasks.length) return <Empty>{t("No hay tareas con estos filtros. Crea una con «+ Tarea» (Alt+T) o revisa los filtros.")}</Empty>;
  return (
    <div className="board-wrap">
      {lanes.map((lane) => (
        <div key={lane.key} className="lane">
          {lane.label && <h3 className="lane-title">{lane.label} <span className="count">({lane.tasks.length})</span></h3>}
          <div className="board" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((col, ci) => {
              const items = lane.tasks.filter((x) => x.status === col).sort((a, b) => a.position - b.position);
              const rows = groupSubtasks ? foldSubtasks(items, openSubs) : items.map((x) => ({ task: x, depth: 0, childCount: 0, expanded: false }));
              return (
                <div key={col} className={"column" + (drag ? " drop-target" : "")} aria-label={t("Columna {nombre}", { nombre: STATUS[col] }) + (lane.label ? ` · ${lane.label}` : "")}
                  onDragOver={(e: any) => e.preventDefault()}
                  onDrop={(e: any) => {
                    e.preventDefault();
                    if (!drag) return;
                    const last = items.filter((x) => x.id !== drag.id).slice(-1)[0];
                    dropTo(lane, col, last ? { after_id: last.id } : {});
                  }}>
                  <h4 className="column-title">{STATUS[col]} <span className="count">{items.length}</span>
                    {col === "hecha" && doneIds.length > 0 && lane === lanes[0] && <button className="ghost small archive-all" onClick={archiveAll} title={t("Archivar todas las tareas hechas (con deshacer)")}>{t("Archivar todas")}</button>}</h4>
                  {rows.map((row, i) => {
                    const x = row.task;
                    const idx = items.indexOf(x);
                    return (
                    <div key={x.id} className={row.depth ? `sub-row depth-${Math.min(row.depth, 4)}` : undefined} onDragOver={(e: any) => e.preventDefault()} onDrop={(e: any) => {
                      e.preventDefault(); e.stopPropagation();
                      if (!drag || drag.id === x.id) return;
                      const prev = items.slice(0, idx).filter((y) => y.id !== drag.id).slice(-1)[0];
                      dropTo(lane, col, { before_id: x.id, ...(prev ? { after_id: prev.id } : {}) });
                    }}>
                      <TaskCard task={x} showProject={showProject} draggable onDragStart={(e: any) => { setDrag({ id: x.id, lane: lane.key }); e.dataTransfer.setData("text/plain", String(x.id)); }}
                        onExpandSeries={x.recurrence_id !== null ? () => toggleSeries(x.recurrence_id!) : undefined}
                        subtasks={row.childCount ? { count: row.childCount, expanded: row.expanded, toggle: () => toggleSubs(x.id) } : undefined}
                        nested={row.depth > 0}
                        actions={<>
                          {x.recurrence_id !== null && expanded.has(x.recurrence_id) && <button className="ghost small" onClick={() => toggleSeries(x.recurrence_id!)} title={t("Agrupar de nuevo la serie")}>↻ −</button>}
                          <button className="ghost small" disabled={ci === 0} onClick={() => act(x.id, { status: columns[ci - 1] })} aria-label={t("Mover «{titulo}» a la columna anterior", { titulo: x.title })} title={t("Columna anterior")}>◀</button>
                          <button className="ghost small" disabled={idx === 0} onClick={() => act(x.id, { before_id: items[idx - 1].id, ...(idx > 1 ? { after_id: items[idx - 2].id } : {}) })} aria-label={t("Subir «{titulo}»", { titulo: x.title })} title={t("Subir")}>▲</button>
                          <button className="ghost small" disabled={idx === items.length - 1} onClick={() => act(x.id, { after_id: items[idx + 1].id, ...(idx + 2 < items.length ? { before_id: items[idx + 2].id } : {}) })} aria-label={t("Bajar «{titulo}»", { titulo: x.title })} title={t("Bajar")}>▼</button>
                          <button className="ghost small" disabled={ci === columns.length - 1} onClick={() => act(x.id, { status: columns[ci + 1] })} aria-label={t("Mover «{titulo}» a la columna siguiente", { titulo: x.title })} title={t("Columna siguiente")}>▶</button>
                          {groupBy !== "ninguna" && (moving === x.id
                            ? <select className="move-to" autoFocus aria-label={t("Mover «{titulo}» a otro grupo", { titulo: x.title })} value={String(groupValue(x, groupBy))}
                                onBlur={() => setMoving(null)} onKeyDown={(e: any) => { if (e.key === "Escape") { e.stopPropagation(); setMoving(null); } }}
                                onChange={(e: any) => { setMoving(null); const v = e.target.value === "null" ? null : Number(e.target.value); if (v !== groupValue(x, groupBy)) void act(x.id, { group: { field: GROUP_FIELD[groupBy], value: v } }); }}>
                                {groupTargets(groupBy, x, app.boot as any).map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}</select>
                            : <button className="ghost small" onClick={() => setMoving(x.id)} aria-label={t("Mover «{titulo}» a otro grupo", { titulo: x.title })} title={t("Mover a otro grupo…")}>⇄</button>)}
                        </>} />
                    </div>);
                  })}
                </div>);
            })}
          </div>
        </div>))}
    </div>
  );
}

export function TaskTable({ tasks: allTasks, archived, groupRecurring = false, groupSubtasks = false, stateKey = "list" }: {
  tasks: Task[]; archived?: boolean; groupRecurring?: boolean; groupSubtasks?: boolean; stateKey?: string;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const [expanded, toggle] = useViewSet(stateKey + ".series");
  const [openSubs, toggleSubs] = useViewSet(stateKey + ".subtasks");
  const tasks = useMemo(() => (groupRecurring && !archived ? groupSeries(allTasks, expanded) : allTasks), [allTasks, groupRecurring, archived, expanded]);
  const rows = groupSubtasks && !archived ? foldSubtasks(tasks, openSubs) : tasks.map((x) => ({ task: x, depth: 0, childCount: 0, expanded: false }));
  if (!tasks.length) return <Empty>{archived ? t("No hay tareas archivadas.") : t("No hay tareas con estos filtros.")}</Empty>;
  const act = async (fn: () => Promise<unknown>, msg: string) => { try { await fn(); app.changed(); app.toast(msg, "ok"); } catch (e: any) { app.toast(e.message, "error"); } };
  return (
    <div className="table-wrap">
      <table className="list">
        <thead><tr><th>{t("Tarea")}</th><th>{t("Proyecto")}</th><th>{t("Responsable")}</th><th>{t("Estado")}</th>
          {!archived && <><th>{t("Condición")}</th><th>{t("Prioridad")}</th><th>{t("Límite")}</th><th>{t("Planificada")}</th><th>{t("Estimación")}</th></>}
          {archived && <th>{t("Acciones")}</th>}</tr></thead>
        <tbody>
          {rows.map(({ task: x, depth, childCount, expanded: subsOpen }) => (
            <tr key={x.id} className={depth ? "sub-row" : undefined}>
              <td className={"wrap" + (depth ? ` indent-${Math.min(depth, 4)}` : "")}>
                {x.parent_id && !depth && <span className="muted small">↳ {x.parent_title} · </span>}
                {depth > 0 && <span className="muted" aria-hidden="true">↳ </span>}
                <button className="linklike" onClick={() => app.openTask(x.id)}>{x.title}</button>
                {childCount > 0 && <button className="chip chip-info subtasks-more" onClick={() => toggleSubs(x.id)} aria-expanded={subsOpen}
                  aria-label={subsOpen ? t("Plegar {n} subtarea(s)", { n: childCount }) : t("Desplegar {n} subtarea(s)", { n: childCount })}>⊞ {subsOpen ? "−" : "+"}{childCount}</button>}
                {x.recurrence_id !== null && (x as any).series_more ? <button className="chip chip-info series-more" onClick={() => toggle(x.recurrence_id!)} title={t("Desplegar la serie")}>↻ +{(x as any).series_more}</button>
                  : x.recurrence_id !== null && <span className="muted" title={t("Tarea recurrente")}> ↻{expanded.has(x.recurrence_id) && <button className="ghost small" onClick={() => toggle(x.recurrence_id!)} title={t("Agrupar de nuevo la serie")}>−</button>}</span>}
                {x.open_blockers > 0 && <span className="muted" title={t("Depende de otras tareas")}> ⛓{x.open_blockers}</span>}
                {x.open_dependents > 0 && <span className="muted" title={t("Bloquea otras tareas")}> ➜{x.open_dependents}</span>}
                {x.steps_total > 0 && <span className="muted" title={t("Pasos")}> ☑{x.steps_done}/{x.steps_total}</span>}</td>
              <td>{app.project(x.project_id)?.name || "—"}</td>
              <td>{app.person(x.assignee_id)?.name || t("Sin asignar")}</td>
              <td>{STATUS[x.status]}</td>
              {!archived && <>
                <td>{x.condition ? CONDITION[x.condition] : "—"}</td>
                <td>{PRIORITY_MARK[x.priority]} {PRIORITY[x.priority]}</td>
                <td className={x.due_date && x.due_date < today ? "overdue" : ""}>{x.due_date ? fmtDate(x.due_date) + (x.due_date < today ? " " + t("(vencida)") : "") : "—"}</td>
                <td>{x.planned_date ? fmtDate(x.planned_date) : "—"}</td>
                <td>{x.estimate_hours !== null ? `${x.estimate_hours} h` : t("no informado")}</td></>}
              {archived && <td className="nowrap">
                <button className="small" onClick={() => act(() => api.patch(`/api/tasks/${x.id}`, { archived: false }), t("Tarea restaurada"))}>{t("Restaurar")}</button>
                <button className="small danger" onClick={() => { if (window.confirm(t("¿Eliminar definitivamente «{titulo}»? No se puede deshacer.", { titulo: x.title }))) void act(() => api.del(`/api/tasks/${x.id}`), t("Tarea eliminada")); }}>{t("Eliminar")}</button>
              </td>}
            </tr>))}
        </tbody>
      </table>
    </div>
  );
}

/** Compact text for the registered holidays and absences of a day. */
export function dayContextText(c: DayContext | undefined): { holiday: string; absent: string; title: string } {
  if (!c) return { holiday: "", absent: "", title: "" };
  const holiday = c.holidays.map((h) => h.location ? t("Festivo {oficina}", { oficina: h.location }) : t("Festivo")).join(" · ");
  const absent = c.absences.length ? t("Ausente: {nombres}", { nombres: c.absences.map((a) => a.name.split(" ")[0]).join(", ") }) : "";
  const title = [...c.holidays.map((h) => `${h.name || t("Festivo")}${h.location ? ` (${h.location})` : " " + t("(todas las oficinas)")}: ${h.people.join(", ") || t("nadie asignado")}`),
    ...(c.absences.length ? [t("Ausencias registradas: {nombres}", { nombres: c.absences.map((a) => a.name).join(", ") })] : [])].join("\n");
  return { holiday, absent, title };
}

interface CalItem { task: Task; kind: "due" | "plan" | "review" }
const CAL_LABEL = { due: "📅", plan: "🗓", review: "🔎" };
const CAL_TEXT = { due: () => t("Vence"), plan: () => t("Planificada"), review: () => t("Revisión") };

export function Calendar({ tasks, mode, anchor, setAnchor, setMode }: {
  tasks: Task[]; mode: "week" | "month"; anchor: string; setAnchor: (d: string) => void; setMode: (m: "week" | "month") => void;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const days = mode === "week" ? Array.from({ length: 7 }, (_, i) => addDays(viewWeekStart(anchor), i)) : monthGrid(anchor);
  const { data: ctx } = useApi<{ days: Record<string, DayContext> }>(`/api/calendar-context?start=${days[0]}&end=${days[days.length - 1]}`);
  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>();
    const put = (d: string | null, it: CalItem) => { if (d) m.set(d, [...(m.get(d) || []), it]); };
    for (const x of tasks) {
      put(x.due_date, { task: x, kind: "due" });
      if (x.planned_date && x.planned_date !== x.due_date) put(x.planned_date, { task: x, kind: "plan" });
      if (x.next_review_at) put(utcToZonedInput(x.next_review_at, app.tz).slice(0, 10), { task: x, kind: "review" });
    }
    return m;
  }, [tasks]);
  const undated = tasks.filter((x) => !x.due_date && !x.planned_date && !x.next_review_at).length;
  const shift = (dir: number) => {
    if (mode === "week") setAnchor(addDays(anchor, dir * 7));
    else { const d = new Date(anchor.slice(0, 8) + "15T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + dir); setAnchor(d.toISOString().slice(0, 10)); }
  };
  const month = anchor.slice(0, 7);
  const md = new Date(anchor.slice(0, 8) + "15T12:00:00Z");
  return (
    <div>
      <div className="row cal-bar">
        <button onClick={() => shift(-1)} aria-label={t("Anterior")}>◀</button>
        <button onClick={() => setAnchor(today)}>{t("Hoy")}</button>
        <button onClick={() => shift(1)} aria-label={t("Siguiente")}>▶</button>
        <strong>{mode === "week" ? t("Semana del {desde} al {hasta}", { desde: fmtDate(days[0]), hasta: fmtDate(days[6]) }) : `${monthName(md.getUTCMonth())} ${md.getUTCFullYear()}`}</strong>
        <span className="spacer" />
        <div role="group" aria-label={t("Escala del calendario")} className="tabs-inline">
          <button aria-pressed={mode === "week"} className={mode === "week" ? "active" : ""} onClick={() => setMode("week")}>{t("Semana")}</button>
          <button aria-pressed={mode === "month"} className={mode === "month" ? "active" : ""} onClick={() => setMode("month")}>{t("Mes")}</button>
        </div>
      </div>
      <p className="hint">{t("📅 Vence · 🗓 Planificada · 🔎 Revisión · ↻ en cursiva, ocurrencias de series recurrentes · en gris, festivos y ausencias registrados (pasa el ratón para ver a quién afectan).")} {undated > 0 && t("{n} tarea(s) sin fecha no se muestran.", { n: undated })}</p>
      <div className={`calendar cal-${mode}`}>
        {weekHeaders().map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {days.map((d) => {
          const items = byDay.get(d) || [];
          const c = dayContextText(ctx?.days[d]);
          const globalHoliday = ctx?.days[d]?.holidays.some((h) => !h.location);
          return (
            <div key={d} className={`cal-day${d === today ? " today" : ""}${mode === "month" && d.slice(0, 7) !== month ? " out" : ""}${isoDow(d) >= 6 || globalHoliday ? " weekend" : ""}`}>
              <div className="cal-date">{Number(d.slice(8))}{d === today && <span className="sr"> {t("(hoy)")}</span>}</div>
              {(c.holiday || c.absent) && <div className="cal-ctx" title={c.title}>{c.holiday && <span>{c.holiday}</span>}{c.absent && <span>{c.absent}</span>}</div>}
              {items.map((it) => (
                <button key={it.kind + it.task.id} className={`cal-item cal-${it.kind}${it.task.recurrence_id !== null ? " cal-rec" : ""}`} onClick={() => app.openTask(it.task.id)}
                  title={`${CAL_TEXT[it.kind]()}: ${it.task.title}${it.task.recurrence_id !== null ? " · " + t("serie recurrente") : ""}`}>
                  <span aria-label={CAL_TEXT[it.kind]()}>{CAL_LABEL[it.kind]}</span>{it.task.recurrence_id !== null && <span aria-label={t("recurrente")}>↻</span>} {it.task.title}
                </button>))}
            </div>);
        })}
      </div>
    </div>
  );
}

/** Discreet line with the registered holidays and absences of the current week. */
export function WeekAvailabilityStrip() {
  const app = useApp();
  const ws = weekStart(todayIn(app.tz));
  const { data } = useApi<{ days: Record<string, DayContext> }>(`/api/calendar-context?start=${ws}&end=${addDays(ws, 6)}`);
  if (!data) return null;
  const parts: { text: string; title: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(ws, i);
    const c = data.days[d];
    if (!c) continue;
    const names = [...new Set([...c.holidays.flatMap((h) => h.people), ...c.absences.map((a) => a.name)])];
    if (!names.length) continue;
    const info = dayContextText(c);
    parts.push({ text: `${fmtDate(d)}: ${names.map((n) => n.split(" ")[0]).join(", ")}`, title: info.title });
  }
  if (!parts.length) return null;
  return <p className="availability-strip" aria-label={t("Festivos y ausencias registrados esta semana")}>
    <span className="muted">{t("No disponibles esta semana (festivos/ausencias registrados):")}</span>{" "}
    {parts.map((p, i) => <span key={i} className="avail-item" title={p.title}>{p.text}</span>)}
  </p>;
}

/** Work filters (0.5: multiple choice in each filter; values combine with OR inside a filter and AND between filters). */
export function FilterBar({ filters, setFilters, hideProject, onReset }: { filters: Filters; setFilters: (f: Filters) => void; hideProject?: boolean; onReset?: () => void }) {
  const app = useApp();
  const set = (k: keyof Filters, v: any) => setFilters({ ...filters, [k]: v });
  const projects = [{ value: "none", label: t("Sin proyecto") }, ...app.boot.projects.map((p) => ({ value: String(p.id), label: p.name }))];
  const people = [{ value: "none", label: t("Sin asignar") }, ...app.boot.people.filter((p) => p.active || splitMulti(filters.person_id).includes(String(p.id))).map((p) => ({ value: String(p.id), label: p.name }))];
  const clients = [{ value: "none", label: t("Sin cliente") }, ...app.boot.clients.map((c) => ({ value: String(c.id), label: c.name }))];
  const statuses = (Object.keys(STATUS) as TaskStatus[]).map((x) => ({ value: x, label: STATUS[x] }));
  const conditions = [{ value: "cualquiera", label: t("En espera o bloqueadas") }, { value: "espera", label: t("En espera") }, { value: "bloqueada", label: t("Bloqueadas") }, { value: "none", label: t("Sin condición") }];
  const prios = Object.entries(PRIORITY).map(([k, v]) => ({ value: k, label: v }));
  const tags = app.boot.tags.map((x) => ({ value: x, label: "#" + x }));
  const active = Object.entries(filters).some(([k, v]) => v && k !== "sort");
  return (
    <div className="filters" role="group" aria-label={t("Filtros")}>
      {!hideProject && <MultiSelect label={t("Proyecto")} options={projects} value={filters.project_id} onChange={(v) => set("project_id", v)} />}
      {!hideProject && <MultiSelect label={t("Cliente")} options={clients} value={filters.client_id} onChange={(v) => set("client_id", v)} />}
      <MultiSelect label={t("Persona")} options={people} value={filters.person_id} onChange={(v) => set("person_id", v)} allLabel={t("Todas")} />
      <MultiSelect label={t("Estado")} options={statuses} value={filters.status} onChange={(v) => set("status", v)} allLabel={t("Operativas")} />
      <MultiSelect label={t("Condición")} options={conditions} value={filters.condition} onChange={(v) => set("condition", v)} allLabel={t("Cualquiera")} />
      <MultiSelect label={t("Prioridad")} options={prios} value={filters.priority} onChange={(v) => set("priority", v)} allLabel={t("Todas")} />
      <MultiSelect label={t("Etiqueta")} options={tags} value={filters.tag} onChange={(v) => set("tag", v)} allLabel={t("Todas")} />
      <label>{t("Orden")} <select value={filters.sort || ""} onChange={(e: any) => set("sort", e.target.value)}>
        <option value="">{t("Manual")}</option><option value="fecha">{t("Fecha límite")}</option><option value="prioridad">{t("Prioridad")}</option></select></label>
      <label className="check"><input type="checkbox" checked={!!filters.include_backlog} onChange={(e: any) => set("include_backlog", e.target.checked)} /> {t("Backlog")}</label>
      <label className="check"><input type="checkbox" checked={!!filters.include_closed} onChange={(e: any) => set("include_closed", e.target.checked)} /> {t("Terminadas")}</label>
      {onReset && <button type="button" className="ghost small" disabled={!active} onClick={onReset}>{t("Restablecer filtros")}</button>}
    </div>
  );
}

export function filtersToQuery(f: Filters): string {
  const p: string[] = [];
  const add = (k: string, v: any) => { if (v !== undefined && v !== "" && v !== false && v !== null) p.push(`${k}=${encodeURIComponent(v === true ? "1" : v)}`); };
  add("project_id", f.project_id); add("client_id", f.client_id); add("person_id", f.person_id); add("status", f.status); add("priority", f.priority);
  add("tag", f.tag); add("condition", f.condition); add("include_backlog", f.include_backlog); add("include_closed", f.include_closed); add("sort", f.sort);
  return p.length ? "?" + p.join("&") : "";
}
