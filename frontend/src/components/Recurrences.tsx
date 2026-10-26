import { useState } from "react";
import { api } from "../lib/api";
import { fmtDate, isoDow, todayIn } from "../lib/dates";
import { t } from "../lib/i18n";
import { DAYS_SHORT, NONWORK, PRIORITY, RULE, describeRule } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Rule } from "../lib/types";
import { DateInput } from "./DateInput";
import { askScope } from "./ScopeDialog";
import { ErrorBox, Field, Modal, PersonSelect, ProjectSelect } from "./ui";

export interface RuleValue { rule: Rule; weekdays: number[]; interval_days: number | null; start_date: string; end_date: string | null; non_working: string }

export function emptyRule(start: string): RuleValue {
  return { rule: "semanal", weekdays: [isoDow(start)], interval_days: 2, start_date: start, end_date: null, non_working: "saltar" };
}

export function ruleIsValid(r: RuleValue): boolean {
  return !!r.start_date && (r.rule !== "semanal" || r.weekdays.length > 0) && (r.rule !== "cada_n_dias" || (r.interval_days || 0) >= 1);
}

/** Repetition rule editor (shared by the task, quick capture and the manager). */
export function RuleEditor({ value, onChange, lockRule }: { value: RuleValue; onChange: (v: RuleValue) => void; lockRule?: boolean }) {
  const set = (p: Partial<RuleValue>) => onChange({ ...value, ...p });
  return (
    <div className="rule-editor">
      <div className="grid2">
        <Field label={t("Se repite")}>
          <select value={value.rule} disabled={lockRule} onChange={(e: any) => set({ rule: e.target.value })}>
            {(Object.keys(RULE) as Rule[]).map((k) => <option key={k} value={k}>{RULE[k]}</option>)}
          </select>
        </Field>
        {value.rule === "cada_n_dias" && <Field label={t("Cada cuántos días")}>
          <input type="number" min="1" disabled={lockRule} value={value.interval_days ?? ""} onChange={(e: any) => set({ interval_days: e.target.value ? Number(e.target.value) : null })} /></Field>}
        <Field label={t("Empieza")}>{lockRule ? <input disabled value={value.start_date} aria-label={t("Empieza")} /> : <DateInput label={t("Empieza")} value={value.start_date} onChange={(v) => set({ start_date: v || value.start_date })} />}</Field>
        <Field label={t("Termina (opcional)")}><DateInput label={t("Termina (opcional)")} value={value.end_date} onChange={(v) => set({ end_date: v })} /></Field>
      </div>
      {value.rule === "semanal" && (
        <fieldset className="weekdays" disabled={lockRule}><legend>{t("Días de la semana")}</legend>
          {DAYS_SHORT.map((d, i) => (
            <label key={d} className="daybox"><input type="checkbox" checked={value.weekdays.includes(i + 1)}
              onChange={(e: any) => set({ weekdays: e.target.checked ? [...value.weekdays, i + 1].sort() : value.weekdays.filter((x) => x !== i + 1) })} />{d}</label>))}
        </fieldset>)}
      {value.rule !== "laborables" && (
        <Field label={t("Si cae en día no laborable")} hint={t("No laborables: días sin horario laboral y festivos registrados (comunes y de la oficina del responsable)")}>
          <select value={value.non_working} onChange={(e: any) => set({ non_working: e.target.value })}>
            {Object.entries(NONWORK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>)}
    </div>
  );
}

interface Rec {
  id: number; title: string; description: string; project_id: number | null; assignee_id: number | null; priority: string;
  estimate_hours: number | null; rule: Rule; interval_days: number | null; weekdays: number[]; start_date: string;
  end_date: string | null; non_working: string; active: boolean;
}

export function RecurrencesModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const { data, error, reload } = useApi<Rec[]>("/api/recurrences");
  const [form, setForm] = useState<(Partial<Rec> & { r: RuleValue }) | null>(null);
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState<Rec | null>(null);
  const save = async () => {
    if (!form) return;
    const { r, ...f } = form;
    try {
      if (f.id) {
        const scope = await askScope("series");  // which occurrences already created also change (0.5)
        if (!scope) return;
        await api.patch(`/api/recurrences/${f.id}`, { title: f.title, project_id: f.project_id ?? null, assignee_id: f.assignee_id ?? null,
          priority: f.priority, estimate_hours: f.estimate_hours ?? null, end_date: r.end_date, non_working: r.non_working, scope });
      } else {
        await api.post("/api/recurrences", { title: f.title, project_id: f.project_id ?? null, assignee_id: f.assignee_id ?? null,
          priority: f.priority || "normal", estimate_hours: f.estimate_hours ?? null, ...r, interval_days: r.rule === "cada_n_dias" ? r.interval_days : null });
      }
      setForm(null); reload(); app.changed(); setErr("");
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <Modal title={t("Tareas recurrentes")} onClose={onClose} wide>
      <p className="hint">{t("También puedes hacer recurrente cualquier tarea desde su detalle (sección «Repetición»). Cada ocurrencia es una tarea propia: se completa o se salta sin afectar a las demás.")}</p>
      <ErrorBox error={error || err} onRetry={reload} />
      {!form && <>
        <div className="table-wrap"><table className="list compact">
          <thead><tr><th>{t("Título")}</th><th>{t("Repetición")}</th><th>{t("Responsable")}</th><th>{t("Estado")}</th><th></th></tr></thead>
          <tbody>{data?.map((r) => (
            <tr key={r.id}><td>{r.title}</td><td>{describeRule(r)} · {t("desde {fecha}", { fecha: fmtDate(r.start_date) })}{r.end_date ? " " + t("hasta {fecha}", { fecha: fmtDate(r.end_date) }) : ""}</td>
              <td>{app.person(r.assignee_id)?.name || t("Sin asignar")}</td><td>{r.active ? t("Activa") : t("Pausada")}</td>
              <td className="nowrap"><button className="small" onClick={() => setForm({ ...r, r: { rule: r.rule, weekdays: r.weekdays, interval_days: r.interval_days, start_date: r.start_date, end_date: r.end_date, non_working: r.non_working } })}>{t("Editar")}</button>
                <button className="small ghost" onClick={async () => { await api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); reload(); app.changed(); }}>{r.active ? t("Pausar") : t("Reactivar")}</button>
                <button className="small ghost danger" onClick={() => setDeleting(r)}>{t("Eliminar serie")}</button></td></tr>))}
          </tbody>
        </table></div>
        {data && !data.length && <p className="empty">{t("No hay tareas recurrentes.")}</p>}
        <div className="modal-foot"><button className="primary" onClick={() => setForm({ priority: "normal", r: emptyRule(todayIn(app.tz)) })}>{t("Nueva recurrencia")}</button></div>
      </>}
      {form && (
        <form onSubmit={(e: any) => { e.preventDefault(); void save(); }}>
          <div className="grid2">
            <Field label={t("Título")}><input value={form.title || ""} onChange={(e: any) => setForm({ ...form, title: e.target.value })} required /></Field>
            <Field label={t("Responsable")}><PersonSelect value={form.assignee_id} onChange={(v) => setForm({ ...form, assignee_id: v })} /></Field>
            <Field label={t("Proyecto")}><ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} /></Field>
            <Field label={t("Prioridad")}><select value={form.priority} onChange={(e: any) => setForm({ ...form, priority: e.target.value })}>{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            <Field label={t("Esfuerzo estimado por ocurrencia (h)")}><input type="number" min="0" step="0.5" value={form.estimate_hours ?? ""} onChange={(e: any) => setForm({ ...form, estimate_hours: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
          </div>
          <RuleEditor value={form.r} onChange={(r) => setForm({ ...form, r })} lockRule={!!form.id} />
          {form.id && <p className="hint">{t("La regla y el inicio no se modifican para no alterar el histórico; si cambian, pausa esta serie y crea otra.")}</p>}
          <div className="modal-foot"><button className="primary" type="submit" disabled={!form.title?.trim() || !ruleIsValid(form.r)}>{t("Guardar")}</button><button type="button" onClick={() => setForm(null)}>{t("Volver")}</button></div>
        </form>
      )}
      {deleting && <DeleteSeriesDialog rec={deleting} onClose={() => setDeleting(null)} onDone={() => { setDeleting(null); reload(); app.changed(); }} />}
    </Modal>
  );
}

/** Delete a series: keep the occurrences as normal tasks or also delete the pending ones. */
export function DeleteSeriesDialog({ rec, onClose, onDone }: { rec: { id: number; title: string }; onClose: () => void; onDone: () => void }) {
  const app = useApp();
  const [mode, setMode] = useState<"conservar" | "eliminar_pendientes">("conservar");
  const [err, setErr] = useState("");
  const run = async () => {
    if (!window.confirm(mode === "conservar" ? t("¿Eliminar la serie «{titulo}»? Sus ocurrencias se conservan como tareas normales.", { titulo: rec.title })
      : t("¿Eliminar la serie «{titulo}» y sus ocurrencias pendientes? No se puede deshacer. Las hechas, en curso o en revisión se conservan.", { titulo: rec.title }))) return;
    try {
      const r = await api.del<{ deleted: number; kept: number }>(`/api/recurrences/${rec.id}?mode=${mode}`);
      app.toast(t("Serie eliminada: {borradas} ocurrencia(s) eliminada(s), {conservadas} conservada(s) como tareas normales", { borradas: r.deleted, conservadas: r.kept }), "ok");
      onDone();
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <Modal title={t("Eliminar serie recurrente")} onClose={onClose}>
      <p><strong>{rec.title}</strong></p>
      <fieldset className="plain-fieldset"><legend>{t("¿Qué hacer con las ocurrencias ya creadas?")}</legend>
        <label className="check"><input type="radio" name="del-mode" checked={mode === "conservar"} onChange={() => setMode("conservar")} /> {t("Conservarlas como tareas normales (dejan de ser recurrentes)")}</label>
        <label className="check"><input type="radio" name="del-mode" checked={mode === "eliminar_pendientes"} onChange={() => setMode("eliminar_pendientes")} /> {t("Eliminar también las pendientes (no iniciadas y saltadas)")}</label>
      </fieldset>
      <p className="hint">{t("Las ocurrencias hechas, en curso o en revisión se conservan siempre. No se generarán más ocurrencias.")}</p>
      <ErrorBox error={err} />
      <div className="modal-foot"><button className="danger" onClick={run}>{t("Eliminar serie")}</button><button onClick={onClose}>{t("Cancelar")}</button></div>
    </Modal>
  );
}
