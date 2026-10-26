import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { fmtDate, fmtDateTime } from "../lib/dates";
import { t } from "../lib/i18n";
import { NOTE_KIND, PROJECT_STATUS, STATUS } from "../lib/labels";
import { NoteSaver, SAVE_LABEL, SaveState } from "../lib/saver";
import { useApi, useApp } from "../lib/store";
import { useViewState } from "../lib/viewstate";
import type { Note, NoteSummary, Task } from "../lib/types";
import { DateInput } from "../components/DateInput";
import { EditorMode, MarkdownEditor } from "../components/MarkdownEditor";
import { consumeNoteFocus, focusAtEnd } from "../lib/focus";
import { Chip, Empty, ErrorBox, Field, Modal, PersonSelect, ProjectSelect, TagPicker, TaskPicker, MultiSelect } from "../components/ui";

type Scope = "sin_clasificar" | "todas" | "fijadas" | "archivo" | "papelera";
const SCOPES: [Scope, () => string][] = [["sin_clasificar", () => t("Sin clasificar")], ["todas", () => t("Todas")], ["fijadas", () => t("Fijadas")], ["archivo", () => t("Archivo")], ["papelera", () => t("Papelera")]];

// Active autosaves, to warn before closing the browser tab
export const activeSavers = new Set<NoteSaver>();

interface Tabs { open: number[]; active: number | null; split?: number | null }

/** Note list filters → /api/notes parameters. */
export function notesQuery(f: { scope: string; kind: string; tag: string; project: string; client?: string; q: string; field: string }): string {
  const p = [`scope=${f.scope}`];
  if (f.kind) p.push(`kind=${encodeURIComponent(f.kind)}`);
  if (f.tag) p.push(`tag=${encodeURIComponent(f.tag)}`);
  if (f.project) p.push(`project_id=${encodeURIComponent(f.project)}`);
  if (f.client) p.push(`client_id=${encodeURIComponent(f.client)}`);
  if (f.q.trim()) { p.push(`q=${encodeURIComponent(f.q.trim())}`); if (f.field !== "todo") p.push(`in=${f.field}`); }
  return `/api/notes?${p.join("&")}`;
}

/** Reorder: move `id` to the position of `target` (drag and drop). */
export function reorderTabs(open: number[], id: number, target: number): number[] {
  if (id === target || !open.includes(id) || !open.includes(target)) return open;
  const rest = open.filter((x) => x !== id);
  const i = rest.indexOf(target) + (open.indexOf(id) < open.indexOf(target) ? 1 : 0);
  return [...rest.slice(0, i), id, ...rest.slice(i)];
}

