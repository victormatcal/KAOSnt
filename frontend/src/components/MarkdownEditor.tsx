// Markdown editor (0.5): «Edit» and «Preview» modes, toolbar and keyboard editing.
// 0.6: «Live» mode — editor and rendered result side by side (stacked when narrow), synchronised scrolling
// (can be switched off), click on a rendered block to jump to its source line and highlight of the block being edited.
// - Tab / Shift+Tab indent and outdent (several lines when selected). To leave the field with the keyboard: Esc, then Tab.
// - Enter continues bullets, numbers and checkboxes; on an empty item it ends the list.
// - Ctrl+B bold, Ctrl+I italic, Ctrl+K link (inside the editor only; elsewhere Ctrl+K opens the search),
//   Ctrl+Shift+C code, Ctrl+Shift+X strikethrough.
// Edits go through execCommand("insertText") when the browser supports it, so Ctrl+Z keeps working.
// The preview is the same safe renderer as everywhere (React elements, no innerHTML); checkboxes can be ticked.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { t } from "../lib/i18n";
import { Anchor, blockForLine, lineOfOffset, lineToOffset, Markdown, offsetOfLine, offsetToLine } from "../lib/markdown";
import { useViewState } from "../lib/viewstate";
import { applyEdit, codeBlock, continueList, Edit, indent, insertBlock, insertLink, Sel, TABLE_TEMPLATE, toggleCheckbox, toggleLinePrefix, wrap } from "../lib/mdedit";

export type EditorMode = "editar" | "live" | "vista_previa";
/** Stored value → editor mode (unknown values → Edit). */
export const asEditorMode = (v: unknown): EditorMode => (v === "live" || v === "vista_previa" ? v : "editar");
const LIVE_DELAY = 150;  // ms: the live result is rendered shortly after typing stops

/** Rendered blocks of a preview as anchors (source line and position inside the scrolling preview). */
export function previewAnchors(preview: HTMLElement): Anchor[] {
  const top0 = preview.getBoundingClientRect().top - preview.scrollTop;
  return (Array.from(preview.querySelectorAll("[data-line]")) as HTMLElement[])
    .map((el) => ({ line: Number(el.dataset.line), top: el.getBoundingClientRect().top - top0 }))
    .filter((a) => Number.isFinite(a.line));
}

/** Keyboard shortcut → edit (null = not handled). Exported for the tests. */
export function editForKey(e: { key: string; ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; altKey?: boolean }, s: Sel): Edit | null {
  const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
  const key = e.key.toLowerCase();
  if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) return indent(s, !!e.shiftKey);
  if (e.key === "Enter" && !mod && !e.shiftKey && !e.altKey) return continueList(s);
  if (!mod) return null;
  if (!e.shiftKey && key === "b") return wrap(s, "**", t("negrita"));
  if (!e.shiftKey && key === "i") return wrap(s, "*", t("cursiva"));
  if (!e.shiftKey && key === "k") return insertLink(s);
  if (e.shiftKey && key === "c") return wrap(s, "`", t("código"));
  if (e.shiftKey && key === "x") return wrap(s, "~~", t("tachado"));
  return null;
}

/** Apply an edit to the textarea keeping the native undo history when possible. */
function applyToTextarea(ta: HTMLTextAreaElement, ed: Edit, onChange: (v: string) => void) {
  ta.focus();
  ta.setSelectionRange(ed.from, ed.to);
  let ok = false;
  try { ok = typeof document !== "undefined" && !!document.execCommand && document.execCommand("insertText", false, ed.insert); } catch { ok = false; }
  if (!ok || ta.value.slice(ed.from, ed.from + ed.insert.length) !== ed.insert) {
    const next = applyEdit(ta.value, ed);
    onChange(next.value);
    requestAnimationFrame(() => ta.setSelectionRange(ed.selStart, ed.selEnd));
    return;
  }
  ta.setSelectionRange(ed.selStart, ed.selEnd);
}

