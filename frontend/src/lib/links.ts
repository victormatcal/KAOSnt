// Validación de enlaces: solo esquemas seguros. Nunca se abren automáticamente.
const SAFE = /^(https?:\/\/|mailto:|file:)/i;

export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.trim();
  if (/[\u0000-\u001f]/.test(u)) return false;
  return SAFE.test(u);
}

export function linkProps(url: string) {
  return { href: url, target: "_blank", rel: "noopener noreferrer nofollow", referrerPolicy: "no-referrer" as const };
}
