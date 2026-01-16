"use client"

import { useEffect, useState, useMemo } from "react"
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
import { Plus, Wallet, Calendar, Filter, TrendingDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"


function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

function formatYen(amount: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", minimumFractionDigits: 0 }).format(amount)
}

function formatDateISO(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })
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
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all")
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all")
  
  const adminOptions = Array.from(
    new Map(
      Object.values(expensesByPeriod)
        .flat()
        .filter((e) => !!e.createdBy && !!e.createdByName)
        .map((e) => [e.createdBy as string, e.createdByName as string])
    ).entries()
  ) as Array<[string, string]>

  // Get available dates for selected period
  const availableDates = useMemo(() => {
    if (selectedPeriodId === "all" || !periods.length) return []
    const period = periods.find(p => p.id === selectedPeriodId)
    if (!period) return []
    
    const dates: { value: string; label: string }[] = []
    const cur = new Date(period.startDate)
    while (cur <= period.endDate) {
      const dateStr = formatDateISO(cur)
      dates.push({
        value: dateStr,
        label: cur.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      })
      cur.setDate(cur.getDate() + 1)
    }
    return dates
  }, [selectedPeriodId, periods])

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    let expenses: Expense[] = []
    
    // Filter by period
    if (selectedPeriodId === "all") {
      expenses = Object.values(expensesByPeriod).flat()
    } else {
      expenses = expensesByPeriod[selectedPeriodId] || []
    }
    
    // Filter by owner
    if (ownerFilter !== "all") {
      expenses = expenses.filter((e) => e.createdBy === ownerFilter)
    }
    
    // Filter by date
    if (selectedDateFilter !== "all") {
      expenses = expenses.filter((e) => formatDateISO(e.date) === selectedDateFilter)
    }
    
    // Group by date
    const grouped: Record<string, Expense[]> = {}
    expenses.forEach(expense => {
      const dateKey = formatDateISO(expense.date)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(expense)
    })
    
    // Sort dates descending (newest first)
    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
  }, [expensesByPeriod, selectedPeriodId, selectedDateFilter, ownerFilter])

  // Calculate totals
  const totalStats = useMemo(() => {
    const allExpenses = groupedExpenses.flatMap(([, expenses]) => expenses)
    const totalYen = allExpenses.reduce((sum, e) => sum + e.expensePrice, 0)
    const totalIDR = allExpenses.reduce((sum, e) => sum + e.totalInIDR, 0)
    return { totalYen, totalIDR, count: allExpenses.length }
  }, [groupedExpenses])

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

  // Auto-select first period when periods load (only if not already set)
  useEffect(() => {
    if (periods.length > 0 && selectedPeriodId === "all" && !selectedPeriod) {
      setSelectedPeriodId(periods[0].id)
      setSelectedPeriod(periods[0])
    }
  }, [periods, selectedPeriodId, selectedPeriod])

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
    if (!selectedExpense) return
    try {
      await ExpensesService.updateExpense(expenseId, data)
      
      // Find the period for this expense
      const expensePeriodId = selectedExpense.periodId
      
      // Update local state directly
      setExpensesByPeriod((prev) => {
        const currentList = prev[expensePeriodId] || []
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
        return { ...prev, [expensePeriodId]: updatedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) }
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
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Pengeluaran</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">Catat dan kelola pengeluaran harian</p>
                </div>
              </div>
              {selectedPeriodId !== "all" && selectedPeriod && (
                <Button 
                  onClick={() => openAddFor(selectedPeriod)} 
                  className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" /> Tambah Pengeluaran
                </Button>
              )}
            </div>

            {/* Filters */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Periode
                    </label>
                    <Select value={selectedPeriodId} onValueChange={(v) => {
                      setSelectedPeriodId(v)
                      const period = periods.find(p => p.id === v)
                      setSelectedPeriod(period || null)
                      setSelectedDateFilter("all") // Reset date filter when period changes
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Periode</SelectItem>
                        {periods.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.startDate.toLocaleDateString("id-ID")} - {p.endDate.toLocaleDateString("id-ID")})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal
                    </label>
                    <Select 
                      value={selectedDateFilter} 
                      onValueChange={setSelectedDateFilter}
                      disabled={selectedPeriodId === "all"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tanggal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tanggal</SelectItem>
                        {availableDates.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Admin</label>
                    <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v)}>
                      <SelectTrigger>
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
              </CardContent>
            </Card>

            {/* Statistics Summary */}
            {totalStats.count > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatYen(totalStats.totalYen)} / {formatCurrency(totalStats.totalIDR)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {totalStats.count} item
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Expenses List */}
          {periods.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Belum ada periode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Buat periode di menu Periode untuk mulai mencatat pengeluaran.</p>
              </CardContent>
            </Card>
          ) : groupedExpenses.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {selectedDateFilter !== "all" 
                      ? "Tidak ada pengeluaran pada tanggal yang dipilih."
                      : "Belum ada pengeluaran untuk filter yang dipilih."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedExpenses.map(([dateKey, expenses]) => {
                const date = new Date(dateKey + "T00:00:00")
                const dayTotalYen = expenses.reduce((sum, e) => sum + e.expensePrice, 0)
                const dayTotalIDR = expenses.reduce((sum, e) => sum + e.totalInIDR, 0)
                
                // Get period for this expense (for edit/delete)
                const expensePeriod = expenses[0] ? periods.find(p => p.id === expenses[0].periodId) : null
                
                return (
                  <Card key={dateKey} className="overflow-hidden shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{formatDateDisplay(date)}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {expenses.length} item • Total: <span className="font-semibold text-red-600">
                                {formatYen(dayTotalYen)} / {formatCurrency(dayTotalIDR)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {expenses.map((e) => {
                          const period = periods.find(p => p.id === e.periodId)
                          return (
                            <div key={e.id} className="flex flex-col gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-600 font-semibold text-sm">¥</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-base mb-1">{e.itemName}</div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">{e.category}</Badge>
                                    {e.createdByName && (
                                      <span>• {e.createdByName}</span>
                                    )}
                                    {period && (
                                      <span>• {period.name}</span>
                                    )}
                                  </div>
                                  {e.notes && (
                                    <p className="text-sm text-muted-foreground mt-2 italic">"{e.notes}"</p>
                                  )}
                                </div>
                              </div>
                              <Separator />
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-left">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {e.expensePrice.toLocaleString()} YEN × {e.exchangeRate.toLocaleString()} = 
                                  </div>
                                  <div className="font-bold text-lg text-red-600">
                                    {formatCurrency(e.totalInIDR)}
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1 sm:flex-none" 
                                    onClick={() => { 
                                      setSelectedPeriod(period || null); 
                                      setSelectedExpense(e); 
                                      setIsEditOpen(true) 
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="flex-1 sm:flex-none" 
                                    onClick={() => period && handleDeleteExpense(e.id, period)}
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
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

          {selectedExpense && (() => {
            const expensePeriod = periods.find(p => p.id === selectedExpense.periodId)
            return expensePeriod ? (
              <EditExpenseModal
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); setSelectedExpense(null) }}
                onSubmit={handleEditExpense}
                periodStart={expensePeriod.startDate}
                periodEnd={expensePeriod.endDate}
                expense={selectedExpense}
              />
            ) : null
          })()}
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