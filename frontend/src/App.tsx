import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./lib/api";
import { inQuietHours } from "./lib/dates";
import { t } from "./lib/i18n";
import { applyPrefs } from "./lib/prefs";
import { restoreScroll, saveScroll } from "./lib/viewstate";
import { AppCtx, Ctx, Toast } from "./lib/store";
import type { Bootstrap, Reminder } from "./lib/types";
import { QuickTask, SearchDialog } from "./components/QuickCapture";
import { PanelResizer } from "./components/PanelResizer";
import { ScopeHost } from "./components/ScopeDialog";
import { PANEL_SETTING_MAX, PANEL_SETTING_MIN } from "./lib/panel";
import { ReminderCenter, ReminderTab } from "./components/ReminderCenter";
import { TaskPanel } from "./components/TaskPanel";
import { ErrorBox } from "./components/ui";
import { activeSavers, NotesView } from "./views/Notes";
import { ProjectDetail, ProjectsView } from "./views/Projects";
import { SettingsView } from "./views/Settings";
import { TeamView } from "./views/Team";
import { TodayView } from "./views/Today";
import { WorkView } from "./views/Work";

const NAV: [string, () => string, string][] = [
  ["hoy", () => t("Hoy"), "Alt+1"], ["proyectos", () => t("Proyectos"), "Alt+2"], ["trabajo", () => t("Trabajo"), "Alt+3"],
  ["equipo", () => t("Equipo"), "Alt+4"], ["notas", () => t("Notas"), "Alt+5"],
];

