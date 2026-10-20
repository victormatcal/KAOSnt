import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./lib/api";
import { inQuietHours } from "./lib/dates";
import { AppCtx, Ctx, Toast } from "./lib/store";
import type { Bootstrap, Reminder } from "./lib/types";
import { QuickTask, SearchDialog } from "./components/QuickCapture";
import { RecurrencesModal } from "./components/Recurrences";
import { TaskPanel } from "./components/TaskPanel";
import { ErrorBox } from "./components/ui";
import { activeSavers, NotesView } from "./views/Notes";
import { ProjectDetail, ProjectsView } from "./views/Projects";
import { SettingsView } from "./views/Settings";
import { TeamView } from "./views/Team";
import { TodayView } from "./views/Today";
import { WorkView } from "./views/Work";

const NAV: [string, string, string][] = [
  ["hoy", "Hoy", "Alt+1"], ["proyectos", "Proyectos", "Alt+2"], ["trabajo", "Trabajo", "Alt+3"],
  ["equipo", "Equipo", "Alt+4"], ["notas", "Notas", "Alt+5"],
];

export function parseRoute(hash: string): { view: string; id?: number } {
  const [, view = "", id] = (hash || "").replace(/^#/, "").split("/");
  const n = id ? Number(id) : undefined;
  return { view, id: n && Number.isFinite(n) ? n : undefined };
}

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

export function App({ initialBoot }: { initialBoot?: Bootstrap }) {
  const [boot, setBoot] = useState<Bootstrap | null>(initialBoot ?? null);
  const [bootError, setBootError] = useState("");
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  const [dataVersion, setDataVersion] = useState(0);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [quick, setQuick] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState(false);
  const [recurrences, setRecurrences] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reminderCount, setReminderCount] = useState(0);
  const toastSeq = useRef(0);

  const reloadBoot = useCallback(async () => {
    try { setBoot(await api.get<Bootstrap>("/api/bootstrap")); setBootError(""); } catch (e: any) { setBootError(e.message); }
  }, []);
  useEffect(() => { if (!initialBoot) void reloadBoot(); }, []);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  // Vista inicial configurable / recordar la última vista
  useEffect(() => {
    if (!boot || window.location.hash) return;
    const sv = boot.settings.start_view;
    window.location.hash = "#/" + (sv === "ultima" ? boot.settings.last_view || "hoy" : sv || "hoy");
  }, [boot === null]);
  const route = parseRoute(hash);
  useEffect(() => {
    if (!boot || boot.settings.start_view !== "ultima" || !route.view || route.view === boot.settings.last_view) return;
    const t = setTimeout(() => { api.patch("/api/settings", { last_view: route.view }).catch(() => undefined); }, 1500);
    return () => clearTimeout(t);
  }, [route.view]);

  const toast = useCallback((text: string, kind: Toast["kind"] = "info", action?: Toast["action"]) => {
    const id = ++toastSeq.current;
    setToasts((t: Toast[]) => [...t.slice(-3), { id, text, kind, action }]);
    setTimeout(() => setToasts((t: Toast[]) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 5000);
  }, []);
  const navigate = useCallback((h: string) => { window.location.hash = h; }, []);
  const newNote = useCallback(async (preset: Record<string, unknown> = {}) => {
    try {
      const n = await api.post<{ id: number }>("/api/notes", preset);
      setDataVersion((v: number) => v + 1);
      window.location.hash = `#/notas/${n.id}`;
    } catch (e: any) { toast(e.message, "error"); }
  }, []);

  const ctx: AppCtx | null = useMemo(() => boot && ({
    boot, tz: boot.settings.timezone, meId: boot.me_id,
    person: (id) => (id == null ? undefined : boot.people.find((p) => p.id === id)),
    project: (id) => (id == null ? undefined : boot.projects.find((p) => p.id === id)),
    reloadBoot, dataVersion, changed: () => setDataVersion((v: number) => v + 1),
    openTask: (id) => setTaskId(id), quickTask: (preset) => setQuick(preset || {}), newNote, navigate, toast,
  }), [boot, dataVersion]);

  // Atajos globales (visibles en la barra superior)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && (e.key === "t" || e.key === "T") && !e.shiftKey) { e.preventDefault(); setQuick({}); }
      else if (e.altKey && !e.ctrlKey && (e.key === "n" || e.key === "N")) { e.preventDefault(); void newNote(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setSearch(true); }
      else if (e.key === "/" && !isTyping(e)) { e.preventDefault(); setSearch(true); }
      else if (e.altKey && !e.ctrlKey && /^[1-5]$/.test(e.key)) { e.preventDefault(); navigate("#/" + NAV[Number(e.key) - 1][0]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Aviso antes de cerrar con texto de notas sin confirmar
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      for (const s of activeSavers) if (s.hasUnsaved) { void s.flush(); e.preventDefault(); e.returnValue = ""; return; }
    };
    const hidden = () => { if (document.visibilityState === "hidden") for (const s of activeSavers) void s.flush(); };
    window.addEventListener("beforeunload", before);
    document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("beforeunload", before); document.removeEventListener("visibilitychange", hidden); };
  }, []);

  // Recordatorios: recálculo periódico mientras la aplicación está abierta y aviso agrupado opcional
  useEffect(() => {
    if (!boot) return;
    const check = async () => {
      try {
        const r = await api.get<{ active: Reminder[] }>("/api/reminders");
        setReminderCount(r.active.length);
        const fresh = r.active.filter((x) => !x.notified);
        const st = boot.settings;
        if (!fresh.length || !st.notifications_enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
        if (inQuietHours(st.quiet_start, st.quiet_end, st.timezone)) return;
        const body = st.notifications_discreet || fresh.length > 1
          ? `${fresh.length} recordatorio(s) pendiente(s)`
          : `${fresh[0].rule_label}`;
        new Notification(st.app_name || "Centro de trabajo", { body, tag: "centro-recordatorios", silent: false });
        await api.post("/api/reminders/notified", { ids: fresh.map((x) => x.id) });
      } catch { /* el centro interno sigue disponible */ }
    };
    void check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [boot?.settings.notifications_enabled, dataVersion]);

  if (!boot || !ctx) {
    return <main className="boot">{bootError ? <ErrorBox error={bootError} onRetry={reloadBoot} /> : <p>Cargando Centro de trabajo…</p>}</main>;
  }

  let content;
  switch (route.view) {
    case "proyectos": content = route.id ? <ProjectDetail key={route.id} id={route.id} /> : <ProjectsView />; break;
    case "trabajo": content = <WorkView />; break;
    case "equipo": content = <TeamView personId={route.id} />; break;
    case "notas": content = <NotesView routeId={route.id} />; break;
    case "config": content = <SettingsView />; break;
    default: content = <TodayView />;
  }
  const current = route.view || "hoy";

  return (
    <Ctx.Provider value={ctx}>
      <a className="skip" href="#main">Saltar al contenido</a>
      <header className="topbar">
        <span className="brand">{boot.settings.app_name || "Centro de trabajo"}{boot.demo && <span className="demo-badge">DEMO · datos ficticios</span>}</span>
        <nav aria-label="Principal" className="mainnav">
          {NAV.map(([k, label, key]) => (
            <a key={k} href={`#/${k}`} className={current === k ? "active" : ""} aria-current={current === k ? "page" : undefined} title={key}>{label}</a>
          ))}
        </nav>
        <span className="spacer" />
        <button onClick={() => setQuick({})} title="Alt+T">+ Tarea <kbd>Alt+T</kbd></button>
        <button onClick={() => newNote()} title="Alt+N">+ Nota <kbd>Alt+N</kbd></button>
        <button onClick={() => setSearch(true)} title="Ctrl+K o /">Buscar <kbd>Ctrl+K</kbd></button>
        {current === "trabajo" && <button onClick={() => setRecurrences(true)}>Recurrentes</button>}
        <a href="#/hoy" className="bell" title="Recordatorios pendientes (en Hoy)" aria-label={`${reminderCount} recordatorios pendientes`}>🔔 {reminderCount}</a>
        <a href="#/config" className={current === "config" ? "active" : ""} title="Configuración, copias y cierre">⚙ Configuración</a>
      </header>
      <div className={"layout" + (taskId ? " with-panel" : "")}>
        <main id="main" tabIndex={-1}>{content}</main>
        {taskId !== null && <TaskPanel key={taskId} id={taskId} onClose={() => setTaskId(null)} />}
      </div>
      {quick && <QuickTask preset={quick} onClose={() => setQuick(null)} />}
      {search && <SearchDialog onClose={() => setSearch(false)} />}
      {recurrences && <RecurrencesModal onClose={() => setRecurrences(false)} />}
      <div className="toasts" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <span>{t.text}</span>
            {t.action && <button className="small" onClick={() => { t.action!.run(); setToasts((x: Toast[]) => x.filter((y) => y.id !== t.id)); }}>{t.action.label}</button>}
            <button className="ghost small" aria-label="Cerrar aviso" onClick={() => setToasts((x: Toast[]) => x.filter((y) => y.id !== t.id))}>✕</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
