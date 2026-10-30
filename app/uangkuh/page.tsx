"use client"

import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore"
import { ArrowDownLeft, ArrowUpRight, Bot, Copy, Pencil, Plus, Trash2, Upload, WalletCards, X, ArrowLeftRight } from "lucide-react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"

type Kind = "income" | "expense" | "transfer"
type Transaction = { id: string; kind: Kind; amount: number; date: string; category: string; note: string; wallet?: string; walletTo?: string }
type Category = { id: string; name: string; group: string }
type Draft = { kind: Kind; amount: number; date: string; category: string; note: string; confidence?: number; wallet?: string; walletTo?: string }

const DEFAULT_CATEGORIES = [
  ["Keluarga", "Keluarga"], ["Kendaraan", "Kendaraan"], ["Makan", "Makan"],
  ["Kesehatan & Proteksi", "Kesehatan & Proteksi"], ["Tabungan", "Tabungan"],
  ["Belanja", "Belanja"], ["Tagihan", "Tagihan"], ["Pendapatan", "Pendapatan"], ["Lainnya", "Lainnya"],
] as const

// Tebak kategori dari isi pengeluaran (catatan/merchant), BUKAN dari label AI.
// Aturan merchant spesifik menang atas kata kunci umum; hasil selalu nama dari
// daftar kategori user, fallback "Lainnya". Tebakan salah dibetulkan user di draf.
const GUESS_RULES: [string, string[]][] = [
  ["Tagihan", ["pln", "listrik", "pdam", "internet", "wifi", "pulsa", "paket data", "netflix", "spotify", "langganan"]],
  ["Kesehatan & Proteksi", ["apotek", "klinik", "rumah sakit", "dokter", "obat", "vitamin", "asuransi", "bpjs", "puskesmas"]],
  ["Kendaraan", ["pertamina", "shell", "bensin", "parkir", "tol", "ojek", "grab", "gojek", "taksi", "bengkel", "kereta", "busway", "transjakarta"]],
  ["Makan", ["warung", "rm ", "rumah makan", "resto", "restoran", "cafe", "kopi", "jajan", "kuliner", "food", "bakso", "soto", "ayam", "geprek", "seblak", "martabak", "makanan", "sarapan"]],
  ["Belanja", ["indomaret", "alfamart", "alfamidi", "market", "supermarket", "minimarket", "mall", "toko", "shop", "store", "shopee", "tokopedia", "belanja"]],
  ["Tabungan", ["tabungan", "deposito", "reksa", "investasi", "nabung"]],
  ["Pendapatan", ["gaji", "honor", "bonus", "thr", "dividen", "pendapatan", "upah"]],
  ["Keluarga", ["sekolah", "spp", "les", "orang tua"]],
]

const isKasLatihanNote = (note: string) => {
  const text = (note || "").toLowerCase()
  return text.includes("warung cr") || text.includes("warung crown")
}

const guessCategory = (note: string, knownNames: string[], kasLatihanReady: boolean): string => {
  if (isKasLatihanNote(note)) return kasLatihanReady ? "Kas Latihan" : "Lainnya"
  const text = (note || "").toLowerCase()
  for (const [name, keywords] of GUESS_RULES) {
    if (!knownNames.includes(name)) continue
    if (keywords.some((keyword) => text.includes(keyword))) return name
  }
  return "Lainnya"
}

