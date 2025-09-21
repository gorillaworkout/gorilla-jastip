"use client"

import { useEffect, useState } from "react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
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
import { useToast } from "@/hooks/use-toast"


function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

function formatYen(amount: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", minimumFractionDigits: 0 }).format(amount)
}

function PengeluaranContent() {
  const { user } = useAuth()
  const { toast } = useToast()
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
            // Sort by createdAt descending (newest first)
            const sortedEx = ex.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            return [p.id, sortedEx] as const
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
    try {
      const expenseId = await ExpensesService.addExpense(data)
      
      // Create new expense object to add to local state
      const newExpense: Expense = {
        id: expenseId,
        periodId: data.periodId,
        date: new Date(data.date),
        itemName: data.itemName,
        expensePrice: Number.parseFloat(data.expensePrice),
        exchangeRate: Number.parseFloat(data.exchangeRate),
        totalInIDR: Number.parseFloat(data.expensePrice) * Number.parseFloat(data.exchangeRate),
        category: data.category,
        notes: data.notes || "",
        createdBy: user?.id || "",
        createdByName: user?.name || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Add to local state and sort by createdAt descending (newest first)
      setExpensesByPeriod((prev) => {
        const currentList = prev[selectedPeriod.id] || []
        const updatedList = [newExpense, ...currentList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        return { ...prev, [selectedPeriod.id]: updatedList }
      })
      
      setIsAddOpen(false)
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil ditambahkan.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Gagal menambahkan pengeluaran. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const handleEditExpense = async (expenseId: string, data: any) => {
    if (!selectedPeriod) return
    try {
      await ExpensesService.updateExpense(expenseId, data)
      
      // Update local state directly
      setExpensesByPeriod((prev) => {
        const currentList = prev[selectedPeriod.id] || []
        const updatedList = currentList.map(expense => {
          if (expense.id === expenseId) {
            return {
              ...expense,
              date: new Date(data.date),
              itemName: data.itemName,
              expensePrice: Number.parseFloat(data.expensePrice),
              exchangeRate: Number.parseFloat(data.exchangeRate),
              totalInIDR: Number.parseFloat(data.expensePrice) * Number.parseFloat(data.exchangeRate),
              category: data.category,
              notes: data.notes || "",
              updatedAt: new Date(),
            }
          }
          return expense
        })
        // Sort by createdAt descending (newest first)
        return { ...prev, [selectedPeriod.id]: updatedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) }
      })
      
      setIsEditOpen(false)
      setSelectedExpense(null)
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil diperbarui.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating expense:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui pengeluaran. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteExpense = async (expenseId: string, period: Period) => {
    try {
      await ExpensesService.deleteExpense(expenseId)
      
      // Remove from local state directly
      setExpensesByPeriod((prev) => {
        const currentList = prev[period.id] || []
        const updatedList = currentList.filter(expense => expense.id !== expenseId)
        return { ...prev, [period.id]: updatedList }
      })
      
      toast({
        title: "Berhasil!",
        description: "Pengeluaran berhasil dihapus.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus pengeluaran. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="flex items-center justify-center min-h-[60vh] p-6">
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
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile header menu */}
        <MobileHeader title="Pengeluaran" />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Pengeluaran</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">Catat pengeluaran harian per periode</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v)}>
                  <SelectTrigger className="w-full sm:w-44">
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
            </div>
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
                const totalYen = list.reduce((sum, e) => sum + e.expensePrice, 0)
                return (
                  <Card key={p.id} className="overflow-hidden">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>{p.name}</CardTitle>
                        <div className="text-sm text-muted-foreground truncate">
                          {p.startDate.toLocaleDateString("id-ID")} - {p.endDate.toLocaleDateString("id-ID")} • Total: <span className="font-semibold text-red-600">{formatYen(totalYen)}</span> / <span className="font-semibold text-red-600">{formatCurrency(total)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{list.length} item</Badge>
                        <Button onClick={() => openAddFor(p)} className="bg-blue-500 hover:bg-blue-600">
                          <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="min-w-0">
                      {list.length === 0 ? (
                        <p className="text-muted-foreground">Belum ada pengeluaran untuk periode ini.</p>
                      ) : (
                        <div className="space-y-3">
                          {list.map((e) => (
                            <div key={e.id} className="flex flex-col gap-3 p-3 rounded-lg border">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-600 text-xs sm:text-sm">¥</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate text-sm sm:text-base">{e.itemName}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{e.date.toLocaleDateString("id-ID")} • {e.category}{e.createdByName ? ` • ${e.createdByName}` : ""}</div>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-left sm:text-right">
                                  <div className="text-xs sm:text-sm text-muted-foreground">{e.expensePrice.toLocaleString()} YEN × {e.exchangeRate.toLocaleString()}</div>
                                  <div className="font-semibold text-sm sm:text-base">{formatCurrency(e.totalInIDR)}</div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none mobile-button" onClick={() => { setSelectedPeriod(p); setSelectedExpense(e); setIsEditOpen(true) }}>Edit</Button>
                                  <Button variant="destructive" size="sm" className="flex-1 sm:flex-none mobile-button" onClick={() => handleDeleteExpense(e.id, p)}>Hapus</Button>
                                </div>
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