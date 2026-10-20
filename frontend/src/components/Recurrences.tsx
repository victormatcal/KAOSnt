import { useState } from "react";
import { api } from "../lib/api";
import { fmtDate, todayIn } from "../lib/dates";
import { PRIORITY } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import { ErrorBox, Field, Modal, PersonSelect, ProjectSelect } from "./ui";

interface Rec {
  id: number; title: string; description: string; project_id: number | null; assignee_id: number | null; priority: string;
  estimate_hours: number | null; rule: string; interval_days: number | null; weekdays: number[]; start_date: string;
  end_date: string | null; non_working: string; active: boolean; generated_until: string | null;
}

const RULE: Record<string, string> = { diaria: "Diaria", laborables: "Días laborables", semanal: "Semanal", cada_n_dias: "Cada X días" };
const NONWORK: Record<string, string> = { saltar: "Saltar ese día", siguiente_laborable: "Mover al siguiente laborable", mantener: "Mantener la fecha" };
const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function RecurrencesModal({ onClose }: { onClose: () => void }) {
  const app = useApp();
  const { data, error, reload } = useApi<Rec[]>("/api/recurrences");
  const [form, setForm] = useState<Partial<Rec> | null>(null);
  const [err, setErr] = useState("");
  const describe = (r: Rec) => r.rule === "semanal" ? `Semanal (${r.weekdays.map((d) => DAYS[d - 1]).join(", ") || "día de inicio"})`
    : r.rule === "cada_n_dias" ? `Cada ${r.interval_days} días` : RULE[r.rule];

  const save = async () => {
    if (!form) return;
    try {
      if (form.id) {
        const applyFuture = window.confirm("¿Aplicar también a las ocurrencias futuras ya generadas que sigan pendientes?\n\nAceptar = esta y las futuras · Cancelar = solo la plantilla (nuevas ocurrencias)");
        await api.patch(`/api/recurrences/${form.id}`, {
          title: form.title, description: form.description, project_id: form.project_id ?? null, assignee_id: form.assignee_id ?? null,
          priority: form.priority, estimate_hours: form.estimate_hours ?? null, end_date: form.end_date || null,
          non_working: form.non_working, active: form.active, apply_to_future: applyFuture,
        });
      } else {
        await api.post("/api/recurrences", {
          title: form.title, description: form.description || "", project_id: form.project_id ?? null, assignee_id: form.assignee_id ?? null,
          priority: form.priority || "normal", estimate_hours: form.estimate_hours ?? null, rule: form.rule, interval_days: form.interval_days ?? null,
          weekdays: form.weekdays || [], start_date: form.start_date, end_date: form.end_date || null, non_working: form.non_working || "saltar",
        });
      }
      setForm(null); reload(); app.changed(); setErr("");
    } catch (e: any) { setErr(e.message); }
  };

  return (
    <Modal title="Tareas recurrentes" onClose={onClose} wide>
      <p className="hint">Cada ocurrencia es una tarea independiente: conserva su estado y fechas. Se generan hasta {app.boot.settings.recurrence_horizon_days} días vista; si la aplicación estuvo cerrada, solo se crea la última ocurrencia perdida. Para editar una sola ocurrencia, ábrela como cualquier tarea.</p>
      <ErrorBox error={error || err} onRetry={reload} />
      {!form && <>
        <table className="list compact">
          <thead><tr><th>Título</th><th>Regla</th><th>Responsable</th><th>Días no laborables</th><th>Estado</th><th></th></tr></thead>
          <tbody>{data?.map((r) => (
            <tr key={r.id}><td>{r.title}</td><td>{describe(r)} desde {fmtDate(r.start_date)}{r.end_date ? ` hasta ${fmtDate(r.end_date)}` : ""}</td>
              <td>{app.person(r.assignee_id)?.name || "Sin asignar"}</td><td>{NONWORK[r.non_working]}</td><td>{r.active ? "Activa" : "Pausada"}</td>
              <td><button className="small" onClick={() => setForm(r)}>Editar</button>
                <button className="small ghost" onClick={async () => { await api.patch(`/api/recurrences/${r.id}`, { active: !r.active }); reload(); }}>{r.active ? "Pausar" : "Reactivar"}</button></td></tr>))}
          </tbody>
        </table>
        {data && !data.length && <p className="empty">No hay tareas recurrentes.</p>}
        <div className="modal-foot"><button className="primary" onClick={() => setForm({ rule: "laborables", start_date: todayIn(app.tz), non_working: "saltar", priority: "normal", weekdays: [] })}>Nueva recurrencia</button></div>
      </>}
      {form && (
        <form onSubmit={(e: any) => { e.preventDefault(); void save(); }}>
          <div className="grid2">
            <Field label="Título"><input value={form.title || ""} onChange={(e: any) => setForm({ ...form, title: e.target.value })} required /></Field>
            <Field label="Responsable"><PersonSelect value={form.assignee_id} onChange={(v) => setForm({ ...form, assignee_id: v })} /></Field>
            <Field label="Proyecto"><ProjectSelect value={form.project_id} onChange={(v) => setForm({ ...form, project_id: v })} /></Field>
            <Field label="Prioridad"><select value={form.priority} onChange={(e: any) => setForm({ ...form, priority: e.target.value })}>{Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            <Field label="Regla"><select value={form.rule} disabled={!!form.id} onChange={(e: any) => setForm({ ...form, rule: e.target.value })}>{Object.entries(RULE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            {form.rule === "cada_n_dias" && <Field label="Cada cuántos días"><input type="number" min="1" disabled={!!form.id} value={form.interval_days ?? ""} onChange={(e: any) => setForm({ ...form, interval_days: Number(e.target.value) })} /></Field>}
            {form.rule === "semanal" && <fieldset className="weekdays" disabled={!!form.id}><legend>Días</legend>{DAYS.map((d, i) => (
              <label key={d} className="check"><input type="checkbox" checked={(form.weekdays || []).includes(i + 1)} onChange={(e: any) => setForm({ ...form, weekdays: e.target.checked ? [...(form.weekdays || []), i + 1] : (form.weekdays || []).filter((x) => x !== i + 1) })} />{d}</label>))}</fieldset>}
            <Field label="Inicio"><input type="date" disabled={!!form.id} value={form.start_date || ""} onChange={(e: any) => setForm({ ...form, start_date: e.target.value })} required /></Field>
            <Field label="Fin (opcional)"><input type="date" value={form.end_date || ""} onChange={(e: any) => setForm({ ...form, end_date: e.target.value || null })} /></Field>
            <Field label="Si cae en día no laborable" hint="No laborables: días de la semana y festivos registrados en Configuración"><select value={form.non_working} onChange={(e: any) => setForm({ ...form, non_working: e.target.value })}>{Object.entries(NONWORK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
            <Field label="Esfuerzo estimado por ocurrencia (h)"><input type="number" min="0" step="0.5" value={form.estimate_hours ?? ""} onChange={(e: any) => setForm({ ...form, estimate_hours: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
          </div>
          {form.id && <p className="hint">La regla y el inicio no se modifican para no alterar el histórico; crea una nueva recurrencia si cambian.</p>}
          <div className="modal-foot"><button className="primary" type="submit" disabled={!form.title?.trim() || !form.start_date}>Guardar</button><button type="button" onClick={() => setForm(null)}>Volver</button></div>
        </form>
      )}
    </Modal>
  );
}
