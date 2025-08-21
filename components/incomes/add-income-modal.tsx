import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateIncomeData } from "@/lib/types"

interface AddIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateIncomeData) => Promise<void> | void
  periodId: string
  periodStart: Date
  periodEnd: Date
  loading?: boolean
}

function formatDateISO(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function AddIncomeModal({ isOpen, onClose, onSubmit, periodId, periodStart, periodEnd, loading = false }: AddIncomeModalProps) {
  const dayOptions = useMemo(() => {
    const days: string[] = []
    const cur = new Date(periodStart)
    while (cur <= periodEnd) {
      days.push(formatDateISO(new Date(cur)))
      cur.setDate(cur.getDate() + 1)
    }
    return days
  }, [periodStart, periodEnd])

  const [form, setForm] = useState<CreateIncomeData>({
    periodId,
    date: dayOptions[0] || formatDateISO(periodStart),
    customerName: "",
    incomeAmount: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ ...form, periodId })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pendapatan</DialogTitle>
          <DialogDescription>Pilih tanggal dalam rentang periode</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <select
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="h-10 w-full rounded-md border px-3 text-sm"
            >
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Customer</Label>
            <Input id="customerName" placeholder="Contoh: Budi" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeAmount">Jumlah Pendapatan (IDR)</Label>
            <Input
              id="incomeAmount"
              type="text"
              placeholder="Contoh: Rp 2.500.000"
              value={form.incomeAmount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(form.incomeAmount)) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                setForm({ ...form, incomeAmount: raw })
              }}
              onBlur={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                if (raw) {
                  e.target.value = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(raw))
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Input id="notes" placeholder="Catatan tambahan" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


