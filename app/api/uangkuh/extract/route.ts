import { NextResponse } from "next/server"
import pdfParse from "pdf-parse/lib/pdf-parse.js"

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])
const PROMPT = `Ekstrak semua transaksi dari mutasi rekening bank apa pun (BCA, Jenius, bank lain, PDF atau screenshot). Kembalikan JSON saja dengan schema {"transactions":[{"kind":"income"|"expense","amount":number,"date":"YYYY-MM-DD","category":"string","note":"string","confidence":number}]}. Normalisasi tanggal DD/MM/YYYY, DD-MM-YYYY, atau format lain menjadi YYYY-MM-DD. Nominal Rupiah bisa memakai titik/koma; kirim sebagai angka positif tanpa pemisah. Kenali kolom debit/kredit, DB/CR, masuk/keluar; kredit/CR/masuk = income, debit/DB/keluar = expense. Abaikan saldo awal/akhir, nomor rekening, header, biaya laporan, dan total. Jangan menebak baris yang bukan transaksi.`

function normalizeDate(value: unknown) {
  const raw = String(value ?? "").trim()
  const months: Record<string, string> = { januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06", juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12" }
  const named = raw.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/)
  if (named && months[named[2]]) return `${named[3]}-${months[named[2]]}-${named[1].padStart(2, "0")}`
  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (!match) match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)?.slice(1).reverse() as RegExpMatchArray | null
  if (!match) return ""
  const [, year, month, day] = match
  const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : ""
}

function normalizeAmount(value: unknown) {
  const raw = String(value ?? "").replace(/[^\d,.-]/g, "").trim()
  if (!raw) return 0
  const normalized = raw.includes(",") && raw.includes(".")
    ? raw.lastIndexOf(",") > raw.lastIndexOf(".") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "")
    : raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "")
  return Math.abs(Number(normalized)) || 0
}

function parseTransactions(content: string) {
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  let parsed: any
  try { parsed = JSON.parse(cleaned) } catch {
    const start = Math.min(...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((x) => x >= 0))
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"))
    if (start < 0 || end <= start) return []
    try { parsed = JSON.parse(cleaned.slice(start, end + 1)) } catch { return [] }
  }
  const rows = Array.isArray(parsed) ? parsed : parsed.transactions || parsed.data || parsed.items || []
  if (!Array.isArray(rows)) return []
  return rows.map((x: any) => {
    const rawKind = String(x?.kind ?? x?.type ?? x?.debitCredit ?? "").toLowerCase()
    const kind = rawKind.includes("income") || rawKind.includes("credit") || rawKind.includes("kredit") || rawKind.includes("masuk") ? "income" : "expense"
    return { kind, amount: normalizeAmount(x?.amount ?? x?.nominal ?? x?.value), date: normalizeDate(x?.date ?? x?.tanggal), category: String(x?.category ?? "Lainnya"), note: String(x?.note ?? x?.description ?? x?.merchant ?? "").trim(), confidence: Number(x?.confidence) || 0.5 }
  }).filter((x: any) => x.amount > 0 && x.date)
}

export async function POST(request: Request) {
  const key = process.env.AI_API_KEY
  if (!key) return NextResponse.json({ error: "AI belum dikonfigurasi. Tambahkan AI_API_KEY di environment production." }, { status: 503 })
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib diupload." }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Format file harus JPG, PNG, WebP, atau PDF." }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 10 MB." }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())
  const baseUrl = (process.env.AI_BASE_URL || "https://llmdupoin.gorillaworkout.id/v1").replace(/\/$/, "")
  const model = process.env.AI_MODEL || "cx/gpt-5.6-sol"
  const pdfText = file.type === "application/pdf" ? (await pdfParse(bytes)).text.trim() : ""
  if (file.type === "application/pdf" && !pdfText) return NextResponse.json({ error: "PDF ini berupa scan/gambar tanpa text layer. Simpan ulang sebagai PDF searchable atau upload screenshot tiap halaman." }, { status: 422 })
  const userContent = file.type === "application/pdf"
    ? { role: "user", content: `${PROMPT}\n\nBaca seluruh text mutasi berikut. Setiap baris transaksi wajib dipertahankan:\n${pdfText.slice(0, 120000)}` }
    : { role: "user", content: [{ type: "text", text: PROMPT }, { type: "image_url", image_url: { url: `data:${file.type};base64,${bytes.toString("base64")}`, detail: "high" } }] }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ ...(model ? { model } : {}), temperature: 0, messages: [userContent] }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: payload.error?.message || "AI gagal membaca file. Pastikan PDF berisi mutasi transaksi." }, { status: 502 })
  try {
    const content = payload.choices?.[0]?.message?.content || payload.output_text || payload.choices?.[0]?.text || ""
    const transactions = parseTransactions(typeof content === "string" ? content : JSON.stringify(content))
    return NextResponse.json({ transactions, warning: transactions.length ? undefined : "AI tidak menemukan baris transaksi yang valid." })
  } catch {
    return NextResponse.json({ error: "Respons AI tidak valid. Coba lagi." }, { status: 502 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"
