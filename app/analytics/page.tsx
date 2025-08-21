"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, DollarSign, Package, Percent, Download } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { PeriodsService } from "@/lib/periods-service"
import type { Period, PeriodItem } from "@/lib/types"

interface AnalyticsData {
  totalRevenue: number
  totalProfit: number
  totalProducts: number
  averageMargin: number
  revenueGrowth: number
  profitGrowth: number
  monthlyData: Array<{
    month: string
    revenue: number
    profit: number
    products: number
  }>
  categoryData: Array<{
    name: string
    value: number
    profit: number
  }>
  topProducts: Array<{
    name: string
    profit: number
    margin: number
    category: string
  }>
}

function AnalyticsContent() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        setLoading(true)
        // Ambil semua periode
        const periods: Period[] = await PeriodsService.getPeriods()

        // Tentukan periode mana yang dipakai berdasarkan filter
        let targetPeriodIds: string[] = []
        if (selectedPeriod === "current") {
          const active = periods.find((p) => p.isActive)
          if (active) targetPeriodIds = [active.id]
        } else {
          // all dan last30: gunakan semua periode
          targetPeriodIds = periods.map((p) => p.id)
        }

        // Ambil items untuk periode terpilih
        const itemsArrays = await Promise.all(
          targetPeriodIds.map((id) => PeriodsService.getPeriodItems(id))
        )
        let items: PeriodItem[] = itemsArrays.flat()

        // Filter last30 jika perlu
        if (selectedPeriod === "last30") {
          const cutoff = new Date()
          cutoff.setDate(cutoff.getDate() - 30)
          items = items.filter((it) => it.createdAt >= cutoff)
        }

        // Hitung metrik agregat
        const totalRevenue = items.reduce((sum, it) => sum + it.sellingPrice, 0)
        const totalProfit = items.reduce((sum, it) => sum + it.profit, 0)
        const totalProducts = items.length
        const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

        // Growth sederhana: bandingkan 30 hari terakhir vs 30 hari sebelumnya
        const now = new Date()
        const last30Start = new Date(now)
        last30Start.setDate(now.getDate() - 30)
        const prev30Start = new Date(now)
        prev30Start.setDate(now.getDate() - 60)

        const last30Items = items.filter((it) => it.createdAt >= last30Start)
        const prev30Items = items.filter((it) => it.createdAt < last30Start && it.createdAt >= prev30Start)
        const last30Revenue = last30Items.reduce((s, it) => s + it.sellingPrice, 0)
        const prev30Revenue = prev30Items.reduce((s, it) => s + it.sellingPrice, 0)
        const last30Profit = last30Items.reduce((s, it) => s + it.profit, 0)
        const prev30Profit = prev30Items.reduce((s, it) => s + it.profit, 0)

        const revenueGrowth = prev30Revenue > 0 ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100 : 0
        const profitGrowth = prev30Profit > 0 ? ((last30Profit - prev30Profit) / prev30Profit) * 100 : 0

        // Monthly trend dari items.createdAt (6 bulan terakhir)
        const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        const monthLabel = (d: Date) => d.toLocaleString("id-ID", { month: "short" })
        const byMonth = new Map<string, { date: Date; revenue: number; profit: number; products: number }>()
        const sixMonthsAgo = new Date(now)
        sixMonthsAgo.setMonth(now.getMonth() - 5)
        // Seed 6 bulan agar tidak kosong
        for (let i = 0; i < 6; i++) {
          const d = new Date(sixMonthsAgo)
          d.setMonth(sixMonthsAgo.getMonth() + i)
          byMonth.set(monthKey(d), { date: d, revenue: 0, profit: 0, products: 0 })
        }
        for (const it of items) {
          const key = monthKey(it.createdAt)
          const entry = byMonth.get(key)
          if (entry) {
            entry.revenue += it.sellingPrice
            entry.profit += it.profit
            entry.products += 1
          }
        }
        const monthlyData = Array.from(byMonth.values())
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((m) => ({ month: monthLabel(m.date), revenue: m.revenue, profit: m.profit, products: m.products }))

        // Category distribution: gunakan customerName sebagai kategori (berdasarkan revenue share)
        const byCustomer = new Map<string, { revenue: number; profit: number }>()
        for (const it of items) {
          const cur = byCustomer.get(it.customerName) || { revenue: 0, profit: 0 }
          cur.revenue += it.sellingPrice
          cur.profit += it.profit
          byCustomer.set(it.customerName, cur)
        }
        const totalRevenueForShare = Array.from(byCustomer.values()).reduce((s, v) => s + v.revenue, 0)
        let categoryData = Array.from(byCustomer.entries()).map(([name, v]) => ({
          name,
          value: totalRevenueForShare > 0 ? (v.revenue / totalRevenueForShare) * 100 : 0,
          profit: v.profit,
        }))
        // Ambil top 4, gabungkan sisanya ke "Lainnya"
        categoryData.sort((a, b) => b.value - a.value)
        if (categoryData.length > 5) {
          const top4 = categoryData.slice(0, 4)
          const others = categoryData.slice(4)
          const othersAgg = others.reduce(
            (acc, cur) => ({ name: "Lainnya", value: acc.value + cur.value, profit: acc.profit + cur.profit }),
            { name: "Lainnya", value: 0, profit: 0 }
          )
          categoryData = [...top4, othersAgg]
        }

        // Top products: berdasarkan profit
        const topProducts = [...items]
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5)
          .map((it) => ({ name: it.itemName || "Item", profit: it.profit, margin: Number(it.margin.toFixed(1)), category: it.customerName }))

        setAnalytics({
          totalRevenue,
          totalProfit,
          totalProducts,
          averageMargin: Number(averageMargin.toFixed(1)),
          revenueGrowth: Number(revenueGrowth.toFixed(1)),
          profitGrowth: Number(profitGrowth.toFixed(1)),
          monthlyData,
          categoryData,
          topProducts,
        })
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setAnalytics({
          totalRevenue: 0,
          totalProfit: 0,
          totalProducts: 0,
          averageMargin: 0,
          revenueGrowth: 0,
          profitGrowth: 0,
          monthlyData: [],
          categoryData: [],
          topProducts: [],
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user, selectedPeriod])

  if (!analytics || loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data analytics...</p>
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
          {/* Mobile-first header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Insights bisnis jastip Anda</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  <SelectItem value="current">Periode Aktif</SelectItem>
                  <SelectItem value="last30">30 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Mobile-first summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />{analytics.revenueGrowth >= 0 ? "+" : ""}{analytics.revenueGrowth}% dari periode sebelumnya
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.totalProfit)}
                </div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />{analytics.profitGrowth >= 0 ? "+" : ""}{analytics.profitGrowth}% dari periode sebelumnya
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{analytics.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Produk terjual</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Margin</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-green-600">{analytics.averageMargin}%</div>
                <p className="text-xs text-muted-foreground mt-1">Margin keuntungan</p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-first charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trend Revenue & Profit</CardTitle>
                <CardDescription>Perkembangan bulanan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), ""]}
                        labelFormatter={(label) => `Bulan ${label}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribusi Customer</CardTitle>
                <CardDescription>Berdasarkan share revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value?.toFixed(1)}%`}
                      >
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${(value as number).toFixed(1)}%`, "Persentase"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products - Mobile optimized */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 5 Produk Terbaik</CardTitle>
              <CardDescription>Berdasarkan profit tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.name + index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          <span className="text-sm text-green-600 font-medium">{product.margin}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-green-600">{formatCurrency(product.profit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsContent />
    </AdminGuard>
  )
}