export function NotesView({ routeId }: { routeId?: number }) {
  const app = useApp();
  // Screen state kept when moving to another screen and back (0.5, browser session)
  const [scope, setScope] = useViewState<Scope>("notes.scope", "todas");
  const [kind, setKind] = useViewState<string>("notes.kind", "");
  const [tag, setTag] = useViewState<string>("notes.tag", "");
  const [project, setProject] = useViewState<string>("notes.project", "");
  const [client, setClient] = useViewState<string>("notes.client", "");
  const [q, setQ] = useViewState<string>("notes.q", "");
  const [qDebounced, setQDebounced] = useState(q);
  const [field, setField] = useViewState<string>("notes.field", "todo");
  useEffect(() => { const timer = setTimeout(() => setQDebounced(q), 250); return () => clearTimeout(timer); }, [q]);
  const { data: list, error, reload } = useApi<NoteSummary[]>(notesQuery({ scope, kind, tag, project, client, q: qDebounced, field }));
  const [tabs, setTabs] = useState<Tabs | null>(null);
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [tabsError, setTabsError] = useState("");
  const [dragTab, setDragTab] = useState<number | null>(null);
  const filtered = !!(kind || tag || project || client || q.trim());

  useEffect(() => { api.get<Tabs>("/api/session/note-tabs").then(setTabs, (e) => setTabsError(e.message)); }, []);
  useEffect(() => {
    if (!tabs || !routeId) return;
    if (!tabs.open.includes(routeId) || tabs.active !== routeId)
      persist({ ...tabs, open: tabs.open.includes(routeId) ? tabs.open : [...tabs.open, routeId], active: routeId, split: tabs.split === routeId ? null : tabs.split });
  }, [routeId, tabs === null]);
  useEffect(() => {
    if (!tabs) return;
    for (const id of tabs.open.filter((x) => !(x in titles)))
      api.get<Note>(`/api/notes/${id}`).then((n) => setTitles((m: Record<number, string>) => ({ ...m, [id]: n.display_title })), () => undefined);
  }, [tabs?.open.join(",")]);

  function persist(next: Tabs) {
    setTabs(next);
    api.put<Tabs>("/api/session/note-tabs", { open: next.open, active: next.active, split: next.split ?? null })
      .then(undefined, (e) => setTabsError(t("No se pudo guardar la sesión de pestañas: {error}", { error: e.message })));
  }
  const openNote = (id: number) => app.navigate(`#/notas/${id}`);
  /** Remove a note from the tabs (when closing the tab or if the note no longer exists). Never deletes the note. */
  const removeTab = (id: number) => {
    if (tabs) {
      const idx = tabs.open.indexOf(id);
      const open = tabs.open.filter((x) => x !== id);
      const split = tabs.split === id ? null : tabs.split ?? null;
      const left = open.filter((x) => x !== split);
      const active = tabs.active === id || routeId === id ? (left[idx] ?? left[idx - 1] ?? left[0] ?? null) : (routeId ?? tabs.active);
      persist({ open, active, split: split === active ? null : split });
      app.navigate(active ? `#/notas/${active}` : "#/notas");
    }
    setTitles((m: Record<number, string>) => { const n = { ...m }; delete n[id]; return n; });
  };
  const moveTab = (id: number, dir: number) => {
    if (!tabs) return;
    const open = [...tabs.open];
    const i = open.indexOf(id), j = i + dir;
    if (j < 0 || j >= open.length) return;
    [open[i], open[j]] = [open[j], open[i]];
    persist({ ...tabs, open });
  };
  const active = routeId ?? tabs?.active ?? null;
  const split = tabs?.split && tabs.split !== active && tabs.open.includes(tabs.split) ? tabs.split : null;
  const setSplit = (id: number | null) => { if (tabs) persist({ ...tabs, active, split: id }); };
  const splitCandidates = (tabs?.open || []).filter((x) => x !== active);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.altKey && !e.ctrlKey && (e.key === "w" || e.key === "W") && active) { e.preventDefault(); removeTab(active); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const editor = (id: number, pane: "left" | "right") => <NoteEditor key={pane + id} id={id} pane={pane}
    onTitle={(title) => setTitles((m: Record<number, string>) => ({ ...m, [id]: title }))} onListChange={reload}
    onGone={() => { removeTab(id); reload(); }} />;

  return (
    <div className="view notes-view">
      <aside className="notes-side" aria-label={t("Lista de notas")}>
        <button className="primary block" onClick={() => app.newNote()}>{t("Nueva nota (Alt+N)")}</button>
        <div className="scope-tabs" role="tablist" aria-label={t("Bandejas")}>
          {SCOPES.map(([k, label]) => <button key={k} role="tab" aria-selected={scope === k} className={scope === k ? "active" : ""} onClick={() => setScope(k)}>{label()}</button>)}
        </div>
        <div className="note-filters" role="group" aria-label={t("Filtros de notas")}>
          <input type="search" aria-label={t("Buscar en las notas")} placeholder={t("Buscar texto…")} value={q} onChange={(e: any) => setQ(e.target.value)} />
          <select aria-label={t("Buscar en")} value={field} onChange={(e: any) => setField(e.target.value)}>
            <option value="todo">{t("Título y contenido")}</option><option value="titulo">{t("Solo título")}</option><option value="contenido">{t("Solo contenido")}</option></select>
          <MultiSelect label={t("Proyecto")} value={project} onChange={setProject}
            options={[{ value: "none", label: t("Sin proyecto") }, ...app.boot.projects.map((p) => ({ value: String(p.id), label: p.name + (p.status !== "activo" ? ` (${PROJECT_STATUS[p.status] || p.status})` : "") }))]} />
          <MultiSelect label={t("Cliente")} value={client} onChange={setClient}
            options={[{ value: "none", label: t("Sin cliente") }, ...app.boot.clients.map((c) => ({ value: String(c.id), label: c.name }))]} />
          <MultiSelect label={t("Tipo de nota")} value={kind} onChange={setKind}
            options={[{ value: "none", label: t("Nota") }, ...Object.entries(NOTE_KIND).map(([k, v]) => ({ value: k, label: v }))]} />
          <MultiSelect label={t("Etiqueta")} value={tag} onChange={setTag} allLabel={t("Todas")} options={app.boot.tags.map((x) => ({ value: x, label: "#" + x }))} />
          {filtered && <button className="ghost small" onClick={() => { setKind(""); setTag(""); setProject(""); setClient(""); setQ(""); setField("todo"); }}>{t("Restablecer filtros")}</button>}
        </div>
        <ErrorBox error={error} onRetry={reload} />
        {list && !list.length && <Empty>{filtered ? t("Ninguna nota coincide con los filtros.") : scope === "papelera" ? t("La papelera está vacía.") : scope === "sin_clasificar" ? t("No hay notas sin clasificar.") : t("Sin notas aquí. Crea una con Alt+N: no necesita título ni proyecto.")}</Empty>}
        {list && list.length > 0 && filtered && <p className="hint">{t("{n} nota(s)", { n: list.length })}</p>}
        <ul className="plain note-items">{list?.map((n) => (
          <li key={n.id}><button className={"note-item" + (n.id === active ? " active" : "") + (n.id === split ? " split" : "")} onClick={() => openNote(n.id)}>
            <span className="note-item-title">{n.pinned ? "📌 " : ""}{n.display_title}</span>
            <span className="note-item-meta">{fmtDate(n.updated_at.slice(0, 10))}{n.kind ? ` · ${NOTE_KIND[n.kind]}` : ""}{n.project_id ? ` · ${app.project(n.project_id)?.name ?? ""}` : ""}{n.linked_tasks ? " · " + t("{n} tarea(s)", { n: n.linked_tasks }) : ""}</span>
            <span className="note-item-excerpt">{n.excerpt}</span>
          </button></li>))}</ul>
      </aside>
      <section className="notes-main">
        <ErrorBox error={tabsError} />
        <div className="note-tabs-bar">
          <div className="note-tabs" role="tablist" aria-label={t("Notas abiertas (arrastra para reordenar)")}>
            {tabs?.open.map((id) => (
              <div key={id} role="presentation" draggable
                className={"note-tab" + (id === active ? " active" : "") + (id === split ? " split" : "") + (dragTab === id ? " dragging" : "")}
                onDragStart={(e: any) => { setDragTab(id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(id)); }}
                onDragOver={(e: any) => { if (dragTab !== null) e.preventDefault(); }}
                onDrop={(e: any) => { e.preventDefault(); if (dragTab !== null && tabs) persist({ ...tabs, open: reorderTabs(tabs.open, dragTab, id) }); setDragTab(null); }}
                onDragEnd={() => setDragTab(null)}>
                <button role="tab" aria-selected={id === active} onClick={() => openNote(id)}
                  title={t("{titulo} — arrastra o usa Alt+←/→ para reordenar", { titulo: titles[id] || "" })}
                  onKeyDown={(e: any) => { if (e.altKey && e.key === "ArrowLeft") moveTab(id, -1); if (e.altKey && e.key === "ArrowRight") moveTab(id, 1); }}>
                  {id === split ? "◨ " : ""}{titles[id] || t("Nota")}</button>
                <button className="ghost small" aria-label={t("Cerrar pestaña {titulo} (no borra la nota)", { titulo: titles[id] || "" })} title={t("Cerrar pestaña (Alt+W). La nota no se borra.")} onClick={() => removeTab(id)}>×</button>
              </div>))}
          </div>
          <div className="split-control row tight">
            {split ? <>
              <label className="small">{t("Derecha")} <select aria-label={t("Nota del panel derecho")} value={split} onChange={(e: any) => setSplit(Number(e.target.value))}>
                {splitCandidates.map((id) => <option key={id} value={id}>{titles[id] || t("Nota")}</option>)}</select></label>
              <button className="small" onClick={() => setSplit(null)} title={t("Volver a una sola nota")}>{t("Cerrar división")}</button>
            </> : <button className="small" disabled={!active || !splitCandidates.length} onClick={() => setSplit(splitCandidates[0])}
              title={splitCandidates.length ? t("Ver y editar dos notas a la vez") : t("Abre al menos dos notas para dividir la pantalla")}>◫ {t("Pantalla dividida")}</button>}
          </div>
        </div>
        {active ? <div className={"note-panes" + (split ? " two" : "")}>
          {editor(active, "left")}
          {split && editor(split, "right")}
        </div> : <Empty>{t("Abre una nota de la lista o crea una nueva. Cerrar una pestaña nunca borra ni archiva la nota.")}</Empty>}
      </section>
    </div>
  );
}

