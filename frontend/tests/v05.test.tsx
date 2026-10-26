// 0.5 tests: Markdown editor, nested/aligned Markdown, subtask folding, Kanban groups, multiple-choice filters,
// screen state, scope dialog, focus from the search and the Settings layout.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, AppCtx, Ctx } from "../src/lib/store";
import { setLang } from "../src/lib/i18n";
import { applyEdit, continueList, indent, insertLink, toggleCheckbox, toggleLinePrefix, wrap } from "../src/lib/mdedit";
import { Markdown } from "../src/lib/markdown";
import { foldSubtasks } from "../src/lib/subtasks";
import { readViewState, writeViewState } from "../src/lib/viewstate";
import { consumeNoteFocus, requestNoteFocus } from "../src/lib/focus";
import { editForKey, MarkdownEditor } from "../src/components/MarkdownEditor";
import { askScope, needsScope, ScopeDialog } from "../src/components/ScopeDialog";
import { Board, FilterBar, filtersToQuery, groupTargets, TaskTable } from "../src/components/TaskViews";
import { MultiSelect } from "../src/components/ui";
import { SettingsView } from "../src/views/Settings";
import type { Bootstrap, Task } from "../src/lib/types";

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
const sel = (value: string, start: number, end = start) => ({ value, start, end });

// ---------------- Markdown editing ----------------
test("editor: Tab inserts a tab, indents list items and several lines; Shift+Tab outdents", () => {
  assert.equal(applyEdit("ab", indent(sel("ab", 1), false)).value, "a\tb");
  assert.equal(applyEdit("- uno", indent(sel("- uno", 5), false)).value, "\t- uno");
  const two = "a\nb\nc";
  const r = applyEdit(two, indent(sel(two, 0, 3), false));
  assert.equal(r.value, "\ta\n\tb\nc");
  assert.equal(applyEdit(r.value, indent(sel(r.value, 0, r.end), true)).value, two);
  assert.equal(applyEdit("    x", indent(sel("    x", 5), true)).value, "x");
});

test("editor: Enter continues bullets, numbers and checkboxes and ends an empty item", () => {
  assert.equal(applyEdit("- uno", continueList(sel("- uno", 5))!).value, "- uno\n- ");
  assert.equal(applyEdit("  3. tres", continueList(sel("  3. tres", 9))!).value, "  3. tres\n  4. ");
  assert.equal(applyEdit("- [x] hecho", continueList(sel("- [x] hecho", 11))!).value, "- [x] hecho\n- [ ] ");
  assert.equal(applyEdit("a\n- ", continueList(sel("a\n- ", 4))!).value, "a\n");
  assert.equal(continueList(sel("texto", 5)), null);
});

test("editor: wrap, link, line prefixes and checkboxes", () => {
  assert.equal(applyEdit("hola mundo", wrap(sel("hola mundo", 5, 10), "**")).value, "hola **mundo**");
  const off = applyEdit("hola **mundo**", wrap(sel("hola **mundo**", 7, 12), "**"));
  assert.equal(off.value, "hola mundo");
  const l = applyEdit("ver doc", insertLink(sel("ver doc", 4, 7)));
  assert.equal(l.value, "ver [doc](https://)");
  assert.equal(l.value.slice(l.start, l.end), "https://");
  assert.equal(applyEdit("x", insertLink(sel("x", 0, 1))).value, "[x](https://)");
  assert.equal(applyEdit("a\nb", toggleLinePrefix(sel("a\nb", 0, 3), "1. ")).value, "1. a\n2. b");
  assert.equal(applyEdit("## T", toggleLinePrefix(sel("## T", 0), "# ")).value, "# T");
  assert.equal(toggleCheckbox("- [ ] a\n- [x] b", 0), "- [x] a\n- [x] b");
  assert.equal(toggleCheckbox("- [ ] a\n- [x] b", 1), "- [ ] a\n- [ ] b");
  assert.equal(toggleCheckbox("texto", 0), null);
});

