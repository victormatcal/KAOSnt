import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { fmtDate, fmtDateTime, sinceLabel } from "../lib/dates";
import { GROUPING_KIND, HEALTH, MILESTONE_KIND, PROJECT_STATUS, projectTypeLabel } from "../lib/labels";
import { useApi, useApp } from "../lib/store";
import type { Client, NoteSummary, Project, ProjectListItem, Task } from "../lib/types";
import { Board, GroupBy } from "../components/TaskViews";
import { AutoText, Chip, CommitText, Empty, ErrorBox, Field, LinksEditor, Modal, PersonSelect, SafeLink, Section } from "../components/ui";

export function ProjectsView() {
  const app = useApp();
  const [tab, setTab] = useState<"proyectos" | "clientes">("proyectos");
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);
  const { data, error, reload } = useApi<ProjectListItem[]>(`/api/projects${showAll ? "?include_archived=true" : ""}`);
  return (
    <div className="view">
      <header className="view-head row">
        <h1>Proyectos</h1>
        <div role="tablist" className="tabs-inline" aria-label="Proyectos o clientes">
          <button role="tab" aria-selected={tab === "proyectos"} className={tab === "proyectos" ? "active" : ""} onClick={() => setTab("proyectos")}>Proyectos</button>
          <button role="tab" aria-selected={tab === "clientes"} className={tab === "clientes" ? "active" : ""} onClick={() => setTab("clientes")}>Clientes</button>
        </div>
        <span className="spacer" />
        {tab === "proyectos" && <>
          <label className="check"><input type="checkbox" checked={showAll} onChange={(e: any) => setShowAll(e.target.checked)} /> Incluir archivados</label>
          <button className="primary" onClick={() => setCreating(true)}>Nuevo proyecto</button></>}
      </header>
      {tab === "clientes" ? <ClientsPanel /> : <>
        <ErrorBox error={error} onRetry={reload} />
        {data && !data.length && <Empty>Aún no hay proyectos. No son obligatorios: puedes capturar tareas y notas sin proyecto y vincularlas después.</Empty>}
        <div className="project-grid">
          {data?.map((p) => (
            <article key={p.id} className={`project-card status-${p.status}`}>
              <button className="linklike project-name" onClick={() => app.navigate(`#/proyectos/${p.id}`)}>{p.name}</button>
              <div className="card-meta">
                <Chip>{projectTypeLabel(p.type)}</Chip>
                {p.status !== "activo" && <Chip>{PROJECT_STATUS[p.status]}</Chip>}
                {p.health && <Chip tone={p.health === "bloqueado" ? "danger" : p.health === "atencion" ? "warn" : "neutral"}>{HEALTH[p.health]}</Chip>}
                {p.client_name && <span className="muted">{p.client_name}</span>}
              </div>
              {p.health_note && <p className="health-note">{p.health_note}</p>}
              <p className="clamp">{p.summary || <span className="muted">Sin resumen «Dónde lo dejamos»</span>}</p>
              {p.next_action && <p className="clamp"><strong>Siguiente:</strong> {p.next_action}</p>}
              <p className="muted small">{p.open_tasks ?? 0} tareas operativas · {p.conditioned_tasks ?? 0} con espera/bloqueo · resumen {p.summary_updated_at ? sinceLabel(p.summary_updated_at) : "no informado"}</p>
            </article>))}
        </div>
      </>}
      {creating && <ProjectForm onClose={() => setCreating(false)} onSaved={(id) => { setCreating(false); app.navigate(`#/proyectos/${id}`); }} />}
    </div>
  );
}

