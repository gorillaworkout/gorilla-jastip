"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddExpenseModal } from "@/components/expenses/add-expense-modal"
import { EditExpenseModal } from "@/components/expenses/edit-expense-modal"
import { PeriodsService } from "@/lib/periods-service"
import { ExpensesService } from "@/lib/expenses-service"
import type { Expense, Period } from "@/lib/types"
import { Plus, Wallet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

function PengeluaranContent() {
  const { user } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, Expense[]>>({})
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [ownerFilter, setOwnerFilter] = useState<"all" | "me" | string>("all")
  const adminOptions = Array.from(
    new Map(
      Object.values(expensesByPeriod)
        .flat()
        .filter((e) => !!e.createdBy && !!e.createdByName)
        .map((e) => [e.createdBy as string, e.createdByName as string])
    ).entries()
  ) as Array<[string, string]>

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const ps = await PeriodsService.getPeriods()
        setPeriods(ps)
        const entries = await Promise.all(
          ps.map(async (p) => {
            const ex = await ExpensesService.getExpensesByPeriod(p.id)
            return [p.id, ex] as const
          })
        )
        const map: Record<string, Expense[]> = {}
        entries.forEach(([id, ex]) => (map[id] = ex))
        setExpensesByPeriod(map)
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

  const handleAddExpense = async (data: any) => {
    if (!selectedPeriod) return
    await ExpensesService.addExpense(data)
    const updated = await ExpensesService.getExpensesByPeriod(selectedPeriod.id)
    setExpensesByPeriod((prev) => ({ ...prev, [selectedPeriod.id]: updated }))
    setIsAddOpen(false)
  }

  const handleEditExpense = async (expenseId: string, data: any) => {
    if (!selectedPeriod) return
    await ExpensesService.updateExpense(expenseId, data)
    const updated = await ExpensesService.getExpensesByPeriod(selectedPeriod.id)
    setExpensesByPeriod((prev) => ({ ...prev, [selectedPeriod.id]: updated }))
    setIsEditOpen(false)
    setSelectedExpense(null)
  }

  const handleDeleteExpense = async (expenseId: string, period: Period) => {
    await ExpensesService.deleteExpense(expenseId)
    const updated = await ExpensesService.getExpensesByPeriod(period.id)
    setExpensesByPeriod((prev) => ({ ...prev, [period.id]: updated }))
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data pengeluaran...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pengeluaran</h1>
              <p className="text-muted-foreground">Catat pengeluaran harian per periode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Admin</SelectItem>
                {user?.id && <SelectItem value={user.id}>Admin: {user.name || user.id}</SelectItem>}
                {adminOptions
                  .filter(([uid]) => uid !== user?.id)
                  .map(([uid, name]) => (
                    <SelectItem key={uid} value={uid}>Admin: {name || uid}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {periods.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Belum ada periode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Buat periode di menu Periode untuk mulai mencatat pengeluaran.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {periods.map((p) => {
                let list = expensesByPeriod[p.id] || []
                if (ownerFilter !== "all") {
                  list = list.filter((e) => e.createdBy === ownerFilter)
                }
                const total = list.reduce((sum, e) => sum + e.totalInIDR, 0)
                return (
                  <Card key={p.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{p.name}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {p.startDate.toLocaleDateString("id-ID")} - {p.endDate.toLocaleDateString("id-ID")} • Total:{" "}
                          <span className="font-semibold text-red-600">{formatCurrency(total)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{list.length} item</Badge>
                        <Button onClick={() => openAddFor(p)} className="bg-blue-500 hover:bg-blue-600">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {list.length === 0 ? (
                        <p className="text-muted-foreground">Belum ada pengeluaran untuk periode ini.</p>
                      ) : (
                        <div className="space-y-3">
                          {list.map((e) => (
                            <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                  <span className="text-red-600 text-sm">¥</span>
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{e.itemName}</div>
                                  <div className="text-xs text-muted-foreground">{e.date.toLocaleDateString("id-ID")} • {e.category}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                  <div className="text-sm text-muted-foreground">{e.expensePrice.toLocaleString()} YEN × {e.exchangeRate.toLocaleString()}</div>
                                  <div className="font-semibold">{formatCurrency(e.totalInIDR)}</div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => { setSelectedPeriod(p); setSelectedExpense(e); setIsEditOpen(true) }}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteExpense(e.id, p)}>Hapus</Button>
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
            <AddExpenseModal
              isOpen={isAddOpen}
              onClose={() => setIsAddOpen(false)}
              onSubmit={handleAddExpense}
              periodId={selectedPeriod.id}
              periodStart={selectedPeriod.startDate}
              periodEnd={selectedPeriod.endDate}
            />
          )}

          {selectedPeriod && selectedExpense && (
            <EditExpenseModal
              isOpen={isEditOpen}
              onClose={() => { setIsEditOpen(false); setSelectedExpense(null) }}
              onSubmit={handleEditExpense}
              periodStart={selectedPeriod.startDate}
              periodEnd={selectedPeriod.endDate}
              expense={selectedExpense}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function PengeluaranPage() {
  return (
    <AdminGuard>
      <PengeluaranContent />
    </AdminGuard>
  )
}