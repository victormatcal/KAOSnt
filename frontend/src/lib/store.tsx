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
  dataVersion: number;          // when it changes, the views query the server again
  changed: () => void;
  openTask: (id: number) => void;
  quickTask: (preset?: Record<string, unknown>) => void;
  newNote: (preset?: Record<string, unknown>) => Promise<void>;
  navigate: (hash: string) => void;
  toast: (text: string, kind?: Toast["kind"], action?: Toast["action"]) => void;
  /** Notice with «Undo» for a few seconds (configurable) after a direct action. */
  undoable: (text: string, undoId: number | null | undefined) => void;
  openReminders: (tab?: "pending" | "scheduled" | "resolved") => void;
}

export const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("Contexto de aplicación no disponible"); // programming error, never shown to the user
  return c;
}

// Cache per URL: shows previous data while reloading and makes render tests easier.
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
