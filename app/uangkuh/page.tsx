"use client"

import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore"
import { ArrowDownLeft, ArrowUpRight, Bot, Plus, Trash2, WalletCards, X } from "lucide-react"
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

type Kind = "income" | "expense"
type Transaction = { id: string; kind: Kind; amount: number; date: string; category: string; note: string }
type Category = { id: string; name: string; group: string }
type Draft = { kind: Kind; amount: number; date: string; category: string; note: string; confidence?: number }

const DEFAULT_CATEGORIES = [
  ["Keluarga", "Keluarga"], ["Kendaraan", "Kendaraan"], ["Makan", "Makan"],
  ["Kesehatan & Proteksi", "Kesehatan & Proteksi"], ["Tabungan", "Tabungan"],
  ["Belanja", "Belanja"], ["Tagihan", "Tagihan"], ["Pendapatan", "Pendapatan"], ["Lainnya", "Lainnya"],
] as const

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
const digits = (value: string) => value.replace(/\D/g, "")

function UangkuhContent() {
  const { firebaseUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [kind, setKind] = useState<Kind>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Keluarga")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newGroup, setNewGroup] = useState("Lainnya")
  const [saving, setSaving] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState("")

  const extractFile = async (file: File) => {
    setExtracting(true); setExtractError("")
    try {
      const form = new FormData(); form.append("file", file)
      const response = await fetch("/api/uangkuh/extract", { method: "POST", body: form })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "AI gagal membaca file.")
      setDrafts(result.transactions || [])
      if (!result.transactions?.length) setExtractError("Tidak ada transaksi yang terbaca. Coba screenshot lebih jelas.")
    } catch (error) { setExtractError(error instanceof Error ? error.message : "AI gagal membaca file.")
    } finally { setExtracting(false) }
  }

  const updateDraft = (index: number, field: keyof Draft, value: string) => setDrafts((items) => items.map((item, i) => i === index ? { ...item, [field]: field === "amount" ? Number(digits(value)) : value } : item))

  const saveDrafts = async () => {
    if (!firebaseUser || !db || !drafts.length) return
    setSaving(true)
    try {
      const ref = collection(db, "financeUsers", firebaseUser.uid, "transactions")
      await Promise.all(drafts.map((item) => addDoc(ref, { ...item, source: "ai-screenshot", createdAt: serverTimestamp(), updatedAt: serverTimestamp() })))
      setDrafts([])
    } finally { setSaving(false) }
  }

  const clearDraft = (index: number) => setDrafts((items) => items.filter((_, i) => i !== index))

  useEffect(() => {
    if (!firebaseUser || !db) return
    const transactionRef = collection(db, "financeUsers", firebaseUser.uid, "transactions")
    const categoryRef = collection(db, "financeUsers", firebaseUser.uid, "categories")
    const unsubscribeTransactions = onSnapshot(query(transactionRef, orderBy("date", "desc")), (snapshot) => {
      setTransactions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Transaction)))
    }, (error) => {
      console.error("Uangkuh transaction listener failed:", error)
    })
    const unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Category))
      if (snapshot.empty) {
        setCategories(DEFAULT_CATEGORIES.map(([name, group], index) => ({ id: `default-${index}`, name, group })))
        return
      }
      setCategories(items)
      if (!items.some((item) => item.name === category)) setCategory(items[0]?.name || "Lainnya")
    })
    return () => { unsubscribeTransactions(); unsubscribeCategories() }
  }, [firebaseUser])

  const totals = useMemo(() => transactions.reduce((sum, item) => sum + (item.kind === "income" ? item.amount : -item.amount), 0), [transactions])
  const categoryOptions = categories.length ? categories : DEFAULT_CATEGORIES.map(([name, group], index) => ({ id: String(index), name, group }))

  const save = async () => {
    if (!firebaseUser || !db || !amount || Number(amount) <= 0) return
    setSaving(true)
    try {
      await addDoc(collection(db, "financeUsers", firebaseUser.uid, "transactions"), { kind, amount: Number(amount), category, date, note: note.trim(), source: "manual", createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      setAmount(""); setNote("")
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
    await deleteDoc(doc(db, "financeUsers", firebaseUser.uid, "categories", item.id))
    if (category === item.name) setCategory("Lainnya")
  }

  const remove = (id: string) => firebaseUser && db && deleteDoc(doc(db, "financeUsers", firebaseUser.uid, "transactions", id))

  return <div className="flex min-h-[100dvh] bg-[#f7f8f4] text-[#183b36]"><Sidebar /><main className="min-w-0 flex-1 overflow-auto"><MobileHeader title="Uangkuh" /><div className="mx-auto max-w-6xl space-y-5 px-3 py-5 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold tracking-wide text-[#4f9d69]">UANGKUH</p><h1 className="text-3xl font-bold tracking-tight">Biar uang nggak bikin mumet.</h1><p className="mt-1 text-sm text-[#55736c]">Catat, pahami, tenang.</p></div><label className="inline-flex cursor-pointer items-center rounded-md bg-[#183b36] px-4 py-2 text-sm font-medium text-white hover:bg-[#24574e]"> <Bot className="mr-2 h-4 w-4" /> {extracting ? "Membaca…" : "Import dengan AI"}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={extracting} onChange={(e) => { const file = e.target.files?.[0]; if (file) void extractFile(file); e.currentTarget.value = "" }} /></label></header>
    {extractError && <div className="rounded-xl border border-[#f0c5bb] bg-[#fff4f1] p-4 text-sm text-[#9d4938]">{extractError}</div>}
    {drafts.length > 0 && <Card className="border-[#d8d0fa] bg-[#fbfaff]"><CardHeader><CardTitle className="flex items-center justify-between"><span>Draft dari AI</span><span className="text-sm font-normal text-[#6f64a8]">Periksa sebelum simpan</span></CardTitle></CardHeader><CardContent className="space-y-3">{drafts.map((item, index) => <div key={`${item.date}-${index}`} className="grid gap-2 rounded-xl border bg-white p-3 sm:grid-cols-[100px_130px_1fr_1fr_auto]"><Select value={item.kind} onValueChange={(value) => updateDraft(index, "kind", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="expense">Pengeluaran</SelectItem><SelectItem value="income">Pemasukan</SelectItem></SelectContent></Select><Input inputMode="numeric" value={money(item.amount)} onChange={(e) => updateDraft(index, "amount", e.target.value)} /><Input type="date" value={item.date} onChange={(e) => updateDraft(index, "date", e.target.value)} /><Input value={item.note} onChange={(e) => updateDraft(index, "note", e.target.value)} placeholder="Catatan" /><Button variant="ghost" size="icon" onClick={() => clearDraft(index)}><X className="h-4 w-4" /></Button></div>)}<Button onClick={saveDrafts} disabled={saving} className="bg-[#183b36] hover:bg-[#24574e]">{saving ? "Menyimpan…" : `Simpan ${drafts.length} transaksi`}</Button></CardContent></Card>}
    <Card className="border-0 bg-[#183b36] text-white shadow-lg"><CardContent className="p-6"><p className="text-sm text-[#b8d8c6]">Saldo berjalan</p><p className="mt-2 text-4xl font-bold">{money(totals)}</p><p className="mt-2 text-sm text-[#b8d8c6]">Data pribadi · tersimpan di Firebase</p></CardContent></Card>
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]"><Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-[#4f9d69]" /> Catat transaksi</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-2"><Button variant={kind === "expense" ? "default" : "outline"} onClick={() => setKind("expense")} className={kind === "expense" ? "bg-[#d86b52] hover:bg-[#bd5943]" : ""}><ArrowDownLeft className="mr-2 h-4 w-4" />Keluar</Button><Button variant={kind === "income" ? "default" : "outline"} onClick={() => setKind("income")} className={kind === "income" ? "bg-[#4f9d69] hover:bg-[#3c8154]" : ""}><ArrowUpRight className="mr-2 h-4 w-4" />Masuk</Button></div>
      <div><Label>Nominal (Rupiah)</Label><Input className="mt-1 text-lg" inputMode="numeric" value={amount ? money(Number(amount)) : ""} onChange={(e) => setAmount(digits(e.target.value))} placeholder="Rp25.000" /></div>
      <div><div className="flex items-center justify-between"><Label>Kategori</Label><span className="text-xs text-[#77918a]">{categoryOptions.length} kategori</span></div><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{categoryOptions.map((item) => <SelectItem key={item.id} value={item.name}>{item.name} · {item.group}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Tanggal</Label><Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div><div><Label>Catatan</Label><Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: makan siang" rows={3} /></div><Button className="w-full bg-[#183b36] hover:bg-[#24574e]" onClick={save} disabled={saving || !amount}>{saving ? "Menyimpan…" : "Simpan transaksi"}</Button>
    </CardContent></Card>
    <div className="space-y-5"><Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#4f9d69]" /> Kelola kategori</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]"><Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nama kategori baru" /><Input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Grup" /><Button onClick={addCategory} className="bg-[#183b36] hover:bg-[#24574e]"><Plus className="mr-1 h-4 w-4" />Tambah</Button></div><div className="flex flex-wrap gap-2">{categoryOptions.map((item) => <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-[#edf5ef] px-3 py-1 text-xs text-[#315f50]">{item.name}{!DEFAULT_CATEGORIES.some(([name]) => name === item.name) && <button aria-label={`Hapus ${item.name}`} onClick={() => removeCategory(item)}><X className="h-3 w-3" /></button>}</span>)}</div><p className="text-xs text-[#77918a]">Kategori bawaan tidak dihapus. Kategori tambahan bisa dihapus.</p></CardContent></Card>
    <Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#4f9d69]" /> Transaksi terbaru</CardTitle></CardHeader><CardContent>{transactions.length === 0 ? <div className="rounded-xl bg-[#f7f8f4] p-8 text-center text-sm text-[#55736c]">Belum ada transaksi. Catat yang pertama.</div> : <div className="divide-y">{transactions.slice(0, 30).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{item.note || item.category}</p><p className="text-xs text-[#77918a]">{item.date} · {item.category}</p></div><div className="flex items-center gap-2"><span className={item.kind === "income" ? "font-semibold text-[#4f9d69]" : "font-semibold text-[#d86b52]"}>{item.kind === "income" ? "+" : "-"}{money(item.amount)}</span><Button variant="ghost" size="icon" aria-label="Hapus transaksi" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-[#d86b52]" /></Button></div></div>)}</div>}</CardContent></Card></div></div>
  </div></main></div>
}

export default function UangkuhPage() { return <AdminGuard><UangkuhContent /></AdminGuard> }
