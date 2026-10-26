// 0.4 tests: English by default, translated server messages, resizable task panel and deleting team members.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { apiCache, AppCtx, Ctx } from "../src/lib/store";
import { getLang, setLang, t } from "../src/lib/i18n";
import { serverMessage } from "../src/lib/api";
import { clampPanelWidth, defaultPanelWidth, keyResize, MAIN_MIN, PANEL_MIN } from "../src/lib/panel";
import { PanelResizer } from "../src/components/PanelResizer";
import { DeletePersonDialog, TeamView } from "../src/views/Team";
import { TodayView } from "../src/views/Today";
import type { Bootstrap } from "../src/lib/types";

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

test("English is the default language; Spanish keys are the fallback", () => {
  setLang(boot.settings.language);
  assert.equal(getLang(), "en");
  assert.equal(t("Hoy"), "Today");
  const html = render(<TodayView />);
  assert.ok(html.includes("Due today and this week") && !html.includes("Vence hoy y esta semana"));
  setLang("es");
  assert.equal(t("Hoy"), "Hoy");
  setLang("xx");
  assert.equal(getLang(), "en"); // unknown values fall back to English
});

test("server messages are rendered with t(message_key, params), translating entity params", () => {
  setLang("en");
  assert.equal(serverMessage({ message: "Proyecto no encontrado", message_key: "{entidad} no encontrado", params: { entidad: "Proyecto" }, tparams: ["entidad"] }), "Project not found");
  assert.equal(serverMessage({ message_key: "El ancho del panel debe estar entre {min} y {max} píxeles", params: { min: 320, max: 2000 } }), "The panel width must be between 320 and 2000 pixels");
  assert.equal(serverMessage({ message_key: "Mensaje nuevo sin traducir {x}", params: { x: 1 } }), "Mensaje nuevo sin traducir 1");
  assert.equal(serverMessage({ message: "texto antiguo" }), "texto antiguo"); // responses without a key
  assert.equal(serverMessage(null), "");
  setLang("es");
  assert.equal(serverMessage({ message_key: "{entidad} no encontrado", params: { entidad: "Proyecto" }, tparams: ["entidad"] }), "Proyecto no encontrado");
  setLang("en");
});

test("task panel width: limits, default and keyboard", () => {
  assert.equal(clampPanelWidth(100, 1600), PANEL_MIN);
  assert.equal(clampPanelWidth(5000, 1600), 1600 - MAIN_MIN);
  assert.equal(clampPanelWidth(700, 1600), 700);
  assert.equal(clampPanelWidth(700, 600), PANEL_MIN); // tiny windows: never below the minimum
  assert.equal(defaultPanelWidth(1600), 672);
  assert.equal(keyResize("ArrowLeft", false, 600, 1600), 624); // handle on the left edge: left = wider
  assert.equal(keyResize("ArrowRight", true, 600, 1600), 504);
  assert.equal(keyResize("Home", false, 600, 1600), 1600 - MAIN_MIN);
  assert.equal(keyResize("End", false, 600, 1600), PANEL_MIN);
  assert.equal(keyResize("a", false, 600, 1600), null);
});

test("resize handle: accessible separator and CSS that keeps room for the main view", () => {
  setLang("en");
  const html = render(<PanelResizer width={640} layout={() => null} onResize={() => undefined} onCommit={() => undefined} />);
  for (const re of [/role="separator"/, /aria-orientation="vertical"/, /aria-valuenow="640"/, /tabindex="0"/, /aria-label="Task panel width"/]) assert.match(html, re);
  const css = readFileSync(__dirname + "/../../src/styles.css", "utf8");
  assert.match(css, /\.layout\.with-panel\.custom-width \{ grid-template-columns: minmax\(0, 1fr\) clamp\(360px, var\(--panel-w\), calc\(100% - 360px\)\)/);
});

test("delete a team member: summary, explicit reassignment option and no option for «me»", () => {
  setLang("en");
  const ana = boot.people.find((p) => p.id === 2)!;
  const html = render(<DeletePersonDialog person={ana} onClose={() => undefined} onDone={() => undefined} />);
  for (const s of ["Delete person", "2 open task(s) they are responsible for", "1 registered absence(s): deleted",
    "Allocation in 2 project(s): deleted", "Leave them unassigned", "Reassign them to:", "untick &quot;Active&quot;"])
    assert.ok(html.includes(s), s);
  assert.ok(!/<option value="2">/.test(html), "cannot reassign to the same person");
  assert.ok(render(<TeamView personId={2} />).includes("Team"));
});