export function parseRoute(hash: string): { view: string; id?: number } {
  const [, view = "", id] = (hash || "").replace(/^#/, "").split("/");
  const n = id ? Number(id) : undefined;
  return { view, id: n && Number.isFinite(n) ? n : undefined };
}

/** «Home» destination: the configured start screen (or the last view if configured so). */
export function homeHash(s: { start_view: string; last_view: string }): string {
  return "#/" + (s.start_view === "ultima" ? s.last_view || "hoy" : s.start_view || "hoy");
}

function isTyping(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function App({ initialBoot }: { initialBoot?: Bootstrap }) {
  const [boot, setBoot] = useState<Bootstrap | null>(initialBoot ?? null);
  const [bootError, setBootError] = useState("");
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  const [dataVersion, setDataVersion] = useState(0);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [quick, setQuick] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reminderCount, setReminderCount] = useState(0);
  const [remCenter, setRemCenter] = useState<ReminderTab | null>(null);
  // Task panel width (0.4): live value while resizing; saved in the settings when the gesture ends
  const layoutRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<number | null>(initialBoot?.settings.task_panel_width ?? null);
  useEffect(() => { if (boot) setPanelWidth(boot.settings.task_panel_width ?? null); }, [boot?.settings.task_panel_width]);
  const commitPanelWidth = (w: number | null) => {
    if (w !== null) w = Math.min(Math.max(w, PANEL_SETTING_MIN), PANEL_SETTING_MAX);
    setPanelWidth(w);
    api.patch("/api/settings", { task_panel_width: w }).then(
      () => setBoot((b: Bootstrap | null) => (b ? { ...b, settings: { ...b.settings, task_panel_width: w } } : b)), () => undefined);
  };
  const [systemDark, setSystemDark] = useState(false);
  const toastSeq = useRef(0);
  // Language, date format and theme: applied before painting with the settings received
  if (boot) applyPrefs(boot.settings, systemDark);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  const reloadBoot = useCallback(async () => {
    try { setBoot(await api.get<Bootstrap>("/api/bootstrap")); setBootError(""); } catch (e: any) { setBootError(e.message); }
  }, []);
  useEffect(() => { if (!initialBoot) void reloadBoot(); }, []);
  // Each screen keeps its scroll position for the browser session (0.5)
  const lastHash = useRef(typeof window !== "undefined" ? window.location.hash : "");
  useEffect(() => {
    const on = () => { saveScroll(lastHash.current); lastHash.current = window.location.hash; setHash(window.location.hash); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { restoreScroll(hash); }, [hash]);
  useEffect(() => { if (boot) document.title = boot.settings.app_name || "KAOSnt"; }, [boot?.settings.app_name]);
  useEffect(() => { if (boot && !window.location.hash) window.location.hash = homeHash(boot.settings); }, [boot === null]);
  const route = parseRoute(hash);
  useEffect(() => {
    if (!boot || boot.settings.start_view !== "ultima" || !route.view || route.view === boot.settings.last_view) return;
    const timer = setTimeout(() => { api.patch("/api/settings", { last_view: route.view }).catch(() => undefined); }, 1500);
    return () => clearTimeout(timer);
  }, [route.view]);

  const pushToast = useCallback((x: Omit<Toast, "id">) => {
    const id = ++toastSeq.current;
    const ms = x.ms ?? (x.kind === "error" ? 9000 : 5000);
    setToasts((list: Toast[]) => [...list.slice(-3), { ...x, id, ms }]);
    setTimeout(() => setToasts((list: Toast[]) => list.filter((y) => y.id !== id)), ms);
  }, []);
  const toast = useCallback((text: string, kind: Toast["kind"] = "info", action?: Toast["action"]) => pushToast({ text, kind, action }), []);
  const navigate = useCallback((h: string) => { window.location.hash = h; }, []);
  const newNote = useCallback(async (preset: Record<string, unknown> = {}) => {
    try { const n = await api.post<{ id: number }>("/api/notes", preset); setDataVersion((v: number) => v + 1); window.location.hash = `#/notas/${n.id}`; }
    catch (e: any) { toast(e.message, "error"); }
  }, []);

  const ctx: AppCtx | null = useMemo(() => boot && ({
    boot, tz: boot.settings.timezone, meId: boot.me_id,
    person: (id) => (id == null ? undefined : boot.people.find((p) => p.id === id)),
    project: (id) => (id == null ? undefined : boot.projects.find((p) => p.id === id)),
    reloadBoot, dataVersion, changed: () => setDataVersion((v: number) => v + 1),
    openTask: (id) => setTaskId(id), quickTask: (preset) => setQuick(preset || {}), newNote, navigate, toast,
    undoable: (text, undoId) => {
      if (!undoId) { toast(text, "ok"); return; }
      pushToast({ text, kind: "ok", undo: true, ms: Math.max(3, Math.min(60, boot.settings.undo_seconds || 8)) * 1000, action: {
        label: t("Deshacer"),
        run: () => { api.post(`/api/undo/${undoId}`).then(() => { setDataVersion((v: number) => v + 1); toast(t("Acción deshecha"), "ok"); }, (e: any) => toast(e.message, "error")); },
      } });
    },
    openReminders: (tab) => setRemCenter(tab || "pending"),
  }), [boot, dataVersion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) return; // AltGr on Spanish keyboards
      if (e.defaultPrevented) return; // already handled (e.g. Ctrl+K = link inside the Markdown editor)
      if (e.altKey && !e.shiftKey && (e.key === "t" || e.key === "T")) { e.preventDefault(); setQuick({}); }
      else if (e.altKey && (e.key === "n" || e.key === "N")) { e.preventDefault(); void newNote(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); setSearch(true); }
      else if (e.key === "/" && !isTyping(e)) { e.preventDefault(); setSearch(true); }
      else if (e.altKey && /^[1-5]$/.test(e.key)) { e.preventDefault(); navigate("#/" + NAV[Number(e.key) - 1][0]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => { for (const s of activeSavers) if (s.hasUnsaved) { void s.flush(); e.preventDefault(); e.returnValue = ""; return; } };
    const hidden = () => { if (document.visibilityState === "hidden") for (const s of activeSavers) void s.flush(); };
    window.addEventListener("beforeunload", before);
    document.addEventListener("visibilitychange", hidden);
    return () => { window.removeEventListener("beforeunload", before); document.removeEventListener("visibilitychange", hidden); };
  }, []);

  // Reminders: periodic recalculation while the app is open and optional grouped notification
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
        const body = st.notifications_discreet || fresh.length > 1 ? t("{n} recordatorio(s) pendiente(s)", { n: fresh.length }) : t(fresh[0].rule_label);
        new Notification(st.app_name || "KAOSnt", { body, tag: "kaosnt-recordatorios" });
        await api.post("/api/reminders/notified", { ids: fresh.map((x) => x.id) });
      } catch { /* the internal centre is still available */ }
    };
    void check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [boot?.settings.notifications_enabled, dataVersion]);

  if (!boot || !ctx) return <main className="boot">{bootError ? <ErrorBox error={bootError} onRetry={reloadBoot} /> : <p>{t("Cargando…")}</p>}</main>;

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
      <div key={boot.settings.language} className="app-root">
      <a className="skip" href="#main">{t("Saltar al contenido")}</a>
      <header className="topbar">
        <a className="brand" href={homeHash(boot.settings)} title={t("Ir a la pantalla de inicio")}>{boot.settings.app_name || "KAOSnt"}</a>
        {boot.demo && <span className="demo-badge">{t("DEMO · datos ficticios")}</span>}
        <nav aria-label={t("Principal")} className="mainnav">
          {NAV.map(([k, label, key]) => <a key={k} href={`#/${k}`} className={current === k ? "active" : ""} aria-current={current === k ? "page" : undefined} title={key}>{label()}</a>)}
        </nav>
        <span className="spacer" />
        <button onClick={() => setQuick({})} title="Alt+T">{t("+ Tarea")} <kbd>Alt+T</kbd></button>
        <button onClick={() => newNote()} title="Alt+N">{t("+ Nota")} <kbd>Alt+N</kbd></button>
        <button onClick={() => setSearch(true)} title={t("Ctrl+K o /")}>{t("Buscar")} <kbd>Ctrl+K</kbd></button>
        <button className="bell ghost" onClick={() => setRemCenter("pending")} title={t("Centro de recordatorios: pendientes, programados y resueltos")}
          aria-label={t("Recordatorios: {n} pendientes", { n: reminderCount })}>🔔 {reminderCount}</button>
        <a href="#/config" className={"navlink" + (current === "config" ? " active" : "")} title={t("Configuración, copias y cierre")}>⚙ {t("Configuración")}</a>
      </header>
      <div ref={layoutRef} className={"layout" + (taskId ? " with-panel" : "") + (panelWidth !== null ? " custom-width" : "")}
        style={panelWidth !== null ? { ["--panel-w" as any]: `${panelWidth}px` } : undefined}>
        <main id="main" tabIndex={-1}>{content}</main>
        {taskId !== null && <div className="panel-wrap">
          <PanelResizer width={panelWidth} layout={() => layoutRef.current} onResize={setPanelWidth} onCommit={commitPanelWidth} />
          <TaskPanel key={taskId} id={taskId} onClose={() => setTaskId(null)} />
        </div>}
      </div>
      {quick && <QuickTask preset={quick} onClose={() => setQuick(null)} />}
      {search && <SearchDialog onClose={() => setSearch(false)} />}
      <ScopeHost />
      {remCenter && <ReminderCenter initial={remCenter} onClose={() => { setRemCenter(null); setDataVersion((v: number) => v + 1); }} />}
      <div className="toasts" aria-live="polite" role="status">
        {toasts.map((x) => <div key={x.id} className={`toast toast-${x.kind}${x.undo ? " toast-undo" : ""}`}><span>{x.text}</span>
          {x.action && <button className="small" onClick={() => { x.action!.run(); setToasts((l: Toast[]) => l.filter((y) => y.id !== x.id)); }}>{x.action.label}</button>}
          <button className="ghost small" aria-label={t("Cerrar aviso")} onClick={() => setToasts((l: Toast[]) => l.filter((y) => y.id !== x.id))}>✕</button>
          {x.undo && <span className="toast-progress" aria-hidden="true" style={{ animationDuration: `${x.ms}ms` }} />}</div>)}
      </div>
      </div>
    </Ctx.Provider>
  );
}