const WALLETS = ["BCA", "Jenius", "Tunai", "E-Wallet"] as const

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
const digits = (value: string) => value.replace(/\D/g, "")
// Parser CSV kecil tanpa dependensi (mendukung field ber-tanda kutip,
// koma, dan baris baru di dalam kutip), supaya file hasil olahan Muse
// bisa diimpor langsung dari perangkat pengguna.
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  const pushField = () => { row.push(field); field = "" }
  const pushRow = () => { pushField(); rows.push(row); row = [] }
  const clean = text.replace(/^\uFEFF/, "")
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]
    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++ } else { quoted = false }
      } else { field += ch }
    } else if (ch === '"') {
      if (field === "") quoted = true
      else field += ch
    } else if (ch === ",") {
      pushField()
    } else if (ch === "\r") {
      // diabaikan, \n yang menutup baris
    } else if (ch === "\n") {
      pushRow()
    } else {
      field += ch
    }
  }
  if (field !== "" || row.length > 0) pushRow()
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""))
}
const parseCsvAmount = (raw: string): number => {
  // "Rp200.000", "200.000,00", dan "200000" semuanya dibaca sebagai 200000.
  const cleaned = raw.replace(/rp/gi, "").trim().replace(/,00$/, "").replace(/\.00$/, "")
  return Number(digits(cleaned))
}
const parseCsvDate = (raw: string): string => {
  const value = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = value.split("/")
  if (parts.length === 3) {
    const day = parts[0] || "", month = parts[1] || "", year = parts[2] || ""
    if (day && month && year) return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }
  return value
}
// Tanggal lokal (WIB) — toISOString() memakai UTC sehingga input lewat
// tengah malam WIB default-nya mundur sehari.
const localToday = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function UangkuhContent() {
  const { firebaseUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [kind, setKind] = useState<Kind>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Keluarga")
  const [date, setDate] = useState(localToday)
  const [note, setNote] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newGroup, setNewGroup] = useState("Lainnya")
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [draftSource, setDraftSource] = useState<"ai" | "csv">("ai")
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState("")
  const [importWarnings, setImportWarnings] = useState<string[]>([])
  const [skippedCount, setSkippedCount] = useState(0)
  const [formError, setFormError] = useState("")
  const [monthFilter, setMonthFilter] = useState(() => localToday().slice(0, 7))
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [editKind, setEditKind] = useState<Kind>("expense")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("Lainnya")
  const [editDate, setEditDate] = useState("")
  const [editNote, setEditNote] = useState("")
  const [wallet, setWallet] = useState("")
  const [walletTo, setWalletTo] = useState("")
  const [editWallet, setEditWallet] = useState("")
  const [editWalletTo, setEditWalletTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("Semua")
  const [filterWallet, setFilterWallet] = useState("Semua")
  const [listLimit, setListLimit] = useState(50)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [lastDeleted, setLastDeleted] = useState<Omit<Transaction, "id">[] | null>(null)

  const extractFile = async (file: File) => {
    setExtracting(true); setExtractError(""); setImportWarnings([]); setSkippedCount(0); setCsvErrors([])
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : ""
      const form = new FormData(); form.append("file", file)
      const response = await fetch("/api/uangkuh/extract", { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "AI gagal membaca file.")
      const rawDrafts = (result.transactions || []) as Draft[]
      // Tebak kategori dari isi pengeluaran, bukan dari label AI. Kategori
      // "Kas Latihan" dibuat otomatis bila ada draf kas latihan dan kategorinya
      // belum ada (sama seperti tombol Kelola kategori).
      const knownNames = categories.length ? categories.map((c) => c.name) : DEFAULT_CATEGORIES.map(([name]) => name)
      let kasLatihanReady = knownNames.includes("Kas Latihan")
      if (rawDrafts.some((t) => isKasLatihanNote(t.note)) && !kasLatihanReady && firebaseUser && db) {
        try {
          const ref = await addDoc(collection(db, "financeUsers", firebaseUser.uid, "categories"), { name: "Kas Latihan", group: "Lainnya", createdAt: serverTimestamp() })
          setCategories((items) => [...items, { id: ref.id, name: "Kas Latihan", group: "Lainnya" }])
          kasLatihanReady = true
        } catch { /* gagal dibuat: kas latihan jatuh ke Lainnya, bukan Makan */ }
      }
      setDrafts(rawDrafts.map((t) => ({ ...t, category: guessCategory(t.note, knownNames, kasLatihanReady) })))
      setDraftSource("ai")
      setImportWarnings(result.warnings || [])
      if (!result.transactions?.length) setExtractError("Tidak ada transaksi yang terbaca. Coba screenshot lebih jelas.")
    } catch (error) { setExtractError(error instanceof Error ? error.message : "AI gagal membaca file.")
    } finally { setExtracting(false) }
  }

  const updateDraft = (index: number, field: keyof Draft, value: string) => setDrafts((items) => items.map((item, i) => i === index ? { ...item, [field]: field === "amount" ? Number(digits(value)) : value } : item))

  const saveDrafts = async () => {
    if (!firebaseUser || !db || !drafts.length) return
    setSaving(true)
    try {
      // Dedup: lewati draft yang sudah ada (tanggal+jenis+nominal+catatan
      // sama) dan duplikat di dalam draft itu sendiri, supaya upload ulang
      // mutasi sebulan yang sama tidak menggandakan transaksi.
      const existing = new Set(transactions.map((t) => `${t.date}|${t.kind}|${t.amount}|${t.note}`))
      const seen = new Set<string>()
      const fresh: Draft[] = []
      let skipped = 0
      for (const item of drafts) {
        const key = `${item.date}|${item.kind}|${item.amount}|${item.note}`
        if (existing.has(key) || seen.has(key)) { skipped += 1; continue }
        seen.add(key); fresh.push(item)
      }
      if (fresh.length) {
        // Batch (maks 400 dokumen per batch) supaya impor ratusan baris
        // dari CSV tidak membanjiri Firestore dengan ratusan request.
        const ref = collection(db, "financeUsers", firebaseUser.uid, "transactions")
        const source = draftSource === "csv" ? "csv" : "ai-screenshot"
        for (let i = 0; i < fresh.length; i += 400) {
          const batch = writeBatch(db)
          for (const item of fresh.slice(i, i + 400)) batch.set(doc(ref), { ...item, source, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
          await batch.commit()
        }
      }
      setSkippedCount(skipped)
      setDrafts([])
    } finally { setSaving(false) }
  }

  const clearDraft = (index: number) => {
    if (confirm("Hapus draft ini?")) setDrafts((items) => items.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!firebaseUser || !db) return
    const transactionRef = collection(db, "financeUsers", firebaseUser.uid, "transactions")
    const categoryRef = collection(db, "financeUsers", firebaseUser.uid, "categories")
    const unsubscribeTransactions = onSnapshot(query(transactionRef, orderBy("date", "desc"), limit(500)), (snapshot) => {
      setTransactions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Transaction)))
    }, (error) => {
      console.error("Uangkuh transaction listener failed:", error)
    })
    const unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Category))
      // Gabungkan kategori bawaan + kategori Firestore. Sebelumnya, begitu
      // ada satu kategori di Firestore, kategori bawaan lenyap dari pilihan.
      const merged: Category[] = [...DEFAULT_CATEGORIES.map(([name, group], index) => ({ id: `default-${index}`, name, group }))]
      for (const item of items) {
        if (!merged.some((m) => m.name.toLowerCase() === item.name.toLowerCase())) merged.push(item)
      }
      setCategories(merged)
      if (!merged.some((item) => item.name === category)) setCategory(merged[0]?.name || "Lainnya")
    })
    return () => { unsubscribeTransactions(); unsubscribeCategories() }
  }, [firebaseUser])

  const totals = useMemo(() => transactions.reduce((sum, item) => sum + (item.kind === "income" ? item.amount : item.kind === "expense" ? -item.amount : 0), 0), [transactions])
  // Rekap per bulan: transaksi impor bulanan (BCA/Jenius) kini punya
  // ringkasan bulanannya sendiri, bukan cuma total seumur hidup.
  const monthTransactions = useMemo(() => transactions.filter((t) => t.date.startsWith(monthFilter)), [transactions, monthFilter])
  const monthTotal = useMemo(() => monthTransactions.reduce((sum, item) => sum + (item.kind === "income" ? item.amount : item.kind === "expense" ? -item.amount : 0), 0), [monthTransactions])
  const monthByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of monthTransactions) {
      if (t.kind === "transfer") continue
      map.set(t.category, (map.get(t.category) || 0) + (t.kind === "income" ? t.amount : -t.amount))
    }
    return [...map.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  }, [monthTransactions])
  const monthTransferTotal = useMemo(() => monthTransactions.filter((t) => t.kind === "transfer").reduce((sum, item) => sum + item.amount, 0), [monthTransactions])
  const visibleTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return transactions.filter((t) => {
      if (q && !(t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))) return false
      if (filterCategory !== "Semua" && t.category !== filterCategory) return false
      if (filterWallet === "Tanpa dompet" && (t.wallet || t.walletTo)) return false
      if (filterWallet !== "Semua" && filterWallet !== "Tanpa dompet" && t.wallet !== filterWallet && t.walletTo !== filterWallet) return false
      return true
    })
  }, [transactions, searchQuery, filterCategory, filterWallet])
  const trend = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      months.push({ key, label: d.toLocaleDateString("id-ID", { month: "short" }), income: 0, expense: 0 })
    }
    for (const t of transactions) {
      const m = months.find((x) => x.key === t.date.slice(0, 7))
      if (!m) continue
      if (t.kind === "income") m.income += t.amount
      else if (t.kind === "expense") m.expense += t.amount
    }
    return months
  }, [transactions])
  const trendMax = Math.max(1, ...trend.flatMap((m) => [m.income, m.expense]))
  const categoryOptions = categories.length ? categories : DEFAULT_CATEGORIES.map(([name, group], index) => ({ id: String(index), name, group }))

  const importCsvFile = async (file: File) => {
    setCsvErrors([]); setImportWarnings([]); setSkippedCount(0); setExtractError("")
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      if (rows.length < 2) { setCsvErrors(["File CSV kosong atau hanya berisi header."]); return }
      const header = rows[0].map((h) => h.trim().toLowerCase())
      const col = (names: string[]): number => {
        for (const name of names) {
          const index = header.indexOf(name)
          if (index >= 0) return index
        }
        return -1
      }
      const dateCol = col(["tanggal", "date"])
      const kindCol = col(["jenis", "kind", "type"])
      const amountCol = col(["nominal", "amount"])
      const categoryCol = col(["kategori", "category"])
      const noteCol = col(["catatan", "note", "keterangan"])
      const walletCol = col(["dompet", "wallet"])
      const walletToCol = col(["dompet_tujuan", "wallet_to", "tujuan"])
      if (dateCol < 0 || kindCol < 0 || amountCol < 0) {
        setCsvErrors(["Header tidak dikenali. Format: tanggal,jenis,nominal,kategori,catatan."])
        return
      }
      const knownCategories = categoryOptions.map((c) => c.name)
      const valid: Draft[] = []
      const errors: string[] = []
      const warnings: string[] = []
      const unknownCategories = new Set<string>()
      rows.slice(1).forEach((row, i) => {
        const line = i + 2
        const rawKind = (row[kindCol] || "").trim().toLowerCase()
        const kind: Kind | null = ["pengeluaran", "expense", "keluar", "db"].includes(rawKind) ? "expense" : ["pemasukan", "income", "masuk", "cr"].includes(rawKind) ? "income" : ["transfer", "pindah"].includes(rawKind) ? "transfer" : null
        const date = parseCsvDate(row[dateCol] || "")
        const amount = parseCsvAmount(row[amountCol] || "")
        if (!kind) { errors.push(`Baris ${line}: jenis tidak dikenali ("${row[kindCol]}").`); return }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { errors.push(`Baris ${line}: tanggal tidak valid ("${row[dateCol]}").`); return }
        if (!amount || amount <= 0) { errors.push(`Baris ${line}: nominal tidak valid ("${row[amountCol]}").`); return }
        let category = (categoryCol >= 0 ? (row[categoryCol] || "").trim() : "") || "Lainnya"
        const matched = knownCategories.find((name) => name.toLowerCase() === category.toLowerCase())
        if (matched) category = matched
        else {
          if (!unknownCategories.has(category)) { unknownCategories.add(category); warnings.push(`Kategori "${category}" tidak dikenal, diubah ke Lainnya.`) }
          category = "Lainnya"
        }
        valid.push({ kind, amount, date, category, note: (noteCol >= 0 ? (row[noteCol] || "").trim() : ""), wallet: (walletCol >= 0 ? (row[walletCol] || "").trim() : ""), walletTo: (walletToCol >= 0 ? (row[walletToCol] || "").trim() : "") })
      })
      setCsvErrors(errors)
      setImportWarnings(warnings)
      setDrafts(valid)
      setDraftSource("csv")
      if (!valid.length && !errors.length) setCsvErrors(["Tidak ada baris yang bisa diimpor."])
    } catch {
      setCsvErrors(["File CSV gagal dibaca. Pastikan formatnya tanggal,jenis,nominal,kategori,catatan."])
    }
  }

  const exportCsv = () => {
    const escape = (value: string) => /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
    const header = "tanggal,jenis,nominal,kategori,dompet,dompet_tujuan,catatan"
    const lines = visibleTransactions.map((t) => [t.date, t.kind === "income" ? "pemasukan" : t.kind === "expense" ? "pengeluaran" : "transfer", String(t.amount), t.category, t.wallet || "", t.walletTo || "", t.note].map(escape).join(","))
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `uangkuh-${localToday()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const duplicate = async (item: Transaction) => {
    if (!firebaseUser || !db) return
    const { id: _dupId, ...rest } = item
    await addDoc(collection(db, "financeUsers", firebaseUser.uid, "transactions"), { ...rest, date: localToday(), source: "duplicate", createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }

  const removeSelected = async () => {
    if (!firebaseUser || !db || !selectedIds.length) return
    if (!confirm(`Hapus ${selectedIds.length} transaksi terpilih?`)) return
    const items = transactions.filter((t) => selectedIds.includes(t.id))
    const batch = writeBatch(db)
    for (const item of items) batch.delete(doc(db, "financeUsers", firebaseUser.uid, "transactions", item.id))
    await batch.commit()
    setLastDeleted(items.map((item) => {
      const { id: _bulkId, ...rest } = item
      return rest
    }))
    setSelectedIds([])
  }

  const undoDelete = async () => {
    if (!firebaseUser || !db || !lastDeleted) return
    const batch = writeBatch(db)
    const ref = collection(db, "financeUsers", firebaseUser.uid, "transactions")
    for (const item of lastDeleted) batch.set(doc(ref), { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    await batch.commit()
    setLastDeleted(null)
  }

  const save = async () => {
    if (!firebaseUser || !db || !amount || Number(amount) <= 0) {
      setFormError("Nominal harus lebih dari 0.")
      return
    }
    setFormError("")
    setSaving(true)
    try {
      await addDoc(collection(db, "financeUsers", firebaseUser.uid, "transactions"), { kind, amount: Number(amount), category, date, note: note.trim(), wallet, walletTo: kind === "transfer" ? walletTo : "", source: "manual", createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      setAmount(""); setNote(""); setWallet(""); setWalletTo("")
    } finally { setSaving(false) }
  }

  const startEdit = (item: Transaction) => {
    setEditing(item)
    setEditKind(item.kind); setEditAmount(String(item.amount)); setEditCategory(item.category); setEditDate(item.date); setEditNote(item.note); setEditWallet(item.wallet || ""); setEditWalletTo(item.walletTo || "")
  }

  const saveEdit = async () => {
    if (!firebaseUser || !db || !editing || !editAmount || Number(editAmount) <= 0) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "financeUsers", firebaseUser.uid, "transactions", editing.id), { kind: editKind, amount: Number(editAmount), category: editCategory, date: editDate, note: editNote.trim(), wallet: editWallet, walletTo: editKind === "transfer" ? editWalletTo : "", updatedAt: serverTimestamp() })
      setEditing(null)
    } finally { setSaving(false) }
  }

  const addCategory = async () => {
    const name = newCategory.trim()
    if (!firebaseUser || !db || !name || categoryOptions.some((item) => item.name.toLowerCase() === name.toLowerCase())) return
    const ref = await addDoc(collection(db, "financeUsers", firebaseUser.uid, "categories"), { name, group: newGroup.trim() || "Lainnya", createdAt: serverTimestamp() })
    setCategory(name); setNewCategory(""); setCategories((items) => [...items, { id: ref.id, name, group: newGroup.trim() || "Lainnya" }])
  }

  const removeCategory = async (item: Category) => {
    if (!firebaseUser || !db || DEFAULT_CATEGORIES.some(([name]) => name === item.name)) return
    if (!confirm(`Hapus kategori ${item.name}?`)) return
    await deleteDoc(doc(db, "financeUsers", firebaseUser.uid, "categories", item.id))
    if (category === item.name) setCategory("Lainnya")
  }

  const remove = async (id: string) => {
    if (!firebaseUser || !db) return
    const item = transactions.find((t) => t.id === id)
    if (!item) return
    if (!confirm("Hapus transaksi ini?")) return
    const { id: _removedId, ...rest } = item
    await deleteDoc(doc(db, "financeUsers", firebaseUser.uid, "transactions", id))
    setSelectedIds((ids) => ids.filter((x) => x !== id))
    setLastDeleted([rest])
  }

  return <div className="flex min-h-[100dvh] bg-[#f7f8f4] text-[#183b36]"><Sidebar /><main className="min-w-0 flex-1 overflow-auto"><MobileHeader title="Uangkuh" /><div className="mx-auto max-w-6xl space-y-5 px-3 py-5 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold tracking-wide text-[#4f9d69]">UANGKUH</p><h1 className="text-3xl font-bold tracking-tight">Biar uang nggak bikin mumet.</h1><p className="mt-1 text-sm text-[#55736c]">Catat, pahami, tenang.</p></div><div className="flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center rounded-md bg-[#183b36] px-4 py-2 text-sm font-medium text-white hover:bg-[#24574e]"> <Bot className="mr-2 h-4 w-4" /> {extracting ? "Membaca…" : "Import dengan AI"}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={extracting} onChange={(e) => { const file = e.target.files?.[0]; if (file) void extractFile(file); e.currentTarget.value = "" }} /></label><label className="inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-[#183b36] ring-1 ring-inset ring-[#183b36] hover:bg-[#edf5ef]" title="Format: tanggal,jenis,nominal,kategori,catatan"> <Upload className="mr-2 h-4 w-4" /> Import CSV<input className="hidden" type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) void importCsvFile(file); e.currentTarget.value = "" }} /></label></div></header>
    {extractError && <div className="rounded-xl border border-[#f0c5bb] bg-[#fff4f1] p-4 text-sm text-[#9d4938]">{extractError}</div>}
    {importWarnings.length > 0 && <div className="rounded-xl border border-[#e8d9a8] bg-[#fffbe8] p-4 text-sm text-[#7a5b12]">{importWarnings.map((w, i) => <p key={i}>{w}</p>)}</div>}
    {csvErrors.length > 0 && <div className="rounded-xl border border-[#f0c5bb] bg-[#fff4f1] p-4 text-sm text-[#9d4938]"><p className="font-semibold">Beberapa baris CSV dilewati:</p>{csvErrors.slice(0, 20).map((w, i) => <p key={i}>{w}</p>)}{csvErrors.length > 20 && <p>…dan {csvErrors.length - 20} baris lainnya.</p>}</div>}
    {skippedCount > 0 && <div className="rounded-xl border border-[#dce9df] bg-[#edf5ef] p-4 text-sm text-[#315f50]">{skippedCount} transaksi duplikat dilewati (sudah pernah diimpor).</div>}
    {drafts.length > 0 && <Card className="border-[#d8d0fa] bg-[#fbfaff] shadow-sm"><CardHeader className="space-y-1 pb-3"><CardTitle className="text-lg">Draft dari {draftSource === "csv" ? "CSV" : "AI"}</CardTitle><p className="text-sm font-normal text-[#6f64a8]">{draftSource === "csv" ? "Periksa nominal dan detail sebelum disimpan. Format: tanggal,jenis,nominal,kategori,catatan." : "Periksa nominal dan detail sebelum disimpan."}</p></CardHeader><CardContent className="space-y-3">{drafts.map((item, index) => <div key={`${item.date}-${index}`} className="rounded-xl border border-[#e4e1f2] bg-white p-3 shadow-sm"><div className="grid gap-3 md:grid-cols-[minmax(130px,0.8fr)_minmax(150px,1fr)_130px_minmax(150px,1fr)_minmax(180px,1.5fr)_40px] md:items-end"><div><Label className="text-xs text-[#55736c]">Jenis</Label><Select value={item.kind} onValueChange={(value) => updateDraft(index, "kind", value)}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Pengeluaran</SelectItem><SelectItem value="income">Pemasukan</SelectItem><SelectItem value="transfer">Transfer</SelectItem></SelectContent></Select></div><div><Label className="text-xs text-[#55736c]">Nominal</Label><Input className="mt-1 w-full font-semibold" inputMode="numeric" value={money(item.amount)} onChange={(e) => updateDraft(index, "amount", e.target.value)} /></div><div><Label className="text-xs text-[#55736c]">Tanggal</Label><Input className="mt-1 w-full" type="date" value={item.date} onChange={(e) => updateDraft(index, "date", e.target.value)} /></div><div><Label className="text-xs text-[#55736c]">Kategori</Label><Select value={item.category} onValueChange={(value) => updateDraft(index, "category", value)}><SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger><SelectContent>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-xs text-[#55736c]">Catatan</Label><Input className="mt-1 w-full" value={item.note} onChange={(e) => updateDraft(index, "note", e.target.value)} placeholder="Merchant atau catatan" /></div><Button className="mt-1 shrink-0" variant="ghost" size="icon" aria-label="Hapus draft" onClick={() => clearDraft(index)}><X className="h-4 w-4" /></Button></div>{draftSource !== "csv" && <p className="mt-2 text-xs text-[#6f64a8]">Keyakinan AI: {Math.round((item.confidence ?? 0.5) * 100)}%</p>}</div>)}<Button onClick={saveDrafts} disabled={saving} className="w-full bg-[#183b36] hover:bg-[#24574e] sm:w-auto">{saving ? "Menyimpan…" : `Simpan ${drafts.length} transaksi`}</Button></CardContent></Card>}
    <Card className="border-0 bg-[#183b36] text-white shadow-lg"><CardContent className="p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[#b8d8c6]">Total bulan ini</p><p className="mt-2 text-4xl font-bold">{money(monthTotal)}</p></div><div><Label className="text-xs text-[#b8d8c6]">Bulan</Label><Input className="mt-1 bg-white text-[#183b36]" type="month" value={monthFilter} onChange={(e) => e.target.value && setMonthFilter(e.target.value)} /></div></div><p className="mt-2 text-sm text-[#b8d8c6]">Total seumur hidup: {money(totals)} · {monthTransactions.length} transaksi di bulan ini · Transfer bulan ini: {money(monthTransferTotal)} · Data pribadi · tersimpan di Firebase</p>{monthByCategory.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{monthByCategory.map(([name, value]) => <button key={name} onClick={() => { setFilterCategory(filterCategory === name ? "Semua" : name); document.getElementById("daftar-transaksi")?.scrollIntoView({ behavior: "smooth" }) }} className={`rounded-full px-3 py-1 text-xs ${filterCategory === name ? "bg-white text-[#183b36]" : "bg-[#24574e]"}`}>{name}: {money(value)}</button>)}</div>}</CardContent></Card>
    <Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="text-lg">Tren 6 bulan terakhir</CardTitle></CardHeader><CardContent><div className="flex items-end gap-3 sm:gap-4">{trend.map((m) => <div key={m.key} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-32 w-full items-end justify-center gap-1"><div className="w-full max-w-6 rounded-t bg-[#4f9d69]" style={{ height: `${(m.income / trendMax) * 100}%` }} title={`Pemasukan ${m.label}: ${money(m.income)}`} /><div className="w-full max-w-6 rounded-t bg-[#d86b52]" style={{ height: `${(m.expense / trendMax) * 100}%` }} title={`Pengeluaran ${m.label}: ${money(m.expense)}`} /></div><span className="text-xs text-[#55736c]">{m.label}</span></div>)}</div><p className="mt-3 text-xs text-[#77918a]"><span className="text-[#4f9d69]">■</span> Pemasukan · <span className="text-[#d86b52]">■</span> Pengeluaran · Transfer tidak dihitung.</p></CardContent></Card>
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]"><Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-[#4f9d69]" /> Catat transaksi</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="grid grid-cols-3 gap-2"><Button variant={kind === "expense" ? "default" : "outline"} onClick={() => setKind("expense")} className={kind === "expense" ? "bg-[#d86b52] hover:bg-[#bd5943]" : ""}><ArrowDownLeft className="mr-2 h-4 w-4" />Keluar</Button><Button variant={kind === "income" ? "default" : "outline"} onClick={() => setKind("income")} className={kind === "income" ? "bg-[#4f9d69] hover:bg-[#3c8154]" : ""}><ArrowUpRight className="mr-2 h-4 w-4" />Masuk</Button><Button variant={kind === "transfer" ? "default" : "outline"} onClick={() => setKind("transfer")} className={kind === "transfer" ? "bg-[#55736c] hover:bg-[#425a55]" : ""}><ArrowLeftRight className="mr-2 h-4 w-4" />Transfer</Button></div>
      <div><Label>Nominal (Rupiah)</Label><Input className="mt-1 text-lg" inputMode="numeric" value={amount ? money(Number(amount)) : ""} onChange={(e) => setAmount(digits(e.target.value))} placeholder="Rp25.000" /></div>
      <div><div className="flex items-center justify-between"><Label>Kategori</Label><span className="text-xs text-[#77918a]">{categoryOptions.length} kategori</span></div><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{categoryOptions.map((item) => <SelectItem key={item.id} value={item.name}>{item.name} · {item.group}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Dompet</Label><Select value={wallet || "none"} onValueChange={(v) => setWallet(v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Tanpa dompet</SelectItem>{WALLETS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>{kind === "transfer" && <div><Label>Ke dompet</Label><Select value={walletTo || "none"} onValueChange={(v) => setWalletTo(v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Tanpa dompet</SelectItem>{WALLETS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>}<div><Label>Tanggal</Label><Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div><Label>Catatan</Label><Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: makan siang" rows={3} /></div><Button className="w-full bg-[#183b36] hover:bg-[#24574e]" onClick={save} disabled={saving || !amount}>{saving ? "Menyimpan…" : "Simpan transaksi"}</Button>{formError && <p className="text-sm text-[#9d4938]">{formError}</p>}
    </CardContent></Card>
    <div className="space-y-5"><Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#4f9d69]" /> Kelola kategori</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]"><Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama kategori baru" /><Input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Grup" /><Button onClick={addCategory} className="bg-[#183b36] hover:bg-[#24574e]"><Plus className="mr-1 h-4 w-4" />Tambah</Button></div><div className="flex flex-wrap gap-2">{categoryOptions.map((item) => <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-[#edf5ef] px-3 py-1 text-xs text-[#315f50]">{item.name}{!DEFAULT_CATEGORIES.some(([name]) => name === item.name) && <button aria-label={`Hapus ${item.name}`} onClick={() => removeCategory(item)}><X className="h-3 w-3" /></button>}</span>)}</div><p className="text-xs text-[#77918a]">Kategori bawaan tidak dihapus. Kategori tambahan bisa dihapus.</p></CardContent></Card>
    {editing && <Card className="border-[#d8d0fa] bg-[#fbfaff]"><CardHeader><CardTitle className="text-lg">Edit transaksi</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><div><Label>Jenis</Label><Select value={editKind} onValueChange={(v) => setEditKind(v as Kind)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Pengeluaran</SelectItem><SelectItem value="income">Pemasukan</SelectItem><SelectItem value="transfer">Transfer</SelectItem></SelectContent></Select></div><div><Label>Nominal (Rupiah)</Label><Input className="mt-1" inputMode="numeric" value={editAmount ? money(Number(editAmount)) : ""} onChange={(e) => setEditAmount(digits(e.target.value))} /></div><div><Label>Kategori</Label><Select value={editCategory} onValueChange={setEditCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></div><div><Label>Tanggal</Label><Input className="mt-1" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} /></div><div><Label>Dompet</Label><Select value={editWallet || "none"} onValueChange={(v) => setEditWallet(v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Tanpa dompet</SelectItem>{WALLETS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>{editKind === "transfer" && <div><Label>Ke dompet</Label><Select value={editWalletTo || "none"} onValueChange={(v) => setEditWalletTo(v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Tanpa dompet</SelectItem>{WALLETS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent></Select></div>}</div><div><Label>Catatan</Label><Textarea className="mt-1" value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2} /></div><div className="flex gap-2"><Button onClick={saveEdit} disabled={saving} className="bg-[#183b36] hover:bg-[#24574e]">{saving ? "Menyimpan…" : "Simpan perubahan"}</Button><Button variant="outline" onClick={() => setEditing(null)}>Batal</Button></div></CardContent></Card>}
    <Card id="daftar-transaksi" className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#4f9d69]" /> Transaksi</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="grid gap-2 sm:grid-cols-[1fr_160px_140px]"><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari catatan atau kategori…" /><Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Semua">Semua kategori</SelectItem>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><Select value={filterWallet} onValueChange={setFilterWallet}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Semua">Semua dompet</SelectItem>{WALLETS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}<SelectItem value="Tanpa dompet">Tanpa dompet</SelectItem></SelectContent></Select></div><div className="flex flex-wrap items-center gap-2"><span className="text-xs text-[#77918a]">{visibleTransactions.length} transaksi</span>{(filterCategory !== "Semua" || filterWallet !== "Semua" || searchQuery) && <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setFilterCategory("Semua"); setFilterWallet("Semua") }}>Hapus filter</Button>}<span className="flex-1" /><Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>{selectedIds.length > 0 && <Button variant="outline" size="sm" className="text-[#9d4938]" onClick={removeSelected}>Hapus {selectedIds.length} terpilih</Button>}</div>{lastDeleted && <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#edf5ef] p-3 text-sm text-[#315f50]"><span>{lastDeleted.length} transaksi dihapus.</span><Button size="sm" onClick={undoDelete}>Urungkan</Button><Button variant="ghost" size="sm" onClick={() => setLastDeleted(null)}>Tutup</Button></div>}{visibleTransactions.length === 0 ? <div className="rounded-xl bg-[#f7f8f4] p-8 text-center text-sm text-[#55736c]">Tidak ada transaksi yang cocok.</div> : <div className="divide-y">{visibleTransactions.slice(0, listLimit).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 flex-1 items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#183b36]" checked={selectedIds.includes(item.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, item.id] : ids.filter((x) => x !== item.id))} aria-label="Pilih transaksi" /><div className="min-w-0"><p className="truncate font-medium">{item.note || item.category}</p><p className="text-xs text-[#77918a]">{item.date} · {item.category}{item.kind === "transfer" ? (item.wallet || item.walletTo ? ` · ${item.wallet || "?"} → ${item.walletTo || "?"}` : "") : (item.wallet ? ` · ${item.wallet}` : "")}</p></div></div><div className="flex shrink-0 items-center gap-1"><span className={item.kind === "income" ? "font-semibold text-[#4f9d69]" : item.kind === "expense" ? "font-semibold text-[#d86b52]" : "font-semibold text-[#55736c]"}>{item.kind === "income" ? "+" : item.kind === "expense" ? "-" : ""}{money(item.amount)}</span><Button variant="ghost" size="icon" aria-label="Duplikat transaksi" onClick={() => void duplicate(item)}><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Edit transaksi" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Hapus transaksi" onClick={() => void remove(item.id)}><Trash2 className="h-4 w-4 text-[#d86b52]" /></Button></div></div>)}</div>}{visibleTransactions.length > listLimit && <Button variant="outline" className="w-full" onClick={() => setListLimit((n) => n + 50)}>Muat lebih banyak ({visibleTransactions.length - listLimit} lagi)</Button>}</div></CardContent></Card></div></div>
  </div></main></div>
}

export default function UangkuhPage() { return <AdminGuard><UangkuhContent /></AdminGuard> }
