// Markdown editing helpers (0.5): pure functions over (text, selection) used by the note and description editor.
// Each returns an Edit: the range [from, to) of the original text replaced by `insert`, and the new selection.
// Keeping edits as ranges lets the editor apply them with execCommand("insertText"), so Ctrl+Z keeps working.

export interface Sel { value: string; start: number; end: number }
export interface Edit { from: number; to: number; insert: string; selStart: number; selEnd: number }

export const TAB = "\t";
const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])(\s+)(\[[ xX]\]\s+)?/;

/** Apply an edit to a text (used by the fallback path and by the tests). */
export function applyEdit(value: string, e: Edit): Sel {
  return { value: value.slice(0, e.from) + e.insert + value.slice(e.to), start: e.selStart, end: e.selEnd };
}

function lineStart(v: string, i: number): number { return v.lastIndexOf("\n", i - 1) + 1; }
function lineEnd(v: string, i: number): number { const n = v.indexOf("\n", i); return n === -1 ? v.length : n; }

/** Lines touched by the selection (a selection ending at the start of a line does not include that line). */
function lineBlock(s: Sel): { from: number; to: number; lines: string[] } {
  const from = lineStart(s.value, s.start);
  const endPos = s.end > s.start && s.value[s.end - 1] === "\n" ? s.end - 1 : s.end;
  const to = lineEnd(s.value, endPos);
  return { from, to, lines: s.value.slice(from, to).split("\n") };
}

/** Tab / Shift+Tab. Tab inserts a tab at the cursor; on a list item or a multi-line selection it indents the whole lines.
 * Shift+Tab removes one level (a tab or up to 4 spaces) from the touched lines. */
export function indent(s: Sel, outdent: boolean): Edit {
  const multi = s.value.slice(s.start, s.end).includes("\n");
  const ls = lineStart(s.value, s.start);
  const curLine = s.value.slice(ls, lineEnd(s.value, s.start));
  if (!multi && !outdent && !LIST_ITEM.test(curLine)) {
    return { from: s.start, to: s.end, insert: TAB, selStart: s.start + 1, selEnd: s.start + 1 };
  }
  const b = lineBlock(s);
  let firstDelta = 0, total = 0;
  const lines = b.lines.map((l, i) => {
    let nl: string;
    if (outdent) {
      const m = /^(\t| {1,4})/.exec(l);
      nl = m ? l.slice(m[0].length) : l;
    } else nl = TAB + l;
    const d = nl.length - l.length;
    if (i === 0) firstDelta = d;
    total += d;
    return nl;
  });
  const insert = lines.join("\n");
  const selStart = Math.max(b.from, s.start + firstDelta);
  const selEnd = multi ? s.end + total : Math.max(b.from, s.end + firstDelta);
  return { from: b.from, to: b.to, insert, selStart, selEnd };
}

/** Enter inside a list item: continue the bullet/number/checkbox; on an empty item, end the list. Null = default Enter. */
export function continueList(s: Sel): Edit | null {
  if (s.start !== s.end) return null;
  const ls = lineStart(s.value, s.start);
  const line = s.value.slice(ls, lineEnd(s.value, s.start));
  const m = LIST_ITEM.exec(line);
  if (!m || s.start < ls + m[0].length) return null;
  if (!line.slice(m[0].length).trim()) {  // empty item → remove the marker and leave the list
    return { from: ls, to: ls + line.length, insert: "", selStart: ls, selEnd: ls };
  }
  const num = /^(\d+)([.)])$/.exec(m[2]);
  const marker = num ? `${Number(num[1]) + 1}${num[2]}` : m[2];
  const insert = "\n" + m[1] + marker + m[3] + (m[4] ? "[ ] " : "");
  return { from: s.start, to: s.end, insert, selStart: s.start + insert.length, selEnd: s.start + insert.length };
}