test("editor: keyboard shortcuts (Ctrl+K inserts a link inside the editor)", () => {
  const s = sel("abc", 0, 3);
  assert.equal(applyEdit("abc", editForKey({ key: "k", ctrlKey: true }, s)!).value, "[abc](https://)");
  assert.equal(applyEdit("abc", editForKey({ key: "b", ctrlKey: true }, s)!).value, "**abc**");
  assert.equal(applyEdit("abc", editForKey({ key: "I", ctrlKey: true }, s)!).value, "*abc*");
  assert.equal(applyEdit("abc", editForKey({ key: "X", ctrlKey: true, shiftKey: true }, s)!).value, "~~abc~~");
  assert.equal(applyEdit("abc", editForKey({ key: "C", ctrlKey: true, shiftKey: true }, s)!).value, "`abc`");
  assert.equal(editForKey({ key: "k", ctrlKey: true, altKey: true }, s), null); // AltGr
  assert.equal(editForKey({ key: "a" }, s), null);
  const html = render(<MarkdownEditor value="- [ ] x" onChange={() => undefined} mode="editar" onModeChange={() => undefined} label="Contenido" />);
  for (const x of ["Negrita (Ctrl+B)", "Enlace (Ctrl+K)", "Tabla", "Lista numerada", "Vista previa", "Esc y luego Tab"]) assert.ok(html.includes(x), x);
  const pv = render(<MarkdownEditor value="- [ ] x" onChange={() => undefined} mode="vista_previa" onModeChange={() => undefined} label="Contenido" />);
  assert.match(pv, /type="checkbox"/);
  assert.doesNotMatch(pv, /<textarea/);
});

test("renderer: nested lists, table alignment, separator and safe output", () => {
  const html = renderToStaticMarkup(<Markdown text={"- a\n\t- b\n\t\t1. c\n- d\n\n| x | y | z |\n|:---|:---:|---:|\n| 1 | 2 | 3 |\n\n---\n<script>alert(1)</script>"} />);
  assert.match(html, /<ul><li>a<ul><li>b<ol><li>c<\/li><\/ol><\/li><\/ul><\/li><li>d<\/li><\/ul>/);
  assert.match(html, /<th class="al-left">x<\/th><th class="al-center">y<\/th><th class="al-right">z<\/th>/);
  assert.match(html, /<hr\/>/);
  assert.doesNotMatch(html, /<script/);
  // checkboxes are only interactive when the note is editable
  assert.doesNotMatch(renderToStaticMarkup(<Markdown text="- [x] a" />), /<input/);
  assert.match(renderToStaticMarkup(<Markdown text="- [x] a" onToggleTask={() => undefined} />), /<input type="checkbox"[^>]*checked=""/);
});

// ---------------- Subtasks ----------------
const base: Task = fx["/api/tasks"][0];
const mk = (id: number, status: any, parent: number | null, position = id): Task => ({ ...base, id, status, parent_id: parent, position, recurrence_id: null, title: "T" + id });

test("subtasks fold under their parent only in the same column, at several levels", () => {
  const items = [mk(1, "pendiente", null), mk(2, "pendiente", 1), mk(3, "pendiente", 2), mk(4, "en_curso", 1), mk(5, "pendiente", 99)];
  const folded = foldSubtasks(items, new Set());
  assert.deepEqual(folded.map((r) => [r.task.id, r.depth, r.childCount]), [[1, 0, 2], [4, 0, 0], [5, 0, 0]]);
  const open1 = foldSubtasks(items, new Set([1]));
  assert.deepEqual(open1.map((r) => [r.task.id, r.depth]), [[1, 0], [2, 1], [4, 0], [5, 0]]);
  const all = foldSubtasks(items, new Set([1, 2]));
  assert.deepEqual(all.map((r) => [r.task.id, r.depth]), [[1, 0], [2, 1], [3, 2], [4, 0], [5, 0]]);
  // a cycle never hides tasks
  assert.equal(foldSubtasks([mk(7, "pendiente", 8), mk(8, "pendiente", 7)], new Set()).length >= 1, true);
});

test("Kanban: subtask counter, «move to group» control and targets of the task's own project", () => {
  const items = [mk(1, "pendiente", null), mk(2, "pendiente", 1)];
  const html = render(<Board tasks={items} showBacklog={false} showDone={false} groupBy="persona" />);
  assert.ok(html.includes("⊞ +1") && html.includes("Mover a otro grupo"));
  assert.ok(!html.includes(">T2<"), "the subtask is folded");
  const flat = render(<Board tasks={items} showBacklog={false} showDone={false} groupSubtasks={false} />);
  assert.ok(flat.includes(">T2<") && !flat.includes("Mover a otro grupo"));
  const list = render(<TaskTable tasks={items} groupSubtasks />);
  assert.ok(list.includes("⊞ +1") && !list.includes(">T2<"));
  const p1 = boot.projects[0].id;
  const tg = groupTargets("linea", { ...base, project_id: p1 }, boot as any);
  assert.equal(tg[0].value, null);
  const ids = new Set(boot.groupings.filter((g) => g.kind === "linea" && g.project_id === p1).map((g) => g.id));
  assert.ok(tg.slice(1).every((o) => ids.has(o.value as number)) && tg.length === ids.size + 1);
  assert.equal(groupTargets("persona", base, boot as any)[0].label, "Sin asignar");
});

