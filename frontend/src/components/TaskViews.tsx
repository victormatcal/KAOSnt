import { useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { addDays, fmtDate, isoDow, monthGrid, monthName, todayIn, utcToZonedInput, viewWeekStart, weekHeaders, weekStart } from "../lib/dates";
import { t } from "../lib/i18n";
import { groupSeries } from "../lib/series";
import { BOARD_COLUMNS, CONDITION, GROUPING_KIND, PRIORITY, PRIORITY_MARK, STATUS } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { DayContext, Filters, Task, TaskStatus } from "../lib/types";
import { TaskCard } from "./TaskCard";
import { Empty, PersonSelect, ProjectSelect } from "./ui";

/** Mueve/reordena una tarea; si la aprobación está pendiente pide confirmación explícita.
 * Con cambio de columna devuelve el identificador para «Deshacer». */
export async function moveTask(id: number, body: { status?: TaskStatus; before_id?: number; after_id?: number }): Promise<false | { undo_id?: number | null }> {
  const url = `/api/tasks/${id}/reorder${body.status ? "?undo=1" : ""}`;
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

export function Board({ tasks: allTasks, showBacklog, showDone, groupBy = "ninguna", showProject = true, groupRecurring = true }: {
  tasks: Task[]; showBacklog: boolean; showDone: boolean; groupBy?: GroupBy; showProject?: boolean; groupRecurring?: boolean;
}) {
  const app = useApp();
  const [dragId, setDragId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const tasks = useMemo(() => (groupRecurring ? groupSeries(allTasks, expanded) : allTasks), [allTasks, groupRecurring, expanded]);
  const toggleSeries = (rid: number) => setExpanded((prev: Set<number>) => { const n = new Set(prev); if (n.has(rid)) n.delete(rid); else n.add(rid); return n; });
  const doneIds = allTasks.filter((x) => x.status === "hecha").map((x) => x.id);
  const archiveAll = async () => {
    if (!window.confirm(t("¿Archivar las {n} tareas de la columna Hecha? Podrás deshacerlo durante unos segundos y verlas en Trabajo → Archivadas.", { n: doneIds.length }))) return;
    try { const r = await api.post<{ archived: number; undo_id: number }>("/api/tasks/archive-bulk", { ids: doneIds }); app.changed(); app.undoable(t("{n} tareas archivadas", { n: r.archived }), r.undo_id); }
    catch (e: any) { app.toast(e.message, "error"); }
  };
  const columns: TaskStatus[] = [...(showBacklog ? ["backlog" as TaskStatus] : []), ...BOARD_COLUMNS.filter((c) => c !== "hecha" || showDone)];
  const lanes = useMemo(() => {
    if (groupBy === "ninguna") return [{ key: "all", label: "", tasks }];
    const keyOf = (x: Task): number | null => groupBy === "linea" ? x.workstream_id : groupBy === "fase" ? x.phase_id
      : groupBy === "entregable" ? x.deliverable_id : groupBy === "proyecto" ? x.project_id : x.assignee_id;
    const labelOf = (k: number | null): string => {
      if (k === null) return groupBy === "persona" ? t("Sin asignar") : groupBy === "proyecto" ? t("Sin proyecto") : t("Sin {agrupacion}", { agrupacion: GROUPING_KIND[groupBy].toLowerCase() });
      if (groupBy === "proyecto") return app.project(k)?.name || "—";
      if (groupBy === "persona") return app.person(k)?.name || "—";
      return app.boot.groupings.find((g) => g.id === k)?.name || "—";
    };
    const map = new Map<number | null, Task[]>();
    for (const x of tasks) { const k = keyOf(x); map.set(k, [...(map.get(k) || []), x]); }
    return [...map.entries()].sort((a, b) => (a[0] === null ? 1 : b[0] === null ? -1 : labelOf(a[0]).localeCompare(labelOf(b[0]))))
      .map(([k, ts]) => ({ key: String(k), label: labelOf(k), tasks: ts }));
  }, [tasks, groupBy, app.boot]);
  const act = async (id: number, body: { status?: TaskStatus; before_id?: number; after_id?: number }) => {
    try {
      const r = await moveTask(id, body);
      if (!r) return;
      app.changed();
      if (body.status && r.undo_id) app.undoable(t("Movida a «{columna}»", { columna: STATUS[body.status] }), r.undo_id);
    } catch (e: any) { app.toast(e.message, "error"); }
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
              return (
                <div key={col} className="column" aria-label={t("Columna {nombre}", { nombre: STATUS[col] })} onDragOver={(e: any) => e.preventDefault()}
                  onDrop={(e: any) => {
                    e.preventDefault();
                    if (dragId === null) return;
                    const last = items.filter((x) => x.id !== dragId).slice(-1)[0];
                    void act(dragId, { status: col, ...(last ? { after_id: last.id } : {}) });
                    setDragId(null);
                  }}>
                  <h4 className="column-title">{STATUS[col]} <span className="count">{items.length}</span>
                    {col === "hecha" && doneIds.length > 0 && lane === lanes[0] && <button className="ghost small archive-all" onClick={archiveAll} title={t("Archivar todas las tareas hechas (con deshacer)")}>{t("Archivar todas")}</button>}</h4>
                  {items.map((x, i) => (
                    <div key={x.id} onDragOver={(e: any) => e.preventDefault()} onDrop={(e: any) => {
                      e.preventDefault(); e.stopPropagation();
                      if (dragId === null || dragId === x.id) return;
                      const prev = items.slice(0, i).filter((y) => y.id !== dragId).slice(-1)[0];
                      void act(dragId, { status: col, before_id: x.id, ...(prev ? { after_id: prev.id } : {}) });
                      setDragId(null);
                    }}>
                      <TaskCard task={x} showProject={showProject} draggable onDragStart={(e: any) => { setDragId(x.id); e.dataTransfer.setData("text/plain", String(x.id)); }}
                        onExpandSeries={x.recurrence_id !== null ? () => toggleSeries(x.recurrence_id!) : undefined}
                        actions={<>
                          {x.recurrence_id !== null && expanded.has(x.recurrence_id) && <button className="ghost small" onClick={() => toggleSeries(x.recurrence_id!)} title={t("Agrupar de nuevo la serie")}>↻ −</button>}
                          <button className="ghost small" disabled={ci === 0} onClick={() => act(x.id, { status: columns[ci - 1] })} aria-label={t("Mover «{titulo}» a la columna anterior", { titulo: x.title })} title={t("Columna anterior")}>◀</button>
                          <button className="ghost small" disabled={i === 0} onClick={() => act(x.id, { before_id: items[i - 1].id, ...(i > 1 ? { after_id: items[i - 2].id } : {}) })} aria-label={t("Subir «{titulo}»", { titulo: x.title })} title={t("Subir")}>▲</button>
                          <button className="ghost small" disabled={i === items.length - 1} onClick={() => act(x.id, { after_id: items[i + 1].id, ...(i + 2 < items.length ? { before_id: items[i + 2].id } : {}) })} aria-label={t("Bajar «{titulo}»", { titulo: x.title })} title={t("Bajar")}>▼</button>
                          <button className="ghost small" disabled={ci === columns.length - 1} onClick={() => act(x.id, { status: columns[ci + 1] })} aria-label={t("Mover «{titulo}» a la columna siguiente", { titulo: x.title })} title={t("Columna siguiente")}>▶</button>
                        </>} />
                    </div>))}
                </div>);
            })}
          </div>
        </div>))}
    </div>
  );
}

