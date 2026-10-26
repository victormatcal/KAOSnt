// Screen state kept while moving between screens (0.5): filters, view options, tabs and expanded groups.
// Stored in sessionStorage: it survives a page reload and is cleared when the browser is closed.
// Nothing goes to the database. A stored value with the wrong shape (corrupt or from another version) is ignored.
import { useEffect, useState } from "react";

const PREFIX = "kaosnt-vista:";

function sameShape(a: unknown, b: unknown): boolean {
  if (Array.isArray(b)) return Array.isArray(a);
  if (b === null) return true;
  if (typeof b === "object") return !!a && typeof a === "object" && !Array.isArray(a);
  return typeof a === typeof b;
}

export function readViewState<T>(key: string, initial: T): T {
  try {
    const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(PREFIX + key) : null;
    if (raw === null) return initial;
    const v = JSON.parse(raw);
    if (!sameShape(v, initial)) return initial;
    // objects: only the known keys of the initial value are taken (plus any extra filter keys of the same type)
    if (initial && typeof initial === "object" && !Array.isArray(initial)) return { ...initial, ...v };
    return v as T;
  } catch { return initial; }
}

export function writeViewState(key: string, value: unknown): void {
  try { if (typeof sessionStorage !== "undefined") sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage full or disabled */ }
}

/** useState that remembers its value for the browser session under `key`. */
export function useViewState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readViewState(key, initial));
  useEffect(() => { writeViewState(key, value); }, [key, JSON.stringify(value)]);
  return [value, setValue as any];
}

/** A Set kept as an array (expanded series / subtasks). */
export function useViewSet(key: string): [Set<number>, (id: number) => void] {
  const [arr, setArr] = useViewState<number[]>(key, []);
  const set = new Set(arr.filter((x) => typeof x === "number"));
  const toggle = (id: number) => setArr((prev: number[]) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return [set, toggle];
}

// ---- Scroll position per screen ----
export function saveScroll(route: string): void {
  if (typeof window !== "undefined") writeViewState("scroll:" + route, window.scrollY || 0);
}
export function restoreScroll(route: string): void {
  if (typeof window === "undefined") return;
  const y = readViewState<number>("scroll:" + route, 0);
  if (!y) { window.scrollTo(0, 0); return; }
  // twice: right away and once the cached data has been painted
  requestAnimationFrame(() => window.scrollTo(0, y));
  setTimeout(() => window.scrollTo(0, y), 250);
}
