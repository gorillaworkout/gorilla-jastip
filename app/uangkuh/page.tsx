"use client"

import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore"
import { ArrowDownLeft, ArrowUpRight, Bot, Plus, Trash2, WalletCards } from "lucide-react"
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

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)

function UangkuhContent() {
  const { firebaseUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [kind, setKind] = useState<Kind>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Makanan")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!firebaseUser || !db) return
    const ref = collection(db, "financeUsers", firebaseUser.uid, "transactions")
    return onSnapshot(query(ref, orderBy("date", "desc")), (snapshot) => {
      setTransactions(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Transaction)))
    })
  }, [firebaseUser])

  const totals = useMemo(() => transactions.reduce((sum, item) => sum + (item.kind === "income" ? item.amount : -item.amount), 0), [transactions])

  const save = async () => {
    if (!firebaseUser || !db || !amount || Number(amount) <= 0) return
    setSaving(true)
    try {
      await addDoc(collection(db, "financeUsers", firebaseUser.uid, "transactions"), {
        kind, amount: Number(amount), category, date, note: note.trim(), source: "manual", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      })
      setAmount(""); setNote("")
    } finally { setSaving(false) }
  }

  const remove = (id: string) => firebaseUser && db && deleteDoc(doc(db, "financeUsers", firebaseUser.uid, "transactions", id))

  return <div className="flex min-h-[100dvh] bg-[#f7f8f4] text-[#183b36]">
    <Sidebar />
    <main className="min-w-0 flex-1 overflow-auto">
      <MobileHeader title="Uangkuh" />
      <div className="mx-auto max-w-6xl space-y-5 px-3 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold tracking-wide text-[#4f9d69]">UANGKUH</p><h1 className="text-3xl font-bold tracking-tight">Biar uang nggak bikin mumet.</h1><p className="mt-1 text-sm text-[#55736c]">Catat, pahami, tenang.</p></div>
          <Button className="bg-[#183b36] hover:bg-[#24574e]"><Bot className="mr-2 h-4 w-4" /> Import dengan AI</Button>
        </header>
        <Card className="border-0 bg-[#183b36] text-white shadow-lg"><CardContent className="p-6"><p className="text-sm text-[#b8d8c6]">Saldo berjalan</p><p className="mt-2 text-4xl font-bold">{money(totals)}</p><p className="mt-2 text-sm text-[#b8d8c6]">Data pribadi · tersimpan di Firebase</p></CardContent></Card>
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5 text-[#4f9d69]" /> Catat transaksi</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2"><Button variant={kind === "expense" ? "default" : "outline"} onClick={() => setKind("expense")} className={kind === "expense" ? "bg-[#d86b52] hover:bg-[#bd5943]" : ""}><ArrowDownLeft className="mr-2 h-4 w-4" />Keluar</Button><Button variant={kind === "income" ? "default" : "outline"} onClick={() => setKind("income")} className={kind === "income" ? "bg-[#4f9d69] hover:bg-[#3c8154]" : ""}><ArrowUpRight className="mr-2 h-4 w-4" />Masuk</Button></div>
            <div><Label>Nominal</Label><Input className="mt-1" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" /></div>
            <div><Label>Kategori</Label><Select value={category} onValueChange={setCategory}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{["Makanan", "Transportasi", "Belanja", "Tagihan", "Kesehatan", "Hiburan", "Pendapatan", "Lainnya"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Tanggal</Label><Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Catatan</Label><Textarea className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: makan siang" rows={3} /></div>
            <Button className="w-full bg-[#183b36] hover:bg-[#24574e]" onClick={save} disabled={saving || !amount}>{saving ? "Menyimpan…" : "Simpan transaksi"}</Button>
          </CardContent></Card>
          <Card className="border-[#dce9df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#4f9d69]" /> Transaksi terbaru</CardTitle></CardHeader><CardContent>{transactions.length === 0 ? <div className="rounded-xl bg-[#f7f8f4] p-8 text-center text-sm text-[#55736c]">Belum ada transaksi. Catat yang pertama.</div> : <div className="divide-y">{transactions.slice(0, 30).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate font-medium">{item.note || item.category}</p><p className="text-xs text-[#77918a]">{item.date} · {item.category}</p></div><div className="flex items-center gap-2"><span className={item.kind === "income" ? "font-semibold text-[#4f9d69]" : "font-semibold text-[#d86b52]"}>{item.kind === "income" ? "+" : "-"}{money(item.amount)}</span><Button variant="ghost" size="icon" aria-label="Hapus transaksi" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-[#d86b52]" /></Button></div></div>)}</div>}</CardContent></Card>
        </div>
      </div>
    </main>
  </div>
}

export default function UangkuhPage() { return <AdminGuard><UangkuhContent /></AdminGuard> }