// ---------------- Filters ----------------
test("multiple-choice filters: comma lists, client filter and compatible single values", () => {
  assert.equal(filtersToQuery({ project_id: "1,none", client_id: "2", tag: "a,b" }), "?project_id=1%2Cnone&client_id=2&tag=a%2Cb");
  assert.equal(filtersToQuery({ project_id: "3" }), "?project_id=3"); // saved view from 0.4
  const bar = render(<FilterBar filters={{ project_id: "1,none" }} setFilters={() => undefined} onReset={() => undefined} />);
  for (const x of ["Proyecto", "Cliente", "Persona", "Estado", "Condición", "Etiqueta", "2 seleccionados", "Restablecer filtros"]) assert.ok(bar.includes(x), x);
  const ms = render(<MultiSelect label="Proyecto" options={[{ value: "1", label: "Alfa" }]} value="1" onChange={() => undefined} />);
  assert.ok(ms.includes("Alfa") && ms.includes('aria-expanded="false"'));
});

// ---------------- Screen state ----------------
test("screen state: session storage, corrupt or old values are ignored", () => {
  const store: Record<string, string> = {};
  (globalThis as any).sessionStorage = { getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = v; } };
  try {
    writeViewState("x.filters", { project_id: "1,2" });
    assert.deepEqual(readViewState("x.filters", {}), { project_id: "1,2" });
    store["kaosnt-vista:x.mode"] = "{corrupt";
    assert.equal(readViewState("x.mode", "kanban"), "kanban");
    store["kaosnt-vista:x.list"] = JSON.stringify({ a: 1 });
    assert.deepEqual(readViewState<number[]>("x.list", []), []);
    store["kaosnt-vista:x.flag"] = JSON.stringify("yes");
    assert.equal(readViewState("x.flag", false), false);
  } finally { delete (globalThis as any).sessionStorage; }
  assert.equal(readViewState("x.none", "def"), "def"); // no storage at all
});

// ---------------- Recurring scope ----------------
test("scope dialog: options, cancel and which changes need it", async () => {
  const occ = render(<ScopeDialog kind="occurrence" onChoose={() => undefined} />);
  for (const x of ["Solo esta ocurrencia", "Esta y las posteriores", "Todas las ocurrencias", "incluidas las pasadas, terminadas y canceladas", "Cancelar"]) assert.ok(occ.includes(x), x);
  const ser = render(<ScopeDialog kind="series" onChoose={() => undefined} />);
  for (const x of ["Solo las nuevas ocurrencias", "Desde hoy", "Todas las ocurrencias"]) assert.ok(ser.includes(x), x);
  assert.equal(needsScope({ recurrence_id: 3 }, ["status"]), false);
  assert.equal(needsScope({ recurrence_id: 3 }, ["status", "assignee_id"]), true);
  assert.equal(needsScope({ recurrence_id: null }, ["assignee_id"]), false);
  assert.equal(await askScope("occurrence"), "this"); // without the host (no UI) the safest scope
});

// ---------------- Search → note ----------------
test("search: focus request for a note is consumed once", () => {
  requestNoteFocus(7);
  assert.equal(consumeNoteFocus(8), false);
  assert.equal(consumeNoteFocus(7), true);
  assert.equal(consumeNoteFocus(7), false);
});

// ---------------- Settings ----------------
test("Settings: side index, one section at a time, holidays in their own scroll area", () => {
  const html = render(<SettingsView initialSection="holidays" />);
  for (const x of ["Secciones de configuración", "General", "Aspecto", "Copias y restauración", "Zona de peligro", "Añadir festivo", "Importar festivos en bloque"]) assert.ok(html.includes(x), x);
  assert.match(html, /aria-current="page"[^>]*>Oficinas y festivos/);
  assert.ok(!html.includes("Idioma de la interfaz"), "other sections are not rendered");
  const gen = render(<SettingsView initialSection="general" />);
  assert.ok(gen.includes("Sin cambios pendientes") && gen.includes("Idioma de la interfaz"));
  const css = readFileSync(__dirname + "/../../src/styles.css", "utf8");
  assert.match(css, /\.holiday-list \{ max-height: 420px; overflow-y: auto;/);
});
