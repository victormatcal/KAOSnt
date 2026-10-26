// Rendering without a browser (React on the server) with real API responses over fictitious data.
// It does not run effects or interaction and does not measure the layout (overflows): that needs a browser.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, AppCtx, Ctx } from "../src/lib/store";
import { App } from "../src/App";
import { TodayView } from "../src/views/Today";
import { WorkView } from "../src/views/Work";
import { ProjectDetail, ProjectsView } from "../src/views/Projects";
import { TeamView } from "../src/views/Team";
import { NotesView } from "../src/views/Notes";
import { SettingsView } from "../src/views/Settings";
import { Markdown } from "../src/lib/markdown";
import { Board, Calendar, TaskTable, WeekAvailabilityStrip } from "../src/components/TaskViews";
import { TaskCard } from "../src/components/TaskCard";
import { AccItem, TagPicker } from "../src/components/ui";
import { setLang } from "../src/lib/i18n";
import { todayIn, weekStart } from "../src/lib/dates";
import type { Bootstrap, Task } from "../src/lib/types";

const fx: Record<string, any> = JSON.parse(readFileSync(__dirname + "/../../tests/fixtures/demo-api.json", "utf8"));
for (const [k, v] of Object.entries(fx)) apiCache.set(k, v);
const boot: Bootstrap = fx["/api/bootstrap"];
// The fixture is generated for a fixed week (fx.__week__). Components that ask for the *current* week get the same
// data moved to the current week, so the result does not depend on the day the tests run.
{
  const shift = (iso: string, days: number) => new Date(Date.parse(iso + "T12:00:00Z") + days * 86400000).toISOString().slice(0, 10);
  const realWs = weekStart(todayIn(boot.settings.timezone));
  const diff = Math.round((Date.parse(realWs) - Date.parse(fx.__week__)) / 86400000);
  const src = fx[`/api/calendar-context?start=${fx.__week__}&end=${shift(fx.__week__, 6)}`];
  if (diff && src) apiCache.set(`/api/calendar-context?start=${realWs}&end=${shift(realWs, 6)}`,
    { ...src, days: Object.fromEntries(Object.entries(src.days).map(([d, v]) => [shift(d, diff), v])) });
}
const ctx: AppCtx = {
  boot, tz: boot.settings.timezone, meId: boot.me_id,
  person: (id) => boot.people.find((p) => p.id === id), project: (id) => boot.projects.find((p) => p.id === id),
  reloadBoot: async () => undefined, dataVersion: 0, changed: () => undefined, openTask: () => undefined,
  quickTask: () => undefined, newNote: async () => undefined, navigate: () => undefined, toast: () => undefined,
  undoable: () => undefined, openReminders: () => undefined,
};
const render = (el: any) => renderToStaticMarkup(<Ctx.Provider value={ctx}>{el}</Ctx.Provider>);
const FORBIDDEN = /ocioso|improductiv|horas trabajadas|productividad/i;
const tasks: Task[] = fx["/api/tasks"];

test("App: KAOSnt name linked to the start screen, visible shortcuts, English by default", () => {
  assert.equal(boot.settings.language, "en");
  const html = renderToStaticMarkup(<App initialBoot={boot} />);
  assert.match(html, /<a class="brand" href="#\/hoy"[^>]*>KAOSnt<\/a>/);
  for (const s of ["Today", "Projects", "Work", "Team", "Notes", "Alt+T", "Alt+N", "Ctrl+K", "Settings", "DEMO"]) assert.ok(html.includes(s), s);
  assert.doesNotMatch(html, /Centro de trabajo|Configuración/);
  setLang("es"); // the rest of this file checks the Spanish interface
});

