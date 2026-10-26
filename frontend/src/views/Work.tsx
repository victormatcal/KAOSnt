import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { addDays, monthGrid, todayIn, viewWeekStart } from "../lib/dates";
import { t } from "../lib/i18n";
import { useApi, useApp } from "../lib/store";
import type { Filters, SavedView, Task } from "../lib/types";
import { RecurrencesModal } from "../components/Recurrences";
import { Board, Calendar, FilterBar, filtersToQuery, GroupBy, TaskTable, WeekAvailabilityStrip } from "../components/TaskViews";
import { ErrorBox } from "../components/ui";

type Mode = "kanban" | "lista" | "calendario" | "archivadas";

export function WorkView() {
  const app = useApp();
  const [mode, setMode] = useState<Mode>("kanban");
  const [filters, setFilters] = useState<Filters>({});
  const [groupBy, setGroupBy] = useState<GroupBy>("ninguna");
  const [calMode, setCalMode] = useState<"week" | "month">("week");
  const [anchor, setAnchor] = useState(todayIn(app.tz));
  const [viewId, setViewId] = useState("");
  const [recurrences, setRecurrences] = useState(false);
  const groupRec = app.boot.settings.group_recurring !== false;
  const setGroupRec = async (v: boolean) => { try { await api.patch("/api/settings", { group_recurring: v }); await app.reloadBoot(); } catch (e: any) { app.toast(e.message, "error"); } };

  let url = mode === "archivadas" ? "/api/tasks?archived=only" : "/api/tasks" + filtersToQuery(filters);
  if (mode === "calendario") {
    const days = calMode === "week" ? [viewWeekStart(anchor), addDays(viewWeekStart(anchor), 6)] : [monthGrid(anchor)[0], monthGrid(anchor)[41]];
    url += (url.includes("?") ? "&" : "?") + `date_from=${days[0]}&date_to=${days[1]}`;
  }
  const { data, error, reload } = useApi<Task[]>(url);

  const applyView = (id: string) => {
    setViewId(id);
    const v = app.boot.saved_views.find((x) => String(x.id) === id);
    if (v) { setMode(v.view); setFilters(v.filters || {}); }
  };
  const saveView = async () => {
    const name = window.prompt(t("Nombre de la vista guardada:"));
    if (!name?.trim()) return;
    try {
      const v = await api.post<SavedView>("/api/saved-views", { name: name.trim(), view: mode === "archivadas" ? "lista" : mode, filters });
      await app.reloadBoot(); setViewId(String(v.id)); app.toast(t("Vista guardada"), "ok");
    } catch (e: any) { app.toast(e.message, "error"); }
  };
  useEffect(() => { if (filters.project_id && groupBy === "ninguna") setGroupBy("linea"); }, [filters.project_id]);

  const tabs: [Mode, string][] = [["kanban", t("Kanban")], ["lista", t("Lista")], ["calendario", t("Calendario")], ["archivadas", t("Archivadas")]];
  return (
    <div className="view">
      <header className="view-head row">
        <h1>{t("Trabajo")}</h1>
        <div role="tablist" aria-label={t("Tipo de vista")} className="tabs-inline">
          {tabs.map(([m, label]) => <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>{label}</button>)}
        </div>
        <span className="spacer" />
        <button onClick={() => setRecurrences(true)} title={t("Ver y gestionar todas las series recurrentes")}>↻ {t("Recurrentes")}</button>
        {mode !== "archivadas" && <>
          <label>{t("Vista guardada")} <select value={viewId} onChange={(e: any) => applyView(e.target.value)}>
            <option value="">—</option>{app.boot.saved_views.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
          <button onClick={saveView}>{t("Guardar vista")}</button>
          {viewId && <button className="ghost" onClick={async () => { if (window.confirm(t("¿Eliminar esta vista guardada? Las tareas no se ven afectadas."))) { await api.del(`/api/saved-views/${viewId}`); setViewId(""); await app.reloadBoot(); } }}>{t("Eliminar vista")}</button>}
        </>}
      </header>
      {mode === "archivadas" ? <p className="hint">{t("Tareas archivadas: restáuralas o elimínalas definitivamente. Archivar oculta una tarea de todas las vistas sin borrarla.")}</p> : <>
        <FilterBar filters={filters} setFilters={(f) => { setFilters(f); setViewId(""); }} />
        <WeekAvailabilityStrip />
        {(mode === "kanban" || mode === "lista") && <div className="row">
          {mode === "kanban" && <label>{t("Agrupar por")} <select value={groupBy} onChange={(e: any) => setGroupBy(e.target.value)}>
            <option value="ninguna">{t("Sin agrupar")}</option><option value="proyecto">{t("Proyecto")}</option><option value="persona">{t("Persona")}</option>
            <option value="linea">{t("Línea de trabajo")}</option><option value="fase">{t("Fase")}</option><option value="entregable">{t("Entregable")}</option></select></label>}
          <label className="check" title={t("Una tarjeta por serie y estado (la ocurrencia abierta más antigua) con «↻ +N»; pulsa para desplegar la serie")}>
            <input type="checkbox" checked={groupRec} onChange={(e: any) => setGroupRec(e.target.checked)} /> {t("Agrupar series recurrentes")}</label>
          {mode === "kanban" && <span className="hint">{t("Backlog y terminadas ocultos por defecto (actívalos en los filtros).")}</span>}
        </div>}
      </>}
      <ErrorBox error={error} onRetry={reload} />
      {!data ? <p className="muted">{t("Cargando…")}</p> :
        mode === "kanban" ? <Board tasks={data} showBacklog={!!filters.include_backlog} showDone={!!filters.include_closed} groupBy={groupBy} groupRecurring={groupRec} /> :
          mode === "lista" ? <TaskTable tasks={data} groupRecurring={groupRec} /> :
            mode === "archivadas" ? <TaskTable tasks={data} archived /> :
              <Calendar tasks={data} mode={calMode} setMode={setCalMode} anchor={anchor} setAnchor={setAnchor} />}
      {recurrences && <RecurrencesModal onClose={() => setRecurrences(false)} />}
    </div>
  );
}
