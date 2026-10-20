import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { todayIn } from "../lib/dates";
import { useApp } from "../lib/store";
import type { TaskDetail } from "../lib/types";
import { emptyRule, RuleEditor, ruleIsValid, RuleValue } from "./Recurrences";
import { ErrorBox, Field, Modal, PersonSelect, ProjectSelect } from "./ui";

/** Captura rápida de tarea: solo el título es obligatorio. Más campos (incluida la repetición) bajo demanda. */
export function QuickTask({ preset, onClose }: { preset: Record<string, any>; onClose: () => void }) {
  const app = useApp();
  const [title, setTitle] = useState(preset.title || "");
  const [more, setMore] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(preset.project_id ?? null);
  const [assignee, setAssignee] = useState<number | null>(preset.assignee_id ?? null);
  const [due, setDue] = useState("");
  const [backlog, setBacklog] = useState(!!preset.backlog);
  const [repeat, setRepeat] = useState(false);
  const [rule, setRule] = useState<RuleValue>(emptyRule(todayIn(app.tz)));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (openAfter: boolean) => {
    if (!title.trim() || busy || (repeat && !ruleIsValid(rule))) return;
    setBusy(true);
    try {
      let t = await api.post<TaskDetail>("/api/tasks", { title: title.trim(), project_id: projectId, assignee_id: assignee,
        due_date: due || null, status: backlog ? "backlog" : "pendiente" });
      if (repeat) {
        t = await api.post<TaskDetail>(`/api/tasks/${t.id}/recurrence`, { rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [],
          interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null, start_date: due || rule.start_date, end_date: rule.end_date, non_working: rule.non_working });
      }
      app.changed();
      app.toast(`Tarea creada: ${t.title}`, "ok", { label: "Abrir", run: () => app.openTask(t.id) });
      onClose();
      if (openAfter) app.openTask(t.id);
    } catch (e: any) { setError(e.message); setBusy(false); }
  };

  return (
    <Modal title="Nueva tarea" onClose={onClose} wide={repeat}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(false); }}>
        <Field label="Título (obligatorio)"><input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="¿Qué hay que hacer?" required maxLength={300} /></Field>
        <button type="button" className="ghost small" onClick={() => setMore(!more)} aria-expanded={more}>{more ? "Menos campos" : "Más campos (opcionales)"}</button>
        {more && <>
          <div className="grid2">
            <Field label="Proyecto"><ProjectSelect value={projectId} onChange={setProjectId} /></Field>
            <Field label="Responsable"><PersonSelect value={assignee} onChange={setAssignee} /></Field>
            <Field label="Fecha límite"><input type="date" value={due} onChange={(e: any) => setDue(e.target.value)} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={backlog} onChange={(e: any) => setBacklog(e.target.checked)} /> Guardar en Backlog (aún no comprometida)</label>
          <label className="check"><input type="checkbox" checked={repeat} onChange={(e: any) => setRepeat(e.target.checked)} /> Se repite</label>
          {repeat && <RuleEditor value={{ ...rule, start_date: due || rule.start_date }} onChange={setRule} />}
        </>}
        <ErrorBox error={error} />
        <div className="modal-foot">
          <button type="submit" className="primary" disabled={!title.trim() || busy || (repeat && !ruleIsValid(rule))}>Crear (Enter)</button>
          <button type="button" disabled={!title.trim() || busy} onClick={() => submit(true)}>Crear y abrir detalle</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </Modal>
  );
}

interface Result { type: "nota" | "tarea" | "proyecto"; id: number; title: string; context: string; snippet: string; state: string }

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const [archived, setArchived] = useState(false);
  const [trash, setTrash] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [sel, setSel] = useState(0);
  const seq = useRef(0);
  useEffect(() => {
    if (!q.trim()) { setResults([]); setTotal(0); return; }
    const my = ++seq.current;
    const t = setTimeout(() => {
      api.get<{ results: Result[]; total: number }>(`/api/search?q=${encodeURIComponent(q)}${archived ? "&archived=true" : ""}${trash ? "&trash=true" : ""}`)
        .then((r) => { if (my === seq.current) { setResults(r.results); setTotal(r.total); setSel(0); setError(""); } }, (e) => setError(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [q, archived, trash]);
  const open = (r: Result) => {
    onClose();
    if (r.type === "tarea") app.openTask(r.id); else app.navigate(r.type === "nota" ? `#/notas/${r.id}` : `#/proyectos/${r.id}`);
  };
  return (
    <Modal title="Buscar" onClose={onClose} wide>
      <input aria-label="Texto a buscar" placeholder='Palabras o "frase exacta" en tareas, proyectos y notas' value={q} onChange={(e: any) => setQ(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
          if (e.key === "Enter" && results[sel]) { e.preventDefault(); open(results[sel]); }
        }} />
      <div className="row">
        <label className="check"><input type="checkbox" checked={archived} onChange={(e: any) => setArchived(e.target.checked)} /> Incluir archivados</label>
        <label className="check"><input type="checkbox" checked={trash} onChange={(e: any) => setTrash(e.target.checked)} /> Incluir papelera</label>
      </div>
      <ErrorBox error={error} />
      {q.trim() && !results.length && !error && <p className="empty">Sin resultados. Prueba con menos palabras o sin comillas.</p>}
      <ul className="results" role="listbox" aria-label="Resultados">
        {results.map((r, i) => (
          <li key={r.type + r.id} role="option" aria-selected={i === sel} className={i === sel ? "sel" : ""}>
            <button className="result" onClick={() => open(r)}>
              <span className="result-type">{r.type === "nota" ? "Nota" : r.type === "tarea" ? "Tarea" : "Proyecto"}</span>
              <strong>{r.title}</strong> <span className="muted">· {r.context}</span>
              {r.snippet && <span className="snippet">{r.snippet}</span>}
            </button>
          </li>))}
      </ul>
      {total > results.length && <p className="hint">Mostrando {results.length} de {total}. Afina la búsqueda.</p>}
    </Modal>
  );
}
