import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("admin session lifetime is independent of the 1h Firebase ID token", () => {
  const route = read("app/api/auth/session/route.ts")
  assert.doesNotMatch(route, /Math\.min\(claims\.exp/)
  assert.match(route, /Math\.floor\(Date\.now\(\) \/ 1000\) \+ MAX_AGE/)
})

test("token verification tolerates clock skew and refreshes rotated keys", () => {
  const auth = read("lib/server-auth.ts")
  assert.match(auth, /CLOCK_SKEW_SECONDS/)
  assert.match(auth, /getFirebaseCerts\(true\)/)
})

test("client stops admin redirects when the server rejects the session", () => {
  const ctx = read("contexts/auth-context.tsx")
  assert.match(ctx, /sessionResponse\.ok/)
})
