"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Plus, TrendingUp, Package, DollarSign, Percent, AlertCircle, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PeriodsService } from "@/lib/periods-service"
import { IncomesService } from "@/lib/incomes-service"
import { ExpensesService } from "@/lib/expenses-service"
import { Period, Income, Expense } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

function DashboardContent() {
  const { isConfigured } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [incomesByPeriod, setIncomesByPeriod] = useState<Record<string, Income[]>>({})
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, Expense[]>>({})

  useEffect(() => {
    loadPeriods()
  }, [])

  const loadPeriods = async () => {
    try {
      setLoading(true)
      const periodsData = await PeriodsService.getPeriods()
      const periodsWithItems = await Promise.all(
        periodsData.map(async (period) => {
          const items = await PeriodsService.getPeriodItems(period.id)
          return { ...period, items }
        })
      )
      setPeriods(periodsWithItems)
      // Fetch incomes & expenses per period
      const incomeEntries = await Promise.all(
        periodsData.map(async (p) => [p.id, await IncomesService.getIncomesByPeriod(p.id)] as const)
      )
      const expenseEntries = await Promise.all(
        periodsData.map(async (p) => [p.id, await ExpensesService.getExpensesByPeriod(p.id)] as const)
      )
      const incomeMap: Record<string, Income[]> = {}
      incomeEntries.forEach(([id, arr]) => (incomeMap[id] = arr))
      const expenseMap: Record<string, Expense[]> = {}
      expenseEntries.forEach(([id, arr]) => (expenseMap[id] = arr))
      setIncomesByPeriod(incomeMap)
      setExpensesByPeriod(expenseMap)
    } catch (error) {
      console.error("Error loading periods:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals & aggregations
  const stats = useMemo(() => {
    let totalRevenue = 0
    let totalItems = 0
    let totalProfit = 0
    let totalMargin = 0
    let activePeriods = 0

    periods.forEach(period => {
      if (period.isActive) {
        totalRevenue += period.totalRevenue
        totalItems += period.totalProducts
        totalProfit += period.totalProfit
        totalMargin += period.averageMargin
        activePeriods++
      }
    })

    const averageProfit = activePeriods > 0 ? totalProfit / activePeriods : 0
    const profitMargin = activePeriods > 0 ? totalMargin / activePeriods : 0

    // Income/Expense totals across all periods
    const allIncomes = Object.values(incomesByPeriod).flat()
    const allExpenses = Object.values(expensesByPeriod).flat()
    const totalIncomeAll = allIncomes.reduce((s, i) => s + i.incomeAmount, 0)
    const totalExpenseAll = allExpenses.reduce((s, e) => s + e.totalInIDR, 0)
    const netAll = totalIncomeAll - totalExpenseAll

    // Top customers by income
    const byCustomer = new Map<string, number>()
    for (const inc of allIncomes) {
      byCustomer.set(inc.customerName, (byCustomer.get(inc.customerName) || 0) + inc.incomeAmount)
    }
    const topCustomers = Array.from(byCustomer.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalRevenue,
      totalItems,
      averageProfit,
      profitMargin,
      totalIncomeAll,
      totalExpenseAll,
      netAll,
      topCustomers,
    }
  }, [periods, incomesByPeriod, expensesByPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat dashboard...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-6">
          {!isConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Demo Mode: Firebase belum dikonfigurasi. Data yang ditampilkan adalah contoh. Silakan tambahkan
                environment variables Firebase untuk menggunakan data real.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">Dashboard</h1>
              <p className="text-muted-foreground">Ringkasan bisnis jastip Anda</p>
            </div>
            <Button className="w-fit" onClick={() => window.location.href = '/periods'}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (Produk)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {periods.filter(p => p.isActive).length > 0 ? 'Dari periode aktif' : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {periods.filter(p => p.isActive).length > 0 ? 'Produk terjual' : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.averageProfit)}</div>
                <p className="text-xs text-muted-foreground">Per periode aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margin Profit</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Rata-rata margin</p>
              </CardContent>
            </Card>
          </div>

          {/* Income/Expense summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan (Incomes)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalIncomeAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalExpenseAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net (Pendapatan - Pengeluaran)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.netAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Periode Aktif</CardTitle>
                <CardDescription>Periode yang sedang berjalan</CardDescription>
              </CardHeader>
              <CardContent>
                {periods.filter(p => p.isActive).length > 0 ? (
                  <div className="space-y-4">
                    {periods.filter(p => p.isActive).map((period) => (
                      <div key={period.id} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{period.name}</h3>
                          <Badge variant="default">Aktif</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Periode</p>
                            <p className="font-medium">{formatDate(period.startDate)} - {formatDate(period.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Item</p>
                            <p className="font-medium">{period.totalProducts}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium text-green-600">{formatCurrency(period.totalRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit</p>
                            <p className="font-medium text-blue-600">{formatCurrency(period.totalProfit)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tidak ada periode aktif</p>
                    <Button 
                      className="mt-2" 
                      variant="outline"
                      onClick={() => window.location.href = '/periods'}
                    >
                      Buat Periode
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Periode (Pendapatan & Pengeluaran)</CardTitle>
                <CardDescription>Total per periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {periods.map((p) => {
                    const incomes = incomesByPeriod[p.id] || []
                    const expenses = expensesByPeriod[p.id] || []
                    const totalIncome = incomes.reduce((s, i) => s + i.incomeAmount, 0)
                    const totalExpense = expenses.reduce((s, e) => s + e.totalInIDR, 0)
                    const net = totalIncome - totalExpense
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.startDate.toLocaleDateString('id-ID')} - {p.endDate.toLocaleDateString('id-ID')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Pendapatan</div>
                          <div className="font-semibold">{formatCurrency(totalIncome)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Pengeluaran</div>
                          <div className="font-semibold">{formatCurrency(totalExpense)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Net</div>
                          <div className="font-semibold">{formatCurrency(net)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers by Income */}
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan per Customer (Top 5)</CardTitle>
              <CardDescription>Akumulasi semua periode</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topCustomers.length === 0 ? (
                <p className="text-muted-foreground">Belum ada pendapatan tercatat.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topCustomers.map(([name, amount]) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="font-medium truncate">{name}</div>
                      <div className="font-semibold text-primary">{formatCurrency(amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Plus, TrendingUp, Package, DollarSign, Percent, AlertCircle, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PeriodsService } from "@/lib/periods-service"
import { IncomesService } from "@/lib/incomes-service"
import { ExpensesService } from "@/lib/expenses-service"
import { Period, Income, Expense } from "@/lib/types"

function DashboardContent() {
  const { isConfigured } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [incomesByPeriod, setIncomesByPeriod] = useState<Record<string, Income[]>>({})
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, Expense[]>>({})

  useEffect(() => {
    loadPeriods()
  }, [])

  const loadPeriods = async () => {
    try {
      setLoading(true)
      const periodsData = await PeriodsService.getPeriods()
      const periodsWithItems = await Promise.all(
        periodsData.map(async (period) => {
          const items = await PeriodsService.getPeriodItems(period.id)
          return { ...period, items }
        })
      )
      setPeriods(periodsWithItems)
      const incomeEntries = await Promise.all(
        periodsData.map(async (p) => [p.id, await IncomesService.getIncomesByPeriod(p.id)] as const)
      )
      const expenseEntries = await Promise.all(
        periodsData.map(async (p) => [p.id, await ExpensesService.getExpensesByPeriod(p.id)] as const)
      )
      const incomeMap: Record<string, Income[]> = {}
      incomeEntries.forEach(([id, arr]) => (incomeMap[id] = arr))
      const expenseMap: Record<string, Expense[]> = {}
      expenseEntries.forEach(([id, arr]) => (expenseMap[id] = arr))
      setIncomesByPeriod(incomeMap)
      setExpensesByPeriod(expenseMap)
    } catch (error) {
      console.error("Error loading periods:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    let totalRevenue = 0
    let totalItems = 0
    let totalProfit = 0
    let totalMargin = 0
    let activePeriods = 0

    periods.forEach(period => {
      if (period.isActive) {
        totalRevenue += period.totalRevenue
        totalItems += period.totalProducts
        totalProfit += period.totalProfit
        totalMargin += period.averageMargin
        activePeriods++
      }
    })

    const averageProfit = activePeriods > 0 ? totalProfit / activePeriods : 0
    const profitMargin = activePeriods > 0 ? totalMargin / activePeriods : 0

    const allIncomes = Object.values(incomesByPeriod).flat()
    const allExpenses = Object.values(expensesByPeriod).flat()
    const totalIncomeAll = allIncomes.reduce((s, i) => s + i.incomeAmount, 0)
    const totalExpenseAll = allExpenses.reduce((s, e) => s + e.totalInIDR, 0)
    const netAll = totalIncomeAll - totalExpenseAll

    const byCustomer = new Map<string, number>()
    for (const inc of allIncomes) {
      byCustomer.set(inc.customerName, (byCustomer.get(inc.customerName) || 0) + inc.incomeAmount)
    }
    const topCustomers = Array.from(byCustomer.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { totalRevenue, totalItems, averageProfit, profitMargin, totalIncomeAll, totalExpenseAll, netAll, topCustomers }
  }, [periods, incomesByPeriod, expensesByPeriod])

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
  const formatDate = (date: Date) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date)

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-background">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat dashboard...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-6">
          {!isConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Demo Mode: Firebase belum dikonfigurasi.</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">Dashboard</h1>
              <p className="text-muted-foreground">Ringkasan bisnis jastip Anda</p>
            </div>
            <Button className="w-fit" onClick={() => window.location.href = '/periods'}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Produk
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (Produk)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{periods.filter(p => p.isActive).length > 0 ? 'Dari periode aktif' : 'Belum ada data'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">{periods.filter(p => p.isActive).length > 0 ? 'Produk terjual' : 'Belum ada data'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.averageProfit)}</div>
                <p className="text-xs text-muted-foreground">Per periode aktif</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margin Profit</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Rata-rata margin</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan (Incomes)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalIncomeAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalExpenseAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net (Pendapatan - Pengeluaran)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats.netAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Periode Aktif</CardTitle>
                <CardDescription>Periode yang sedang berjalan</CardDescription>
              </CardHeader>
              <CardContent>
                {periods.filter(p => p.isActive).length > 0 ? (
                  <div className="space-y-4">
                    {periods.filter(p => p.isActive).map((period) => (
                      <div key={period.id} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{period.name}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Aktif</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Periode</p>
                            <p className="font-medium">{formatDate(period.startDate)} - {formatDate(period.endDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Item</p>
                            <p className="font-medium">{period.totalProducts}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium text-primary">{formatCurrency(period.totalRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit</p>
                            <p className="font-medium text-primary">{formatCurrency(period.totalProfit)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tidak ada periode aktif</p>
                    <Button className="mt-2" variant="outline" onClick={() => window.location.href = '/periods'}>
                      Buat Periode
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Periode (Pendapatan & Pengeluaran)</CardTitle>
                <CardDescription>Total per periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {periods.map((p) => {
                    const incomes = incomesByPeriod[p.id] || []
                    const expenses = expensesByPeriod[p.id] || []
                    const totalIncome = incomes.reduce((s, i) => s + i.incomeAmount, 0)
                    const totalExpense = expenses.reduce((s, e) => s + e.totalInIDR, 0)
                    const net = totalIncome - totalExpense
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.startDate.toLocaleDateString('id-ID')} - {p.endDate.toLocaleDateString('id-ID')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Pendapatan</div>
                          <div className="font-semibold">{formatCurrency(totalIncome)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Pengeluaran</div>
                          <div className="font-semibold">{formatCurrency(totalExpense)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Net</div>
                          <div className="font-semibold">{formatCurrency(net)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pendapatan per Customer (Top 5)</CardTitle>
              <CardDescription>Akumulasi semua periode</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topCustomers.length === 0 ? (
                <p className="text-muted-foreground">Belum ada pendapatan tercatat.</p>
              ) : (
                <div className="space-y-3">
                  {stats.topCustomers.map(([name, amount]) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="font-medium truncate">{name}</div>
                      <div className="font-semibold text-primary">{formatCurrency(amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  )
}


