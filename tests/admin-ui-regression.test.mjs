import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("settings only exposes real account information and logout", () => {
  const source = read("app/settings/page.tsx")
  for (const deadControl of [
    "Notifikasi Email",
    "Auto Save",
    "Dark Mode",
    "Ubah Password",
    "Two-Factor Authentication",
    "Status Database",
    "v1.0.0",
  ]) {
    assert.doesNotMatch(source, new RegExp(deadControl))
  }
  assert.match(source, /Profil Pengguna/)
  assert.match(source, /Logout/)
})

test("analytics does not advertise a dead export action", () => {
  assert.doesNotMatch(read("app/analytics/page.tsx"), />Export</)
})

test("mobile header and global buttons meet a 44px touch target", () => {
  const header = read("components/layout/mobile-header.tsx")
  const button = read("components/ui/button.tsx")
  assert.doesNotMatch(header, /h-16/)
  assert.match(header, /h-14/)
  assert.match(button, /min-h-11/)
  assert.match(button, /min-w-11/)
})

test("every admin page provides a named compact mobile header", () => {
  const pages = {
    "app/dashboard/page.tsx": "Dashboard",
    "app/periods/page.tsx": "Periode",
    "app/pendapatan/page.tsx": "Pendapatan",
    "app/pengeluaran/page.tsx": "Pengeluaran",
    "app/monthly-expenses/page.tsx": "Pengeluaran Bulanan",
    "app/analytics/page.tsx": "Analytics",
    "app/departures/page.tsx": "Keberangkatan",
    "app/jastipers/manage/page.tsx": "Jastiper",
    "app/uangkuh/page.tsx": "Uangkuh",
    "app/settings/page.tsx": "Pengaturan",
  }
  for (const [path, title] of Object.entries(pages)) {
    assert.match(read(path), new RegExp(`<MobileHeader title=["']${title}["']`), path)
  }
})

test("dashboard delegates jastiper management to its dedicated page", () => {
  const source = read("app/dashboard/page.tsx")
  assert.doesNotMatch(source, /Tambah Jastiper/)
  assert.doesNotMatch(source, /handleDeleteJastiper/)
  assert.match(source, /\/jastipers\/manage/)
})

test("unused React 18-only drawer dependency is removed", () => {
  const pkg = JSON.parse(read("package.json"))
  assert.equal(pkg.dependencies.vaul, undefined)
})
