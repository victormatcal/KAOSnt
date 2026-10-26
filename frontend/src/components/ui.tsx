import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { t } from "../lib/i18n";
import { STATUS } from "../lib/labels";
import { isSafeUrl, linkProps } from "../lib/links";
import { useApp } from "../lib/store";
import type { Link, TaskRef } from "../lib/types";

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input, textarea, select, button:not(.modal-close)")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => { window.removeEventListener("keydown", onKey, true); prev?.focus?.(); };
  }, []);
  return (
    <div className="modal-backdrop" onMouseDown={(e: any) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " modal-wide" : "")} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="modal-head"><h2>{title}</h2><button className="ghost modal-close" onClick={onClose} aria-label={t("Cerrar (Esc)")}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint, wide }: { label: string; children: ReactNode; hint?: string; wide?: boolean }) {
  return (
    <label className={"field" + (wide ? " field-wide" : "")}>
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

/** Text area that grows with its content (between minRows and maxRows lines) without overflowing its container. */
export function AutoText({ value, onChange, minRows = 1, maxRows = 8, ...rest }:
  { value: string; onChange: (v: string) => void; minRows?: number; maxRows?: number; [k: string]: any }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof getComputedStyle === "undefined") return;
    el.style.height = "auto";
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = lh * maxRows + 12;
    el.style.height = Math.min(Math.max(el.scrollHeight + 2, lh * minRows + 12), max) + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value, maxRows, minRows]);
  return <textarea ref={ref} rows={minRows} className="autotext" value={value} onChange={(e: any) => onChange(e.target.value)} {...rest} />;
}

/** Text saved when leaving the field or with Ctrl+Enter. Esc reverts the current edit. */
export function CommitText({ value, onCommit, placeholder, label, maxRows = 6 }:
  { value: string; onCommit: (v: string) => void; placeholder?: string; label: string; maxRows?: number }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const commit = () => { if (v !== value) onCommit(v); };
  return <AutoText value={v} onChange={setV} aria-label={label} placeholder={placeholder} maxRows={maxRows} onBlur={commit}
    onKeyDown={(e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); commit(); }
      if (e.key === "Escape") { e.stopPropagation(); setV(value); }
    }} />;
}

export function PersonSelect({ value, onChange, label = t("Persona"), allowEmpty = true, emptyLabel = t("Sin asignar") }:
  { value: number | null | undefined; onChange: (v: number | null) => void; label?: string; allowEmpty?: boolean; emptyLabel?: string }) {
  const { boot } = useApp();
  return (
    <select aria-label={label} value={value ?? ""} onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {boot.people.filter((p) => p.active || p.id === value).map((p) => <option key={p.id} value={p.id}>{p.name}{p.is_me ? " (yo)" : ""}</option>)}
    </select>
  );
}

export function ProjectSelect({ value, onChange, label = t("Proyecto"), emptyLabel = t("Sin proyecto") }:
  { value: number | null | undefined; onChange: (v: number | null) => void; label?: string; emptyLabel?: string }) {
  const { boot } = useApp();
  return (
    <select aria-label={label} value={value ?? ""} onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">{emptyLabel}</option>
      {boot.projects.filter((p) => p.status !== "archivado" || p.id === value).map((p) => (
        <option key={p.id} value={p.id}>{p.name}{p.status !== "activo" ? ` (${p.status})` : ""}</option>))}
    </select>
  );
}

