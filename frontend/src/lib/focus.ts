// One-shot request to focus a note's text at its end (0.5): set by the search (Ctrl+K) before navigating
// to the note, consumed by the note editor once the note has loaded.
let pending: number | null = null;

export function requestNoteFocus(id: number): void { pending = id; }

/** True (once) if focus was requested for this note. */
export function consumeNoteFocus(id: number): boolean {
  if (pending !== id) return false;
  pending = null;
  return true;
}

/** Caret and scroll at the end of a text area. */
export function focusAtEnd(ta: HTMLTextAreaElement | null): void {
  if (!ta) return;
  ta.focus();
  const n = ta.value.length;
  ta.setSelectionRange(n, n);
  ta.scrollTop = ta.scrollHeight;
}
