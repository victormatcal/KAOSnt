// Renderizador Markdown propio y seguro: produce elementos React (nunca innerHTML),
// por lo que cualquier HTML del texto se muestra como texto literal y no se ejecuta.
// No descarga imágenes ni recursos externos: las imágenes se muestran como un enlace de texto.
import type { ReactNode } from "react";
import { isSafeUrl, linkProps } from "./links";

let keySeq = 0;
const k = () => "md" + keySeq++;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  // orden: código, imagen, enlace, autoenlace, negrita, cursiva, tachado
  const re = /(`[^`]+`)|(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(<?(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])>?)|(\*\*([^*]+)\*\*|__([^_]+)__)|(\*([^*\s][^*]*)\*|_([^_\s][^_]*)_)|(~~([^~]+)~~)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<code key={k()}>{m[1].slice(1, -1)}</code>);
    else if (m[2]) {
      const url = m[4];
      out.push(isSafeUrl(url)
        ? <a key={k()} {...linkProps(url)} title={url}>[imagen: {m[3] || "sin descripción"} — no se carga]</a>
        : <span key={k()}>[imagen: {m[3]}]</span>);
    } else if (m[5]) {
      const url = m[7];
      out.push(isSafeUrl(url)
        ? <a key={k()} {...linkProps(url)} title={url}>{inline(m[6])}</a>
        : <span key={k()} className="unsafe-link" title="Enlace bloqueado: esquema no permitido">{m[6]} [enlace bloqueado]</span>);
    } else if (m[8]) {
      const url = m[9];
      out.push(<a key={k()} {...linkProps(url)}>{url}</a>);
    } else if (m[10]) out.push(<strong key={k()}>{inline(m[11] ?? m[12])}</strong>);
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

export function renderMarkdown(src: string): ReactNode[] {
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
      const level = Math.min(h[1].length + 1, 6);
      const Tag = ("h" + level) as any;
      out.push(<Tag key={k()}>{inline(h[2])}</Tag>);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push(<hr key={k()} />); i++; continue; }
    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) body.push(cells(lines[i++]));
      out.push(
        <div className="md-table" key={k()}><table>
          <thead><tr>{head.map((c) => <th key={k()}>{inline(c)}</th>)}</tr></thead>
          <tbody>{body.map((r) => <tr key={k()}>{r.map((c) => <td key={k()}>{inline(c)}</td>)}</tr>)}</tbody>
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
      const ordered = /^\s*\d/.test(line);
      const items: ReactNode[] = [];
      while (i < lines.length && LIST_RE.test(lines[i])) {
        const m = LIST_RE.exec(lines[i])!;
        const indent = m[1].length;
        let text = m[3];
        const task = /^\[([ xX])\]\s+(.*)$/.exec(text);
        const content = task
          ? <><span aria-label={task[1].trim() ? "completado" : "pendiente"}>{task[1].trim() ? "☑" : "☐"}</span> {inline(task[2])}</>
          : inline(text);
        items.push(<li key={k()} style={indent ? { marginLeft: `${Math.min(indent, 12) * 0.6}em` } : undefined}>{content}</li>);
        i++;
      }
      out.push(ordered ? <ol key={k()}>{items}</ol> : <ul key={k()}>{items}</ul>);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*>)/.test(lines[i]) && !LIST_RE.test(lines[i])
      && !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
      buf.push(lines[i++]);
    }
    if (!buf.length) { buf.push(lines[i++]); }
    out.push(<p key={k()}>{buf.flatMap((b, j) => (j ? [<br key={k()} />, ...inline(b)] : inline(b)))}</p>);
  }
  return out;
}

export function Markdown({ text }: { text: string }) {
  return <div className="markdown">{renderMarkdown(text)}</div>;
}
