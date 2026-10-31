"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowRight, Calendar, DollarSign, Package, Percent, Plus, TrendingDown, Users } from "lucide-react"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { ExpensesService } from "@/lib/expenses-service"
import { IncomesService } from "@/lib/incomes-service"
import { JastiperService } from "@/lib/jastiper-service"
import { PeriodsService } from "@/lib/periods-service"
import type { Expense, Income, Jastiper, Period } from "@/lib/types"

const currency = (amount: number) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(amount)

function DashboardContent() {
  const router = useRouter()
  const { isConfigured } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [incomesByPeriod, setIncomesByPeriod] = useState<Record<string, Income[]>>({})
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, Expense[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        setError("")
        const periodRows = await PeriodsService.getPeriods()
        const [periodsWithItems, jastiperRows, incomeEntries, expenseEntries] = await Promise.all([
          Promise.all(periodRows.map(async (period) => ({ ...period, items: await PeriodsService.getPeriodItems(period.id) }))),
          JastiperService.getAllJastipers(),
          Promise.all(periodRows.map(async (period) => [period.id, await IncomesService.getIncomesByPeriod(period.id)] as const)),
          Promise.all(periodRows.map(async (period) => [period.id, await ExpensesService.getExpensesByPeriod(period.id)] as const)),
        ])
        if (!active) return
        setPeriods(periodsWithItems)
        setJastipers(jastiperRows)
        setIncomesByPeriod(Object.fromEntries(incomeEntries))
        setExpensesByPeriod(Object.fromEntries(expenseEntries))
      } catch (cause) {
        console.error("Failed to load dashboard", cause)
        if (active) setError("Dashboard gagal dimuat. Periksa koneksi lalu coba lagi.")
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const stats = useMemo(() => {
    const activePeriods = periods.filter((period) => period.isActive)
    const revenue = activePeriods.reduce((sum, period) => sum + period.totalRevenue, 0)
    const products = activePeriods.reduce((sum, period) => sum + period.totalProducts, 0)
    const profit = activePeriods.reduce((sum, period) => sum + period.totalProfit, 0)
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0
    const incomes = Object.values(incomesByPeriod).flat().reduce((sum, item) => sum + item.incomeAmount, 0)
    const expenses = Object.values(expensesByPeriod).flat().reduce((sum, item) => sum + item.totalInIDR, 0)
    return {
      active: activePeriods[0], revenue, products, margin, incomes, expenses,
      verified: jastipers.filter((item) => item.isVerified).length,
    }
  }, [periods, incomesByPeriod, expensesByPeriod, jastipers])

  if (loading) {
    return <div className="flex min-h-[100dvh] bg-background"><Sidebar /><main className="min-w-0 flex-1"><MobileHeader title="Dashboard" /><div className="grid min-h-[70dvh] place-items-center px-4 text-sm text-muted-foreground">Memuat dashboard…</div></main></div>
  }

  const metricCards = [
    { label: "Revenue produk", value: currency(stats.revenue), note: "Periode aktif", icon: DollarSign },
    { label: "Produk terjual", value: String(stats.products), note: "Periode aktif", icon: Package },
    { label: "Margin terealisasi", value: `${stats.margin.toFixed(1)}%`, note: "Revenue dan profit aktif", icon: Percent },
    { label: "Jastiper", value: String(jastipers.length), note: `${stats.verified} terverifikasi`, icon: Users },
  ]

  return (
    <div className="flex min-h-[100dvh] bg-muted/20">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <MobileHeader title="Dashboard" />
        <div className="admin-page">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="admin-page-header">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Ringkasan operasional jastip.</p>
            </div>
            <Button className="w-full md:w-auto" onClick={() => router.push("/periods")}>
              <Plus className="h-4 w-4" />Tambah produk
            </Button>
          </header>

          <Card className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">Workspace: Jastip Jepang (Pribadi)</p>
                <p className="text-sm text-muted-foreground">Kelola jastip tim Cina di workspace terpisah.</p>
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => router.push("/cina")}>Buka Jastip Cina<ArrowRight className="h-4 w-4" /></Button>
            </CardContent>
          </Card>

          {!isConfigured && <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Firebase belum dikonfigurasi.</AlertDescription></Alert>}
          {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan utama">
            {metricCards.map(({ label, value, note, icon: Icon }) => (
              <Card key={label} className="min-w-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                  </div>
                  <p className="mt-3 break-words text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Arus kas tercatat</CardTitle>
                <CardDescription>Akumulasi pendapatan dan pengeluaran semua periode.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-emerald-50 p-4"><p className="text-xs text-emerald-700">Pendapatan</p><p className="mt-1 break-words font-bold text-emerald-800">{currency(stats.incomes)}</p></div>
                <div className="rounded-lg bg-rose-50 p-4"><p className="text-xs text-rose-700">Pengeluaran</p><p className="mt-1 break-words font-bold text-rose-800">{currency(stats.expenses)}</p></div>
                <div className="rounded-lg bg-slate-100 p-4"><p className="text-xs text-slate-600">Net</p><p className="mt-1 break-words font-bold">{currency(stats.incomes - stats.expenses)}</p></div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-lg">Periode aktif</CardTitle></CardHeader>
              <CardContent>
                {stats.active ? <div className="space-y-3"><Badge>Aktif</Badge><div><p className="font-semibold">{stats.active.name}</p><p className="mt-1 text-sm text-muted-foreground">{stats.active.totalProducts} produk</p></div></div> : <p className="text-sm text-muted-foreground">Belum ada periode aktif.</p>}
                <Button variant="outline" className="mt-4 w-full justify-between" onClick={() => router.push("/periods")}>Kelola periode<ArrowRight className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" />Jastiper</CardTitle><CardDescription>{jastipers.length} profil, {stats.verified} terverifikasi.</CardDescription></CardHeader>
              <CardContent><Button variant="outline" className="w-full justify-between" onClick={() => router.push("/jastipers/manage")}>Kelola jastiper<ArrowRight className="h-4 w-4" /></Button></CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" />Laporan</CardTitle><CardDescription>Analisis revenue, profit, dan customer.</CardDescription></CardHeader>
              <CardContent><Button variant="outline" className="w-full justify-between" onClick={() => router.push("/analytics")}>Buka analytics<ArrowRight className="h-4 w-4" /></Button></CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return <AdminGuard><DashboardContent /></AdminGuard>
}
