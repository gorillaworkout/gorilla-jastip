"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Period } from "@/lib/types"
import { PeriodsService } from "@/lib/periods-service"
import { Save, X } from "lucide-react"

interface EditPeriodModalProps {
  period: Period | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditPeriodModal({ period, isOpen, onClose, onSuccess }: EditPeriodModalProps) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!period) return
    setName(period.name)
    const s = new Date(period.startDate)
    const e = new Date(period.endDate)
    const toInput = (d: Date) => d.toISOString().slice(0, 10)
    setStartDate(toInput(s))
    setEndDate(toInput(e))
  }, [period])

  const handleClose = () => {
    setIsSubmitting(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!period) return
    try {
      setIsSubmitting(true)
      await PeriodsService.updatePeriod(period.id, {
        name,
        startDate,
        endDate,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating period:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ganti Periode</DialogTitle>
          <DialogDescription>
            Perbaiki nama atau tanggal periode yang salah. Perubahan akan disimpan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="periodName">Nama Periode</Label>
            <Input id="periodName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Tanggal Mulai</Label>
              <Input id="periodStart" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Tanggal Selesai</Label>
              <Input id="periodEnd" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Simpan Perubahan
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPeriodModal


