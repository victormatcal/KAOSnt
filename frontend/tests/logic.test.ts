import test from "node:test";
import assert from "node:assert/strict";
import { NoteSaver, SaveState, SAVE_LABEL } from "../src/lib/saver";
import { dueLabel, elapsedSinceStart, inQuietHours, todayIn, utcToZonedInput, weekStart, zonedToUtc } from "../src/lib/dates";
import { describeRule } from "../src/lib/labels";
import { isSafeUrl } from "../src/lib/links";
import { homeHash, parseRoute } from "../src/App";

function manualTimers() {
  const q: (() => void)[] = [];
  return { setTimer: (f: () => void) => { q.push(f); return q.length; }, clearTimer: () => { q.length = 0; } };
}

test("criterio 2: un fallo de guardado se muestra y conserva el texto; reintento correcto", async () => {
  const states: SaveState[] = [];
  let fail = true;
  const stored: string[] = [];
  let emergency: string | null = null;
  const t = manualTimers();
  const s = new NoteSaver("", 1, {
    save: async (c) => { if (fail) throw Object.assign(new Error("Sin conexión"), { code: "sin_conexion" }); stored.push(c); return { version: 2 }; },
    onState: (st) => states.push(st), emergency: { put: (c) => { emergency = c; }, clear: () => { emergency = null; } },
    setTimer: t.setTimer, clearTimer: t.clearTimer,
  });
  s.edit("texto importante");
  await s.flush();
  assert.equal(s.state, "error");
  assert.equal(s.text, "texto importante");
  assert.equal(emergency, "texto importante");
  assert.ok(!states.includes("guardado"));
  assert.match(SAVE_LABEL.error, /conserva/);
  fail = false;
  await s.retry();
  assert.equal(s.state, "guardado");
  assert.deepEqual(stored, ["texto importante"]);
  assert.equal(emergency, null);
});

test("autoguardado: «guardado» solo tras confirmar, con ediciones durante el guardado", async () => {
  let resolveSave: (v: { version: number }) => void = () => undefined;
  const saved: string[] = [];
  const t = manualTimers();
  const s = new NoteSaver("a", 1, { save: (c) => new Promise((r) => { saved.push(c); resolveSave = r; }), onState: () => undefined, setTimer: t.setTimer, clearTimer: t.clearTimer });
  s.edit("ab");
  const p = s.flush();
  assert.equal(s.state, "guardando");
  s.edit("abc");
  resolveSave({ version: 2 });
  await p;
  assert.equal(s.state, "pendiente");
  const p2 = s.flush();
  resolveSave({ version: 3 });
  await p2;
  assert.equal(s.state, "guardado");
  assert.deepEqual(saved, ["ab", "abc"]);
});

test("conflicto de versión: estado específico y sobrescritura explícita", async () => {
  let calls = 0;
  const s = new NoteSaver("x", 1, {
    save: async (_c, base) => { calls++; if (base === 1) throw Object.assign(new Error("Conflicto"), { code: "conflicto_version", extra: { server_version: 5 } }); return { version: 6 }; },
    onState: () => undefined, setTimer: () => 0, clearTimer: () => undefined,
  });
  s.edit("y");
  await s.flush();
  assert.equal(s.state, "conflicto");
  await s.overwrite();
  assert.equal(s.state, "guardado");
  assert.equal(calls, 2);
});

test("criterio 9: tiempo natural transcurrido, nunca dedicación", () => {
  const now = new Date("2026-10-13T10:00:00Z");
  const label = elapsedSinceStart("2026-10-10T08:00:00Z", null, now);
  assert.match(label, /tiempo natural transcurrido/);
  assert.doesNotMatch(label, /trabajad|dedicaci/i);
  assert.match(elapsedSinceStart(null, null, now), /no informado/);
});

test("fechas: Europe/Madrid con cambio de horario", () => {
  assert.equal(zonedToUtc("2026-07-01T09:00", "Europe/Madrid"), "2026-07-01T07:00:00Z");
  assert.equal(zonedToUtc("2026-12-01T09:00", "Europe/Madrid"), "2026-12-01T08:00:00Z");
  assert.equal(utcToZonedInput("2026-10-25T09:30:00Z", "Europe/Madrid"), "2026-10-25T10:30");
  assert.equal(todayIn("Europe/Madrid", new Date("2026-10-12T22:30:00Z")), "2026-10-13");
  assert.equal(weekStart("2026-10-18"), "2026-10-12");
  assert.equal(dueLabel("2026-10-12", "2026-10-13"), "venció hace 1 d");
});

test("horario silencioso que cruza medianoche", () => {
  assert.equal(inQuietHours("20:00", "08:00", "Europe/Madrid", new Date("2026-10-13T21:30:00Z")), true);
  assert.equal(inQuietHours("20:00", "08:00", "Europe/Madrid", new Date("2026-10-13T10:00:00Z")), false);
});

test("enlaces: solo esquemas seguros", () => {
  for (const u of ["javascript:alert(1)", "JAVASCRIPT:x", "data:text/html,1", "vbscript:x", "", "\u0001http://x"]) assert.equal(isSafeUrl(u), false, u);
  for (const u of ["https://example.com", "mailto:a@b.c", "file:///C:/docs/a.docx"]) assert.equal(isSafeUrl(u), true, u);
});

test("rutas, inicio configurable y descripción de repeticiones", () => {
  assert.deepEqual(parseRoute("#/notas/12"), { view: "notas", id: 12 });
  assert.equal(homeHash({ start_view: "notas", last_view: "hoy" }), "#/notas");
  assert.equal(homeHash({ start_view: "ultima", last_view: "trabajo" }), "#/trabajo");
  assert.equal(describeRule({ rule: "semanal", weekdays: [3, 1] }), "Cada semana: lunes, miércoles");
  assert.equal(describeRule({ rule: "cada_n_dias", interval_days: 3 }), "Cada 3 días");
});
