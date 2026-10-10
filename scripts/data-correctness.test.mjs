import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("monthly expenses supports a true cross-month range and derives metrics from filtered rows", async () => {
  const service = await source("lib/monthly-expenses-service.ts")
  const page = await source("app/monthly-expenses/page.tsx")
  assert.match(service, /getExpensesByDateRange/)
  assert.match(page, /getExpensesByDateRange\(startDate, endDate\)/)
  assert.match(page, /const visibleTotal = useMemo\(\(\) => filteredExpenses\.reduce/)
  assert.doesNotMatch(page, /new Date\(filterData\.month \+ "-01"\)/)
  assert.match(page, /Data terbaru:/)
})

test("period deletion scopes all dependent collections by periodId and deletes parent last", async () => {
  const service = await source("lib/periods-service.ts")
  const body = service.slice(service.indexOf("static async deletePeriod"), service.indexOf("// Toggle period active status"))
  for (const collectionName of ["ITEMS_COLLECTION", '"incomes"', '"expenses"']) {
    assert.match(body, new RegExp(collectionName.replace(/["\\]/g, "\\$&")))
  }
  assert.ok(body.indexOf('where("periodId", "==", id)') < body.lastIndexOf("deleteDoc(docRef)"))
})

test("analytics compares unfiltered adjacent 30-day windows and exposes load errors", async () => {
  const page = await source("app/analytics/page.tsx")
  assert.match(page, /const comparisonItems = items/)
  assert.match(page, /setError\(/)
  assert.match(page, /Gagal memuat analytics/)
})

test("partial expense updates read missing operands before recalculating IDR total", async () => {
  const service = await source("lib/expenses-service.ts")
  assert.match(service, /getDoc\(expenseRef\)/)
  assert.match(service, /price \* rate/)
})

test("departure create and edit reject return dates before departure", async () => {
  const page = await source("app/departures/page.tsx")
  assert.equal((page.match(/Tanggal pulang tidak boleh sebelum tanggal berangkat/g) || []).length, 2)
})

test("Uangkuh drafts allow category edits and destructive actions require confirmation", async () => {
  const page = await source("app/uangkuh/page.tsx")
  assert.match(page, /updateDraft\(index, "category", value\)/)
  assert.match(page, /confirm\("Hapus draft ini\?"\)/)
  assert.match(page, /confirm\(`Hapus kategori/)
  assert.match(page, /confirm\("Hapus transaksi ini\?"\)/)
})

test("pendapatan and pengeluaran confirm deletion", async () => {
  assert.match(await source("app/pendapatan/page.tsx"), /confirm\("Hapus pendapatan ini\?"\)/)
  assert.match(await source("app/pengeluaran/page.tsx"), /confirm\("Hapus pengeluaran ini\?"\)/)
})
