// Subtasks folded under their parent task (0.5), like recurring series.
// Inside a list of tasks (a Kanban column of a group, or the List view), a subtask is folded under its parent only
// when the parent is in that same list and has the same status. Folding is recursive (several levels).
// A subtask in another column, in another group or whose parent is filtered out is shown on its own, as before.
import type { Task } from "./types";

export interface FoldedRow<T extends Task = Task> {
  task: T;
  depth: number;          // 0 = top level
  childCount: number;     // direct + indirect subtasks folded under it in this list
  expanded: boolean;      // its subtasks are shown
}

/** `expanded`: ids of parent tasks whose subtasks are shown. Order: parents in list order, children after them. */
export function foldSubtasks<T extends Task>(items: T[], expanded: Set<number>): FoldedRow<T>[] {
  const byId = new Map(items.map((x) => [x.id, x]));
  const children = new Map<number, T[]>();
  const isChild = (x: T) => {
    if (x.parent_id === null || x.parent_id === undefined) return false;
    const p = byId.get(x.parent_id);
    return !!p && p.status === x.status && p.id !== x.id;
  };
  // guard against cycles: a task is a child only if walking up never comes back to it
  const inCycle = (x: T) => {
    const seen = new Set<number>([x.id]);
    let cur = x.parent_id !== null ? byId.get(x.parent_id) : undefined;
    while (cur && isChild(cur)) {
      if (seen.has(cur.id)) return true;
      seen.add(cur.id);
      cur = cur.parent_id !== null ? byId.get(cur.parent_id) : undefined;
    }
    return !!cur && seen.has(cur.id);
  };
  const roots: T[] = [];
  for (const x of items) {
    if (isChild(x) && !inCycle(x)) children.set(x.parent_id!, [...(children.get(x.parent_id!) || []), x]);
    else roots.push(x);
  }
  const count = (id: number): number => (children.get(id) || []).reduce((n, c) => n + 1 + count(c.id), 0);
  const out: FoldedRow<T>[] = [];
  const walk = (x: T, depth: number) => {
    const n = count(x.id);
    const open = n > 0 && expanded.has(x.id);
    out.push({ task: x, depth, childCount: n, expanded: open });
    if (open) for (const c of children.get(x.id) || []) walk(c, depth + 1);
  };
  for (const r of roots) walk(r, 0);
  return out;
}
