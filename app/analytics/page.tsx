"use client"

import { useState, useEffect } from "react"
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

  // Demo data
  useEffect(() => {
    if (!user) return

    const demoAnalytics: AnalyticsData = {
      totalRevenue: 83000000,
      totalProfit: 15300000,
      totalProducts: 27,
      averageMargin: 18.4,
      revenueGrowth: 18.4,
      profitGrowth: 25.2,
      monthlyData: [
        { month: "Jul", revenue: 25000000, profit: 4500000, products: 8 },
        { month: "Aug", revenue: 38000000, profit: 6800000, products: 12 },
        { month: "Sep", revenue: 45000000, profit: 8500000, products: 15 },
      ],
      categoryData: [
        { name: "Electronics", value: 45, profit: 8500000 },
        { name: "Fashion", value: 30, profit: 4200000 },
        { name: "Beauty", value: 15, profit: 1800000 },
        { name: "Others", value: 10, profit: 800000 },
      ],
      topProducts: [
        { name: "iPhone 15 Pro", profit: 1515000, margin: 10.1, category: "Electronics" },
        { name: "MacBook Air M2", profit: 2800000, margin: 15.2, category: "Electronics" },
        { name: "Nike Air Jordan", profit: 500000, margin: 18.5, category: "Fashion" },
        { name: "Dyson Hair Dryer", profit: 800000, margin: 22.1, category: "Beauty" },
        { name: "Apple Watch", profit: 650000, margin: 12.8, category: "Electronics" },
      ],
    }
    setAnalytics(demoAnalytics)
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (!analytics) {
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
                  <TrendingUp className="h-3 w-3 mr-1" />+{analytics.revenueGrowth}% dari bulan lalu
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
                  <TrendingUp className="h-3 w-3 mr-1" />+{analytics.profitGrowth}% dari bulan lalu
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
                <CardTitle className="text-lg">Distribusi Kategori</CardTitle>
                <CardDescription>Berdasarkan profit</CardDescription>
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
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, "Persentase"]} />
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
                  <div key={product.name} className="flex items-center justify-between p-3 rounded-lg border">
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
