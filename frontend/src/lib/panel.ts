// Width of the task detail panel (0.4). Stored in the `task_panel_width` setting (px); null = default (42 % of the window).
export const PANEL_MIN = 360;          // narrower than this the detail form no longer fits
export const MAIN_MIN = 360;           // space always left for the main view
export const PANEL_SETTING_MIN = 320;  // limits accepted by the server
export const PANEL_SETTING_MAX = 2000;
export const PANEL_STEP = 24;          // keyboard step (arrow keys); Shift = ×4

/** Clamp a requested width to what fits in a layout of `available` px. */
export function clampPanelWidth(width: number, available: number): number {
  const max = Math.max(PANEL_MIN, available - MAIN_MIN);
  return Math.round(Math.min(Math.max(width, PANEL_MIN), max));
}

/** Default width (same as the CSS default: 42 % of the layout, at least 400 px). */
export function defaultPanelWidth(available: number): number {
  return clampPanelWidth(Math.max(400, available * 0.42), available);
}

/** New width after a key press on the resize handle, or null if the key does not resize. */
export function keyResize(key: string, shift: boolean, current: number, available: number): number | null {
  const step = PANEL_STEP * (shift ? 4 : 1);
  // The handle is on the left edge of the panel: moving it left makes the panel wider
  if (key === "ArrowLeft") return clampPanelWidth(current + step, available);
  if (key === "ArrowRight") return clampPanelWidth(current - step, available);
  if (key === "Home") return clampPanelWidth(Number.MAX_SAFE_INTEGER, available);
  if (key === "End") return clampPanelWidth(0, available);
  return null;
}
