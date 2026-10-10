export const ADMIN_SESSION_COOKIE = "jastip_admin_session"

export const ADMIN_PATHS = [
  "/dashboard",
  "/periods",
  "/pendapatan",
  "/pengeluaran",
  "/monthly-expenses",
  "/settings",
  "/analytics",
  "/departures",
  "/jastipers/manage",
  "/uangkuh",
] as const

export function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function getSafeNextPath(next: string | null | undefined): string {
  if (!next) return "/dashboard"
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard"
  if (next.startsWith("/login")) return "/dashboard"
  return next
}

export async function verifyAdminSessionCookie(value: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!value || !secret || secret.length < 32) return false
  const [payload, signature, extra] = value.split(".")
  if (!payload || !signature || extra) return false
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"])
    const actual = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0))
    if (!await crypto.subtle.verify("HMAC", key, actual, new TextEncoder().encode(payload))) return false
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number; uid?: string }
    return typeof decoded.uid === "string" && typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}
