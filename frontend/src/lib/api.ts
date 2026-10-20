// Cliente HTTP mínimo. Solo habla con el propio servidor local (mismo origen).
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
    throw new ApiError(0, "sin_conexion", "No se puede conectar con la aplicación local. Comprueba que KAOSnt sigue en marcha (iniciar.bat).");
  }
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new ApiError(res.status, data?.code || "error", data?.message || `Error ${res.status}`, data || {});
  return data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body: unknown = {}) => request<T>("POST", url, body),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  put: <T>(url: string, body: unknown) => request<T>("PUT", url, body),
  del: <T>(url: string) => request<T>("DELETE", url),
};
