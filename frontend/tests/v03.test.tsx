// 0.3 tests: configurable dates, language, themes, recurring series and notes.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, AppCtx, Ctx } from "../src/lib/store";
import { formatIso, monthGrid, parseDateText, parseTimeText, setDateConfig, viewWeekStart, weekHeaders, weekStart, fmtDate } from "../src/lib/dates";
import { setLang, t, translateServer } from "../src/lib/i18n";
import { EN } from "../src/i18n/en";
import { BUILTIN_THEMES, contrastIssues, resolveAppearance, themeTemplate, validateTheme } from "../src/lib/theme";
import { groupSeries } from "../src/lib/series";
import { describeSchedule, STATUS } from "../src/lib/labels";
import { notesQuery, reorderTabs } from "../src/views/Notes";
import { Board } from "../src/components/TaskViews";
import { DateInput } from "../src/components/DateInput";
import { TodayView } from "../src/views/Today";
import { SettingsView } from "../src/views/Settings";
import type { Bootstrap, Task } from "../src/lib/types";

setLang("es"); // these tests check the Spanish interface (English is the default since 0.4)

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
const reset = () => { setLang("es"); setDateConfig("dd/mm/aaaa", 1); };

test("dates: configurable formats and validation (internally YYYY-MM-DD)", () => {
  reset();
  assert.equal(formatIso("2026-10-12"), "12/10/2026");
  assert.equal(formatIso("2026-10-12", "mm/dd/aaaa"), "10/12/2026");
  assert.equal(parseDateText("12/10/2026"), "2026-10-12");
  assert.equal(parseDateText("1/2/2027"), "2027-02-01");
  assert.equal(parseDateText("2026-10-12"), "2026-10-12");
  assert.equal(parseDateText("31/02/2026"), null);
  assert.equal(parseDateText("10/12/2026", "mm/dd/aaaa"), "2026-10-12");
  assert.equal(parseTimeText("9:05"), "09:05");
  assert.equal(parseTimeText("24:00"), null);
  assert.equal(fmtDate("2026-10-12"), "12/10/2026");
  setDateConfig("aaaa-mm-dd", 7);
  assert.equal(fmtDate("2026-10-12"), "2026-10-12");
  assert.equal(viewWeekStart("2026-10-14"), "2026-10-11"); // domingo
  assert.equal(weekStart("2026-10-14"), "2026-10-12"); // planning: always Monday
  assert.equal(monthGrid("2026-10-15")[0], "2026-09-27");
  assert.equal(weekHeaders()[0], "dom");
  reset();
  assert.equal(weekHeaders()[0], "lun");
});

test("DateInput: text in the configured format, no native input type=date", () => {
  reset();
  const html = render(<DateInput label="Fecha límite" value="2026-10-12" onChange={() => undefined} />);
  assert.ok(html.includes('value="12/10/2026"') && html.includes('placeholder="dd/mm/aaaa"'));
  for (const f of ["components", "views"]) for (const n of readdirSync(__dirname + `/../../src/${f}`)) {
    const src = readFileSync(__dirname + `/../../src/${f}/${n}`, "utf8");
    assert.doesNotMatch(src, /type="(date|time|datetime-local)"/, n);
  }
});

test("i18n: English with Spanish as the key; without a translation the Spanish text is shown", () => {
  setLang("en");
  assert.equal(t("Hoy"), "Today");
  assert.equal(t("Tarea creada: {titulo}", { titulo: "Informe" }), "Task created: Informe");
  assert.equal(t("Texto que no existe"), "Texto que no existe");
  assert.equal(STATUS.en_curso, "In progress");
  assert.equal(translateServer("Vence el 2026-10-12"), "Due on 2026-10-12");
  assert.equal(translateServer("Texto del usuario"), "Texto del usuario");
  const html = render(<TodayView />);
  assert.ok(html.includes("Today") && html.includes("External blockers") && !html.includes("Bloqueos externos"));
  setLang("es");
  assert.equal(STATUS.en_curso, "En curso");
  assert.ok(Object.keys(EN).length > 500);
  reset();
});

