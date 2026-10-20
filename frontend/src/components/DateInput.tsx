// Campos de fecha y hora propios: siguen el formato configurado (no el idioma del navegador).
// DateInput: texto en el formato configurado + calendario emergente; el valor se aplica en cuanto la fecha es válida.
// TimeInput: 24 h (HH:MM). DateTimeInput: fecha + hora en la zona configurada (valor local «AAAA-MM-DDTHH:MM»).
import { useEffect, useRef, useState } from "react";
import { addDays, dateConfig, formatHint, formatIso, monthGrid, monthName, parseDateText, parseTimeText, todayIn, weekHeaders } from "../lib/dates";
import { t } from "../lib/i18n";
import { useApp } from "../lib/store";

export function DateInput({ value, onChange, label, id, required, className }: {
  value: string | null | undefined; onChange: (v: string | null) => void; label: string; id?: string; required?: boolean; className?: string;
}) {
  const [text, setText] = useState(value ? formatIso(value) : "");
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => { setText(value ? formatIso(value) : ""); setInvalid(false); }, [value, dateConfig().format]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const edit = (v: string) => {
    setText(v);
    if (!v.trim()) { setInvalid(false); if (value) onChange(null); return; }
    const iso = parseDateText(v);
    if (iso) setInvalid(false);
    if (iso && iso !== value) onChange(iso);
  };
  return (
    <span className={"date-input" + (className ? " " + className : "")} ref={box}>
      <input id={id} type="text" inputMode="numeric" aria-label={label} placeholder={formatHint()} value={text} required={required}
        aria-invalid={invalid || undefined} className={invalid ? "invalid" : ""} size={11} maxLength={10}
        onChange={(e: any) => edit(e.target.value)} onBlur={() => { const ok = !text.trim() || !!parseDateText(text); setInvalid(!ok); if (ok && value) setText(formatIso(value)); }}
        onKeyDown={(e: any) => {
          if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); setOpen(true); }
          if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
        }} />
      <button type="button" className="ghost small date-btn" aria-label={t("Abrir calendario: {campo}", { campo: label })} aria-expanded={open}
        title={t("Calendario (Alt+↓)")} onClick={() => setOpen(!open)}>📅</button>
      {invalid && <span className="field-error small">{t("Fecha no válida ({formato})", { formato: formatHint() })}</span>}
      {open && <DatePopup value={value || null} onPick={(iso) => { onChange(iso); setText(formatIso(iso)); setInvalid(false); setOpen(false); }} onClose={() => setOpen(false)} />}
    </span>
  );
}

function DatePopup({ value, onPick, onClose }: { value: string | null; onPick: (iso: string) => void; onClose: () => void }) {
  const app = useApp();
  const today = todayIn(app.tz);
  const [anchor, setAnchor] = useState((value || today).slice(0, 8) + "15");
  const [focus, setFocus] = useState(value || today);
  const days = monthGrid(anchor);
  const shift = (n: number) => { const d = new Date(anchor + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); setAnchor(d.toISOString().slice(0, 8) + "15"); };
  const move = (n: number) => { const f = addDays(focus, n); setFocus(f); if (f.slice(0, 7) !== anchor.slice(0, 7)) setAnchor(f.slice(0, 8) + "15"); };
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.querySelector<HTMLElement>(".dp-focus")?.focus(); }, [focus, anchor]);
  const d0 = new Date(anchor + "T12:00:00Z");
  return (
    <div className="date-popup" role="dialog" aria-label={t("Elegir fecha")} ref={ref}
      onKeyDown={(e: any) => {
        const k: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
        if (k[e.key] !== undefined) { e.preventDefault(); move(k[e.key]); }
        else if (e.key === "PageUp") { e.preventDefault(); shift(-1); }
        else if (e.key === "PageDown") { e.preventDefault(); shift(1); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onClose(); }
      }}>
      <div className="dp-head">
        <button type="button" className="ghost small" onClick={() => shift(-1)} aria-label={t("Mes anterior")}>◀</button>
        <strong>{monthName(d0.getUTCMonth())} {d0.getUTCFullYear()}</strong>
        <button type="button" className="ghost small" onClick={() => shift(1)} aria-label={t("Mes siguiente")}>▶</button>
      </div>
      <div className="dp-grid" role="grid">
        {weekHeaders().map((h) => <span key={h} className="dp-dow" aria-hidden="true">{h}</span>)}
        {days.map((d) => (
          <button type="button" key={d} tabIndex={d === focus ? 0 : -1}
            className={"dp-day" + (d.slice(0, 7) !== anchor.slice(0, 7) ? " out" : "") + (d === today ? " today" : "") + (d === value ? " sel" : "") + (d === focus ? " dp-focus" : "")}
            aria-label={formatIso(d)} aria-pressed={d === value} onClick={() => onPick(d)}>{Number(d.slice(8))}</button>))}
      </div>
      <div className="dp-foot">
        <button type="button" className="small" onClick={() => onPick(today)}>{t("Hoy")}</button>
        <button type="button" className="small ghost" onClick={onClose}>{t("Cerrar")}</button>
      </div>
    </div>
  );
}

export function TimeInput({ value, onChange, label }: { value: string | null | undefined; onChange: (v: string | null) => void; label: string }) {
  const [text, setText] = useState(value || "");
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setText(value || ""); setInvalid(false); }, [value]);
  return (
    <span className="time-input">
      <input type="text" inputMode="numeric" aria-label={label} placeholder="HH:MM" size={5} maxLength={5} value={text}
        aria-invalid={invalid || undefined} className={invalid ? "invalid" : ""}
        onChange={(e: any) => {
          const v = e.target.value;
          setText(v);
          if (!v.trim()) { setInvalid(false); if (value) onChange(null); return; }
          const hm = parseTimeText(v);
          if (hm) setInvalid(false);
          if (hm && hm !== value) onChange(hm);
        }}
        onBlur={() => { const ok = !text.trim() || !!parseTimeText(text); setInvalid(!ok); if (ok && value) setText(value); }} />
      {invalid && <span className="field-error small">{t("Hora no válida (HH:MM, 24 h)")}</span>}
    </span>
  );
}

/** Valor local «AAAA-MM-DDTHH:MM» en la zona configurada (el llamador convierte a UTC). */
export function DateTimeInput({ value, onChange, label, defaultTime = "09:00" }: {
  value: string | null | undefined; onChange: (v: string | null) => void; label: string; defaultTime?: string;
}) {
  const date = value ? value.slice(0, 10) : null;
  const time = value ? value.slice(11, 16) : null;
  return (
    <span className="datetime-input">
      <DateInput label={t("{campo} (fecha)", { campo: label })} value={date} onChange={(d) => onChange(d ? `${d}T${time || defaultTime}` : null)} />
      <TimeInput label={t("{campo} (hora)", { campo: label })} value={time} onChange={(h) => { if (date && h) onChange(`${date}T${h}`); }} />
    </span>
  );
}
