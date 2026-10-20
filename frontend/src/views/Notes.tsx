import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { fmtDate, fmtDateTime } from "../lib/dates";
import { NOTE_KIND, STATUS } from "../lib/labels";
import { Markdown } from "../lib/markdown";
import { NoteSaver, SAVE_LABEL, SaveState } from "../lib/saver";
import { useApi, useApp } from "../lib/store";
import type { Note, NoteSummary, Task } from "../lib/types";
import { Chip, Empty, ErrorBox, Field, Modal, PersonSelect, ProjectSelect, TagPicker, TaskPicker } from "../components/ui";

type Scope = "sin_clasificar" | "todas" | "fijadas" | "archivo" | "papelera";
const SCOPES: [Scope, string][] = [["sin_clasificar", "Sin clasificar"], ["todas", "Todas"], ["fijadas", "Fijadas"], ["archivo", "Archivo"], ["papelera", "Papelera"]];

// Autoguardados activos, para avisar antes de cerrar la pestaña del navegador
export const activeSavers = new Set<NoteSaver>();

interface Tabs { open: number[]; active: number | null }

export function NotesView({ routeId }: { routeId?: number }) {
  const app = useApp();
  const [scope, setScope] = useState<Scope>("todas");
  const [kind, setKind] = useState("");
  const [tag, setTag] = useState("");
  const { data: list, error, reload } = useApi<NoteSummary[]>(`/api/notes?scope=${scope}${kind ? `&kind=${kind}` : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`);
  const [tabs, setTabs] = useState<Tabs | null>(null);
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [tabsError, setTabsError] = useState("");

  useEffect(() => { api.get<Tabs>("/api/session/note-tabs").then(setTabs, (e) => setTabsError(e.message)); }, []);
  useEffect(() => {
    if (!tabs || !routeId) return;
    if (!tabs.open.includes(routeId) || tabs.active !== routeId) persist({ open: tabs.open.includes(routeId) ? tabs.open : [...tabs.open, routeId], active: routeId });
  }, [routeId, tabs === null]);
  useEffect(() => {
    if (!tabs) return;
    for (const id of tabs.open.filter((x) => !(x in titles)))
      api.get<Note>(`/api/notes/${id}`).then((n) => setTitles((t: Record<number, string>) => ({ ...t, [id]: n.display_title })), () => undefined);
  }, [tabs?.open.join(",")]);

  function persist(next: Tabs) {
    setTabs(next);
    api.put<Tabs>("/api/session/note-tabs", next).then(undefined, (e) => setTabsError("No se pudo guardar la sesión de pestañas: " + e.message));
  }
  const openNote = (id: number) => app.navigate(`#/notas/${id}`);
  const closeTab = (id: number) => {
    if (!tabs) return;
    const idx = tabs.open.indexOf(id);
    const open = tabs.open.filter((x) => x !== id);
    const active = tabs.active === id ? (open[idx] ?? open[idx - 1] ?? null) : tabs.active;
    persist({ open, active });
    app.navigate(active ? `#/notas/${active}` : "#/notas");
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.altKey && !e.ctrlKey && (e.key === "w" || e.key === "W") && active) { e.preventDefault(); closeTab(active); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="view notes-view">
      <aside className="notes-side" aria-label="Lista de notas">
        <button className="primary block" onClick={() => app.newNote()}>Nueva nota (Alt+N)</button>
        <div className="scope-tabs" role="tablist" aria-label="Bandejas">
          {SCOPES.map(([k, label]) => <button key={k} role="tab" aria-selected={scope === k} className={scope === k ? "active" : ""} onClick={() => setScope(k)}>{label}</button>)}
        </div>
        <div className="row tight">
          <select aria-label="Tipo de nota" value={kind} onChange={(e: any) => setKind(e.target.value)}>
            <option value="">Todos los tipos</option>{Object.entries(NOTE_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select aria-label="Etiqueta" value={tag} onChange={(e: any) => setTag(e.target.value)}>
            <option value="">Todas las etiquetas</option>{app.boot.tags.map((t) => <option key={t} value={t}>#{t}</option>)}</select>
        </div>
        <ErrorBox error={error} onRetry={reload} />
        {list && !list.length && <Empty>{scope === "papelera" ? "La papelera está vacía." : scope === "sin_clasificar" ? "No hay notas sin clasificar." : "Sin notas aquí. Crea una con Alt+N: no necesita título ni proyecto."}</Empty>}
        <ul className="plain note-items">{list?.map((n) => (
          <li key={n.id}><button className={"note-item" + (n.id === active ? " active" : "")} onClick={() => openNote(n.id)}>
            <span className="note-item-title">{n.pinned ? "📌 " : ""}{n.display_title}</span>
            <span className="note-item-meta">{fmtDate(n.updated_at.slice(0, 10))}{n.kind ? ` · ${NOTE_KIND[n.kind]}` : ""}{n.project_id ? ` · ${app.project(n.project_id)?.name ?? ""}` : ""}{n.linked_tasks ? ` · ${n.linked_tasks} tarea(s)` : ""}</span>
            <span className="note-item-excerpt">{n.excerpt}</span>
          </button></li>))}</ul>
      </aside>
      <section className="notes-main">
        <ErrorBox error={tabsError} />
        <div className="note-tabs" role="tablist" aria-label="Notas abiertas">
          {tabs?.open.map((id) => (
            <div key={id} className={"note-tab" + (id === active ? " active" : "")} role="presentation">
              <button role="tab" aria-selected={id === active} onClick={() => openNote(id)} title={`${titles[id] || ""} — Alt+←/→ para reordenar`}
                onKeyDown={(e: any) => { if (e.altKey && e.key === "ArrowLeft") moveTab(id, -1); if (e.altKey && e.key === "ArrowRight") moveTab(id, 1); }}>{titles[id] || "Nota"}</button>
              <button className="ghost small" aria-label={`Cerrar pestaña ${titles[id] || ""} (no borra la nota)`} title="Cerrar pestaña (Alt+W). La nota no se borra." onClick={() => closeTab(id)}>×</button>
            </div>))}
        </div>
        {active ? <NoteEditor key={active} id={active} onTitle={(t) => setTitles((x: Record<number, string>) => ({ ...x, [active]: t }))} onListChange={reload} />
          : <Empty>Abre una nota de la lista o crea una nueva. Cerrar una pestaña nunca borra ni archiva la nota.</Empty>}
      </section>
    </div>
  );
}

const EMERGENCY = (id: number) => `kaosnt-nota-pendiente-${id}`;

function NoteEditor({ id, onTitle, onListChange }: { id: number; onTitle: (t: string) => void; onListChange: () => void }) {
  const app = useApp();
  const [note, setNote] = useState<Note | null>(null);
  const [text, setText] = useState("");
  const [state, setState] = useState<SaveState>("guardado");
  const [saveErr, setSaveErr] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [preview, setPreview] = useState(false);
  const [recovered, setRecovered] = useState<string | null>(null);
  const [toTask, setToTask] = useState<{ title: string; excerpt: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const saver = useRef<NoteSaver | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    try {
      const n = await api.get<Note>(`/api/notes/${id}`);
      setNote(n); setText(n.content); onTitle(n.display_title); setLoadErr("");
      saver.current?.dispose();
      if (saver.current) activeSavers.delete(saver.current);
      saver.current = new NoteSaver(n.content, n.version, {
        save: async (content, base) => {
          const r = await api.patch<Note>(`/api/notes/${id}`, { content, base_version: base });
          setNote(r); onTitle(r.display_title);
          return { version: r.version };
        },
        onState: (s, err) => { setState(s); setSaveErr(err || ""); if (s === "guardado") onListChange(); },
        emergency: {
          put: (c) => { try { localStorage.setItem(EMERGENCY(id), c); } catch { /* sin almacenamiento local */ } },
          clear: () => { try { localStorage.removeItem(EMERGENCY(id)); } catch { /* */ } },
        },
      });
      activeSavers.add(saver.current);
      try { const pending = localStorage.getItem(EMERGENCY(id)); if (pending !== null && pending !== n.content) setRecovered(pending); } catch { /* */ }
    } catch (e: any) { setLoadErr(e.message); }
  };
  useEffect(() => {
    void load();
    api.get<Task[]>("/api/tasks?include_backlog=1").then(setTasks, () => undefined);
    return () => { const s = saver.current; if (s) { void s.flush().finally(() => activeSavers.delete(s)); s.dispose(); } };
  }, [id]);

  if (loadErr) return <ErrorBox error={loadErr} onRetry={load} />;
  if (!note) return <p className="muted pad">Cargando…</p>;

  const meta = async (body: Record<string, unknown>, msg?: string) => {
    try { const r = await api.patch<Note>(`/api/notes/${id}`, body); setNote({ ...r, content: note.content }); onTitle(r.display_title); onListChange(); app.changed(); if (msg) app.toast(msg, "ok"); return true; }
    catch (e: any) { app.toast(e.message, "error"); return false; }
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
  const indicator = state === "guardado" && saver.current?.hasUnsaved ? "pendiente" : state;

  return (
    <div className="note-editor" onKeyDown={(e: any) => {
      if (e.altKey && !e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) { e.preventDefault(); startToTask(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); void saver.current?.flush(); }
    }}>
      {recovered !== null && <div className="warn-box" role="alert">
        Hay texto de esta nota que no llegó a guardarse en una sesión anterior.
        <button onClick={() => { setText(recovered); saver.current?.edit(recovered); setRecovered(null); }}>Recuperar ese texto</button>
        <button className="ghost" onClick={() => { try { localStorage.removeItem(EMERGENCY(id)); } catch { /* */ } setRecovered(null); }}>Descartarlo</button>
      </div>}
      <div className="note-head">
        <input className="title-input grow" aria-label="Título manual (opcional)" placeholder={`${note.display_title} (título sugerido)`}
          defaultValue={note.title_manual || ""} key={"t" + (note.title_manual || "")}
          onBlur={(e: any) => { if ((e.target.value || null) !== (note.title_manual || null)) void meta({ title_manual: e.target.value }); }} />
        <span className={`save-state save-${indicator}`} role="status" aria-live="polite">{SAVE_LABEL[indicator]}</span>
        {(state === "error" || state === "conflicto") && <>
          <button onClick={() => saver.current?.retry()}>Reintentar</button>
          {state === "conflicto" && <button onClick={() => saver.current?.overwrite()}>Sobrescribir con mi texto</button>}
          {state === "conflicto" && <button className="ghost" onClick={() => { navigator.clipboard?.writeText(text).catch(() => undefined); app.toast("Tu texto se ha copiado al portapapeles", "info"); void load(); }}>Copiar mi texto y recargar</button>}
        </>}
      </div>
      {saveErr && <p className="field-error" role="alert">{saveErr}. El texto sigue en el editor y en una copia de emergencia local.</p>}
      <div className="note-toolbar row">
        <label>Tipo <select value={note.kind || ""} onChange={(e: any) => meta({ kind: e.target.value || null })}>
          <option value="">Nota</option>{Object.entries(NOTE_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Proyecto <ProjectSelect value={note.project_id} onChange={(v) => meta({ project_id: v }, v ? "Nota vinculada al proyecto" : "Nota sin proyecto")} /></label>
        <button aria-pressed={note.pinned} onClick={() => meta({ pinned: !note.pinned })}>{note.pinned ? "📌 Fijada" : "Fijar"}</button>
        <button aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? "Editar" : "Vista previa"}</button>
        <button onClick={startToTask} title="Alt+Shift+T">Crear tarea desde selección</button>
        <span className="spacer" />
        {note.state === "activa" && <button onClick={() => meta({ state: "archivada" }, "Nota archivada")}>Archivar</button>}
        {note.state !== "activa" && <button onClick={() => meta({ state: "activa" }, "Nota restaurada")}>Restaurar</button>}
        {note.state !== "papelera" && <button onClick={() => meta({ state: "papelera" }, "Nota enviada a la papelera (recuperable)")}>A la papelera</button>}
        {note.state === "papelera" && <button className="danger" onClick={async () => {
          if (!window.confirm("¿Eliminar definitivamente esta nota? No se puede deshacer.")) return;
          try { await api.del(`/api/notes/${id}`); app.toast("Nota eliminada", "ok"); onListChange(); app.navigate("#/notas"); } catch (e: any) { app.toast(e.message, "error"); }
        }}>Eliminar definitivamente</button>}
      </div>
      {note.state !== "activa" && <p className="hint">Esta nota está {note.state === "archivada" ? "archivada" : "en la papelera"}.</p>}
      {preview ? <div className="note-preview"><Markdown text={text} /></div> :
        <textarea ref={area} className="note-text" aria-label="Contenido de la nota" value={text} spellCheck
          placeholder="Escribe libremente. Se guarda solo. Admite Markdown (# títulos, - listas, ``` código, | tablas |), pero no es necesario."
          onChange={(e: any) => { setText(e.target.value); saver.current?.edit(e.target.value); }} onBlur={() => void saver.current?.flush()} />}
      <div className="note-foot">
        <span className="muted">Creada {fmtDateTime(note.created_at, app.tz)} · Actualizada {fmtDateTime(note.updated_at, app.tz)}</span>
        <div className="note-tags"><span className="field-label">Etiquetas</span>
          <TagPicker value={note.tags} onChange={async (v) => { if (await meta({ tags: v })) await app.reloadBoot(); }} /></div>
      </div>
      <div className="note-links">
        <h3>Tareas vinculadas</h3>
        {note.tasks.length === 0 && <p className="muted">Ninguna. Selecciona texto y usa «Crear tarea desde selección», o vincula una existente.</p>}
        <ul className="plain">{note.tasks.map((t) => (
          <li key={t.id}><button className="linklike" onClick={() => app.openTask(t.id)}>{t.title}</button> <Chip>{STATUS[t.status]}</Chip>
            <span className="muted small"> {app.project(t.project_id)?.name || ""}</span>
            {t.excerpt && <blockquote className="excerpt">{t.excerpt}</blockquote>}
            <button className="ghost small" onClick={async () => { await api.del(`/api/notes/${id}/links/${t.id}`); void load(); app.changed(); }}>Desvincular</button></li>))}</ul>
        <TaskPicker tasks={tasks} exclude={note.tasks.map((t) => t.id)} placeholder="Vincular tarea existente: buscar por título…"
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
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const submit = async () => {
    try {
      const t = await api.post<{ id: number; title: string }>(`/api/notes/${noteId}/to-task`, { title: title.trim(), excerpt: initial.excerpt, project_id: project, assignee_id: assignee, due_date: due || null });
      app.changed(); app.toast(`Tarea creada y vinculada: ${t.title}`, "ok", { label: "Abrir", run: () => app.openTask(t.id) }); onDone();
    } catch (e: any) { setError(e.message); }
  };
  return (
    <Modal title="Crear tarea desde la nota" onClose={onClose}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
        <Field label="Título de la tarea"><input value={title} onChange={(e: any) => setTitle(e.target.value)} required /></Field>
        {initial.excerpt && <Field label="Fragmento de referencia (la nota no se modifica)"><blockquote className="excerpt">{initial.excerpt}</blockquote></Field>}
        <div className="grid2">
          <Field label="Proyecto"><ProjectSelect value={project} onChange={setProject} /></Field>
          <Field label="Responsable"><PersonSelect value={assignee} onChange={setAssignee} /></Field>
          <Field label="Fecha límite"><input type="date" value={due} onChange={(e: any) => setDue(e.target.value)} /></Field>
        </div>
        <ErrorBox error={error} />
        <div className="modal-foot"><button className="primary" type="submit" disabled={!title.trim()}>Crear tarea</button><button type="button" onClick={onClose}>Cancelar</button></div>
      </form>
    </Modal>
  );
}
