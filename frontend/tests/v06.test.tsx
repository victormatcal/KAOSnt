// 0.6 tests: compact Work filter bar with active-filter chips, notes filter pop-up and collapsible side panel,
// and the Markdown «Live» mode (source-line anchors, scroll mapping, click to jump, rendering).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, AppCtx, Ctx } from "../src/lib/store";
import { setLang } from "../src/lib/i18n";
import { blockForLine, lineOfOffset, lineToOffset, Markdown, offsetOfLine, offsetToLine } from "../src/lib/markdown";
import { readViewState } from "../src/lib/viewstate";
import { ActiveFilters, fitChips, MultiSelect } from "../src/components/ui";
import { FilterBar, filterChips } from "../src/components/TaskViews";
import { asEditorMode, MarkdownEditor } from "../src/components/MarkdownEditor";
import { activeNoteFilters, NotesView } from "../src/views/Notes";
import type { Bootstrap, Filters } from "../src/lib/types";

setLang("es"); // these tests check the Spanish texts
const fx: Record<string, any> = JSON.parse(readFileSync(__dirname + "/../../tests/fixtures/demo-api.json", "utf8"));
for (const [k, v] of Object.entries(fx)) apiCache.set(k, v);
const boot: Bootstrap = fx["/api/bootstrap"];
const ctx: AppCtx = {
  boot, tz: boot.settings.timezone, meId: boot.me_id,
  person: (id) => boot.people.find((p) => p.id === id), project: (id) => boot.projects.find((p) => p.id === id),
  reloadBoot: async () => undefined, dataVersion: 0, changed: () => undefined, openTask: () => undefined,
  quickTask: () => undefined, newNote: async () => undefined, navigate: () => undefined, toast: () => undefined,
  undoable: () => undefined, openReminders: () => undefined,
};
const render = (el: any) => renderToStaticMarkup(<Ctx.Provider value={ctx}>{el}</Ctx.Provider>);
const css = readFileSync(__dirname + "/../../src/styles.css", "utf8");