/** Gestión de clientes: crear, renombrar y eliminar (los proyectos se conservan sin cliente). */
function ClientsPanel() {
  const app = useApp();
  const { data, error, reload } = useApi<Client[]>("/api/clients");
  const [name, setName] = useState("");
  const [edit, setEdit] = useState<{ id: number; name: string } | null>(null);
  const [err, setErr] = useState("");
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reload(); await app.reloadBoot(); app.changed(); setErr(""); return true; } catch (e: any) { setErr(e.message); return false; } };
  return (
    <Section title="Clientes" count={data?.length}>
      <p className="hint">Opcionales: un proyecto puede no tener cliente. Cambia el cliente de un proyecto desde su pantalla.</p>
      <ErrorBox error={error || err} onRetry={reload} />
      <form className="row" onSubmit={async (e: any) => { e.preventDefault(); if (await call(() => api.post("/api/clients", { name: name.trim() }))) setName(""); }}>
        <input className="grow" aria-label="Nombre del nuevo cliente" placeholder="Nombre del nuevo cliente" value={name} onChange={(e: any) => setName(e.target.value)} />
        <button type="submit" disabled={!name.trim()}>Añadir cliente</button>
      </form>
      {data && !data.length && <Empty>Sin clientes registrados.</Empty>}
      <ul className="plain clients">{data?.map((c) => (
        <li key={c.id} className="row">
          {edit?.id === c.id ? <>
            <input className="grow" aria-label="Nuevo nombre" value={edit.name} onChange={(e: any) => setEdit({ id: c.id, name: e.target.value })}
              onKeyDown={async (e: any) => { if (e.key === "Enter" && edit.name.trim()) { if (await call(() => api.patch(`/api/clients/${c.id}`, { name: edit.name.trim() }))) setEdit(null); } if (e.key === "Escape") setEdit(null); }} />
            <button className="small primary" disabled={!edit.name.trim()} onClick={async () => { if (await call(() => api.patch(`/api/clients/${c.id}`, { name: edit.name.trim() }))) setEdit(null); }}>Guardar</button>
            <button className="small" onClick={() => setEdit(null)}>Cancelar</button>
          </> : <>
            <strong className="grow">{c.name}</strong>
            <span className="muted small">{c.projects ? `${c.projects} proyecto(s)` : "sin proyectos"}</span>
            <button className="small" onClick={() => setEdit({ id: c.id, name: c.name })}>Renombrar</button>
            <button className="small ghost" onClick={() => { if (window.confirm(`¿Eliminar el cliente «${c.name}»?${c.projects ? ` Sus ${c.projects} proyecto(s) se conservan, sin cliente.` : ""}`)) void call(() => api.del(`/api/clients/${c.id}`)); }}>Eliminar</button>
          </>}
        </li>))}</ul>
    </Section>
  );
}

