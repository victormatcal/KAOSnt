// Autoguardado de notas con estado verificable.
// - «Guardado» solo tras confirmación del servidor.
// - Ante un fallo, el texto pendiente se conserva (en memoria y en una copia de emergencia local)
//   y se puede reintentar. Nunca se descarta texto no confirmado.

export type SaveState = "guardado" | "pendiente" | "guardando" | "error" | "conflicto";

export interface SaveResult { version: number }

export interface SaverOptions {
  save: (content: string, baseVersion: number) => Promise<SaveResult>;
  onState: (state: SaveState, error?: string) => void;
  delay?: number;
  emergency?: { put: (content: string) => void; clear: () => void };
  setTimer?: (fn: () => void, ms: number) => any;
  clearTimer?: (t: any) => void;
}

export class NoteSaver {
  private pending: string | null = null;
  private confirmed: string;
  private timer: any = null;
  private inflight: Promise<void> | null = null;
  state: SaveState = "guardado";
  lastError = "";

  constructor(initial: string, public version: number, private o: SaverOptions) {
    this.confirmed = initial;
  }

  /** Texto que debe mostrarse: el pendiente si existe; nunca se pierde. */
  get text(): string { return this.pending ?? this.confirmed; }
  get hasUnsaved(): boolean { return this.pending !== null && this.pending !== this.confirmed; }

  private set(s: SaveState, err = "") {
    this.state = s;
    this.lastError = err;
    this.o.onState(s, err);
  }

  edit(content: string) {
    this.pending = content;
    if (this.state !== "guardando") this.set(this.state === "error" || this.state === "conflicto" ? this.state : "pendiente");
    this.schedule();
  }

  private schedule() {
    const st = this.o.setTimer ?? ((f: () => void, ms: number) => setTimeout(f, ms));
    const ct = this.o.clearTimer ?? ((t: any) => clearTimeout(t));
    if (this.timer) ct(this.timer);
    this.timer = st(() => { this.timer = null; void this.flush(); }, this.o.delay ?? 700);
  }

  /** Guarda inmediatamente lo pendiente. Devuelve cuando no queda nada por confirmar o hay error. */
  async flush(force = false): Promise<void> {
    if (this.inflight) { await this.inflight; if (this.state === "error" || this.state === "conflicto") return; }
    if (this.pending === null || (this.pending === this.confirmed && !force)) {
      if (this.pending === this.confirmed) this.pending = null;
      if (this.state !== "error" && this.state !== "conflicto") this.set("guardado");
      return;
    }
    const content = this.pending;
    this.set("guardando");
    this.inflight = (async () => {
      try {
        const r = await this.o.save(content, this.version);
        this.version = r.version;
        this.confirmed = content;
        if (this.pending === content) this.pending = null;
        this.o.emergency?.clear();
        if (this.pending !== null) { this.set("pendiente"); this.schedule(); }
        else this.set("guardado");
      } catch (e: any) {
        this.o.emergency?.put(content);
        const conflict = e?.code === "conflicto_version";
        if (conflict && typeof e?.extra?.server_version === "number") this.serverVersion = e.extra.server_version;
        this.set(conflict ? "conflicto" : "error", e?.message || "Error al guardar");
      }
    })();
    try { await this.inflight; } finally { this.inflight = null; }
  }

  serverVersion: number | null = null;

  /** Reintento manual tras un error. */
  retry(): Promise<void> { this.set("pendiente"); return this.flush(true); }

  /** Sobrescribe la versión del servidor con el texto local (tras un conflicto). */
  overwrite(): Promise<void> {
    if (this.serverVersion !== null) this.version = this.serverVersion;
    if (this.pending === null) this.pending = this.confirmed;
    this.set("pendiente");
    return this.flush(true);
  }

  dispose() {
    const ct = this.o.clearTimer ?? ((t: any) => clearTimeout(t));
    if (this.timer) ct(this.timer);
  }
}

export const SAVE_LABEL: Record<SaveState, string> = {
  guardado: "Guardado",
  pendiente: "Cambios sin guardar…",
  guardando: "Guardando…",
  error: "Error al guardar — el texto se conserva",
  conflicto: "Conflicto: modificada en otra ventana",
};
