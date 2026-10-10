"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { CheckCircle, Facebook, Filter, Package, Pencil, Phone, Plus, Search, ShieldCheck, ShieldOff, Trash2, X } from "lucide-react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Sidebar } from "@/components/layout/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { whatsappHref } from "@/lib/jastiper-display"
import { JastiperService } from "@/lib/jastiper-service"
import type { CreateJastiperData, Jastiper } from "@/lib/types"

const emptyForm = (): CreateJastiperData => ({
  name: "", imageUrl: "", facebookLink: "", instagramLink: "", phoneNumber: "",
  description: "", completedOrders: 0, verifiedByFacebookLink: "",
})

function ManageJastipersContent() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("name")
  const [status, setStatus] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Jastiper | null>(null)
  const [form, setForm] = useState<CreateJastiperData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setJastipers(await JastiperService.getAllJastipers())
  }, [])

  useEffect(() => {
    reload().catch((cause) => { console.error("Failed to load jastipers", cause); setError("Gagal memuat jastiper") }).finally(() => setLoading(false))
  }, [reload])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return [...jastipers]
      .filter((item) => status === "all" || (status === "verified" ? item.isVerified : !item.isVerified))
      .filter((item) => !term || [item.name, item.description, item.phoneNumber].some((value) => String(value || "").toLowerCase().includes(term)))
      .sort((a, b) => sort === "orders" ? (b.completedOrders || 0) - (a.completedOrders || 0) : String(a.name).localeCompare(String(b.name), "id"))
  }, [jastipers, search, sort, status])

  const openForm = (item?: Jastiper) => {
    setEditing(item || null)
    setForm(item ? {
      name: item.name, imageUrl: item.imageUrl || "", facebookLink: item.facebookLink || "",
      instagramLink: item.instagramLink || "", phoneNumber: item.phoneNumber || "",
      description: item.description || "", completedOrders: item.completedOrders || 0,
      verifiedByFacebookLink: item.verifiedByFacebookLink || "",
    } : emptyForm())
    setFormOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return setError("Nama jastiper wajib diisi")
    setSaving(true); setError("")
    try {
      if (editing) await JastiperService.updateJastiper(editing.id, form)
      else await JastiperService.createJastiper(form)
      setFormOpen(false); await reload()
    } catch (cause) { console.error("Failed to save jastiper", cause); setError("Gagal menyimpan jastiper") }
    finally { setSaving(false) }
  }

  const toggleVerification = async (item: Jastiper) => {
    setError("")
    try {
      if (item.isVerified) await JastiperService.unverifyJastiper(item.id)
      else await JastiperService.verifyJastiper(item.id)
      await reload()
    } catch (cause) { console.error("Failed to update verification", cause); setError("Gagal mengubah verifikasi") }
  }

  const remove = async (item: Jastiper) => {
    if (!confirm(`Hapus jastiper ${item.name}? Tindakan ini tidak dapat dibatalkan.`)) return
    try { await JastiperService.deleteJastiper(item.id); await reload() }
    catch (cause) { console.error("Failed to delete jastiper", cause); setError("Gagal menghapus jastiper") }
  }

  return <div className="flex min-h-[100dvh] bg-muted/20"><Sidebar /><main className="min-w-0 flex-1 overflow-auto">
    <MobileHeader title="Jastiper" />
    <div className="admin-page">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="admin-page-header"><h1 className="text-3xl font-bold tracking-tight">Jastiper</h1><p className="mt-1 text-muted-foreground">Kelola profil dan verifikasi jastiper.</p></div>
        <Button className="w-full md:w-auto" onClick={() => openForm()}><Plus />Tambah jastiper</Button>
      </header>

      <Card className="shadow-sm"><CardContent className="space-y-3 p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="min-h-11 pl-10 pr-11" placeholder="Cari nama, deskripsi, atau WhatsApp" value={search} onChange={(e) => setSearch(e.target.value)} />{search && <button aria-label="Hapus pencarian" className="absolute right-0 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center" onClick={() => setSearch("")}><X className="h-4 w-4" /></button>}</div>
        <div className="grid grid-cols-2 gap-2"><Select value={sort} onValueChange={setSort}><SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Nama A–Z</SelectItem><SelectItem value="orders">Trip terbanyak</SelectItem></SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua status</SelectItem><SelectItem value="verified">Terverifikasi</SelectItem><SelectItem value="unverified">Belum diverifikasi</SelectItem></SelectContent></Select></div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Filter className="h-4 w-4" />{filtered.length} dari {jastipers.length} jastiper</p>
      </CardContent></Card>

      {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading ? <p className="py-8 text-center text-muted-foreground">Memuat jastiper…</p> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => {
        const wa = whatsappHref(item.phoneNumber)
        return <Card key={item.id} className="shadow-sm"><CardHeader className="pb-3"><div className="flex items-center gap-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted"><Image src={item.imageUrl || "/placeholder-user.jpg"} alt={item.name} fill className="object-cover" /></div><div className="min-w-0"><h2 className="truncate font-semibold">{item.name}</h2><Badge variant={item.isVerified ? "default" : "secondary"} className="mt-1"><CheckCircle className="mr-1 h-3 w-3" />{item.isVerified ? "Terverifikasi" : "Belum diverifikasi"}</Badge></div></div></CardHeader><CardContent className="space-y-3">
          {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
          <p className="flex items-center gap-2 text-sm"><Package className="h-4 w-4" />{item.completedOrders || 0} trip selesai</p>
          <div className="flex flex-wrap gap-3 text-sm">{wa && <a className="flex min-h-11 items-center gap-2 text-green-700" href={wa} target="_blank" rel="noopener noreferrer"><Phone className="h-4 w-4" />WhatsApp</a>}{item.facebookLink && <a className="flex min-h-11 items-center gap-2 text-blue-700" href={item.facebookLink} target="_blank" rel="noopener noreferrer"><Facebook className="h-4 w-4" />Facebook</a>}</div>
          <div className="grid grid-cols-2 gap-2 border-t pt-3"><Button variant="outline" size="sm" onClick={() => openForm(item)}><Pencil />Edit</Button><Button variant="outline" size="sm" onClick={() => toggleVerification(item)}>{item.isVerified ? <ShieldOff /> : <ShieldCheck />}{item.isVerified ? "Batalkan" : "Verifikasi"}</Button><Button variant="outline" size="sm" className="col-span-2 text-destructive hover:text-destructive" onClick={() => remove(item)}><Trash2 />Hapus</Button></div>
        </CardContent></Card>
      })}</div>}

      <Dialog open={formOpen} onOpenChange={setFormOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{editing ? "Edit jastiper" : "Tambah jastiper"}</DialogTitle></DialogHeader><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama" id="name" className="sm:col-span-2"><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="WhatsApp" id="phone"><Input id="phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></Field>
        <Field label="Trip selesai" id="orders"><Input id="orders" type="number" min="0" value={form.completedOrders} onChange={(e) => setForm({ ...form, completedOrders: Number(e.target.value) || 0 })} /></Field>
        <Field label="URL foto" id="image" className="sm:col-span-2"><Input id="image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></Field>
        <Field label="Facebook" id="facebook"><Input id="facebook" value={form.facebookLink} onChange={(e) => setForm({ ...form, facebookLink: e.target.value })} /></Field>
        <Field label="Instagram" id="instagram"><Input id="instagram" value={form.instagramLink} onChange={(e) => setForm({ ...form, instagramLink: e.target.value })} /></Field>
        <Field label="Bukti verifikasi" id="proof" className="sm:col-span-2"><Input id="proof" value={form.verifiedByFacebookLink} onChange={(e) => setForm({ ...form, verifiedByFacebookLink: e.target.value })} /></Field>
        <Field label="Deskripsi" id="description" className="sm:col-span-2"><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div><Button onClick={save} disabled={saving || !form.name.trim()}>{saving ? "Menyimpan…" : "Simpan"}</Button></DialogContent></Dialog>
    </div>
  </main></div>
}

function Field({ label, id, className = "", children }: { label: string; id: string; className?: string; children: React.ReactNode }) {
  return <div className={`space-y-2 ${className}`}><Label htmlFor={id}>{label}</Label>{children}</div>
}

export default function ManageJastipersPage() {
  return <AdminGuard><ManageJastipersContent /></AdminGuard>
}
