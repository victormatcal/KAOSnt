import { t, tr } from "./i18n";

// Note autosave with verifiable state: «Saved» only after the server confirms; on failure
// the pending text is kept (in memory and in a local emergency copy) and can be retried.
export type SaveState = "saved" | "pending" | "saving" | "error" | "conflict";
export interface SaveResult { version: number }
export interface SaverOptions {
  save: (content: string, baseVersion: number) => Promise<SaveResult>;
  onState: (state: SaveState, error?: string) => void;
  delay?: number;
  emergency?: { put: (content: string) => void; clear: () => void };
  setTimer?: (fn: () => void, ms: number) => any;
  clearTimer?: (h: any) => void;
}

export class NoteSaver {
  private pending: string | null = null;
  private confirmed: string;
  private timer: any = null;
  private inflight: Promise<void> | null = null;
  state: SaveState = "saved";
  lastError = "";
  serverVersion: number | null = null;

  constructor(initial: string, public version: number, private o: SaverOptions) { this.confirmed = initial; }

  get text(): string { return this.pending ?? this.confirmed; }
  get hasUnsaved(): boolean { return this.pending !== null && this.pending !== this.confirmed; }

  private set(s: SaveState, err = "") { this.state = s; this.lastError = err; this.o.onState(s, err); }

  edit(content: string) {
    this.pending = content;
    if (this.state !== "saving") this.set(this.state === "error" || this.state === "conflict" ? this.state : "pending");
    this.schedule();
  }

  private schedule() {
    const st = this.o.setTimer ?? ((f: () => void, ms: number) => setTimeout(f, ms));
    const ct = this.o.clearTimer ?? ((h: any) => clearTimeout(h));
    if (this.timer) ct(this.timer);
    this.timer = st(() => { this.timer = null; void this.flush(); }, this.o.delay ?? 700);
  }

  async flush(force = false): Promise<void> {
    if (this.inflight) { await this.inflight; if (this.state === "error" || this.state === "conflict") return; }
    if (this.pending === null || (this.pending === this.confirmed && !force)) {
      if (this.pending === this.confirmed) this.pending = null;
      if (this.state !== "error" && this.state !== "conflict") this.set("saved");
      return;
    }
    const content = this.pending;
    this.set("saving");
    this.inflight = (async () => {
      try {
        const r = await this.o.save(content, this.version);
        this.version = r.version;
        this.confirmed = content;
        if (this.pending === content) this.pending = null;
        this.o.emergency?.clear();
        if (this.pending !== null) { this.set("pending"); this.schedule(); } else this.set("saved");
      } catch (e: any) {
        this.o.emergency?.put(content);
        const conflict = e?.code === "conflicto_version";
        if (conflict && typeof e?.extra?.server_version === "number") this.serverVersion = e.extra.server_version;
        this.set(conflict ? "conflict" : "error", e?.message || t("Error al guardar"));
      }
    })();
    try { await this.inflight; } finally { this.inflight = null; }
  }

  retry(): Promise<void> { this.set("pending"); return this.flush(true); }

  overwrite(): Promise<void> {
    if (this.serverVersion !== null) this.version = this.serverVersion;
    if (this.pending === null) this.pending = this.confirmed;
    this.set("pending");
    return this.flush(true);
  }

  dispose() { const ct = this.o.clearTimer ?? ((h: any) => clearTimeout(h)); if (this.timer) ct(this.timer); }
}

export const SAVE_LABEL: Record<SaveState, string> = tr({
  saved: "Guardado", pending: "Cambios sin guardar…", saving: "Guardando…",
  error: "Error al guardar — el texto se conserva", conflict: "Conflicto: modificada en otra ventana",
});
