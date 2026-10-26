// Own safe Markdown renderer: it produces React elements (never innerHTML). HTML in the text is
// shown literally and never executed. No images or resources are downloaded: images are shown as links.
import type { ReactNode } from "react";
import { t } from "./i18n";
import { isSafeUrl, linkProps } from "./links";

let keySeq = 0;
const k = () => "md" + keySeq++;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(<?(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])>?)|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*\s][^*]*)\*|_([^_\s][^_]*)_)|(~~([^~]+)~~)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<code key={k()}>{m[1].slice(1, -1)}</code>);
    else if (m[2]) out.push(isSafeUrl(m[4])
      ? <a key={k()} {...linkProps(m[4])} title={m[4]}>[{t("imagen: {desc} — no se carga", { desc: m[3] || t("sin descripción") })}]</a>
      : <span key={k()}>[{t("imagen: {desc}", { desc: m[3] })}]</span>);
    else if (m[5]) out.push(isSafeUrl(m[7])
      ? <a key={k()} {...linkProps(m[7])} title={m[7]}>{inline(m[6])}</a>
      : <span key={k()} className="unsafe-link" title={t("Enlace bloqueado: esquema no permitido")}>{m[6]} [{t("enlace bloqueado")}]</span>);
    else if (m[8]) out.push(<a key={k()} {...linkProps(m[9])}>{m[9]}</a>);
    else if (m[10]) out.push(<strong key={k()}>{inline(m[11] ?? m[12])}</strong>);
    else if (m[13]) out.push(<em key={k()}>{inline(m[14] ?? m[15])}</em>);
    else if (m[16]) out.push(<del key={k()}>{inline(m[17])}</del>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isTableSep = (l: string) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
const cells = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const startsTable = (lines: string[], i: number) => lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]);
/** Indentation width (a tab counts as 4 spaces). */
const width = (ws: string) => ws.replace(/\t/g, "    ").length;
/** Column alignment from the separator row (:--- left, :---: centre, ---: right). */
export function tableAlign(sep: string): ("left" | "center" | "right" | undefined)[] {
  return cells(sep).map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : undefined));
}

export interface MarkdownOptions {
  /** Called with the 0-based source line of a checkbox the user clicked (only when given: editable notes). */
  onToggleTask?: (line: number) => void;
}

interface ListLine { indent: number; ordered: boolean; text: string; line: number }

/** Nested lists: a deeper indentation starts a sub-list inside the previous item. */
function renderList(items: ListLine[], opts: MarkdownOptions): ReactNode {
  const out: ReactNode[] = [];
  let i = 0;
  const base = items[0].indent;
  while (i < items.length) {
    const it = items[i];
    const children: ListLine[] = [];
    let j = i + 1;
    while (j < items.length && items[j].indent > base) children.push(items[j++]);
    const task = /^\[([ xX])\]\s+(.*)$/.exec(it.text);
    const done = !!task && !!task[1].trim();
    const content = task
      ? <>{opts.onToggleTask
        ? <input type="checkbox" className="md-check" checked={done} aria-label={done ? t("completado") : t("pendiente")}
            onChange={() => opts.onToggleTask!(it.line)} />
        : <span aria-label={done ? t("completado") : t("pendiente")}>{done ? "☑" : "☐"}</span>} {inline(task[2])}</>
      : inline(it.text);
    out.push(<li key={k()} className={task ? "md-task" + (done ? " done" : "") : undefined}>{content}{children.length ? renderList(children, opts) : null}</li>);
    i = j;
  }
  return items[0].ordered ? <ol key={k()}>{out}</ol> : <ul key={k()}>{out}</ul>;
}

export function renderMarkdown(src: string, opts: MarkdownOptions = {}): ReactNode[] {
  const lines = (src || "").replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(<pre key={k()}><code>{buf.join("\n")}</code></pre>);
      continue;
    }
    if (!line.trim()) { i++; continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const Tag = ("h" + Math.min(h[1].length + 1, 6)) as any;
      out.push(<Tag key={k()}>{inline(h[2])}</Tag>);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push(<hr key={k()} />); i++; continue; }
    if (startsTable(lines, i)) {
      const head = cells(line);
      const align = tableAlign(lines[i + 1]);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) body.push(cells(lines[i++]));
      const cls = (c: number) => (align[c] ? `al-${align[c]}` : undefined);
      out.push(<div className="md-table" key={k()}><table>
        <thead><tr>{head.map((c, ci) => <th key={k()} className={cls(ci)}>{inline(c)}</th>)}</tr></thead>
        <tbody>{body.map((r) => <tr key={k()}>{r.map((c, ci) => <td key={k()} className={cls(ci)}>{inline(c)}</td>)}</tr>)}</tbody>
      </table></div>);
      continue;
    }
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(<blockquote key={k()}>{renderMarkdown(buf.join("\n"))}</blockquote>);
      continue;
    }
    if (LIST_RE.test(line)) {
      const items: ListLine[] = [];
      const first = width(LIST_RE.exec(line)![1]);
      while (i < lines.length && LIST_RE.test(lines[i])) {
        const m = LIST_RE.exec(lines[i])!;
        items.push({ indent: Math.max(width(m[1]), first), ordered: /^\d/.test(m[2]), text: m[3], line: i });
        i++;
      }
      out.push(renderList(items, opts));
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*>)/.test(lines[i]) && !LIST_RE.test(lines[i]) && !startsTable(lines, i)) buf.push(lines[i++]);
    if (!buf.length) buf.push(lines[i++]);
    out.push(<p key={k()}>{buf.flatMap((b, j) => (j ? [<br key={k()} />, ...inline(b)] : inline(b)))}</p>);
  }
  return out;
}

export function Markdown({ text, onToggleTask }: { text: string; onToggleTask?: (line: number) => void }) {
  return <div className="markdown">{renderMarkdown(text, { onToggleTask })}</div>;
}
