import { createHmac, createVerify, timingSafeEqual } from "node:crypto"

const FIREBASE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
const MAX_CERT_AGE_MS = 60 * 60 * 1000
const CLOCK_SKEW_SECONDS = 300
let certCache: { expires: number; certs: Record<string, string> } | undefined

export type FirebaseClaims = { aud: string; auth_time?: number; exp: number; iat: number; iss: string; sub: string; user_id?: string }

function decodePart(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

async function getFirebaseCerts(force = false) {
  if (!force && certCache && certCache.expires > Date.now()) return certCache.certs
  const response = await fetch(FIREBASE_CERTS_URL, { cache: "no-store" })
  if (!response.ok) throw new Error("Firebase signing keys unavailable")
  const certs = await response.json() as Record<string, string>
  certCache = { certs, expires: Date.now() + MAX_CERT_AGE_MS }
  return certs
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseClaims> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) throw new Error("Firebase project is not configured")
  const parts = token.split(".")
  if (parts.length !== 3) throw new Error("Invalid Firebase ID token")
  let header: { alg?: string; kid?: string }
  let claims: FirebaseClaims
  try {
    header = JSON.parse(decodePart(parts[0]))
    claims = JSON.parse(decodePart(parts[1]))
  } catch {
    throw new Error("Invalid Firebase ID token")
  }
  if (header.alg !== "RS256" || !header.kid) throw new Error("Invalid Firebase ID token")
  // Firebase rotates signing keys; refetch once before rejecting an unknown kid.
  const cert = (await getFirebaseCerts())[header.kid] || (await getFirebaseCerts(true))[header.kid]
  if (!cert) throw new Error("Unknown Firebase signing key")
  const verifier = createVerify("RSA-SHA256")
  verifier.update(`${parts[0]}.${parts[1]}`)
  verifier.end()
  if (!verifier.verify(cert, Buffer.from(parts[2], "base64url"))) throw new Error("Invalid Firebase ID token signature")

  const now = Math.floor(Date.now() / 1000)
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}` || typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 128
    || typeof claims.exp !== "number" || typeof claims.iat !== "number" || claims.exp <= now - CLOCK_SKEW_SECONDS || claims.iat > now + CLOCK_SKEW_SECONDS) {
    throw new Error("Invalid Firebase ID token claims")
  }
  return claims
}

export async function isAdminUser(uid: string, token: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) return false
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!response.ok) return false
  const document = await response.json() as { fields?: { role?: { stringValue?: string } } }
  return document.fields?.role?.stringValue === "admin"
}

export async function authenticateAdminRequest(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.startsWith("Bearer ")) return null
  const token = authorization.slice(7)
  try {
    const claims = await verifyFirebaseIdToken(token)
    return await isAdminUser(claims.sub, token) ? claims : null
  } catch {
    return null
  }
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be at least 32 characters")
  return value
}

export function createAdminSession(uid: string, expiresAt: number) {
  const payload = Buffer.from(JSON.stringify({ uid, exp: expiresAt })).toString("base64url")
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

export function verifyAdminSession(value: string) {
  const [payload, signature, extra] = value.split(".")
  if (!payload || !signature || extra) return false
  const expected = createHmac("sha256", secret()).update(payload).digest()
  const actual = Buffer.from(signature, "base64url")
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
  try {
    const session = JSON.parse(decodePart(payload)) as { exp?: number; uid?: string }
    return typeof session.uid === "string" && typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}
