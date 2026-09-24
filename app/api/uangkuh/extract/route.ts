import { NextResponse } from "next/server"

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"])

export async function POST(request: Request) {
  const key = process.env.AI_API_KEY
  if (!key) return NextResponse.json({ error: "AI belum dikonfigurasi. Tambahkan AI_API_KEY di environment production." }, { status: 503 })
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib diupload." }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Format file harus JPG, PNG, WebP, atau PDF." }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Ukuran file maksimal 10 MB." }, { status: 400 })
  if (file.type === "application/pdf") return NextResponse.json({ error: "PDF belum didukung. Upload screenshot JPG/PNG/WebP." }, { status: 415 })

  const bytes = Buffer.from(await file.arrayBuffer())
  const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`
  const baseUrl = (process.env.AI_BASE_URL || "https://llmdupoin.gorillaworkout.id/v1").replace(/\/$/, "")
  const model = process.env.AI_MODEL || "pecut-ai"
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: [
        { type: "text", text: `Baca screenshot mutasi bank Indonesia. Kembalikan JSON saja dengan schema {"transactions":[{"kind":"income"|"expense","amount":number,"date":"YYYY-MM-DD","category":"string","note":"string","confidence":number}]}. amount harus angka Rupiah positif. Abaikan saldo, nomor rekening, header, biaya yang tidak jelas. Jika kredit/pemasukan gunakan income; debit/pembayaran gunakan expense. Jangan menebak: transaksi yang tidak terbaca jangan dimasukkan.` },
        { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
      ] }],
    }),
  })
  if (!response.ok) return NextResponse.json({ error: "AI gagal membaca file. Coba screenshot yang lebih jelas." }, { status: 502 })
  const payload = await response.json()
  try {
    const parsed = JSON.parse(payload.choices?.[0]?.message?.content || "{}")
    const transactions = Array.isArray(parsed.transactions) ? parsed.transactions.filter((x: any) => x && (x.kind === "income" || x.kind === "expense") && Number.isFinite(Number(x.amount)) && Number(x.amount) > 0 && /^\d{4}-\d{2}-\d{2}$/.test(x.date)) : []
    return NextResponse.json({ transactions })
  } catch {
    return NextResponse.json({ error: "Respons AI tidak valid. Coba lagi." }, { status: 502 })
  }
}

export const runtime = "nodejs"
export const maxDuration = 60
