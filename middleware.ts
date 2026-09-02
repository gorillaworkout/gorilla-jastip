import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_SESSION_COOKIE, isAdminPath } from "@/lib/admin-routes"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!isAdminPath(pathname)) {
    return NextResponse.next()
  }

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (session) {
    return NextResponse.next()
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.search = ""
  loginUrl.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/periods",
    "/periods/:path*",
    "/pendapatan",
    "/pendapatan/:path*",
    "/pengeluaran",
    "/pengeluaran/:path*",
    "/monthly-expenses",
    "/monthly-expenses/:path*",
    "/settings",
    "/settings/:path*",
    "/analytics",
    "/analytics/:path*",
    "/departures",
    "/departures/:path*",
    "/jastipers/manage",
    "/jastipers/manage/:path*",
  ],
}