/** Selector de cliente con opción de crear uno nuevo en línea. */
function ClientPicker({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
  const app = useApp();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  if (creating) return <span className="row tight">
    <input aria-label="Nombre del nuevo cliente" placeholder="Nombre del cliente" value={name} autoFocus onChange={(e: any) => setName(e.target.value)}
      onKeyDown={(e: any) => { if (e.key === "Escape") setCreating(false); }} />
    <button type="button" className="small primary" disabled={!name.trim()} onClick={async () => {
      try { const c = await api.post<Client>("/api/clients", { name: name.trim() }); await app.reloadBoot(); onChange(c.id); setCreating(false); setName(""); }
      catch (e: any) { app.toast(e.message, "error"); }
    }}>Crear</button>
    <button type="button" className="small" onClick={() => setCreating(false)}>Cancelar</button>
  </span>;
  return <select aria-label="Cliente" value={value ?? ""} onChange={(e: any) => e.target.value === "nuevo" ? setCreating(true) : onChange(e.target.value ? Number(e.target.value) : null)}>
    <option value="">Sin cliente</option>
    {app.boot.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    <option value="nuevo">+ Nuevo cliente…</option>
  </select>;
}

function ProjectForm({ onClose, onSaved }: { onClose: () => void; onSaved: (id: number) => void }) {
  const app = useApp();
  const [name, setName] = useState("");
  const [type, setType] = useState("implementacion");
  const [clientId, setClientId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const submit = async () => {
    try { const p = await api.post<Project>("/api/projects", { name: name.trim(), type, client_id: clientId }); await app.reloadBoot(); app.changed(); onSaved(p.id); }
    catch (e: any) { setError(e.message); }
  };
  return (
    <Modal title="Nuevo proyecto" onClose={onClose}>
      <form onSubmit={(e: any) => { e.preventDefault(); void submit(); }}>
        <Field label="Nombre"><input value={name} onChange={(e: any) => setName(e.target.value)} required /></Field>
        <Field label="Tipo"><select value={type} onChange={(e: any) => setType(e.target.value)}>
          {app.boot.settings.project_types.map((t) => <option key={t} value={t}>{projectTypeLabel(t)}</option>)}</select></Field>
        <Field label="Cliente (opcional)"><ClientPicker value={clientId} onChange={setClientId} /></Field>
        <ErrorBox error={error} />
        <div className="modal-foot"><button className="primary" type="submit" disabled={!name.trim()}>Crear</button><button type="button" onClick={onClose}>Cancelar</button></div>
      </form>
    </Modal>
  );
}

export function ProjectDetail({ id }: { id: number }) {
  const app = useApp();
  const { data: p, error, reload } = useApi<Project>(`/api/projects/${id}`);
  const [showBacklog, setShowBacklog] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const { data: tasks } = useApi<Task[]>(`/api/tasks?project_id=${id}${showBacklog ? "&include_backlog=1" : ""}${showDone ? "&include_closed=1" : ""}`);
  const { data: notes } = useApi<NoteSummary[]>(`/api/notes?project_id=${id}`);
  const [summary, setSummary] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("linea");
  const [err, setErr] = useState("");
  const [ms, setMs] = useState({ kind: "hito", title: "", date: "" });
  const [grp, setGrp] = useState({ kind: "linea", name: "" });
  const [personToAdd, setPersonToAdd] = useState<number | null>(null);
  useEffect(() => { if (p) setSummary(p.summary); }, [p?.id, p?.summary]);
  if (!p) return <div className="view"><ErrorBox error={error} onRetry={reload} />{!error && <p className="muted">Cargando…</p>}</div>;

  const patch = async (body: Record<string, unknown>, msg = "Proyecto actualizado") => {
    try { await api.patch(`/api/projects/${id}`, body); reload(); await app.reloadBoot(); app.toast(msg, "ok"); setErr(""); } catch (e: any) { setErr(e.message); }
  };
  const call = async (fn: () => Promise<unknown>) => { try { await fn(); reload(); await app.reloadBoot(); app.changed(); setErr(""); } catch (e: any) { setErr(e.message); } };
  const sig = p.signals;
  const pendingDecisions = p.milestones.filter((m) => m.kind === "decision" && m.status === "pendiente");

  return (
    <div className="view project">
      <header className="view-head">
        <p><button className="linklike" onClick={() => app.navigate("#/proyectos")}>← Proyectos</button></p>
        <div className="row">
          <h1 className="wrap">{p.name}</h1>
          <Chip>{projectTypeLabel(p.type)}</Chip>
          <span className="spacer" />
          <button onClick={() => { const n = window.prompt("Nuevo nombre del proyecto:", p.name); if (n?.trim()) void patch({ name: n.trim() }); }}>Renombrar</button>
          <a className="button" href={`/api/export/project/${p.id}`} download>Exportar proyecto</a>
        </div>
        <div className="row">
          <label>Cliente <ClientPicker value={p.client_id} onChange={(v) => patch({ client_id: v }, "Cliente actualizado")} /></label>
          <label>Actividad <select value={p.status} onChange={(e: any) => patch({ status: e.target.value })}>
            {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Estado general (manual) <select value={p.health || ""} onChange={(e: any) => patch({ health: e.target.value || null })}>
            <option value="">No informado</option>{Object.entries(HEALTH).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        </div>
        <Field label="Por qué (explicación breve del estado general; se muestra en la lista de proyectos)" wide>
          <CommitText label="Explicación del estado general" value={p.health_note} placeholder="p. ej. Pendiente de accesos del cliente para continuar las pruebas" maxRows={4}
            onCommit={(v) => patch({ health_note: v }, "Explicación guardada")} />
        </Field>
      </header>
      <ErrorBox error={err} />

      <div className="project-top">
        <Section title="Dónde lo dejamos" id="p-donde">
          <AutoText value={summary} minRows={4} maxRows={14} onChange={setSummary} aria-label="Resumen dónde lo dejamos" placeholder="Estado actual en pocas líneas" />
          <div className="row">
            <button className="primary" disabled={summary === p.summary} onClick={() => patch({ summary }, "Resumen actualizado")}>Guardar resumen</button>
            <span className="muted small">Fecha del resumen: {p.summary_updated_at ? `${fmtDateTime(p.summary_updated_at, app.tz)} (${sinceLabel(p.summary_updated_at)})` : "no informado"}</span>
          </div>
          <Field label="Siguiente acción" hint="Se guarda al salir del campo o con Ctrl+Enter" wide>
            <CommitText label="Siguiente acción" value={p.next_action} placeholder="La próxima cosa concreta que hay que hacer" onCommit={(v) => patch({ next_action: v }, "Siguiente acción guardada")} />
          </Field>
          <details className="mini"><summary>Objetivo y fase actual (opcional)</summary>
            <Field label="Objetivo" wide><CommitText label="Objetivo" value={p.objective} onCommit={(v) => patch({ objective: v })} /></Field>
            <Field label="Fase actual" wide><CommitText label="Fase actual" value={p.phase} maxRows={2} onCommit={(v) => patch({ phase: v })} /></Field>
          </details>
        </Section>

        <Section title="Señales objetivas" id="p-sig">
          <ul className="signals">
            <li><strong>{sig.overdue}</strong> vencidas</li><li><strong>{sig.due_14d}</strong> vencen en 14 días</li>
            <li><strong>{sig.blocked}</strong> bloqueadas · <strong>{sig.waiting}</strong> en espera</li>
            <li><strong>{sig.milestones_14d}</strong> hitos/compromisos en 14 días</li>
            <li><strong>{sig.decisions_pending}</strong> decisiones pendientes</li><li><strong>{sig.approvals_pending}</strong> aprobaciones pendientes</li>
          </ul>
          <p className="hint">Calculadas a partir de los datos registrados. Que no haya señales no significa que el proyecto vaya bien.</p>
          {pendingDecisions.length > 0 && <><h3>Decisiones pendientes</h3>
            <ul className="plain">{pendingDecisions.map((m) => <li key={m.id}>{m.title} {m.date && <span className="muted">· {fmtDate(m.date)}</span>}</li>)}</ul></>}
          <h3>Próximos compromisos (14 días)</h3>
          {p.commitments.length ? <ul className="plain">{p.commitments.map((c) => (
            <li key={c.type + c.id}>{fmtDate(c.date)} · {c.type === "tarea" ? <button className="linklike" onClick={() => app.openTask(c.id)}>{c.title}</button> : <>{MILESTONE_KIND[c.type]}: {c.title}</>}</li>))}</ul>
            : <p className="muted">Ninguno registrado.</p>}
        </Section>
      </div>

      <Section title="Tareas" count={tasks?.length} id="p-tareas" actions={<div className="row">
        <label>Agrupar por <select value={groupBy} onChange={(e: any) => setGroupBy(e.target.value)}>
          <option value="linea">Línea de trabajo</option><option value="fase">Fase</option><option value="entregable">Entregable</option>
          <option value="persona">Persona</option><option value="ninguna">Sin agrupar</option></select></label>
        <label className="check"><input type="checkbox" checked={showBacklog} onChange={(e: any) => setShowBacklog(e.target.checked)} /> Backlog</label>
        <label className="check"><input type="checkbox" checked={showDone} onChange={(e: any) => setShowDone(e.target.checked)} /> Terminadas</label>
        <button className="primary" onClick={() => app.quickTask({ project_id: p.id })}>Nueva tarea</button>
      </div>}>
        {tasks ? <Board tasks={tasks} showBacklog={showBacklog} showDone={showDone} groupBy={groupBy} showProject={false} /> : <p className="muted">Cargando…</p>}
      </Section>

      <div className="project-bottom">
        <Section title="Notas" count={notes?.length} id="p-notas" actions={<button onClick={() => app.newNote({ project_id: p.id })}>Nueva nota</button>}>
          {notes && !notes.length && <Empty>Sin notas vinculadas a este proyecto o a sus tareas.</Empty>}
          <ul className="plain note-list">{notes?.map((n) => (
            <li key={n.id}><button className="linklike" onClick={() => app.navigate(`#/notas/${n.id}`)}>{n.pinned ? "📌 " : ""}{n.display_title}</button>
              <span className="muted small"> · {n.kind || "nota"} · {fmtDate(n.updated_at.slice(0, 10))}</span></li>))}</ul>
        </Section>

        <Section title="Personas y dedicación" count={p.people.length} id="p-personas">
          <p className="hint">Dedicación opcional: % de la capacidad semanal de la persona destinada a este proyecto. Se usa en la Planificación semanal para comparar con el esfuerzo estimado registrado.</p>
          <ul className="plain">{p.people.map((x) => (
            <li key={x.id} className="row">
              <button className="linklike grow" onClick={() => app.navigate(`#/equipo/${x.id}`)}>{x.name}</button>
              <label className="inline small">Dedicación <input type="number" min="0" max="100" step="5" className="num" aria-label={`Dedicación de ${x.name} (%)`} defaultValue={x.dedication_pct ?? ""} key={String(x.dedication_pct)}
                onBlur={(e: any) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== x.dedication_pct) void call(() => api.post(`/api/projects/${id}/people`, { person_id: x.id, dedication_pct: v })); }} /> %</label>
              <span className="muted small">{x.dedication_hours !== null ? `≈ ${x.dedication_hours} h/sem` : x.dedication_pct !== null ? "capacidad no informada" : "no informada"}</span>
              <button className="ghost small" onClick={() => call(() => api.del(`/api/projects/${id}/people/${x.id}`))}>Desvincular</button>
            </li>))}</ul>
          <div className="row">
            <PersonSelect value={personToAdd} onChange={setPersonToAdd} emptyLabel="Elegir persona…" />
            <button disabled={!personToAdd} onClick={() => call(() => api.post(`/api/projects/${id}/people`, { person_id: personToAdd })).then(() => setPersonToAdd(null))}>Vincular</button>
          </div>
        </Section>

        <Section title="Hitos, decisiones y compromisos" id="p-hitos">
          <ul className="plain">{p.milestones.map((m) => (
            <li key={m.id} className={m.status !== "pendiente" ? "done" : ""}>
              <Chip>{MILESTONE_KIND[m.kind]}</Chip> {m.title} <span className="muted small">{m.date ? fmtDate(m.date) : "sin fecha"} · {m.status}</span>
              {m.status === "pendiente" && <button className="ghost small" onClick={() => call(() => api.patch(`/api/milestones/${m.id}`, { status: "cumplido" }))}>{m.kind === "decision" ? "Decidida" : "Cumplido"}</button>}
              <button className="ghost small" onClick={() => { if (window.confirm("¿Eliminar este elemento?")) void call(() => api.del(`/api/milestones/${m.id}`)); }}>Eliminar</button>
            </li>))}</ul>
          <form className="row" onSubmit={(e: any) => { e.preventDefault(); void call(() => api.post(`/api/projects/${id}/milestones`, { kind: ms.kind, title: ms.title, date: ms.date || null })).then(() => setMs({ ...ms, title: "", date: "" })); }}>
            <select aria-label="Tipo" value={ms.kind} onChange={(e: any) => setMs({ ...ms, kind: e.target.value })}>{Object.entries(MILESTONE_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input className="grow" aria-label="Título" placeholder="Título" value={ms.title} onChange={(e: any) => setMs({ ...ms, title: e.target.value })} />
            <input aria-label="Fecha" type="date" value={ms.date} onChange={(e: any) => setMs({ ...ms, date: e.target.value })} />
            <button type="submit" disabled={!ms.title.trim()}>Añadir</button>
          </form>
        </Section>

        <Section title="Agrupaciones" id="p-grupos">
          {(["linea", "fase", "entregable"] as const).map((k) => {
            const gs = p.groupings.filter((g) => g.kind === k);
            return <div key={k}><h3>{GROUPING_KIND[k]}</h3>
              {gs.length ? <ul className="plain">{gs.map((g) => <li key={g.id}>{g.name}
                <button className="ghost small" onClick={() => { const n = window.prompt("Nuevo nombre:", g.name); if (n?.trim()) void call(() => api.patch(`/api/groupings/${g.id}`, { name: n.trim() })); }}>Renombrar</button>
                <button className="ghost small" onClick={() => { if (window.confirm("¿Eliminar la agrupación? Las tareas se conservan sin ella.")) void call(() => api.del(`/api/groupings/${g.id}`)); }}>Eliminar</button></li>)}</ul>
                : <p className="muted">—</p>}</div>;
          })}
          <form className="row" onSubmit={(e: any) => { e.preventDefault(); void call(() => api.post(`/api/projects/${id}/groupings`, grp)).then(() => setGrp({ ...grp, name: "" })); }}>
            <select aria-label="Dimensión" value={grp.kind} onChange={(e: any) => setGrp({ ...grp, kind: e.target.value })}>{Object.entries(GROUPING_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input className="grow" aria-label="Nombre" placeholder="Nombre" value={grp.name} onChange={(e: any) => setGrp({ ...grp, name: e.target.value })} />
            <button type="submit" disabled={!grp.name.trim()}>Añadir</button>
          </form>
        </Section>

        <Section title="Enlaces" id="p-enlaces">
          <ul className="plain">{p.links.map((l, i) => <li key={i}><SafeLink link={l} /></li>)}</ul>
          <details className="mini"><summary>Editar enlaces</summary><LinksEditor value={p.links} onChange={(v) => patch({ links: v }, "Enlaces actualizados")} /></details>
        </Section>
      </div>
    </div>
  );
}