/** Wrap the selection with a marker (**, *, ~~, `). Without selection, inserts the pair and places the cursor inside. */
export function wrap(s: Sel, marker: string, placeholder = ""): Edit {
  const sel = s.value.slice(s.start, s.end) || placeholder;
  const already = s.value.slice(s.start - marker.length, s.start) === marker && s.value.slice(s.end, s.end + marker.length) === marker;
  if (already && s.start !== s.end) {  // toggle off
    return { from: s.start - marker.length, to: s.end + marker.length, insert: sel, selStart: s.start - marker.length, selEnd: s.end - marker.length };
  }
  const insert = marker + sel + marker;
  return { from: s.start, to: s.end, insert, selStart: s.start + marker.length, selEnd: s.start + marker.length + sel.length };
}

/** [text](url): with a selection, it becomes the text and «url» is selected to be typed. */
export function insertLink(s: Sel): Edit {
  const text = s.value.slice(s.start, s.end);
  const isUrl = /^(https?:|mailto:|file:)/i.test(text);
  const label = isUrl ? "" : text;
  const url = isUrl ? text : "https://";
  const insert = `[${label}](${url})`;
  if (!label) return { from: s.start, to: s.end, insert, selStart: s.start + 1, selEnd: s.start + 1 };
  const us = s.start + label.length + 3;
  return { from: s.start, to: s.end, insert, selStart: us, selEnd: us + url.length };
}

/** Toggle a line prefix on every selected line («# », «> », «- », «1. », «- [ ] »). Headings replace each other. */
export function toggleLinePrefix(s: Sel, prefix: string): Edit {
  const b = lineBlock(s);
  const isHeading = /^#+ $/.test(prefix);
  const strip = (l: string) => isHeading ? l.replace(/^#{1,6} /, "") : l.replace(/^(\s*)([-*+] \[[ xX]\] |[-*+] |\d+[.)] |> )/, "$1");
  const all = b.lines.every((l) => l.startsWith(prefix) || (prefix === "1. " && /^\d+[.)] /.test(l)));
  let n = 0;
  const lines = b.lines.map((l) => {
    if (all) return strip(l);
    if (!l.trim() && b.lines.length > 1) return l;
    n++;
    const base = strip(l);
    const lead = /^\s*/.exec(base)![0];
    const p = prefix === "1. " ? `${n}. ` : prefix;
    return isHeading ? p + base : lead + p + base.slice(lead.length);
  });
  const insert = lines.join("\n");
  return { from: b.from, to: b.to, insert, selStart: b.from + insert.length, selEnd: b.from + insert.length };
}

/** Insert a block (code block, table, separator) on its own lines. `cursor` = offset inside the block for the caret. */
export function insertBlock(s: Sel, block: string, cursor: number): Edit {
  const before = s.value.slice(0, s.start);
  const pre = before && !before.endsWith("\n") ? "\n" : "";
  const after = s.value.slice(s.end);
  const post = after && !after.startsWith("\n") ? "\n" : "";
  const insert = pre + block + post;
  const pos = s.start + pre.length + cursor;
  return { from: s.start, to: s.end, insert, selStart: pos, selEnd: pos };
}

export const TABLE_TEMPLATE = "| Columna | Columna |\n| --- | --- |\n|  |  |";

/** Code block around the selection (or empty, with the caret inside). */
export function codeBlock(s: Sel): Edit {
  const sel = s.value.slice(s.start, s.end);
  return insertBlock(s, "```\n" + sel + "\n```", 4 + sel.length);
}

/** Check / uncheck the task list item on line `index` (0-based). Returns the new text, or null if it is not a checkbox. */
export function toggleCheckbox(text: string, index: number): string | null {
  const lines = text.split("\n");
  const l = lines[index];
  if (l === undefined) return null;
  const m = /^(\s*(?:[-*+]|\d+[.)])\s+)\[([ xX])\]/.exec(l);
  if (!m) return null;
  lines[index] = m[1] + (m[2].trim() ? "[ ]" : "[x]") + l.slice(m[0].length);
  return lines.join("\n");
}