test("themes: valid built-ins, contrast ≥ 4.5:1, free-CSS validation and template", () => {
  assert.deepEqual(BUILTIN_THEMES.map((x) => x.id), ["predeterminado", "minimalista", "cupertino", "retro", "alto-contraste"]);
  for (const th of BUILTIN_THEMES) {
    assert.equal(validateTheme(th), "", th.id);
    for (const mode of ["light", "dark"] as const) assert.deepEqual(contrastIssues(resolveAppearance(th, mode).vars), [], `${th.id} ${mode}`);
  }
  const base = { format: "kaosnt-theme", version: 1, id: "x", name: "X", light: {}, dark: {} };
  assert.notEqual(validateTheme({ ...base, light: { bg: "url(http://x)" } }), "");
  assert.notEqual(validateTheme({ ...base, light: { bg: "red;}" } }), "");
  assert.notEqual(validateTheme({ ...base, font: "Comic Sans" }), "");
  assert.notEqual(validateTheme({ ...base, css: "body{}" }), "");
  assert.equal(validateTheme({ ...base, light: { accent: "hsl(210, 60%, 40%)" } }), "");
  const tpl = themeTemplate(BUILTIN_THEMES[3]);
  assert.equal(validateTheme(tpl), "");
  assert.equal(Object.keys(tpl.dark).length, 23);
  // the generated copy matches themes/*.json
  for (const th of BUILTIN_THEMES) assert.deepEqual(JSON.parse(readFileSync(__dirname + `/../../../themes/${th.id}.json`, "utf8")), th);
});

test("recurring series: one card per series and status with «↻ +N»; expandable", () => {
  const mk = (id: number, status: any, occ: string, rid: number | null = 7): Task => ({ ...fx["/api/tasks"][0], id, status, recurrence_id: rid, occurrence_date: occ, parent_id: null });
  const list = [mk(1, "pendiente", "2026-10-14"), mk(2, "pendiente", "2026-10-13"), mk(3, "pendiente", "2026-10-15"),
    mk(4, "hecha", "2026-10-10"), mk(5, "hecha", "2026-10-11"), mk(6, "pendiente", "", null)];
  const g = groupSeries(list);
  assert.deepEqual(g.map((x) => [x.id, x.series_more ?? null]), [[2, 2], [5, 1], [6, null]]);
  assert.equal(groupSeries(list, new Set([7])).length, 6);
  const html = render(<Board tasks={list} showBacklog={false} showDone groupRecurring />);
  assert.ok(html.includes("↻ +2") && html.includes("Archivar todas"));
});

test("notes: text/project filters and tab reordering by drag", () => {
  assert.equal(notesQuery({ scope: "todas", kind: "", tag: "", project: "none", q: " alfa ", field: "titulo" }), "/api/notes?scope=todas&project_id=none&q=alfa&in=titulo");
  assert.deepEqual(reorderTabs([1, 2, 3, 4], 1, 3), [2, 3, 1, 4]);
  assert.deepEqual(reorderTabs([1, 2, 3, 4], 4, 2), [1, 4, 2, 3]);
  assert.deepEqual(reorderTabs([1, 2], 1, 9), [1, 2]);
});

test("schedule per day: «Working» text and Settings with appearance, danger zone and language", () => {
  reset();
  const sch = { "1": { start: "09:00", end: "19:00" }, "2": { start: "09:00", end: "19:00" }, "3": { start: "09:00", end: "19:00" },
    "4": { start: "09:00", end: "19:00" }, "5": { start: "09:00", end: "15:00" }, "6": null, "7": null };
  assert.equal(describeSchedule(sch), "L–J 09:00–19:00 · V 09:00–15:00");
  const html = render(<SettingsView />);
  for (const s of ["Aspecto", "Según el sistema", "Descargar plantilla del tema actual", "Zona de peligro", "Idioma de la interfaz", "Importar festivos en bloque", "Horario laboral"]) assert.ok(html.includes(s), s);
  assert.doesNotMatch(html, / style="[^"]*(url|@import)/);
});
