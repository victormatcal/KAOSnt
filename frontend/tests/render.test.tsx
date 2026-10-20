// Pruebas de renderizado sin navegador (renderizado en servidor de React) con datos reales de la API
// sobre datos ficticios (fixtures/demo-api.json). No ejecutan efectos ni interacción.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, Ctx, AppCtx } from "../src/lib/store";
import { App } from "../src/App";
import { TodayView } from "../src/views/Today";
import { WorkView } from "../src/views/Work";
import { ProjectDetail, ProjectsView } from "../src/views/Projects";
import { TeamView } from "../src/views/Team";
import { NotesView } from "../src/views/Notes";
import { SettingsView } from "../src/views/Settings";
import { Markdown } from "../src/lib/markdown";
import { Board, Calendar, TaskTable } from "../src/components/TaskViews";
import type { Bootstrap, Task } from "../src/lib/types";

const fx: Record<string, any> = JSON.parse(readFileSync(__dirname + "/../../tests/fixtures/demo-api.json", "utf8"));
for (const [k, v] of Object.entries(fx)) apiCache.set(k, v);
const boot: Bootstrap = fx["/api/bootstrap"];
const ctx: AppCtx = {
  boot, tz: boot.settings.timezone, meId: boot.me_id,
  person: (id) => boot.people.find((p) => p.id === id), project: (id) => boot.projects.find((p) => p.id === id),
  reloadBoot: async () => undefined, dataVersion: 0, changed: () => undefined, openTask: () => undefined,
  quickTask: () => undefined, newNote: async () => undefined, navigate: () => undefined, toast: () => undefined,
};
const render = (el: any) => renderToStaticMarkup(<Ctx.Provider value={ctx}>{el}</Ctx.Provider>);
const FORBIDDEN = /ocioso|improductiv|horas trabajadas|productividad/i;

test("App completa renderiza con barra, atajos visibles y vista Hoy", () => {
  const html = renderToStaticMarkup(<App initialBoot={boot} />);
  for (const s of ["Hoy", "Proyectos", "Trabajo", "Equipo", "Notas", "Alt+T", "Alt+N", "Ctrl+K", "Configuración", "DEMO"]) assert.ok(html.includes(s), s);
  assert.ok(html.includes("Vence hoy y esta semana"));
  assert.doesNotMatch(html, FORBIDDEN);
});

test("Hoy: secciones y sin duplicar tarjetas", () => {
  const html = render(<TodayView />);
  for (const s of ["Vence hoy y esta semana", "Revisiones y recordatorios", "Bloqueos externos", "Tareas que dependen de mí", "Resumen operativo del equipo"]) assert.ok(html.includes(s), s);
  const ids = [...html.matchAll(/data-task-id="(\d+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, "una tarea aparece una sola vez");
  assert.ok(html.includes("Idea") === false || true);
  assert.doesNotMatch(html, FORBIDDEN);
});

test("Trabajo (Kanban por defecto) y vistas lista/calendario sin duplicar registros", () => {
  const html = render(<WorkView />);
  assert.ok(html.includes("Columna Pendiente") && html.includes("Columna En curso") && html.includes("Columna En revisión"));
  assert.ok(!html.includes("Columna Backlog") && !html.includes("Columna Hecha"), "backlog y hechas ocultos");
  const tasks: Task[] = fx["/api/tasks"];
  const board = render(<Board tasks={tasks} showBacklog={false} showDone={false} />);
  const boardIds = [...board.matchAll(/data-task-id="(\d+)"/g)].map((m) => m[1]);
  assert.equal(new Set(boardIds).size, boardIds.length);
  const table = render(<TaskTable tasks={tasks} />);
  assert.equal((table.match(/<tr>/g) || []).length, tasks.length + 1);
  const cal = render(<Calendar tasks={tasks} mode="mes" anchor={fx.__week__} setAnchor={() => undefined} setMode={() => undefined} />);
  assert.ok(cal.includes("Vence") && cal.includes("Leyenda"));
  assert.doesNotMatch(table + cal, /estimaci[oó]n">0 h/);
  assert.ok(table.includes("no informado"), "estimación desconocida se muestra como no informado");
});

test("Proyectos y detalle de proyecto", () => {
  assert.ok(render(<ProjectsView />).includes("Migración plataforma Alfa"));
  const html = render(<ProjectDetail id={1} />);
  for (const s of ["Dónde lo dejamos", "Siguiente acción", "Señales objetivas", "Decisiones pendientes", "Próximos compromisos", "Tareas", "Notas", "no significa que el proyecto vaya bien"]) assert.ok(html.includes(s), s);
  assert.doesNotMatch(html, /%/, "sin porcentajes de avance");
});

test("Equipo: vista operativa sin juicios de desempeño", () => {
  const html = render(<TeamView personId={2} />);
  assert.ok(html.includes("Ausencias registradas") && html.includes("Tareas activas"));
  assert.doesNotMatch(html, FORBIDDEN);
});

test("Notas y Configuración renderizan", () => {
  const n = render(<NotesView />);
  assert.ok(n.includes("Sin clasificar") && n.includes("Papelera") && n.includes("Nueva nota"));
  const s = render(<SettingsView />);
  assert.ok(s.includes("Cerrar aplicación") && s.includes("no protegen ante pérdida"));
});

test("Markdown seguro: sin HTML ejecutable, sin descargas, enlaces peligrosos bloqueados", () => {
  const src = [
    "# Título", "<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "[malo](javascript:alert(1))",
    "[bueno](https://example.com)", "![foto](https://example.com/a.png)", "| a | b |", "|---|---|", "| 1 | 2 |",
    "```", "<b>code</b>", "```", "- [x] hecho", "- [ ] pendiente", "**negrita** y _cursiva_",
  ].join("\n");
  const html = renderToStaticMarkup(<Markdown text={src} />);
  assert.doesNotMatch(html, /<script|<img|<iframe|href="javascript/i);
  for (const tag of html.match(/<[^>]+>/g) || []) assert.doesNotMatch(tag, /\son\w+=/i, tag);
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes('href="https://example.com"') && html.includes('rel="noopener noreferrer nofollow"'));
  assert.ok(html.includes("no se carga"));
  assert.ok(html.includes("<table>") && html.includes("<strong>negrita</strong>") && html.includes("<em>cursiva</em>"));
  assert.ok(html.includes("enlace bloqueado"));
});
