import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("Firestore prevents self role escalation and keeps finance ownership", () => {
  const rules = read("firestore.rules")
  assert.match(rules, /allow create:.*request\.resource\.data\.role == ["']user["']/s)
  assert.match(rules, /allow update:.*request\.resource\.data\.role == resource\.data\.role/s)
  assert.match(rules, /match \/financeUsers\/\{userId\}[\s\S]*request\.auth\.uid == userId[\s\S]*match \/\{subcollection\}\/\{document\}[\s\S]*request\.auth\.uid == userId/)
})

test("global business collections are admin-only; monthly expenses are validated", () => {
  const rules = read("firestore.rules")
  for (const name of ["periods", "periodItems", "expenses", "incomes"]) {
    assert.match(rules, new RegExp(`match /${name}/\\{document\\} \\{[\\s\\S]*?allow read, write: if isAdmin\\(\\);`))
  }
  assert.match(rules, /match \/monthly-expenses\/\{document\}[\s\S]*allow read: if isAdmin\(\);/)
  assert.match(rules, /allow create, update: if isAdmin\(\) && validMonthlyExpense\(\);/)
  assert.match(rules, /request\.resource\.data\.keys\(\)\.hasOnly/)
})

test("Uangkuh is covered by server-side route protection", () => {
  const routes = read("lib/admin-routes.ts")
  const middleware = read("middleware.ts")
  assert.match(routes, /["']\/uangkuh["']/)
  assert.match(middleware, /["']\/uangkuh["']/)
  assert.match(middleware, /verifyAdminSessionCookie\(session\)/)
})

test("admin session verifies Firebase JWT and stores only signed server claims", () => {
  const route = read("app/api/auth/session/route.ts")
  const verifier = read("lib/server-auth.ts")
  assert.match(route, /verifyFirebaseIdToken\(token\)/)
  assert.match(route, /isAdminUser/)
  assert.doesNotMatch(route, /cookies\.set\([^\n]+,\s*["']1["']/)
  assert.match(verifier, /createVerify\(["']RSA-SHA256["']\)/)
  assert.match(verifier, /timingSafeEqual/)
  assert.doesNotMatch(route, /console\.(?:log|error)\([^\n]*token/i)
})

test("AI extraction requires admin auth before bounded request processing", () => {
  const route = read("app/api/uangkuh/extract/route.ts")
  const authAt = route.indexOf("authenticateAdminRequest(request)")
  assert.ok(authAt >= 0)
  assert.ok(authAt < route.indexOf("request.formData()"))
  assert.match(route, /MAX_REQUESTS/)
  assert.match(route, /RATE_WINDOW_MS/)
  assert.match(route, /content-length/i)
  assert.match(route, /file\.size > MAX_BYTES/)
})

test("package exposes the regression suite", () => {
  const pkg = JSON.parse(read("package.json"))
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs")
  assert.equal(pkg.scripts.typecheck, "tsc --noEmit")
})
