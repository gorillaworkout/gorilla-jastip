import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-routes"
import { createAdminSession, isAdminUser, verifyFirebaseIdToken } from "@/lib/server-auth"

const MAX_AGE = 60 * 60 * 24

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  }
}

export async function POST(request: Request) {
  let token = ""
  try {
    const body = await request.json()
    token = typeof body?.token === "string" ? body.token : ""
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!token) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const claims = await verifyFirebaseIdToken(token)
    if (!await isAdminUser(claims.sub, token)) return NextResponse.json({ ok: false }, { status: 403 })
    const expiresAt = Math.min(claims.exp, Math.floor(Date.now() / 1000) + MAX_AGE)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(claims.sub, expiresAt), sessionCookieOptions())
    return response
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 })
  return response
}
