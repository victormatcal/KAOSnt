import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { isSafeUrl, linkProps } from "../lib/links";
import { useApp } from "../lib/store";
import type { Link } from "../lib/types";

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const first = el?.querySelector<HTMLElement>("input, textarea, select, button:not(.modal-close)");
    first?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", onKey, true);
    return () => { window.removeEventListener("keydown", onKey, true); prev?.focus?.(); };
  }, []);
  return (
    <div className="modal-backdrop" onMouseDown={(e: any) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " modal-wide" : "")} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="ghost modal-close" onClick={onClose} aria-label="Cerrar (Esc)">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function PersonSelect({ value, onChange, label = "Persona", allowEmpty = true, emptyLabel = "Sin asignar" }:
  { value: number | null | undefined; onChange: (v: number | null) => void; label?: string; allowEmpty?: boolean; emptyLabel?: string }) {
  const { boot } = useApp();
  return (
    <select aria-label={label} value={value ?? ""} onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {boot.people.filter((p) => p.active || p.id === value).map((p) => (
        <option key={p.id} value={p.id}>{p.name}{p.is_me ? " (yo)" : ""}</option>
      ))}
    </select>
  );
}

export function ProjectSelect({ value, onChange, label = "Proyecto", emptyLabel = "Sin proyecto" }:
  { value: number | null | undefined; onChange: (v: number | null) => void; label?: string; emptyLabel?: string }) {
  const { boot } = useApp();
  return (
    <select aria-label={label} value={value ?? ""} onChange={(e: any) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">{emptyLabel}</option>
      {boot.projects.filter((p) => p.status !== "archivado" || p.id === value).map((p) => (
        <option key={p.id} value={p.id}>{p.name}{p.status !== "activo" ? ` (${p.status})` : ""}</option>
      ))}
    </select>
  );
}

export function Chip({ children, tone = "neutral", title }: { children: ReactNode; tone?: string; title?: string }) {
  return <span className={`chip chip-${tone}`} title={title}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}

export function ErrorBox({ error, onRetry }: { error: string; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div className="error-box" role="alert">
      <span>{error}</span>
      {onRetry && <button onClick={onRetry}>Reintentar</button>}
    </div>
  );
}

export function SafeLink({ link }: { link: Link }) {
  if (!isSafeUrl(link.url)) return <span className="unsafe-link">{link.label || link.url} [bloqueado]</span>;
  return <a {...linkProps(link.url)} title={link.url}>{link.label || link.url}</a>;
}

export function LinksEditor({ value, onChange }: { value: Link[]; onChange: (v: Link[]) => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const add = () => {
    if (!isSafeUrl(url)) { setErr("Usa un enlace http(s), mailto o file. Otros esquemas se bloquean."); return; }
    onChange([...value, { label: label.trim(), url: url.trim() }]);
    setLabel(""); setUrl(""); setErr("");
  };
  return (
    <div className="links-editor">
      {value.length === 0 && <span className="muted">Sin enlaces</span>}
      <ul className="plain">
        {value.map((l, i) => (
          <li key={i}><SafeLink link={l} />{" "}
            <button className="ghost small" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar enlace ${l.label || l.url}`}>Quitar</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <input placeholder="Etiqueta (opcional)" aria-label="Etiqueta del enlace" value={label} onChange={(e: any) => setLabel(e.target.value)} />
        <input placeholder="https://… o file:///…" aria-label="URL del enlace" value={url} onChange={(e: any) => setUrl(e.target.value)}
          onKeyDown={(e: any) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button onClick={add} disabled={!url.trim()}>Añadir enlace</button>
      </div>
      {err && <p className="field-error">{err}</p>}
    </div>
  );
}

export function TagsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => setText(value.join(", ")), [value.join("|")]);
  return (
    <input aria-label="Etiquetas separadas por comas" placeholder="etiqueta1, etiqueta2" value={text}
      onChange={(e: any) => setText(e.target.value)}
      onBlur={() => onChange(text.split(",").map((s: string) => s.trim()).filter(Boolean))} />
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
