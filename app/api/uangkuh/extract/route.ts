import { NextResponse } from "next/server"
import pdfParse from "pdf-parse/lib/pdf-parse.js"

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])
const PROMPT = `Ekstrak mutasi rekening bank Indonesia menjadi JSON saja dengan schema {"transactions":[{"kind":"income"|"expense","amount":number,"date":"YYYY-MM-DD","category":"string","note":"string","confidence":number}]}. amount harus angka Rupiah positif. Abaikan saldo, nomor rekening, header, biaya yang tidak jelas, dan total laporan. Kredit/pemasukan = income; debit/pembayaran = expense. Jangan menebak transaksi yang tidak terbaca.`

function parseTransactions(content: string) {
  const parsed = JSON.parse(content.replace(/^```json\s*/i, "").replace(/\s*```$/, ""))
  return Array.isArray(parsed.transactions) ? parsed.transactions.filter((x: any) => x && (x.kind === "income" || x.kind === "expense") && Number.isFinite(Number(x.amount)) && Number(x.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(x.date)) : []
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
  const userContent = file.type === "application/pdf"
    ? { role: "user", content: `${PROMPT}\n\nIsi PDF mutasi bank:\n${(await pdfParse(bytes)).text.slice(0, 120000)}` }
    : { role: "user", content: [{ type: "text", text: PROMPT }, { type: "image_url", image_url: { url: `data:${file.type};base64,${bytes.toString("base64")}`, detail: "high" } }] }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ ...(model ? { model } : {}), temperature: 0, messages: [userContent] }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: payload.error?.message || "AI gagal membaca file. Pastikan PDF berisi mutasi transaksi." }, { status: 502 })
  try {
    return NextResponse.json({ transactions: parseTransactions(payload.choices?.[0]?.message?.content || "{}") })
  } catch {
    return NextResponse.json({ error: "Respons AI tidak valid. Coba lagi." }, { status: 502 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"
