import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-routes"

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }
}

export async function POST(request: Request) {
  let token = ""
  try {
    const body = await request.json()
    token = typeof body?.token === "string" ? body.token : ""
  } catch {
    token = ""
  }

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "1", sessionCookieOptions())
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  })
  return response
}
