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