test("Today: sections, no repeated cards and team as a compact list with holidays/absences", () => {
  const html = render(<TodayView />);
  for (const s of ["Vence hoy y esta semana", "Revisiones y recordatorios", "Bloqueos externos", "Tareas que dependen de mí", "Resumen operativo del equipo"]) assert.ok(html.includes(s), s);
  const ids = [...html.matchAll(/data-task-id="(\d+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(html.includes('class="plain team-list"') && !/sec-eq[\s\S]*<table/.test(html), "no wide table in the team summary");
  assert.ok(html.includes("Ausencia") && html.includes("Festivo"));
  assert.doesNotMatch(html, FORBIDDEN);
});

test("Work: Kanban by default, Archived reachable, availability strip and no duplicates", () => {
  const html = render(<WorkView />);
  assert.ok(html.includes("Columna Pendiente") && !html.includes("Columna Backlog") && !html.includes("Columna Hecha"));
  assert.ok(html.includes("Archivadas") && html.includes("Recurrentes"));
  const board = render(<Board tasks={tasks} showBacklog={false} showDone={false} />);
  const ids = [...board.matchAll(/data-task-id="(\d+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((render(<TaskTable tasks={tasks} />).match(/<tr>/g) || []).length, tasks.length + 1);
  const strip = render(<WeekAvailabilityStrip />);
  assert.ok(strip.includes("No disponibles esta semana"), "holidays/absences of the week");
});

test("Calendar: shows holidays and absences discreetly", () => {
  const cal = render(<Calendar tasks={tasks} mode="week" anchor={fx.__week__} setAnchor={() => undefined} setMode={() => undefined} />);
  assert.ok(cal.includes("cal-ctx"));
  assert.ok(/Festivo Oficina Centro/.test(cal) || /Festivo/.test(cal));
  assert.ok(cal.includes("Ausente: Ana"));
});

test("Subtask card names its parent task (no #id)", () => {
  const sub = tasks.find((t) => t.parent_id)!;
  const html = render(<TaskCard task={sub} />);
  assert.ok(html.includes(`Subtarea de «${sub.parent_title}»`));
  const parent = tasks.find((t) => t.subtasks_total > 0)!;
  assert.ok(render(<TaskCard task={parent} />).includes("subtareas"));
  const withSteps = fx["/api/tasks/1"];
  assert.ok(render(<TaskCard task={withSteps} />).includes("0/2 pasos"));
});

test("Accordion: only one section open", () => {
  const html = render(<>
    <AccItem id="a" title="A" open="a" setOpen={() => undefined}><p>contenido A</p></AccItem>
    <AccItem id="b" title="B" open="a" setOpen={() => undefined}><p>contenido B</p></AccItem>
  </>);
  assert.ok(html.includes("contenido A") && !html.includes("contenido B"));
});

test("Tags: chip picker (not comma-separated text)", () => {
  const html = render(<TagPicker value={["cliente"]} onChange={() => undefined} />);
  assert.ok(html.includes("#cliente") && html.includes("Quitar etiqueta cliente"));
});

test("Projects: status explanation visible in the list; detail with editable client and allocation", () => {
  const list = render(<ProjectsView />);
  assert.ok(list.includes("Pendiente de accesos del cliente") && list.includes("Clientes"));
  const html = render(<ProjectDetail id={1} />);
  for (const s of ["Dónde lo dejamos", "Siguiente acción", "Señales objetivas", "aria-label=\"Cliente\"", "Personas y dedicación", "≈ 20 h/sem"]) assert.ok(html.includes(s), s);
  assert.ok(/<textarea[^>]*aria-label="Siguiente acción"/.test(html), "next action in a text area");
  assert.ok(/<textarea[^>]*aria-label="Explicación del estado general"/.test(html));
  assert.doesNotMatch(html, /\d+ ?% de avance/);
});

test("Team: office, allocation and availability without performance judgements", () => {
  const html = render(<TeamView personId={2} />);
  assert.ok(html.includes("Oficina:") && html.includes("Ausencias y festivos registrados"));
  assert.doesNotMatch(html, FORBIDDEN);
});

test("Notes and Settings: manageable offices/holidays and tags", () => {
  const n = render(<NotesView />);
  assert.ok(n.includes("Sin clasificar") && n.includes("Papelera"));
  // 0.5: one Settings section at a time (side index)
  const s = ["holidays", "tags", "backups", "system"].map((sec) => render(<SettingsView initialSection={sec as any} />)).join("");
  for (const x of ["Oficinas y festivos", "Oficina Norte (ficticia)", "Añadir festivo", "Etiquetas", "Renombrar", "no protegen ante pérdida", "Cerrar aplicación"]) assert.ok(s.includes(x), x);
  assert.doesNotMatch(s, /uno por línea/);
});

test("Safe Markdown: no executable HTML, no downloads, dangerous links blocked", () => {
  const src = ["# Título", "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "[malo](javascript:alert(1))",
    "[bueno](https://example.com)", "![foto](https://example.com/a.png)", "| a | b |", "|---|---|", "| 1 | 2 |",
    "```", "<b>code</b>", "```", "- [x] hecho", "**negrita** y _cursiva_"].join("\n");
  const html = renderToStaticMarkup(<Markdown text={src} />);
  assert.doesNotMatch(html, /<script|<img|<iframe|href="javascript/i);
  for (const tag of html.match(/<[^>]+>/g) || []) assert.doesNotMatch(tag, /\son\w+=/i, tag);
  assert.ok(html.includes("no se carga") && html.includes("<table>") && html.includes("<strong>negrita</strong>") && html.includes("enlace bloqueado"));
});
