import { NextResponse } from "next/server"
import pdfParse from "pdf-parse/lib/pdf-parse.js"
import { execFile } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { promisify } from "node:util"
import { authenticateAdminRequest } from "@/lib/server-auth"

const execFileAsync = promisify(execFile)

const MAX_BYTES = 10 * 1024 * 1024
const RATE_WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_PDF_TEXT_CHARS = 120000
const MAX_SCAN_PAGES = 30
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 10
const rateLimitHits = new Map<string, number[]>()

const PROMPT = `Ekstrak semua transaksi dari mutasi rekening bank apa pun (BCA, Jenius, bank lain, PDF atau screenshot). Kembalikan JSON saja dengan schema {"transactions":[{"kind":"income"|"expense","amount":number,"date":"YYYY-MM-DD","category":"string","note":"string","confidence":number}]}. Normalisasi tanggal DD/MM/YYYY, DD-MM-YYYY, atau format lain menjadi YYYY-MM-DD. Nominal Rupiah bisa memakai titik/koma; kirim sebagai angka positif tanpa pemisah. Kenali kolom debit/kredit, DB/CR, masuk/keluar; kredit/CR/masuk = income, debit/DB/keluar = expense. Abaikan saldo awal/akhir, nomor rekening, header, biaya laporan, dan total. Jangan menebak baris yang bukan transaksi.`

// ---------------------------------------------------------------------------
// Normalisasi tanggal.
//
// Format yang diterima (umum di mutasi BCA/Jenius):
//  - YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
//  - "01 Februari 2026", "01 Feb 2026", "01 Feb 26", "Feb 01, 2026"
//  - Nama bulan Indonesia (lengkap & singkatan) dan Inggris (lengkap & singkatan)
//  - Tahun 2 digit dianggap 20xx.
// Mengembalikan "" bila tidak bisa diparse ATAU tanggalnya tidak valid
// (mis. 31 Februari) supaya barisnya dihitung sebagai "terbuang", bukan
// tersimpan dengan tanggal ngawur.
// ---------------------------------------------------------------------------
function normalizeDate(value: unknown) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  const months: Record<string, string> = {
    januari: "01", jan: "01", january: "01",
    februari: "02", feb: "02", february: "02",
    maret: "03", mar: "03", march: "03",
    april: "04", apr: "04",
    mei: "05", may: "05",
    juni: "06", jun: "06", june: "06",
    juli: "07", jul: "07", july: "07",
    agustus: "08", agu: "08", august: "08", aug: "08",
    september: "09", sep: "09", sept: "09",
    oktober: "10", okt: "10", october: "10", oct: "10",
    november: "11", nov: "11",
    desember: "12", des: "12", december: "12", dec: "12",
  }
  const namedDayFirst = raw.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{2,4})$/)
  if (namedDayFirst && months[namedDayFirst[2]]) {
    return buildDate(namedDayFirst[3], months[namedDayFirst[2]], namedDayFirst[1])
  }
  const namedMonthFirst = raw.toLowerCase().match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/)
  if (namedMonthFirst && months[namedMonthFirst[1]]) {
    return buildDate(namedMonthFirst[3], months[namedMonthFirst[1]], namedMonthFirst[2])
  }
  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (match) return buildDate(match[1], match[2], match[3])
  match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/)
  if (match) return buildDate(match[3], match[2], match[1])
  return ""
}

