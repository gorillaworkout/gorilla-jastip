import { useMemo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Expense, ExpenseCategory, UpdateExpenseData } from "@/lib/types"

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (expenseId: string, data: UpdateExpenseData) => Promise<void> | void
  periodStart: Date
  periodEnd: Date
  expense: Expense
  loading?: boolean
}

const CATEGORIES: ExpenseCategory[] = ["Transport", "Makan", "Akomodasi", "Operasional", "Lainnya"]

function formatDateISO(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function EditExpenseModal({ isOpen, onClose, onSubmit, periodStart, periodEnd, expense, loading = false }: EditExpenseModalProps) {
  const dayOptions = useMemo(() => {
    const days: { value: string; label: string }[] = []
    const cur = new Date(periodStart)
    let idx = 1
    while (cur <= periodEnd) {
      const label = `Hari ${idx} - ${cur.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
      days.push({ value: formatDateISO(cur), label })
      cur.setDate(cur.getDate() + 1)
      idx += 1
    }
    return days
  }, [periodStart, periodEnd])

  const [form, setForm] = useState<UpdateExpenseData>({
    date: formatDateISO(expense.date),
    itemName: expense.itemName,
    expensePrice: String(expense.expensePrice),
    exchangeRate: String(expense.exchangeRate),
    category: expense.category,
    notes: expense.notes || "",
  })

  useEffect(() => {
    // Sync when expense changes
    setForm({
      date: formatDateISO(expense.date),
      itemName: expense.itemName,
      expensePrice: String(expense.expensePrice),
      exchangeRate: String(expense.exchangeRate),
      category: expense.category,
      notes: expense.notes || "",
    })
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(expense.id, form)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Pengeluaran</DialogTitle>
          <DialogDescription>Ubah data pengeluaran</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tanggal dalam Periode</Label>
            <Select value={form.date} onValueChange={(v) => setForm({ ...form, date: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName">Nama Item</Label>
            <Input id="itemName" value={form.itemName || ""} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expensePrice">Pengeluaran (YEN)</Label>
              <Input id="expensePrice" type="number" inputMode="decimal" value={form.expensePrice || ""} onChange={(e) => setForm({ ...form, expensePrice: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Kurs (YEN → IDR)</Label>
              <Input id="exchangeRate" type="number" inputMode="decimal" value={form.exchangeRate || ""} onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jenis Pengeluaran</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Input id="notes" value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-600">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


