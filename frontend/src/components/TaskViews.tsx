import { useMemo, useState } from "react";
import { api, ApiError } from "../lib/api";
import { addDays, fmtDate, isoDow, monthGrid, todayIn, utcToZonedInput, weekStart } from "../lib/dates";
import { BOARD_COLUMNS, CONDITION, GROUPING_KIND, PRIORITY, PRIORITY_MARK, STATUS } from "../lib/labels";
import { useApp } from "../lib/store";
import type { Filters, Task, TaskStatus } from "../lib/types";
import { TaskCard } from "./TaskCard";
import { Empty, PersonSelect, ProjectSelect } from "./ui";

/** Mueve/reordena una tarea; si la aprobación está pendiente pide confirmación explícita. */
export async function moveTask(id: number, body: { status?: TaskStatus; before_id?: number; after_id?: number }): Promise<boolean> {
  try {
    await api.post(`/api/tasks/${id}/reorder`, body);
    return true;
  } catch (e) {
    if (e instanceof ApiError && e.code === "aprobacion_pendiente") {
      if (!window.confirm(e.message)) return false;
      await api.post(`/api/tasks/${id}/reorder`, { ...body, force: true });
      return true;
    }
    throw e;
  }
}

export type GroupBy = "ninguna" | "linea" | "fase" | "entregable" | "proyecto" | "persona";

export function Board({ tasks, showBacklog, showDone, groupBy = "ninguna", showProject = true }: {
  tasks: Task[]; showBacklog: boolean; showDone: boolean; groupBy?: GroupBy; showProject?: boolean;
}) {
  const app = useApp();
  const [dragId, setDragId] = useState<number | null>(null);
  const columns: TaskStatus[] = [...(showBacklog ? ["backlog" as TaskStatus] : []), ...BOARD_COLUMNS.filter((c) => c !== "hecha" || showDone)];

  const lanes = useMemo(() => {
    if (groupBy === "ninguna") return [{ key: "all", label: "", tasks }];
    const keyOf = (t: Task): number | null =>
      groupBy === "linea" ? t.workstream_id : groupBy === "fase" ? t.phase_id : groupBy === "entregable" ? t.deliverable_id
        : groupBy === "proyecto" ? t.project_id : t.assignee_id;
    const labelOf = (k: number | null): string => {
      if (k === null) return groupBy === "persona" ? "Sin asignar" : groupBy === "proyecto" ? "Sin proyecto" : `Sin ${GROUPING_KIND[groupBy].toLowerCase()}`;
      if (groupBy === "proyecto") return app.project(k)?.name || `#${k}`;
      if (groupBy === "persona") return app.person(k)?.name || `#${k}`;
      return app.boot.groupings.find((g) => g.id === k)?.name || `#${k}`;
    };
    const map = new Map<number | null, Task[]>();
    for (const t of tasks) { const k = keyOf(t); map.set(k, [...(map.get(k) || []), t]); }
    return [...map.entries()].sort((a, b) => (a[0] === null ? 1 : b[0] === null ? -1 : labelOf(a[0]).localeCompare(labelOf(b[0]))))
      .map(([k, ts]) => ({ key: String(k), label: labelOf(k), tasks: ts }));
  }, [tasks, groupBy, app.boot]);

  const act = async (id: number, body: { status?: TaskStatus; before_id?: number; after_id?: number }) => {
    try { if (await moveTask(id, body)) app.changed(); } catch (e: any) { app.toast(e.message, "error"); }
  };

  if (!tasks.length) return <Empty>No hay tareas con estos filtros. Crea una con «Nueva tarea» (Alt+T) o revisa los filtros.</Empty>;

  return (
    <div className="board-wrap">
      {lanes.map((lane) => (
        <div key={lane.key} className="lane">
          {lane.label && <h3 className="lane-title">{lane.label} <span className="count">({lane.tasks.length})</span></h3>}
          <div className="board" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(220px, 1fr))` }}>
            {columns.map((col, ci) => {
              const items = lane.tasks.filter((t) => t.status === col).sort((a, b) => a.position - b.position);
              return (
                <div key={col} className="column" aria-label={`Columna ${STATUS[col]}`}
                  onDragOver={(e: any) => e.preventDefault()}
                  onDrop={(e: any) => {
                    e.preventDefault();
                    if (dragId === null) return;
                    const last = items.filter((t) => t.id !== dragId).slice(-1)[0];
                    void act(dragId, { status: col, ...(last ? { after_id: last.id } : {}) });
                    setDragId(null);
                  }}>
                  <h4 className="column-title">{STATUS[col]} <span className="count">{items.length}</span></h4>
                  {items.map((t, i) => (
                    <div key={t.id} onDragOver={(e: any) => e.preventDefault()}
                      onDrop={(e: any) => {
                        e.preventDefault(); e.stopPropagation();
                        if (dragId === null || dragId === t.id) return;
                        const prev = items.slice(0, i).filter((x) => x.id !== dragId).slice(-1)[0];
                        void act(dragId, { status: col, before_id: t.id, ...(prev ? { after_id: prev.id } : {}) });
                        setDragId(null);
                      }}>
                      <TaskCard task={t} showProject={showProject} draggable onDragStart={(e: any) => { setDragId(t.id); e.dataTransfer.setData("text/plain", String(t.id)); }}
                        actions={<>
                          <button className="ghost small" disabled={ci === 0} onClick={() => act(t.id, { status: columns[ci - 1] })} aria-label={`Mover «${t.title}» a ${ci > 0 ? STATUS[columns[ci - 1]] : ""}`} title="Mover a la columna anterior">◀</button>
                          <button className="ghost small" disabled={i === 0} onClick={() => act(t.id, { before_id: items[i - 1].id, ...(i > 1 ? { after_id: items[i - 2].id } : {}) })} aria-label={`Subir «${t.title}»`} title="Subir">▲</button>
                          <button className="ghost small" disabled={i === items.length - 1} onClick={() => act(t.id, { after_id: items[i + 1].id, ...(i + 2 < items.length ? { before_id: items[i + 2].id } : {}) })} aria-label={`Bajar «${t.title}»`} title="Bajar">▼</button>
                          <button className="ghost small" disabled={ci === columns.length - 1} onClick={() => act(t.id, { status: columns[ci + 1] })} aria-label={`Mover «${t.title}» a ${ci < columns.length - 1 ? STATUS[columns[ci + 1]] : ""}`} title="Mover a la columna siguiente">▶</button>
                        </>} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const app = useApp();
  const today = todayIn(app.tz);
  if (!tasks.length) return <Empty>No hay tareas con estos filtros.</Empty>;
  return (
    <div className="table-wrap">
      <table className="list">
        <thead><tr>
          <th>Tarea</th><th>Proyecto</th><th>Responsable</th><th>Estado</th><th>Condición</th><th>Prioridad</th>
          <th>Límite</th><th>Planificada</th><th>Estimación</th>
        </tr></thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td><button className="linklike" onClick={() => app.openTask(t.id)}>{t.title}</button>
                {t.open_blockers > 0 && <span className="muted" title="Depende de otras tareas"> ⛓{t.open_blockers}</span>}
                {t.open_dependents > 0 && <span className="muted" title="Bloquea otras tareas"> ➜{t.open_dependents}</span>}</td>
              <td>{app.project(t.project_id)?.name || "—"}</td>
              <td>{app.person(t.assignee_id)?.name || "Sin asignar"}</td>
              <td>{STATUS[t.status]}</td>
              <td>{t.condition ? CONDITION[t.condition] : "—"}</td>
              <td>{PRIORITY_MARK[t.priority]} {PRIORITY[t.priority]}</td>
              <td className={t.due_date && t.due_date < today ? "overdue" : ""}>{t.due_date ? fmtDate(t.due_date) + (t.due_date < today ? " (vencida)" : "") : "—"}</td>
              <td>{t.planned_date ? fmtDate(t.planned_date) : "—"}</td>
              <td>{t.estimate_hours !== null ? `${t.estimate_hours} h` : "no informado"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface CalItem { task: Task; kind: "vence" | "plan" | "revision" }
const CAL_LABEL = { vence: "📅 Vence", plan: "🗓 Plan", revision: "🔎 Revisión" };

export function Calendar({ tasks, mode, anchor, setAnchor, setMode }: {
  tasks: Task[]; mode: "semana" | "mes"; anchor: string; setAnchor: (d: string) => void; setMode: (m: "semana" | "mes") => void;
}) {
  const app = useApp();
  const today = todayIn(app.tz);
  const days = mode === "semana" ? Array.from({ length: 7 }, (_, i) => addDays(weekStart(anchor), i)) : monthGrid(anchor);
  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>();
    const put = (d: string | null, it: CalItem) => { if (d) m.set(d, [...(m.get(d) || []), it]); };
    for (const t of tasks) {
      put(t.due_date, { task: t, kind: "vence" });
      if (t.planned_date && t.planned_date !== t.due_date) put(t.planned_date, { task: t, kind: "plan" });
      if (t.next_review_at) put(utcToZonedInput(t.next_review_at, app.tz).slice(0, 10), { task: t, kind: "revision" });
    }
    return m;
  }, [tasks]);
  const undated = tasks.filter((t) => !t.due_date && !t.planned_date && !t.next_review_at).length;
  const step = mode === "semana" ? 7 : 0;
  const shift = (dir: number) => {
    if (mode === "semana") setAnchor(addDays(anchor, dir * step));
    else { const d = new Date(anchor.slice(0, 8) + "15T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + dir); setAnchor(d.toISOString().slice(0, 10)); }
  };
  const month = anchor.slice(0, 7);
  return (
    <div>
      <div className="row cal-bar">
        <button onClick={() => shift(-1)} aria-label="Anterior">◀</button>
        <button onClick={() => setAnchor(today)}>Hoy</button>
        <button onClick={() => shift(1)} aria-label="Siguiente">▶</button>
        <strong>{mode === "semana" ? `Semana del ${fmtDate(days[0])} al ${fmtDate(days[6])}` : new Date(anchor.slice(0, 8) + "15T12:00:00Z").toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })}</strong>
        <span className="spacer" />
        <div role="group" aria-label="Escala del calendario">
          <button aria-pressed={mode === "semana"} className={mode === "semana" ? "active" : ""} onClick={() => setMode("semana")}>Semana</button>
          <button aria-pressed={mode === "mes"} className={mode === "mes" ? "active" : ""} onClick={() => setMode("mes")}>Mes</button>
        </div>
      </div>
      <p className="hint">Leyenda: 📅 Vence = fecha límite · 🗓 Plan = fecha planificada · 🔎 Revisión = fecha de revisión. {undated > 0 && `${undated} tarea(s) sin fecha no se muestran (no se inventan fechas).`}</p>
      <div className={`calendar cal-${mode}`}>
        {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {days.map((d) => {
          const items = byDay.get(d) || [];
          const out = mode === "mes" && d.slice(0, 7) !== month;
          return (
            <div key={d} className={`cal-day${d === today ? " today" : ""}${out ? " out" : ""}${isoDow(d) >= 6 ? " weekend" : ""}`}>
              <div className="cal-date">{Number(d.slice(8))}{d === today && <span className="sr"> (hoy)</span>}</div>
              {items.map((it) => (
                <button key={it.kind + it.task.id} className={`cal-item cal-${it.kind}`} onClick={() => app.openTask(it.task.id)} title={`${CAL_LABEL[it.kind]}: ${it.task.title}`}>
                  <span className="cal-kind">{CAL_LABEL[it.kind]}</span> {it.task.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FilterBar({ filters, setFilters, hideProject }: { filters: Filters; setFilters: (f: Filters) => void; hideProject?: boolean }) {
  const app = useApp();
  const set = (k: keyof Filters, v: any) => setFilters({ ...filters, [k]: v });
  return (
    <div className="filters" role="group" aria-label="Filtros">
      {!hideProject && <label>Proyecto <ProjectSelect value={filters.project_id ? Number(filters.project_id) : null} emptyLabel="Todos" onChange={(v) => set("project_id", v ? String(v) : "")} /></label>}
      <label>Persona <PersonSelect value={filters.person_id ? Number(filters.person_id) : null} emptyLabel="Todas" onChange={(v) => set("person_id", v ? String(v) : "")} /></label>
      <label>Estado
        <select value={filters.status || ""} onChange={(e: any) => set("status", e.target.value)}>
          <option value="">Operativas</option>
          {(Object.keys(STATUS) as TaskStatus[]).map((s) => <option key={s} value={s}>{STATUS[s]}</option>)}
        </select>
      </label>
      <label>Condición
        <select value={filters.condition || ""} onChange={(e: any) => set("condition", e.target.value)}>
          <option value="">Cualquiera</option><option value="cualquiera">En espera o bloqueadas</option>
          <option value="espera">En espera</option><option value="bloqueada">Bloqueadas</option>
        </select>
      </label>
      <label>Prioridad
        <select value={filters.priority || ""} onChange={(e: any) => set("priority", e.target.value)}>
          <option value="">Todas</option>{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>Etiqueta
        <select value={filters.tag || ""} onChange={(e: any) => set("tag", e.target.value)}>
          <option value="">Todas</option>{app.boot.tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>Orden
        <select value={filters.sort || ""} onChange={(e: any) => set("sort", e.target.value)}>
          <option value="">Manual</option><option value="fecha">Fecha límite</option><option value="prioridad">Prioridad</option>
        </select>
      </label>
      <label className="check"><input type="checkbox" checked={!!filters.include_backlog} onChange={(e: any) => set("include_backlog", e.target.checked)} /> Backlog</label>
      <label className="check"><input type="checkbox" checked={!!filters.include_closed} onChange={(e: any) => set("include_closed", e.target.checked)} /> Terminadas</label>
    </div>
  );
}

export function filtersToQuery(f: Filters): string {
  const p: string[] = [];
  const add = (k: string, v: any) => { if (v !== undefined && v !== "" && v !== false && v !== null) p.push(`${k}=${encodeURIComponent(v === true ? "1" : v)}`); };
  add("project_id", f.project_id); add("person_id", f.person_id); add("status", f.status); add("priority", f.priority);
  add("tag", f.tag); add("condition", f.condition); add("include_backlog", f.include_backlog); add("include_closed", f.include_closed);
  add("sort", f.sort);
  return p.length ? "?" + p.join("&") : "";
}