function buildDate(yearRaw: string, monthRaw: string, dayRaw: string) {
  let year = Number(yearRaw)
  if (yearRaw.length === 2) year += 2000
  const month = Number(monthRaw)
  const day = Number(dayRaw)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return ""
  if (month < 1 || month > 12 || day < 1 || day > 31) return ""
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ""
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

// ---------------------------------------------------------------------------
// Normalisasi nominal.
//
// Format Indonesia ("1.500.000", "1.500.000,00", "Rp 75.000") dan format
// internasional ("1,500,000", "1,500,000.00") diparse ke angka yang benar.
// Aturan: pemisah TERAKHIR adalah desimal; pemisah lainnya adalah ribuan.
// Bila hanya ada satu jenis pemisah, kelompok tepat 3 digit sesudahnya
// menandakan ribuan ("50.000" -> 50000, "2.500" -> 2500), sedangkan satu
// digit desimal ("2.5") tetap desimal.
// ---------------------------------------------------------------------------
function normalizeAmount(value: unknown) {
  const raw = String(value ?? "").replace(/[^\d,.\-]/g, "").trim()
  if (!raw) return 0
  const negative = raw.startsWith("-")
  const unsigned = negative ? raw.slice(1) : raw
  let normalized: string
  if (unsigned.includes(",") && unsigned.includes(".")) {
    normalized = unsigned.lastIndexOf(",") > unsigned.lastIndexOf(".")
      ? unsigned.replace(/\./g, "").replace(",", ".")
      : unsigned.replace(/,/g, "")
  } else if (unsigned.includes(",")) {
    // Koma desimal ("1500000,00") vs koma ribuan ("1,500,000").
    normalized = /,\d{2}$/.test(unsigned)
      ? (() => { const stripped = unsigned.replace(/,/g, ""); return stripped.slice(0, -2) + "." + stripped.slice(-2) })()
      : unsigned.replace(/,/g, "")
  } else if (unsigned.includes(".")) {
    normalized = /^\d{1,3}(\.\d{3})+$/.test(unsigned) ? unsigned.replace(/\./g, "") : unsigned
  } else {
    normalized = unsigned
  }
  const amount = Number(normalized)
  if (!Number.isFinite(amount)) return 0
  return Math.abs(amount)
}

const INCOME_WORDS = ["income", "credit", "kredit", "masuk"]
const INCOME_CODES = new Set(["cr", "in"])
const EXPENSE_WORDS = ["expense", "debit", "keluar"]
const EXPENSE_CODES = new Set(["db", "out"])

function normalizeKind(value: unknown) {
  const raw = String(value ?? "").toLowerCase()
  if (INCOME_WORDS.some((w) => raw.includes(w))) return "income"
  if (EXPENSE_WORDS.some((w) => raw.includes(w))) return "expense"
  const tokens = raw.split(/[^a-z]+/).filter(Boolean)
  if (tokens.some((t) => INCOME_CODES.has(t))) return "income"
  if (tokens.some((t) => EXPENSE_CODES.has(t))) return "expense"
  return "expense"
}

// Mengembalikan transaksi valid + jumlah baris yang terbuang (nominal tidak
// valid atau tanggal tidak dikenali) supaya UI bisa melaporkannya, bukan
// menghilangkan baris diam-diam.
function parseTransactions(content: string) {
  const cleaned = String(content ?? "").replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  if (!cleaned) return { transactions: [], dropped: 0 }
  let parsed: any
  try { parsed = JSON.parse(cleaned) } catch {
    const start = Math.min(...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((x) => x >= 0))
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"))
    if (start < 0 || end <= start) return { transactions: [], dropped: 0 }
    try { parsed = JSON.parse(cleaned.slice(start, end + 1)) } catch { return { transactions: [], dropped: 0 } }
  }
  const rows = Array.isArray(parsed) ? parsed : parsed.transactions || parsed.data || parsed.items || []
  if (!Array.isArray(rows)) return { transactions: [], dropped: 0 }
  let dropped = 0
  const transactions = rows.map((x: any) => {
    const amount = normalizeAmount(x?.amount ?? x?.nominal ?? x?.value)
    const date = normalizeDate(x?.date ?? x?.tanggal)
    if (!(amount > 0) || !date) {
      dropped += 1
      return null
    }
    return {
      kind: normalizeKind(x?.kind ?? x?.type ?? x?.debitCredit ?? ""),
      amount,
      date,
      category: String(x?.category ?? "Lainnya"),
      note: String(x?.note ?? x?.description ?? x?.merchant ?? "").trim(),
      confidence: Number(x?.confidence) || 0.5,
    }
  }).filter(Boolean)
  return { transactions, dropped }
}

async function renderPdfPages(bytes: Buffer, pageCount: number) {
  const totalPages = Math.max(1, pageCount)
  const renderCount = Math.min(totalPages, MAX_SCAN_PAGES)
  const dir = await mkdtemp(`${tmpdir()}/uangkuh-pdf-`)
  const input = `${dir}/input.pdf`
  const prefix = `${dir}/page`
  await writeFile(input, bytes)
  try {
    await execFileAsync("pdftoppm", ["-jpeg", "-r", "150", "-f", "1", "-l", String(renderCount), input, prefix], { timeout: 45000 })
    const pages = []
    for (let page = 1; page <= renderCount; page++) {
      try { pages.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${(await readFile(`${prefix}-${page}.jpg`)).toString("base64")}`, detail: "high" } }) } catch { /* page unavailable */ }
    }
    return { pages, totalPages, renderCount }
  } catch (error) {
    throw new Error(`PDF scan tidak bisa dirender: ${error instanceof Error ? error.message : "renderer error"}`)
  } finally { await rm(dir, { recursive: true, force: true }) }
}

// Verifikasi Firebase ID Token lewat Identity Toolkit (tanpa Admin SDK).
// Mengembalikan uid bila token valid, null bila tidak.
async function verifyFirebaseToken(token: string, apiKey: string) {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return null
    const payload = await response.json().catch(() => ({}))
    const uid = payload?.users?.[0]?.localId
    return typeof uid === "string" && uid ? uid : null
  } catch {
    return null
  }
}

function checkRateLimit(uid: string) {
  const now = Date.now()
  const hits = (rateLimitHits.get(uid) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  hits.push(now)
  rateLimitHits.set(uid, hits)
  return hits.length <= RATE_LIMIT_MAX
}

export async function POST(request: Request) {
  const admin = await authenticateAdminRequest(request)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const now = Date.now()
  const current = attempts.get(admin.sub)
  if (!current || current.resetAt <= now) attempts.set(admin.sub, { count: 1, resetAt: now + RATE_WINDOW_MS })
  else if (current.count >= MAX_REQUESTS) return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
  else current.count++
  const declaredSize = Number(request.headers.get("content-length") || 0)
  if (declaredSize > MAX_BYTES + 1024 * 1024) return NextResponse.json({ error: "Ukuran request terlalu besar." }, { status: 413 })
  const key = process.env.AI_API_KEY
  if (!key) return NextResponse.json({ error: "AI belum dikonfigurasi. Tambahkan AI_API_KEY di environment production." }, { status: 503 })
  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!firebaseApiKey) return NextResponse.json({ error: "Autentikasi belum dikonfigurasi." }, { status: 503 })

  // Endpoint ini wajib dipanggil pengguna yang login (bukan publik):
  // token Firebase ID dikirim lewat header Authorization.
  const authHeader = request.headers.get("authorization") || ""
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : ""
  const uid = idToken ? await verifyFirebaseToken(idToken, firebaseApiKey) : null
  if (!uid) return NextResponse.json({ error: "Silakan login ulang untuk memakai Import AI." }, { status: 401 })
  if (!checkRateLimit(uid)) return NextResponse.json({ error: "Terlalu banyak permintaan Import AI. Coba lagi semenit lagi." }, { status: 429 })

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib diupload." }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Format file harus JPG, PNG, WebP, atau PDF." }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 10 MB." }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())
  const baseUrl = (process.env.AI_BASE_URL || "https://llmdupoin.gorillaworkout.id/v1").replace(/\/$/, "")
  const model = process.env.AI_MODEL || "cx/gpt-5.6-sol"
  const warnings: string[] = []
  let userContent: { role: "user"; content: string | Array<Record<string, unknown>> }
  try {
    if (file.type === "application/pdf") {
      const parsed = await pdfParse(bytes)
      const pdfText = parsed.text.trim()
      if (pdfText) {
        if (pdfText.length > MAX_PDF_TEXT_CHARS) warnings.push("Teks mutasi sangat panjang dan dipotong — transaksi di akhir dokumen mungkin tidak terbaca.")
        userContent = { role: "user", content: `${PROMPT}\n\nBaca seluruh text mutasi berikut. Setiap baris transaksi wajib dipertahankan:\n${pdfText.slice(0, MAX_PDF_TEXT_CHARS)}` }
      } else {
        const { pages, totalPages, renderCount } = await renderPdfPages(bytes, parsed.numpages || 1)
        if (totalPages > renderCount) warnings.push(`PDF ini ${totalPages} halaman; hanya ${renderCount} halaman pertama yang dibaca.`)
        if (!pages.length) return NextResponse.json({ error: "PDF scan tidak bisa dirender." }, { status: 422 })
        userContent = { role: "user", content: [{ type: "text", text: `${PROMPT}\nPDF ini scan. Baca semua halaman gambar.` }, ...pages] }
      }
    } else {
      userContent = { role: "user", content: [{ type: "text", text: PROMPT }, { type: "image_url", image_url: { url: `data:${file.type};base64,${bytes.toString("base64")}`, detail: "high" } }] }
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "File tidak bisa diproses." }, { status: 422 })
  }
  let response: Response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ ...(model ? { model } : {}), temperature: 0, messages: [userContent] }),
      signal: AbortSignal.timeout(55000),
    })
  } catch {
    return NextResponse.json({ error: "AI tidak merespons tepat waktu. Coba lagi." }, { status: 502 })
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: payload.error?.message || "AI gagal membaca file. Pastikan PDF berisi mutasi transaksi." }, { status: 502 })
  try {
    const content = payload.choices?.[0]?.message?.content || payload.output_text || payload.choices?.[0]?.text || ""
    const { transactions, dropped } = parseTransactions(typeof content === "string" ? content : JSON.stringify(content))
    if (dropped > 0) warnings.push(`${dropped} baris tidak dikenali (nominal/tanggal tidak valid) dan dilewati — periksa mutasi aslinya.`)
    return NextResponse.json({ transactions, dropped, warnings, warning: transactions.length ? (warnings.length ? warnings.join(" ") : undefined) : "AI tidak menemukan baris transaksi yang valid." })
  } catch {
    return NextResponse.json({ error: "Respons AI tidak valid. Coba lagi." }, { status: 502 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"