export function LocationSelect({ value, onChange, emptyLabel = t("Sin oficina") }: { value: number | null | undefined; onChange: (v: number | null) => void; emptyLabel?: string }) {
  const { boot } = useApp();
  return (
    <select aria-label={t("Oficina")} value={value ?? ""} onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">{emptyLabel}</option>
      {boot.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
    </select>
  );
}

export function Chip({ children, tone = "neutral", title }: { children: ReactNode; tone?: string; title?: string }) {
  return <span className={`chip chip-${tone}`} title={title}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) { return <p className="empty">{children}</p>; }

export function ErrorBox({ error, onRetry }: { error: string; onRetry?: () => void }) {
  if (!error) return null;
  return <div className="error-box" role="alert"><span>{error}</span>{onRetry && <button onClick={onRetry}>{t("Reintentar")}</button>}</div>;
}

export function SafeLink({ link }: { link: Link }) {
  if (!isSafeUrl(link.url)) return <span className="unsafe-link">{link.label || link.url} [{t("bloqueado")}]</span>;
  return <a {...linkProps(link.url)} title={link.url}>{link.label || link.url}</a>;
}

export function LinksEditor({ value, onChange }: { value: Link[]; onChange: (v: Link[]) => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const add = () => {
    if (!isSafeUrl(url)) { setErr(t("Usa un enlace http(s), mailto o file. Otros esquemas se bloquean.")); return; }
    onChange([...value, { label: label.trim(), url: url.trim() }]);
    setLabel(""); setUrl(""); setErr("");
  };
  return (
    <div className="links-editor">
      {value.length === 0 && <span className="muted">{t("Sin enlaces")}</span>}
      <ul className="plain">{value.map((l, i) => (
        <li key={i}><SafeLink link={l} /> <button className="ghost small" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={t("Quitar enlace {enlace}", { enlace: l.label || l.url })}>{t("Quitar")}</button></li>))}
      </ul>
      <div className="row">
        <input placeholder={t("Etiqueta (opcional)")} aria-label={t("Etiqueta del enlace")} value={label} onChange={(e: any) => setLabel(e.target.value)} />
        <input className="grow" placeholder={t("https://… o file:///…")} aria-label={t("URL del enlace")} value={url} onChange={(e: any) => setUrl(e.target.value)}
          onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button onClick={add} disabled={!url.trim()}>{t("Añadir enlace")}</button>
      </div>
      {err && <p className="field-error">{err}</p>}
    </div>
  );
}

/** Tag picker: reuses existing tags; Enter picks the highlighted suggestion or creates a new one. */
export function TagPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { boot } = useApp();
  const [text, setText] = useState("");
  const [sel, setSel] = useState(0);
  const [open, setOpen] = useState(false);
  const lower = value.map((v) => v.toLowerCase());
  const q = text.trim().toLowerCase();
  const exact = boot.tags.find((x) => x.toLowerCase() === q);
  const items: { label: string; name: string }[] = useMemo(() => {
    const opts = boot.tags.filter((x) => !lower.includes(x.toLowerCase()) && (!q || x.toLowerCase().includes(q))).slice(0, 8)
      .map((x) => ({ label: "#" + x, name: x }));
    if (q && !exact) opts.push({ label: t("Crear «{nombre}»", { nombre: text.trim() }), name: text.trim() });
    return opts;
  }, [boot.tags, value.join("|"), q, text]);
  const add = (name: string) => {
    const n = name.trim().replace(/\s+/g, " ");
    if (n && !lower.includes(n.toLowerCase())) onChange([...value, boot.tags.find((x) => x.toLowerCase() === n.toLowerCase()) || n]);
    setText(""); setSel(0);
  };
  return (
    <div className="tagpicker" onBlur={(e: any) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      {value.map((x) => (
        <span key={x} className="tagchip">#{x}<button className="ghost small" aria-label={t("Quitar etiqueta {nombre}", { nombre: x })} onClick={() => onChange(value.filter((y) => y !== x))}>×</button></span>))}
      <input aria-label={t("Añadir etiqueta")} placeholder={value.length ? "" : t("Añadir etiqueta…")} value={text} maxLength={60}
        onFocus={() => setOpen(true)} onChange={(e: any) => { setText(e.target.value); setOpen(true); setSel(0); }}
        onKeyDown={(e: any) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setSel(Math.min(sel + 1, items.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); if (exact) add(exact); else if (items[sel]) add(items[sel].name); }
          else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
        }} />
      {open && items.length > 0 && (
        <ul className="dropdown" role="listbox">
          {items.map((it, i) => <li key={it.label}><button tabIndex={-1} className={i === sel ? "sel" : ""} onMouseDown={(e: any) => { e.preventDefault(); add(it.name); }}>{it.label}</button></li>)}
        </ul>
      )}
    </div>
  );
}

/** Task finder by title, with context (project, status, assignee) instead of identifiers. */
export function TaskPicker({ tasks, onPick, placeholder = t("Buscar tarea por título…"), exclude = [] }:
  { tasks: TaskRef[]; onPick: (id: number) => void; placeholder?: string; exclude?: number[] }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const norm = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nq = norm(q.trim());
  const list = tasks.filter((x) => !exclude.includes(x.id) && (!nq || norm(x.title + " " + (app.project(x.project_id)?.name || "")).includes(nq))).slice(0, 10);
  const pick = (id: number) => { onPick(id); setQ(""); setOpen(false); };
  return (
    <div className="taskpicker" onBlur={(e: any) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <input aria-label={placeholder} placeholder={placeholder} value={q} onFocus={() => setOpen(true)}
        onChange={(e: any) => { setQ(e.target.value); setOpen(true); setSel(0); }}
        onKeyDown={(e: any) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setSel(Math.min(sel + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
          else if (e.key === "Enter" && list[sel]) { e.preventDefault(); pick(list[sel].id); }
          else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
        }} />
      {open && (
        <ul className="dropdown" role="listbox">
          {list.length === 0 && <li className="muted pad-s">{t("Sin coincidencias")}</li>}
          {list.map((x, i) => (
            <li key={x.id}><button tabIndex={-1} className={i === sel ? "sel" : ""} onMouseDown={(e: any) => { e.preventDefault(); pick(x.id); }}>
              <span className="dd-title">{x.title}</span>
              <span className="dd-ctx">{[app.project(x.project_id)?.name || t("Sin proyecto"), STATUS[x.status], app.person(x.assignee_id)?.name || t("Sin asignar")].join(" · ")}</span>
            </button></li>))}
        </ul>
      )}
    </div>
  );
}

/** Accordion: only one section open at a time (controlled by the parent). */
export function AccItem({ id, title, open, setOpen, children, badge }:
  { id: string; title: string; open: string | null; setOpen: (v: string | null) => void; children: ReactNode; badge?: ReactNode }) {
  const isOpen = open === id;
  return (
    <section className={"acc" + (isOpen ? " open" : "")}>
      <button className="acc-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)}>
        <span className="acc-caret" aria-hidden="true">{isOpen ? "▾" : "▸"}</span> {title} {badge}
      </button>
      {isOpen && <div className="acc-body">{children}</div>}
    </section>
  );
}

export function Section({ title, count, children, actions, id }: { title: string; count?: number; children: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <section className="section" aria-labelledby={id}>
      <div className="section-head">
        <h2 id={id}>{title}{count !== undefined && <span className="count"> ({count})</span>}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