export function MarkdownEditor({ value, onChange, mode, onModeChange, label, placeholder, textareaRef, compact, className, onBlur, readOnly }: {
  value: string; onChange: (v: string) => void; mode: EditorMode; onModeChange: (m: EditorMode) => void; label: string;
  placeholder?: string; textareaRef?: RefObject<HTMLTextAreaElement | null>; compact?: boolean; className?: string;
  onBlur?: () => void; readOnly?: boolean;
}) {
  const own = useRef<HTMLTextAreaElement>(null);
  const ref = (textareaRef || own) as RefObject<HTMLTextAreaElement>;
  const escArmed = useRef(false);
  // ---- Live mode ----
  const live = mode === "live";
  const previewRef = useRef<HTMLDivElement>(null);
  const [sync, setSync] = useViewState<boolean>("editor.syncScroll", true);
  const [shown, setShown] = useState(value);  // text rendered in the live result (debounced)
  const [caretLine, setCaretLine] = useState(0);
  const lock = useRef<"editor" | "preview" | null>(null);
  useEffect(() => {
    if (!live) { setShown(value); return; }
    const timer = setTimeout(() => setShown(value), LIVE_DELAY);
    return () => clearTimeout(timer);
  }, [value, live]);
  const totalLines = () => Math.max(1, value.split("\n").length);
  const editorToPreview = () => {
    const ta = ref.current, pv = previewRef.current;
    if (!live || !sync || !ta || !pv || lock.current === "preview") { if (lock.current === "preview") lock.current = null; return; }
    lock.current = "editor";
    if (ta.scrollTop + ta.clientHeight >= ta.scrollHeight - 2) { pv.scrollTop = pv.scrollHeight; return; }
    const line = (ta.scrollTop / Math.max(1, ta.scrollHeight)) * totalLines();
    pv.scrollTop = lineToOffset(previewAnchors(pv), line, pv.scrollHeight, totalLines());
  };
  const previewToEditor = () => {
    const ta = ref.current, pv = previewRef.current;
    if (!live || !sync || !ta || !pv || lock.current === "editor") { if (lock.current === "editor") lock.current = null; return; }
    lock.current = "preview";
    if (pv.scrollTop + pv.clientHeight >= pv.scrollHeight - 2) { ta.scrollTop = ta.scrollHeight; return; }
    const line = offsetToLine(previewAnchors(pv), pv.scrollTop, pv.scrollHeight, totalLines());
    ta.scrollTop = (line / totalLines()) * ta.scrollHeight;
  };
  /** Click on a rendered block → caret at the start of its source line. */
  const jumpFromPreview = (e: any) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, input, button") || readOnly) return;
    const el = target.closest("[data-line]") as HTMLElement | null;
    const ta = ref.current;
    if (!el || !ta) return;
    const line = Number(el.dataset.line);
    const pos = offsetOfLine(ta.value, line);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    ta.scrollTop = Math.max(0, (line / totalLines()) * ta.scrollHeight - ta.clientHeight / 3);
    setCaretLine(line);
  };
  // Highlight the block being edited in the live result
  useEffect(() => {
    const pv = previewRef.current;
    if (!live || !pv) return;
    const blocks = Array.from(pv.querySelectorAll(".markdown > [data-line]")) as HTMLElement[];
    const cur = blockForLine(blocks.map((b) => Number(b.dataset.line)), caretLine);
    for (const b of blocks) b.classList.toggle("md-current", Number(b.dataset.line) === cur);
  }, [caretLine, shown, live]);
  const trackCaret = (ta: HTMLTextAreaElement) => { if (live) setCaretLine(lineOfOffset(ta.value, ta.selectionStart)); };
  // Compact editor (task description) grows with its content
  useLayoutEffect(() => {
    const el = ref.current;
    if (!compact || !el || typeof getComputedStyle === "undefined") return;
    el.style.height = "auto";
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = lh * 14 + 12;
    el.style.height = Math.min(Math.max(el.scrollHeight + 2, lh * 3 + 12), max) + "px";
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [value, mode, compact]);
  const run = (make: (s: Sel) => Edit | null) => {
    const ta = ref.current;
    if (!ta || readOnly) return;
    const ed = make({ value: ta.value, start: ta.selectionStart, end: ta.selectionEnd });
    if (ed) applyToTextarea(ta, ed, onChange);
  };
  const tool = (key: string, title: string, make: (s: Sel) => Edit | null, text?: string) => (
    <button type="button" key={key} className="ghost small md-tool" title={title} aria-label={title}
      onMouseDown={(e: any) => e.preventDefault()} onClick={() => run(make)} disabled={readOnly}>{text ?? key}</button>);
  const toggleTask = (line: number) => {
    if (readOnly) return;
    const next = toggleCheckbox(value, line);
    if (next !== null) onChange(next);
  };
  const textarea = (
<textarea ref={ref} className={(compact ? "autotext md-text" : "note-text md-text") + (live ? " md-live-text" : "")} aria-label={label} value={value} spellCheck
            placeholder={placeholder} readOnly={readOnly} rows={compact ? 3 : undefined}
            onChange={(e: any) => onChange(e.target.value)} onBlur={() => { escArmed.current = false; onBlur?.(); }}
            onScroll={editorToPreview} onSelect={(e: any) => trackCaret(e.currentTarget)}
            onKeyDown={(e: any) => {
              if (e.key === "Escape") {
                if (!escArmed.current) { escArmed.current = true; e.stopPropagation(); }  // next Tab leaves the field
                return;
              }
              if (e.key === "Tab" && escArmed.current) { escArmed.current = false; return; }
              escArmed.current = false;
              if (readOnly) return;
              const ta = e.currentTarget as HTMLTextAreaElement;
              const ed = editForKey(e, { value: ta.value, start: ta.selectionStart, end: ta.selectionEnd });
              if (!ed) return;
              e.preventDefault();
              e.stopPropagation();  // Ctrl+K here inserts a link instead of opening the global search
              applyToTextarea(ta, ed, onChange);
            }} />
  );
  return (
    <div className={"md-editor" + (compact ? " compact" : "") + (className ? " " + className : "")}>
      <div className="md-toolbar" role="toolbar" aria-label={t("Formato Markdown")}>
        <div className="tabs-inline md-modes" role="radiogroup" aria-label={t("Modo del editor")}>
          {([["editar", t("Editar")], ["live", t("Live")], ["vista_previa", t("Vista previa")]] as const).map(([m, l]) => (
            <button type="button" key={m} role="radio" aria-checked={mode === m} className={mode === m ? "active" : ""} onClick={() => onModeChange(m)}>{l}</button>))}
        </div>
        {mode !== "vista_previa" && !readOnly && <div className="md-tools">
          {tool("H1", t("Título 1"), (s) => toggleLinePrefix(s, "# "))}
          {tool("H2", t("Título 2"), (s) => toggleLinePrefix(s, "## "))}
          {tool("H3", t("Título 3"), (s) => toggleLinePrefix(s, "### "))}
          {tool("B", t("Negrita (Ctrl+B)"), (s) => wrap(s, "**", t("negrita")), "𝐁")}
          {tool("I", t("Cursiva (Ctrl+I)"), (s) => wrap(s, "*", t("cursiva")), "𝐼")}
          {tool("S", t("Tachado (Ctrl+Shift+X)"), (s) => wrap(s, "~~", t("tachado")), "S̶")}
          {tool("code", t("Código (Ctrl+Shift+C)"), (s) => wrap(s, "`", t("código")), "</>")}
          {tool("pre", t("Bloque de código"), codeBlock, "{ }")}
          {tool("link", t("Enlace (Ctrl+K)"), insertLink, "🔗")}
          {tool("quote", t("Cita"), (s) => toggleLinePrefix(s, "> "), "❝")}
          {tool("ul", t("Lista con viñetas"), (s) => toggleLinePrefix(s, "- "), "•")}
          {tool("ol", t("Lista numerada"), (s) => toggleLinePrefix(s, "1. "), "1.")}
          {tool("task", t("Casilla"), (s) => toggleLinePrefix(s, "- [ ] "), "☐")}
          {tool("table", t("Tabla"), (s) => insertBlock(s, TABLE_TEMPLATE, 2), "▦")}
          {tool("hr", t("Separador"), (s) => insertBlock(s, "---", 3), "―")}
        </div>}
        {live && <label className="check small md-sync" title={t("El resultado sigue al editor y al revés")}>
          <input type="checkbox" checked={sync} onChange={(e: any) => setSync(e.target.checked)} /> {t("Sincronizar desplazamiento")}</label>}
      </div>
      {mode === "vista_previa"
        ? <div className={compact ? "md-preview compact" : "note-preview"} tabIndex={0} aria-label={t("Vista previa de {campo}", { campo: label })}>
            <Markdown text={value} onToggleTask={readOnly ? undefined : toggleTask} /></div>
        : live
          ? <div className={"md-live" + (compact ? " compact" : "")}>
              {textarea}
              <div ref={previewRef} className={"md-live-preview" + (compact ? " compact" : "")} tabIndex={0} onScroll={previewToEditor} onClick={jumpFromPreview}
                aria-label={t("Resultado en directo de {campo}", { campo: label })} title={t("Haz clic en un bloque para ir a su línea")}>
                <Markdown text={shown} onToggleTask={readOnly ? undefined : toggleTask} /></div>
            </div>
          : textarea}
      {mode !== "vista_previa" && !readOnly && <p className="hint md-hint">{t("Tab sangra · Esc y luego Tab sale del campo · Ctrl+B/I/K negrita, cursiva y enlace")}</p>}
    </div>
  );
}
