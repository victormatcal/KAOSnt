// Resize handle on the left edge of the task panel (0.4): drag with the mouse/pen/touch or use the keyboard
// (←/→, Shift for bigger steps, Home/End for maximum/minimum, Enter or double click to restore the default width).
// The width is applied live and saved in the settings when the gesture ends.
import { useRef } from "react";
import { t } from "../lib/i18n";
import { clampPanelWidth, defaultPanelWidth, keyResize } from "../lib/panel";

export function PanelResizer({ width, layout, onResize, onCommit }: {
  width: number | null; layout: () => HTMLElement | null;
  onResize: (w: number) => void; onCommit: (w: number | null) => void;
}) {
  const drag = useRef<{ startX: number; startW: number; last: number } | null>(null);
  const available = () => layout()?.getBoundingClientRect().width || (typeof window !== "undefined" ? window.innerWidth : 1200);
  const current = () => width ?? defaultPanelWidth(available());
  const min = clampPanelWidth(0, available());
  const max = clampPanelWidth(Number.MAX_SAFE_INTEGER, available());
  return (
    <div className="panel-resizer" role="separator" aria-orientation="vertical" tabIndex={0}
      aria-label={t("Ancho del panel de la tarea")} aria-valuenow={Math.round(current())} aria-valuemin={min} aria-valuemax={max}
      title={t("Arrastra para cambiar el ancho (←/→ con el teclado; doble clic o Enter para restaurar)")}
      onPointerDown={(e: any) => {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        drag.current = { startX: e.clientX, startW: current(), last: current() };
        document.documentElement.classList.add("resizing");
      }}
      onPointerMove={(e: any) => {
        const d = drag.current;
        if (!d) return;
        d.last = clampPanelWidth(d.startW + (d.startX - e.clientX), available());
        onResize(d.last);
      }}
      onPointerUp={(e: any) => {
        const d = drag.current;
        drag.current = null;
        document.documentElement.classList.remove("resizing");
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        if (d && d.last !== d.startW) onCommit(d.last);
      }}
      onPointerCancel={() => { drag.current = null; document.documentElement.classList.remove("resizing"); }}
      onDoubleClick={() => onCommit(null)}
      onKeyDown={(e: any) => {
        if (e.key === "Enter") { e.preventDefault(); onCommit(null); return; }
        const w = keyResize(e.key, e.shiftKey, current(), available());
        if (w !== null) { e.preventDefault(); onResize(w); onCommit(w); }
      }} />
  );
}