export function TaskTable({ tasks: allTasks, archived, groupRecurring = false }: { tasks: Task[]; archived?: boolean; groupRecurring?: boolean }) {
  const app = useApp();
  const today = todayIn(app.tz);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const tasks = useMemo(() => (groupRecurring && !archived ? groupSeries(allTasks, expanded) : allTasks), [allTasks, groupRecurring, archived, expanded]);
  if (!tasks.length) return <Empty>{archived ? t("No hay tareas archivadas.") : t("No hay tareas con estos filtros.")}</Empty>;
  const act = async (fn: () => Promise<unknown>, msg: string) => { try { await fn(); app.changed(); app.toast(msg, "ok"); } catch (e: any) { app.toast(e.message, "error"); } };
  const toggle = (rid: number) => setExpanded((prev: Set<number>) => { const n = new Set(prev); if (n.has(rid)) n.delete(rid); else n.add(rid); return n; });
  return (
    <div className="table-wrap">
      <table className="list">
        <thead><tr><th>{t("Tarea")}</th><th>{t("Proyecto")}</th><th>{t("Responsable")}</th><th>{t("Estado")}</th>
          {!archived && <><th>{t("Condición")}</th><th>{t("Prioridad")}</th><th>{t("Límite")}</th><th>{t("Planificada")}</th><th>{t("Estimación")}</th></>}
          {archived && <th>{t("Acciones")}</th>}</tr></thead>
        <tbody>
          {tasks.map((x) => (
            <tr key={x.id}>
              <td className="wrap">
                {x.parent_id && <span className="muted small">↳ {x.parent_title} · </span>}
                <button className="linklike" onClick={() => app.openTask(x.id)}>{x.title}</button>
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

/** Texto compacto para festivos y ausencias registrados de un día. */
export function dayContextText(c: DayContext | undefined): { holiday: string; absent: string; title: string } {
  if (!c) return { holiday: "", absent: "", title: "" };
  const holiday = c.holidays.map((h) => h.location ? t("Festivo {oficina}", { oficina: h.location }) : t("Festivo")).join(" · ");
  const absent = c.absences.length ? t("Ausente: {nombres}", { nombres: c.absences.map((a) => a.name.split(" ")[0]).join(", ") }) : "";
  const title = [...c.holidays.map((h) => `${h.name || t("Festivo")}${h.location ? ` (${h.location})` : " " + t("(todas las oficinas)")}: ${h.people.join(", ") || t("nadie asignado")}`),
    ...(c.absences.length ? [t("Ausencias registradas: {nombres}", { nombres: c.absences.map((a) => a.name).join(", ") })] : [])].join("\n");
  return { holiday, absent, title };
}

interface CalItem { task: Task; kind: "vence" | "plan" | "revision" }
const CAL_LABEL = { vence: "📅", plan: "🗓", revision: "🔎" };
const CAL_TEXT = { vence: () => t("Vence"), plan: () => t("Planificada"), revision: () => t("Revisión") };

export function Calendar({ tasks, mode, anchor, setAnchor, setMode }: {
  tasks: Task[]; mode: "semana" | "mes"; anchor: string; setAnchor: (d: string) => void; setMode: (m: "semana" | "mes") => void;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const days = mode === "semana" ? Array.from({ length: 7 }, (_, i) => addDays(viewWeekStart(anchor), i)) : monthGrid(anchor);
  const { data: ctx } = useApi<{ days: Record<string, DayContext> }>(`/api/calendar-context?start=${days[0]}&end=${days[days.length - 1]}`);
  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>();
    const put = (d: string | null, it: CalItem) => { if (d) m.set(d, [...(m.get(d) || []), it]); };
    for (const x of tasks) {
      put(x.due_date, { task: x, kind: "vence" });
      if (x.planned_date && x.planned_date !== x.due_date) put(x.planned_date, { task: x, kind: "plan" });
      if (x.next_review_at) put(utcToZonedInput(x.next_review_at, app.tz).slice(0, 10), { task: x, kind: "revision" });
    }
    return m;
  }, [tasks]);
  const undated = tasks.filter((x) => !x.due_date && !x.planned_date && !x.next_review_at).length;
  const shift = (dir: number) => {
    if (mode === "semana") setAnchor(addDays(anchor, dir * 7));
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
        <strong>{mode === "semana" ? t("Semana del {desde} al {hasta}", { desde: fmtDate(days[0]), hasta: fmtDate(days[6]) }) : `${monthName(md.getUTCMonth())} ${md.getUTCFullYear()}`}</strong>
        <span className="spacer" />
        <div role="group" aria-label={t("Escala del calendario")} className="tabs-inline">
          <button aria-pressed={mode === "semana"} className={mode === "semana" ? "active" : ""} onClick={() => setMode("semana")}>{t("Semana")}</button>
          <button aria-pressed={mode === "mes"} className={mode === "mes" ? "active" : ""} onClick={() => setMode("mes")}>{t("Mes")}</button>
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
            <div key={d} className={`cal-day${d === today ? " today" : ""}${mode === "mes" && d.slice(0, 7) !== month ? " out" : ""}${isoDow(d) >= 6 || globalHoliday ? " weekend" : ""}`}>
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

/** Línea discreta con festivos y ausencias registrados en la semana actual. */
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

export function FilterBar({ filters, setFilters, hideProject }: { filters: Filters; setFilters: (f: Filters) => void; hideProject?: boolean }) {
  const app = useApp();
  const set = (k: keyof Filters, v: any) => setFilters({ ...filters, [k]: v });
  return (
    <div className="filters" role="group" aria-label={t("Filtros")}>
      {!hideProject && <label>{t("Proyecto")} <ProjectSelect value={filters.project_id ? Number(filters.project_id) : null} emptyLabel={t("Todos")} onChange={(v) => set("project_id", v ? String(v) : "")} /></label>}
      <label>{t("Persona")} <PersonSelect value={filters.person_id ? Number(filters.person_id) : null} emptyLabel={t("Todas")} onChange={(v) => set("person_id", v ? String(v) : "")} /></label>
      <label>{t("Estado")} <select value={filters.status || ""} onChange={(e: any) => set("status", e.target.value)}>
        <option value="">{t("Operativas")}</option>{(Object.keys(STATUS) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}</select></label>
      <label>{t("Condición")} <select value={filters.condition || ""} onChange={(e: any) => set("condition", e.target.value)}>
        <option value="">{t("Cualquiera")}</option><option value="cualquiera">{t("En espera o bloqueadas")}</option><option value="espera">{t("En espera")}</option><option value="bloqueada">{t("Bloqueadas")}</option></select></label>
      <label>{t("Prioridad")} <select value={filters.priority || ""} onChange={(e: any) => set("priority", e.target.value)}>
        <option value="">{t("Todas")}</option>{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label>{t("Etiqueta")} <select value={filters.tag || ""} onChange={(e: any) => set("tag", e.target.value)}>
        <option value="">{t("Todas")}</option>{app.boot.tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
      <label>{t("Orden")} <select value={filters.sort || ""} onChange={(e: any) => set("sort", e.target.value)}>
        <option value="">{t("Manual")}</option><option value="fecha">{t("Fecha límite")}</option><option value="prioridad">{t("Prioridad")}</option></select></label>
      <label className="check"><input type="checkbox" checked={!!filters.include_backlog} onChange={(e: any) => set("include_backlog", e.target.checked)} /> {t("Backlog")}</label>
      <label className="check"><input type="checkbox" checked={!!filters.include_closed} onChange={(e: any) => set("include_closed", e.target.checked)} /> {t("Terminadas")}</label>
    </div>
  );
}

export function filtersToQuery(f: Filters): string {
  const p: string[] = [];
  const add = (k: string, v: any) => { if (v !== undefined && v !== "" && v !== false && v !== null) p.push(`${k}=${encodeURIComponent(v === true ? "1" : v)}`); };
  add("project_id", f.project_id); add("person_id", f.person_id); add("status", f.status); add("priority", f.priority);
  add("tag", f.tag); add("condition", f.condition); add("include_backlog", f.include_backlog); add("include_closed", f.include_closed); add("sort", f.sort);
  return p.length ? "?" + p.join("&") : "";
}
