"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PeriodsService } from "@/lib/periods-service"
import { IncomesService } from "@/lib/incomes-service"
import type { Income, Period } from "@/lib/types"
import { Menu, Plus, HandCoins, Home, BarChart3, Calendar, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"
import { AddIncomeModal } from "@/components/incomes/add-income-modal"
import { EditIncomeModal } from "@/components/incomes/edit-income-modal"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

function PendapatanContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [incomesByPeriod, setIncomesByPeriod] = useState<Record<string, Income[]>>({})
  const [loading, setLoading] = useState(true)
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const ps = await PeriodsService.getPeriods()
        setPeriods(ps)
        const entries = await Promise.all(
          ps.map(async (p) => [p.id, await IncomesService.getIncomesByPeriod(p.id)] as const)
        )
        const map: Record<string, Income[]> = {}
        entries.forEach(([id, ex]) => (map[id] = ex))
        setIncomesByPeriod(map)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openAddFor = (p: Period) => {
    setSelectedPeriod(p)
    setIsAddOpen(true)
  }

  const handleAddIncome = async (data: any) => {
    if (!selectedPeriod) return
    await IncomesService.addIncome(data)
    const updated = await IncomesService.getIncomesByPeriod(selectedPeriod.id)
    setIncomesByPeriod((prev) => ({ ...prev, [selectedPeriod.id]: updated }))
    setIsAddOpen(false)
  }

  const handleEditIncome = async (incomeId: string, data: any) => {
    if (!selectedPeriod) return
    await IncomesService.updateIncome(incomeId, data)
    const updated = await IncomesService.getIncomesByPeriod(selectedPeriod.id)
    setIncomesByPeriod((prev) => ({ ...prev, [selectedPeriod.id]: updated }))
    setIsEditOpen(false)
    setSelectedIncome(null)
  }

  const handleDeleteIncome = async (incomeId: string, period: Period) => {
    await IncomesService.deleteIncome(incomeId)
    const updated = await IncomesService.getIncomesByPeriod(period.id)
    setIncomesByPeriod((prev) => ({ ...prev, [period.id]: updated }))
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-background">
        <div className="hidden md:flex"><Sidebar /></div>
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data pendapatan...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <div className="hidden md:flex"><Sidebar /></div>
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile header menu */}
        <div className="md:hidden sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="px-3 pt-3 pb-2">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="p-3 pt-0 space-y-1">
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/")}> <Home className="h-4 w-4" /> Dashboard</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/pendapatan")}> <HandCoins className="h-4 w-4" /> Pendapatan</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/pengeluaran")}> <BarChart3 className="h-4 w-4" /> Pengeluaran</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/periods")}> <Calendar className="h-4 w-4" /> Periode</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/analytics")}> <BarChart3 className="h-4 w-4" /> Analytics</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => router.push("/settings")}> <Settings className="h-4 w-4" /> Pengaturan</Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="font-semibold">Pendapatan</div>
            <div className="w-9" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <HandCoins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pendapatan</h1>
                <p className="text-muted-foreground">Catat pendapatan per periode</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Future: filter admin / periode */}
            </div>
          </div>

          {periods.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Belum ada periode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Buat periode di menu Periode untuk mulai mencatat pendapatan.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {periods.map((p) => {
                const list = (ownerFilter === "all"
                  ? incomesByPeriod[p.id] || []
                  : (incomesByPeriod[p.id] || []).filter((e) => e.createdBy === ownerFilter))
                const total = list.reduce((sum, e) => sum + e.incomeAmount, 0)
                const avg = list.length ? total / list.length : 0
                return (
                  <Card key={p.id} className="overflow-hidden">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>{p.name}</CardTitle>
                        <div className="text-sm text-muted-foreground truncate">{p.startDate.toLocaleDateString("id-ID")} - {p.endDate.toLocaleDateString("id-ID")}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{list.length} entri</Badge>
                        <Button onClick={() => openAddFor(p)} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Pendapatan
                        </Button>
                      </div>
                    </CardHeader>
                    <div className="px-4 py-3 border-t bg-muted/30">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs text-muted-foreground">Total Pendapatan</div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(total)}</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border">
                          <div className="text-xs text-muted-foreground">Jumlah Entri</div>
                          <div className="text-lg font-bold">{list.length}</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border col-span-2 md:col-span-1">
                          <div className="text-xs text-muted-foreground">Rata-rata/Entri</div>
                          <div className="text-lg font-bold">{formatCurrency(avg)}</div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="min-w-0">
                      {list.length === 0 ? (
                        <p className="text-muted-foreground">Belum ada pendapatan untuk periode ini.</p>
                      ) : (
                        <div className="space-y-3">
                          {list.map((e) => (
                            <div key={e.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{e.customerName}</div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{e.date.toLocaleDateString("id-ID")} {e.createdByName ? `• ${e.createdByName}` : ""}</div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap sm:self-end sm:justify-end">
                                <div className="text-right mr-0 sm:mr-2 min-w-[140px]">
                                  <div className="font-semibold text-blue-600">{formatCurrency(e.incomeAmount)}</div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => { setSelectedPeriod(p); setSelectedIncome(e); setIsEditOpen(true) }}>
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => handleDeleteIncome(e.id, p)}>
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {selectedPeriod && (
            <AddIncomeModal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              onSubmit={handleAddIncome}
              periodId={selectedPeriod.id}
              periodStart={selectedPeriod.startDate}
              periodEnd={selectedPeriod.endDate}
            />
          )}

          {selectedPeriod && selectedIncome && (
            <EditIncomeModal
              isOpen={isEditOpen}
              onClose={() => { setIsEditOpen(false); setSelectedIncome(null) }}
              onSubmit={handleEditIncome}
              periodStart={selectedPeriod.startDate}
              periodEnd={selectedPeriod.endDate}
              income={selectedIncome}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function PendapatanPage() {
  return (
    <AdminGuard>
      <PendapatanContent />
    </AdminGuard>
  )
}


