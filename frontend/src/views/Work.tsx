import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { addDays, monthGrid, todayIn, weekStart } from "../lib/dates";
import { useApi, useApp } from "../lib/store";
import type { Filters, SavedView, Task } from "../lib/types";
import { Board, Calendar, FilterBar, filtersToQuery, GroupBy, TaskTable } from "../components/TaskViews";
import { ErrorBox } from "../components/ui";

type Mode = "kanban" | "lista" | "calendario";

export function WorkView() {
  const app = useApp();
  const [mode, setMode] = useState<Mode>("kanban");
  const [filters, setFilters] = useState<Filters>({});
  const [groupBy, setGroupBy] = useState<GroupBy>("ninguna");
  const [calMode, setCalMode] = useState<"semana" | "mes">("semana");
  const [anchor, setAnchor] = useState(todayIn(app.tz));
  const [viewId, setViewId] = useState("");

  let url = "/api/tasks" + filtersToQuery(filters);
  if (mode === "calendario") {
    const days = calMode === "semana" ? [weekStart(anchor), addDays(weekStart(anchor), 6)] : [monthGrid(anchor)[0], monthGrid(anchor)[41]];
    url += (url.includes("?") ? "&" : "?") + `date_from=${days[0]}&date_to=${days[1]}`;
  }
  const { data, error, reload } = useApi<Task[]>(url);

  const applyView = (id: string) => {
    setViewId(id);
    const v = app.boot.saved_views.find((x) => String(x.id) === id);
    if (v) { setMode(v.view); setFilters(v.filters || {}); }
  };
  const saveView = async () => {
    const name = window.prompt("Nombre de la vista guardada:");
    if (!name?.trim()) return;
    try {
      const v = await api.post<SavedView>("/api/saved-views", { name: name.trim(), view: mode, filters });
      await app.reloadBoot(); setViewId(String(v.id)); app.toast("Vista guardada", "ok");
    } catch (e: any) { app.toast(e.message, "error"); }
  };
  const deleteView = async () => {
    if (!viewId || !window.confirm("¿Eliminar esta vista guardada? Las tareas no se ven afectadas.")) return;
    await api.del(`/api/saved-views/${viewId}`); setViewId(""); await app.reloadBoot();
  };
  useEffect(() => { if (filters.project_id && groupBy === "ninguna") setGroupBy("linea"); }, [filters.project_id]);

  return (
    <div className="view">
      <header className="view-head row">
        <h1>Trabajo</h1>
        <div role="tablist" aria-label="Tipo de vista" className="tabs-inline">
          {(["kanban", "lista", "calendario"] as Mode[]).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
              {m === "kanban" ? "Kanban" : m === "lista" ? "Lista" : "Calendario"}
            </button>))}
        </div>
        <span className="spacer" />
        <label>Vista guardada{" "}
          <select value={viewId} onChange={(e: any) => applyView(e.target.value)}>
            <option value="">—</option>
            {app.boot.saved_views.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </label>
        <button onClick={saveView}>Guardar vista</button>
        {viewId && <button className="ghost" onClick={deleteView}>Eliminar vista</button>}
      </header>
      <FilterBar filters={filters} setFilters={(f) => { setFilters(f); setViewId(""); }} />
      {mode === "kanban" && (
        <div className="row">
          <label>Agrupar por{" "}
            <select value={groupBy} onChange={(e: any) => setGroupBy(e.target.value)}>
              <option value="ninguna">Sin agrupar</option><option value="proyecto">Proyecto</option><option value="persona">Persona</option>
              <option value="linea">Línea de trabajo</option><option value="fase">Fase</option><option value="entregable">Entregable</option>
            </select>
          </label>
          <span className="hint">Backlog y terminadas ocultos por defecto (actívalos en los filtros).</span>
        </div>
      )}
      <ErrorBox error={error} onRetry={reload} />
      {!data ? <p className="muted">Cargando…</p> :
        mode === "kanban" ? <Board tasks={data} showBacklog={!!filters.include_backlog} showDone={!!filters.include_closed} groupBy={groupBy} /> :
          mode === "lista" ? <TaskTable tasks={data} /> :
            <Calendar tasks={data} mode={calMode} setMode={setCalMode} anchor={anchor} setAnchor={setAnchor} />}
    </div>
  );
}