const EMERGENCY = (id: number) => `kaosnt-nota-pendiente-${id}`;

function NoteEditor({ id, pane, onTitle, onListChange, onGone }: { id: number; pane: "left" | "right"; onTitle: (title: string) => void; onListChange: () => void; onGone: () => void }) {
  const app = useApp();
  const [note, setNote] = useState<Note | null>(null);
  const [text, setText] = useState("");
  const [state, setState] = useState<SaveState>("saved");
  const [saveErr, setSaveErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [mode, setModeState] = useState<EditorMode>(app.boot.settings.note_editor_mode === "vista_previa" ? "vista_previa" : "editar");
  const setMode = (m: EditorMode) => {  // the last mode used is remembered in the settings
    setModeState(m);
    if (m !== app.boot.settings.note_editor_mode) api.patch("/api/settings", { note_editor_mode: m }).then(() => app.reloadBoot(), () => undefined);
  };
  const [focusReq, setFocusReq] = useState(false);
  const [recovered, setRecovered] = useState<string | null>(null);
  const [toTask, setToTask] = useState<{ title: string; excerpt: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const saver = useRef<NoteSaver | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    try {
      const n = await api.get<Note>(`/api/notes/${id}`);
      setNote(n); setText(n.content); onTitle(n.display_title); setLoadErr("");
      // Opened from the search (Ctrl+K): edit mode and caret at the end, ready to type (not for notes in the trash)
      if (pane === "left" && consumeNoteFocus(id) && n.state !== "papelera") { setModeState("editar"); setFocusReq(true); }
      saver.current?.dispose();
      if (saver.current) activeSavers.delete(saver.current);
      saver.current = new NoteSaver(n.content, n.version, {
        save: async (content, base) => {
          const r = await api.patch<Note>(`/api/notes/${id}`, { content, base_version: base });
          setNote(r); onTitle(r.display_title);
          return { version: r.version };
        },
        onState: (s, err) => { setState(s); setSaveErr(err || ""); if (s === "saved") onListChange(); },
        emergency: {
          put: (c) => { try { localStorage.setItem(EMERGENCY(id), c); } catch { /* no local storage */ } },
          clear: () => { try { localStorage.removeItem(EMERGENCY(id)); } catch { /* */ } },
        },
      });
      activeSavers.add(saver.current);
      try { const pending = localStorage.getItem(EMERGENCY(id)); if (pending !== null && pending !== n.content) setRecovered(pending); } catch { /* */ }
    } catch (e: any) {
      if (e?.status === 404) { onGone(); return; } // the note no longer exists: it is removed from the tabs
      setLoadErr(e.message);
    }
  };
  useEffect(() => { if (focusReq && note) { focusAtEnd(area.current); setFocusReq(false); } }, [focusReq, note, mode]);
  useEffect(() => {
    void load();
    api.get<Task[]>("/api/tasks?include_backlog=1").then(setTasks, () => undefined);
    return () => { const s = saver.current; if (s) { void s.flush().finally(() => activeSavers.delete(s)); s.dispose(); } };
  }, [id]);

  if (loadErr) return <div className="note-editor"><ErrorBox error={loadErr} onRetry={load} /></div>;
  if (!note) return <div className="note-editor"><p className="muted pad">{t("Cargando…")}</p></div>;

  const meta = async (body: Record<string, unknown>, msg?: string, undoable = false) => {
    try {
      const r = await api.patch<Note & { undo_id?: number }>(`/api/notes/${id}${undoable ? "?undo=1" : ""}`, body);
      setNote({ ...r, content: note.content }); onTitle(r.display_title); onListChange(); app.changed();
      if (msg) { if (undoable) app.undoable(msg, r.undo_id); else app.toast(msg, "ok"); }
      return true;
    } catch (e: any) { app.toast(e.message, "error"); return false; }
  };
  function startToTask() {
    const ta = area.current;
    let sel = "";
    if (ta) {
      sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      if (!sel.trim()) {
        const before = ta.value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
        const after = ta.value.indexOf("\n", ta.selectionStart);
        sel = ta.value.slice(before, after === -1 ? undefined : after);
      }
    }
    const first = sel.split("\n").map((l) => l.replace(/^\s*([-*+]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+|#+\s+)/, "").trim()).find(Boolean) || "";
    setToTask({ title: first.slice(0, 200), excerpt: sel.trim() });
  }
  const indicator = state === "saved" && saver.current?.hasUnsaved ? "pending" : state;

  return (
    <div className={"note-editor pane-" + pane} onKeyDown={(e: any) => {
      if (e.altKey && !e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) { e.preventDefault(); startToTask(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); void saver.current?.flush(); }
    }}>
      {recovered !== null && <div className="warn-box" role="alert">
        {t("Hay texto de esta nota que no llegó a guardarse en una sesión anterior.")}
        <button onClick={() => { setText(recovered); saver.current?.edit(recovered); setRecovered(null); }}>{t("Recuperar ese texto")}</button>
        <button className="ghost" onClick={() => { try { localStorage.removeItem(EMERGENCY(id)); } catch { /* */ } setRecovered(null); }}>{t("Descartarlo")}</button>
      </div>}
      <div className="note-head">
        <input className="title-input grow" aria-label={t("Título manual (opcional)")} placeholder={t("{titulo} (título sugerido)", { titulo: note.display_title })}
          defaultValue={note.title_manual || ""} key={"t" + (note.title_manual || "")}
          onBlur={(e: any) => { if ((e.target.value || null) !== (note.title_manual || null)) void meta({ title_manual: e.target.value }); }} />
        <span className={`save-state save-${indicator}`} role="status" aria-live="polite">{SAVE_LABEL[indicator]}</span>
        {(state === "error" || state === "conflict") && <>
          <button onClick={() => saver.current?.retry()}>{t("Reintentar")}</button>
          {state === "conflict" && <button onClick={() => saver.current?.overwrite()}>{t("Sobrescribir con mi texto")}</button>}
          {state === "conflict" && <button className="ghost" onClick={() => { navigator.clipboard?.writeText(text).catch(() => undefined); app.toast(t("Tu texto se ha copiado al portapapeles"), "info"); void load(); }}>{t("Copiar mi texto y recargar")}</button>}
        </>}
      </div>
      {saveErr && <p className="field-error" role="alert">{t("{error}. El texto sigue en el editor y en una copia de emergencia local.", { error: saveErr })}</p>}
      <div className="note-toolbar row">
        <label>{t("Tipo")} <select value={note.kind || ""} onChange={(e: any) => meta({ kind: e.target.value || null })}>
          <option value="">{t("Nota")}</option>{Object.entries(NOTE_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>{t("Proyecto")} <ProjectSelect value={note.project_id} onChange={(v) => meta({ project_id: v }, v ? t("Nota vinculada al proyecto") : t("Nota sin proyecto"))} /></label>
        <button aria-pressed={note.pinned} onClick={() => meta({ pinned: !note.pinned })}>{note.pinned ? "📌 " + t("Fijada") : t("Fijar")}</button>
        <button onClick={startToTask} title="Alt+Shift+T">{t("Crear tarea desde selección")}</button>
        <span className="spacer" />
        {note.state === "activa" && <button onClick={() => meta({ state: "archivada" }, t("Nota archivada"), true)}>{t("Archivar")}</button>}
        {note.state !== "activa" && <button onClick={() => meta({ state: "activa" }, t("Nota restaurada"))}>{t("Restaurar")}</button>}
        {note.state !== "papelera" && <button onClick={() => meta({ state: "papelera" }, t("Nota enviada a la papelera (recuperable)"), true)}>{t("A la papelera")}</button>}
        {note.state === "papelera" && <button className="danger" onClick={async () => {
          if (!window.confirm(t("¿Eliminar definitivamente esta nota? No se puede deshacer."))) return;
          try {
            const s = saver.current;
            if (s) { s.dispose(); activeSavers.delete(s); saver.current = null; }
            await api.del(`/api/notes/${id}`);
            try { localStorage.removeItem(EMERGENCY(id)); } catch { /* */ }
            app.toast(t("Nota eliminada"), "ok"); onGone();
          } catch (e: any) { app.toast(e.message, "error"); }
        }}>{t("Eliminar definitivamente")}</button>}
      </div>
      {note.state !== "activa" && <p className="hint">{note.state === "archivada" ? t("Esta nota está archivada.") : t("Esta nota está en la papelera.")}</p>}
      <MarkdownEditor value={text} mode={mode} onModeChange={setMode} label={t("Contenido de la nota")} textareaRef={area}
        readOnly={note.state === "papelera"}
        placeholder={t("Escribe libremente. Se guarda solo. Admite Markdown (# títulos, - listas, ``` código, | tablas |), pero no es necesario.")}
        onChange={(v) => { setText(v); saver.current?.edit(v); }} onBlur={() => void saver.current?.flush()} />
      <div className="note-foot">
        <span className="muted">{t("Creada {creada} · Actualizada {actualizada}", { creada: fmtDateTime(note.created_at, app.tz), actualizada: fmtDateTime(note.updated_at, app.tz) })}</span>
        <div className="note-tags"><span className="field-label">{t("Etiquetas")}</span>
          <TagPicker value={note.tags} onChange={async (v) => { if (await meta({ tags: v })) await app.reloadBoot(); }} /></div>
      </div>
      <div className="note-links">
        <h3>{t("Tareas vinculadas")}</h3>
        {note.tasks.length === 0 && <p className="muted">{t("Ninguna. Selecciona texto y usa «Crear tarea desde selección», o vincula una existente.")}</p>}
        <ul className="plain">{note.tasks.map((x) => (
          <li key={x.id}><button className="linklike" onClick={() => app.openTask(x.id)}>{x.title}</button> <Chip>{STATUS[x.status]}</Chip>
            <span className="muted small"> {app.project(x.project_id)?.name || ""}</span>
            {x.excerpt && <blockquote className="excerpt">{x.excerpt}</blockquote>}
            <button className="ghost small" onClick={async () => { await api.del(`/api/notes/${id}/links/${x.id}`); void load(); app.changed(); }}>{t("Desvincular")}</button></li>))}</ul>
        <TaskPicker tasks={tasks} exclude={note.tasks.map((x) => x.id)} placeholder={t("Vincular tarea existente: buscar por título…")}
          onPick={async (tid) => { await api.post(`/api/notes/${id}/links`, { task_id: tid }); void load(); app.changed(); }} />
      </div>
      {toTask && <ToTaskDialog noteId={id} projectId={note.project_id} initial={toTask} onClose={() => setToTask(null)} onDone={() => { setToTask(null); void load(); }} />}
    </div>
  );
}

function ToTaskDialog({ noteId, projectId, initial, onClose, onDone }: {
  noteId: number; projectId: number | null; initial: { title: string; excerpt: string }; onClose: () => void; onDone: () => void;
}) {
  const app = useApp();
  const [title, setTitle] = useState(initial.title);
  const [project, setProject] = useState<number | null>(projectId);
  const [assignee, setAssignee] = useState<number | null>(null);
  const [due, setDue] = useState<string | null>(null);
  const [error, setError] = useState("");
  const submit = async () => {
    try {
      const task = await api.post<{ id: number; title: string }>(`/api/notes/${noteId}/to-task`, { title: title.trim(), excerpt: initial.excerpt, project_id: project, assignee_id: assignee, due_date: due || null });
      app.changed(); app.toast(t("Tarea creada y vinculada: {titulo}", { titulo: task.title }), "ok", { label: t("Abrir"), run: () => app.openTask(task.id) }); onDone();
    } catch (e: any) { setError(e.message); }
  };
  return (
    <Modal title={t("Crear tarea desde la nota")} onClose={onClose}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
        <Field label={t("Título de la tarea")}><input value={title} onChange={(e: any) => setTitle(e.target.value)} required /></Field>
        {initial.excerpt && <Field label={t("Fragmento de referencia (la nota no se modifica)")}><blockquote className="excerpt">{initial.excerpt}</blockquote></Field>}
        <div className="grid2">
          <Field label={t("Proyecto")}><ProjectSelect value={project} onChange={setProject} /></Field>
          <Field label={t("Responsable")}><PersonSelect value={assignee} onChange={setAssignee} /></Field>
          <Field label={t("Fecha límite")}><DateInput label={t("Fecha límite")} value={due} onChange={setDue} /></Field>
        </div>
        <ErrorBox error={error} />
        <div className="modal-foot"><button className="primary" type="submit" disabled={!title.trim()}>{t("Crear tarea")}</button><button type="button" onClick={onClose}>{t("Cancelar")}</button></div>
      </form>
    </Modal>
  );
}
