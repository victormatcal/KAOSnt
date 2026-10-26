// Minimal HTTP client. It only talks to its own local server (same origin).
import { t } from "./i18n";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public extra: any = {}) { super(message); }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json", "X-KAOSnt": "1" } : { "X-KAOSnt": "1" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "sin_conexion", t("No se puede conectar con la aplicación local. Comprueba que KAOSnt sigue en marcha (start.bat)."));
  }
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new ApiError(res.status, data?.code || "error", serverMessage(data) || t("Error {codigo}", { codigo: res.status }), data || {});
  return data as T;
}

/** Server messages are translation keys (Spanish) with params; params listed in `tparams` are keys too. */
export function serverMessage(data: any): string {
  if (!data) return "";
  if (typeof data.message_key !== "string") return typeof data.message === "string" ? data.message : "";
  const params: Record<string, string | number> = { ...(data.params || {}) };
  for (const k of Array.isArray(data.tparams) ? data.tparams : []) if (typeof params[k] === "string") params[k] = t(params[k] as string);
  return t(data.message_key, params);
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body: unknown = {}) => request<T>("POST", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  del: <T>(url: string) => request<T>("DELETE", url),
};