// ---------------- 2) Work: compact filter bar ----------------
test("filter bar: controls never contain chips; active filters are one row of removable chips", () => {
  const people = boot.people.slice(0, 3).map((p) => String(p.id)).join(",");
  const html = render(<FilterBar filters={{ person_id: people, include_backlog: true }} setFilters={() => undefined} onReset={() => undefined} />);
  const [bar, row] = html.split('class="active-filters"');
  assert.ok(row, "the active-filters row is shown");
  assert.doesNotMatch(bar, /tagchip/, "no chips inside the filter controls");
  assert.ok(bar.includes("3 seleccionados"));
  for (const p of boot.people.slice(0, 3)) assert.ok(row.includes(`Persona:</span> ${p.name}`), p.name);
  assert.ok(row.includes("Incluir:</span> Backlog") && row.includes("Restablecer filtros"));
  assert.ok(!render(<FilterBar filters={{}} setFilters={() => undefined} />).includes("active-filters"), "no row without filters");
  assert.match(css, /\.filters \.multiselect, \.filters \.filter-inline \{ height: 3\.1em;/);
  assert.match(css, /\.af-chips \{ display: flex; flex-wrap: nowrap;[^}]*overflow: hidden;/);
});

test("removing a chip removes only that value", () => {
  let out: Filters = {};
  const chips = filterChips(ctx as any, { person_id: "1,2,none", tag: "x", include_closed: true }, (f) => { out = f; });
  assert.deepEqual(chips.map((c) => c.key), ["person_id:1", "person_id:2", "person_id:none", "tag:x", "closed"]);
  chips[1].remove();
  assert.equal(out.person_id, "1,none");
  chips[3].remove();
  assert.equal(out.tag, "");
  chips[4].remove();
  assert.equal(out.include_closed, false);
});

test("one line of chips with «+N more»: how many fit", () => {
  assert.equal(fitChips([100, 100, 100], 400, 4), 3);
  assert.equal(fitChips([100, 100, 100], 250, 4), 2);
  assert.equal(fitChips([300], 200, 4), 0);
  assert.equal(fitChips([], 200, 4), 0);
  const chips = [1, 2, 3].map((n) => ({ key: String(n), filter: "Persona", value: "P" + n, remove: () => undefined }));
  const open = render(<ActiveFilters chips={chips} expanded setExpanded={() => undefined} />);
  assert.ok(open.includes("Mostrar menos") && open.includes("af-chips expanded"));
  assert.equal(render(<ActiveFilters chips={[]} expanded={false} setExpanded={() => undefined} />), "");
});

// ---------------- 1) Notes: pop-up and collapsible panel ----------------
test("multi-select pop-up: one option per line, styles of the notes panel do not reach the check boxes", () => {
  assert.match(css, /\.note-filters > select, \.note-search \{ width: 100%; \}/);
  assert.doesNotMatch(css, /\.note-filters input[ ,{]/, "no rule for every input inside the note filters");
  assert.doesNotMatch(css, /\.notes-side select \{ flex: 1 1 8em; \}/, "the select is not stretched vertically");
  assert.match(css, /\.ms-option input\[type="checkbox"\] \{ width: auto; flex: none;/);
  assert.match(css, /\.ms-option span \{ min-width: 0; overflow-wrap: break-word; word-break: normal; \}/);
  const html = render(<MultiSelect label="Proyecto" options={[{ value: "1", label: "Desarrollo KAOSnt" }]} value="" onChange={() => undefined} />);
  assert.ok(html.includes("Todos") && !html.includes("tagchip"));
});

test("notes side panel: Alt+B hide button, folding filters with active count", () => {
  const html = render(<NotesView />);
  assert.ok(html.includes("Ocultar el panel de notas (Alt+B)") && html.includes('aria-controls="note-filters"'));
  assert.ok(html.includes("Buscar texto"), "the text search stays visible");
  assert.equal(activeNoteFilters({ project: "1,2", client: "", kind: "acta", tag: "", field: "todo" }), 2);
  assert.equal(activeNoteFilters({ project: "", client: "", kind: "", tag: "", field: "titulo" }), 1);
  const store: Record<string, string> = { "kaosnt-vista:notes.sideHidden": "true", "kaosnt-vista:notes.filtersOpen": "false" };
  (globalThis as any).sessionStorage = { getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = v; } };
  try {
    assert.equal(readViewState("notes.sideHidden", false), true);
    const hidden = render(<NotesView />);
    assert.ok(hidden.includes("side-hidden") && hidden.includes("Mostrar el panel de notas (Alt+B)"));
    assert.ok(!hidden.includes("Buscar texto"), "the panel content is not rendered while hidden");
    store["kaosnt-vista:notes.sideHidden"] = "false";
    const folded = render(<NotesView />);
    assert.ok(folded.includes('aria-expanded="false"') && !folded.includes('id="note-filters"'));
  } finally { delete (globalThis as any).sessionStorage; }
});

// ---------------- 3) Live mode ----------------
test("renderer: every block carries its source line", () => {
  const src = "# Título\n\ntexto\nmás\n\n- a\n\t- b\n\n```\ncode\n```\n\n| x | y |\n|---|---|\n| 1 | 2 |\n\n> cita\n> - item\n\n---";
  const html = renderToStaticMarkup(<Markdown text={src} />);
  for (const [tag, line] of [["h2", 0], ["p", 2], ["ul", 5], ["li", 6], ["pre", 8], ["div", 12], ["blockquote", 16], ["hr", 19]] as const)
    assert.match(html, new RegExp(`<${tag}[^>]*data-line="${line}"`), `${tag} → ${line}`);
  assert.match(html, /<blockquote[^>]*><p data-line="16">cita<\/p><ul data-line="17">/, "nested blocks keep absolute lines");
});

test("scroll mapping between editor lines and preview positions", () => {
  const anchors = [{ line: 0, top: 0 }, { line: 10, top: 200 }, { line: 20, top: 600 }];
  assert.equal(lineToOffset(anchors, 0, 1000, 30), 0);
  assert.equal(lineToOffset(anchors, 5, 1000, 30), 100);
  assert.equal(lineToOffset(anchors, 15, 1000, 30), 400);
  assert.equal(lineToOffset(anchors, 25, 1000, 30), 800); // after the last block: up to the end
  for (const l of [0, 3, 12.5, 24]) assert.ok(Math.abs(offsetToLine(anchors, lineToOffset(anchors, l, 1000, 30), 1000, 30) - l) < 1e-9, String(l));
  assert.equal(lineToOffset([], 5, 1000, 30), 0);
  assert.equal(blockForLine([0, 2, 5, 8], 6), 5);
  assert.equal(blockForLine([3], 1), null);
  const text = "a\nbb\nccc";
  assert.equal(lineOfOffset(text, 0), 0);
  assert.equal(lineOfOffset(text, 4), 1);
  assert.equal(offsetOfLine(text, 2), 5);
  assert.equal(offsetOfLine(text, 9), text.length);
});

test("Live mode: editor and result together, toolbar and sync switch; no executable HTML", () => {
  const html = render(<MarkdownEditor value={"# T\n- [ ] x\n<script>alert(1)</script>"} onChange={() => undefined} mode="live" onModeChange={() => undefined} label="Contenido" />);
  assert.match(html, /class="md-live"/);
  assert.match(html, /<textarea[^>]*md-live-text/);
  assert.match(html, /class="md-live-preview"[^>]*>.*<h2 data-line="0">T<\/h2>/s);
  for (const x of ["Editar", "Live", "Vista previa", "Negrita (Ctrl+B)", "Sincronizar desplazamiento", "Haz clic en un bloque"]) assert.ok(html.includes(x), x);
  assert.match(html, /type="checkbox"/);
  assert.doesNotMatch(html, /<script/);
  const compact = render(<MarkdownEditor compact value="x" onChange={() => undefined} mode="live" onModeChange={() => undefined} label="Descripción" />);
  assert.match(compact, /class="md-live compact"/);
  assert.equal(asEditorMode("live"), "live");
  assert.equal(asEditorMode("otro"), "editar");
  assert.match(css, /\.md-live \{ display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\);/);
  assert.match(css, /\.note-panes\.two \.md-live \{ grid-template-columns: minmax\(0, 1fr\); \}/);
});
