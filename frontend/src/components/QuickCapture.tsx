import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { todayIn } from "../lib/dates";
import { t } from "../lib/i18n";
import { NOTE_KIND, PROJECT_STATUS, STATUS, projectTypeLabel } from "../lib/labels";
import { useApp } from "../lib/store";
import type { TaskDetail } from "../lib/types";
import { emptyRule, RuleEditor, ruleIsValid, RuleValue } from "./Recurrences";
import { DateInput } from "./DateInput";
import { ErrorBox, Field, Modal, PersonSelect, ProjectSelect } from "./ui";

/** Quick task capture: only the title is required. More fields (including repetition) on demand. */
export function QuickTask({ preset, onClose }: { preset: Record<string, any>; onClose: () => void }) {
  const app = useApp();
  const [title, setTitle] = useState(preset.title || "");
  const [more, setMore] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(preset.project_id ?? null);
  const [assignee, setAssignee] = useState<number | null>(preset.assignee_id ?? null);
  const [due, setDue] = useState<string | null>(null);
  const [backlog, setBacklog] = useState(!!preset.backlog);
  const [repeat, setRepeat] = useState(false);
  const [rule, setRule] = useState<RuleValue>(emptyRule(todayIn(app.tz)));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (openAfter: boolean) => {
    if (!title.trim() || busy || (repeat && !ruleIsValid(rule))) return;
    setBusy(true);
    try {
      let task = await api.post<TaskDetail>("/api/tasks", { title: title.trim(), project_id: projectId, assignee_id: assignee,
        due_date: due || null, status: backlog ? "backlog" : "pendiente" });
      if (repeat) {
        task = await api.post<TaskDetail>(`/api/tasks/${task.id}/recurrence`, { rule: rule.rule, weekdays: rule.rule === "semanal" ? rule.weekdays : [],
          interval_days: rule.rule === "cada_n_dias" ? rule.interval_days : null, start_date: due || rule.start_date, end_date: rule.end_date, non_working: rule.non_working });
      }
      app.changed();
      app.toast(t("Tarea creada: {titulo}", { titulo: task.title }), "ok", { label: t("Abrir"), run: () => app.openTask(task.id) });
      onClose();
      if (openAfter) app.openTask(task.id);
    } catch (e: any) { setError(e.message); setBusy(false); }
  };

  return (
    <Modal title={t("Nueva tarea")} onClose={onClose} wide={repeat}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(false); }}>
        <Field label={t("Título (obligatorio)")}><input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder={t("¿Qué hay que hacer?")} required maxLength={300} /></Field>
        <button type="button" className="ghost small" onClick={() => setMore(!more)} aria-expanded={more}>{more ? t("Menos campos") : t("Más campos (opcionales)")}</button>
        {more && <>
          <div className="grid2">
            <Field label={t("Proyecto")}><ProjectSelect value={projectId} onChange={setProjectId} /></Field>
            <Field label={t("Responsable")}><PersonSelect value={assignee} onChange={setAssignee} /></Field>
            <Field label={t("Fecha límite")}><DateInput label={t("Fecha límite")} value={due} onChange={setDue} /></Field>
          </div>
          <label className="check"><input type="checkbox" checked={backlog} onChange={(e: any) => setBacklog(e.target.checked)} /> {t("Guardar en Backlog (aún no comprometida)")}</label>
          <label className="check"><input type="checkbox" checked={repeat} onChange={(e: any) => setRepeat(e.target.checked)} /> {t("Se repite")}</label>
          {repeat && <RuleEditor value={{ ...rule, start_date: due || rule.start_date }} onChange={setRule} />}
        </>}
        <ErrorBox error={error} />
        <div className="modal-foot">
          <button type="submit" className="primary" disabled={!title.trim() || busy || (repeat && !ruleIsValid(rule))}>{t("Crear (Enter)")}</button>
          <button type="button" disabled={!title.trim() || busy} onClick={() => submit(true)}>{t("Crear y abrir detalle")}</button>
          <button type="button" onClick={onClose}>{t("Cancelar")}</button>
        </div>
      </form>
    </Modal>
  );
}

interface Result {
  type: "nota" | "tarea" | "proyecto"; id: number; title: string; context: string; snippet: string; state: string;
  project?: string | null; kind?: string | null; archived?: boolean; project_type?: string;
}

/** Result context in the interface language (0.4). The server `context` text (Spanish) is only a fallback. */
export function resultContext(r: Result): string {
  if (r.type === "proyecto") return [t("Proyecto"), r.project_type ? projectTypeLabel(r.project_type) : "", PROJECT_STATUS[r.state] || r.state].filter(Boolean).join(" · ");
  if (r.project === undefined) return r.context;
  const parts = [r.project || "", r.type === "nota" && r.kind ? NOTE_KIND[r.kind] || r.kind : "", r.type === "tarea" ? STATUS[r.state as keyof typeof STATUS] || r.state : "",
    r.archived ? t("archivada") : "", r.type === "nota" && r.state === "papelera" ? t("en papelera") : ""].filter(Boolean);
  return parts.join(" · ") || (r.type === "nota" ? t("Sin clasificar") : "");
}

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
    const timer = setTimeout(() => {
      api.get<{ results: Result[]; total: number }>(`/api/search?q=${encodeURIComponent(q)}${archived ? "&archived=true" : ""}${trash ? "&trash=true" : ""}`)
        .then((r) => { if (my === seq.current) { setResults(r.results); setTotal(r.total); setSel(0); setError(""); } }, (e) => setError(e.message));
    }, 200);
    return () => clearTimeout(timer);
  }, [q, archived, trash]);
  const open = (r: Result) => {
    onClose();
    if (r.type === "tarea") app.openTask(r.id); else app.navigate(r.type === "nota" ? `#/notas/${r.id}` : `#/proyectos/${r.id}`);
  };
  return (
    <Modal title={t("Buscar")} onClose={onClose} wide>
      <input aria-label={t("Texto a buscar")} placeholder={t('Palabras o "frase exacta" en tareas, proyectos y notas')} value={q} onChange={(e: any) => setQ(e.target.value)}
        onKeyDown={(e: any) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
          if (e.key === "Enter" && results[sel]) { e.preventDefault(); open(results[sel]); }
        }} />
      <div className="row">
        <label className="check"><input type="checkbox" checked={archived} onChange={(e: any) => setArchived(e.target.checked)} /> {t("Incluir archivados")}</label>
        <label className="check"><input type="checkbox" checked={trash} onChange={(e: any) => setTrash(e.target.checked)} /> {t("Incluir papelera")}</label>
      </div>
      <ErrorBox error={error} />
      {q.trim() && !results.length && !error && <p className="empty">{t("Sin resultados. Prueba con menos palabras o sin comillas.")}</p>}
      <ul className="results" role="listbox" aria-label={t("Resultados")}>
        {results.map((r, i) => (
          <li key={r.type + r.id} role="option" aria-selected={i === sel} className={i === sel ? "sel" : ""}>
            <button className="result" onClick={() => open(r)}>
              <span className="result-type">{r.type === "nota" ? t("Nota") : r.type === "tarea" ? t("Tarea") : t("Proyecto")}</span>
              <strong>{r.title}</strong> <span className="muted">· {resultContext(r)}</span>
              {r.snippet && <span className="snippet">{r.snippet}</span>}
            </button>
          </li>))}
      </ul>
      {total > results.length && <p className="hint">{t("Mostrando {n} de {total}. Afina la búsqueda.", { n: results.length, total })}</p>}
    </Modal>
  );
}
