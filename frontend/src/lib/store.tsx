import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "./api";
import { t } from "./i18n";
import type { Bootstrap, Person, ProjectListItem } from "./types";

export interface Toast { id: number; text: string; kind: "info" | "error" | "ok"; action?: { label: string; run: () => void }; ms?: number; undo?: boolean }

export interface AppCtx {
  boot: Bootstrap; tz: string; meId: number | null;
  person: (id: number | null | undefined) => Person | undefined;
  project: (id: number | null | undefined) => ProjectListItem | undefined;
  reloadBoot: () => Promise<void>;
  dataVersion: number;          // al cambiar, las vistas vuelven a consultar el servidor
  changed: () => void;
  openTask: (id: number) => void;
  quickTask: (preset?: Record<string, unknown>) => void;
  newNote: (preset?: Record<string, unknown>) => Promise<void>;
  navigate: (hash: string) => void;
  toast: (text: string, kind?: Toast["kind"], action?: Toast["action"]) => void;
  /** Aviso con «Deshacer» durante unos segundos (configurable) tras una acción directa. */
  undoable: (text: string, undoId: number | null | undefined) => void;
  openReminders: (tab?: "pendientes" | "programados" | "resueltos") => void;
}

export const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("Contexto de aplicación no disponible"); // error de programación, no se muestra al usuario
  return c;
}

// Caché por URL: muestra datos previos mientras se recargan y facilita las pruebas de renderizado.
export const apiCache = new Map<string, unknown>();

export function useApi<T>(url: string | null): { data: T | undefined; error: string; loading: boolean; reload: () => void } {
  const { dataVersion } = useApp();
  const [data, setData] = useState<T | undefined>(url ? (apiCache.get(url) as T | undefined) : undefined);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!data);
  const [tick, setTick] = useState(0);
  const current = useRef(url);
  current.current = url;
  useEffect(() => {
    if (!url) { setData(undefined); setLoading(false); return; }
    let alive = true;
    if (apiCache.has(url)) setData(apiCache.get(url) as T);
    setLoading(true);
    api.get<T>(url).then(
      (d) => { if (alive && current.current === url) { apiCache.set(url, d); setData(d); setError(""); setLoading(false); } },
      (e) => { if (alive) { setError(e.message || t("Error")); setLoading(false); } });
    return () => { alive = false; };
  }, [url, dataVersion, tick]);
  const reload = useCallback(() => setTick((x: number) => x + 1), []);
  return { data, error, loading, reload };
}
