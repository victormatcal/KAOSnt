// Scope of a change on a recurring task (0.5). askScope() opens a dialog and resolves with the choice (null = cancel).
// - «occurrence» (editing or dragging one occurrence): this | following | all
// - «series» (series manager, no specific occurrence): new | from_today | all
import { useEffect, useState } from "react";
import { t } from "../lib/i18n";
import { Modal } from "./ui";

export type OccurrenceScope = "this" | "following" | "all";
export type SeriesScope = "new" | "from_today" | "all";
type Kind = "occurrence" | "series";
interface Request { kind: Kind; resolve: (v: string | null) => void }

let show: ((r: Request) => void) | null = null;

export function askScope(kind: "occurrence"): Promise<OccurrenceScope | null>;
export function askScope(kind: "series"): Promise<SeriesScope | null>;
export function askScope(kind: Kind): Promise<string | null> {
  return new Promise((resolve) => {
    if (!show) { resolve(kind === "occurrence" ? "this" : "new"); return; }  // no host (tests): safest scope
    show({ kind, resolve });
  });
}

/** Fields of a task whose change can be applied to other occurrences (status, history and due date never are). */
export const SCOPED_FIELDS = new Set(["title", "tags", "planned_date", "next_review_at", "description", "kind", "project_id", "assignee_id",
  "reviewer_id", "priority", "estimate_hours", "workstream_id", "phase_id", "deliverable_id", "parent_id", "approval",
  "review_after_start_hours", "review_after_idle_hours", "review_hours_mode", "links"]);

export function needsScope(task: { recurrence_id: number | null }, keys: string[]): boolean {
  return task.recurrence_id !== null && keys.some((k) => SCOPED_FIELDS.has(k));
}

export function scopeOptions(kind: Kind): [string, string, string][] {
  return kind === "occurrence"
    ? [["this", t("Solo esta ocurrencia"), t("El cambio afecta únicamente a esta tarea. La serie no cambia.")],
       ["following", t("Esta y las posteriores"), t("Esta ocurrencia y todas las de fecha posterior, en cualquier estado. Las nuevas ocurrencias también lo heredan.")],
       ["all", t("Todas las ocurrencias"), t("Todas, incluidas las pasadas, terminadas y canceladas. Las nuevas ocurrencias también lo heredan.")]]
    : [["new", t("Solo las nuevas ocurrencias"), t("Las ya creadas no cambian; se aplica a las que se generen a partir de ahora.")],
       ["from_today", t("Desde hoy"), t("Las ocurrencias de hoy en adelante que sigan abiertas, y las nuevas.")],
       ["all", t("Todas las ocurrencias"), t("Todas, incluidas las pasadas, terminadas y canceladas, y las nuevas.")]];
}

export function ScopeDialog({ kind, onChoose }: { kind: Kind; onChoose: (v: string | null) => void }) {
  const opts = scopeOptions(kind);
  const [sel, setSel] = useState(opts[0][0]);
  return (
    <Modal title={t("¿A qué ocurrencias se aplica el cambio?")} onClose={() => onChoose(null)}>
      <p className="hint">{t("Esta tarea pertenece a una serie recurrente. El estado, el historial y la fecha límite de cada ocurrencia nunca se copian.")}</p>
      <fieldset className="plain-fieldset scope-options"><legend className="sr">{t("Alcance del cambio")}</legend>
        {opts.map(([v, label, hint]) => <label key={v} className="check scope-option">
          <input type="radio" name="scope" checked={sel === v} onChange={() => setSel(v)} />
          <span><strong>{label}</strong><br /><span className="muted small">{hint}</span></span></label>)}
      </fieldset>
      <div className="modal-foot"><button className="primary" onClick={() => onChoose(sel)}>{t("Aplicar")}</button>
        <button onClick={() => onChoose(null)}>{t("Cancelar")}</button></div>
    </Modal>
  );
}

/** Mounted once in App: shows the dialogs requested with askScope(). */
export function ScopeHost() {
  const [req, setReq] = useState<Request | null>(null);
  useEffect(() => { show = setReq; return () => { show = null; }; }, []);
  if (!req) return null;
  return <ScopeDialog kind={req.kind} onChoose={(v) => { req.resolve(v); setReq(null); }} />;
}
