"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, Download, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"

interface RevenueData {
  currentRevenue: number
  targetRevenue: number
  currentProfit: number
  targetProfit: number
  monthlyBreakdown: Array<{
    month: string
    revenue: number
    profit: number
    target: number
  }>
  weeklyData: Array<{
    week: string
    revenue: number
    profit: number
  }>
}

function RevenueContent() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("current")
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)

  // Demo data
  useEffect(() => {
    if (!user) return

    const demoData: RevenueData = {
      currentRevenue: 45000000,
      targetRevenue: 50000000,
      currentProfit: 8500000,
      targetProfit: 10000000,
      monthlyBreakdown: [
        { month: "Juli", revenue: 25000000, profit: 4500000, target: 30000000 },
        { month: "Agustus", revenue: 38000000, profit: 6800000, target: 40000000 },
        { month: "September", revenue: 45000000, profit: 8500000, target: 50000000 },
      ],
      weeklyData: [
        { week: "Minggu 1", revenue: 12000000, profit: 2200000 },
        { week: "Minggu 2", revenue: 11500000, profit: 2100000 },
        { week: "Minggu 3", revenue: 10800000, profit: 1950000 },
        { week: "Minggu 4", revenue: 10700000, profit: 2250000 },
      ],
    }
    setRevenueData(demoData)
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "text-green-600"
    if (progress >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  if (!revenueData) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data revenue...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const revenueProgress = calculateProgress(revenueData.currentRevenue, revenueData.targetRevenue)
  const profitProgress = calculateProgress(revenueData.currentProfit, revenueData.targetProfit)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
          {/* Mobile-first header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Revenue Tracking</h1>
              <p className="text-muted-foreground">Monitor pencapaian target revenue</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Periode Aktif</SelectItem>
                  <SelectItem value="last30">30 Hari Terakhir</SelectItem>
                  <SelectItem value="last90">90 Hari Terakhir</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Target Progress Cards - Mobile optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Target Revenue</CardTitle>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Progress pencapaian target bulanan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(revenueData.currentRevenue)}</p>
                    <p className="text-sm text-muted-foreground">dari {formatCurrency(revenueData.targetRevenue)}</p>
                  </div>
                  <Badge
                    variant={revenueProgress >= 90 ? "default" : revenueProgress >= 70 ? "secondary" : "destructive"}
                  >
                    {revenueProgress.toFixed(1)}%
                  </Badge>
                </div>

                <Progress value={revenueProgress} className="h-3" />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa target</span>
                  <span className={getProgressColor(revenueProgress)}>
                    {formatCurrency(revenueData.targetRevenue - revenueData.currentRevenue)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Target Profit</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Progress pencapaian target profit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueData.currentProfit)}</p>
                    <p className="text-sm text-muted-foreground">dari {formatCurrency(revenueData.targetProfit)}</p>
                  </div>
                  <Badge variant={profitProgress >= 90 ? "default" : profitProgress >= 70 ? "secondary" : "destructive"}>
                    {profitProgress.toFixed(1)}%
                  </Badge>
                </div>

                <Progress value={profitProgress} className="h-3" />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa target</span>
                  <span className={getProgressColor(profitProgress)}>
                    {formatCurrency(revenueData.targetProfit - revenueData.currentProfit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown - Mobile optimized */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Breakdown Bulanan</CardTitle>
              <CardDescription>Performa revenue vs target per bulan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.monthlyBreakdown.map((month) => {
                  const monthProgress = calculateProgress(month.revenue, month.target)
                  return (
                    <div key={month.month} className="p-4 rounded-lg border">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{month.month}</span>
                          <Badge
                            variant={monthProgress >= 90 ? "default" : monthProgress >= 70 ? "secondary" : "destructive"}
                          >
                            {monthProgress.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(month.revenue)}</p>
                          <p className="text-sm text-muted-foreground">Target: {formatCurrency(month.target)}</p>
                        </div>
                      </div>

                      <Progress value={monthProgress} className="h-2 mb-2" />

                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Profit: {formatCurrency(month.profit)}</span>
                        <span className="text-muted-foreground">
                          Margin: {((month.profit / month.revenue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Performance - Mobile optimized */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performa Mingguan</CardTitle>
              <CardDescription>Revenue dan profit per minggu (bulan ini)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueData.weeklyData.map((week, index) => (
                  <div key={week.week} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{week.week}</span>
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>

                    <div className="space-y-1">
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-semibold text-sm">{formatCurrency(week.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Profit</p>
                        <p className="font-semibold text-sm text-green-600">{formatCurrency(week.profit)}</p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Margin: {((week.profit / week.revenue) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Insights & Rekomendasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueProgress < 70 && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Perhatian:</strong> Revenue masih {(70 - revenueProgress).toFixed(1)}% di bawah target
                      optimal. Pertimbangkan untuk meningkatkan aktivitas marketing atau menambah produk.
                    </p>
                  </div>
                )}

                {profitProgress >= 90 && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Excellent:</strong> Target profit hampir tercapai! Pertahankan momentum ini.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Rata-rata margin profit Anda{" "}
                    {((revenueData.currentProfit / revenueData.currentRevenue) * 100).toFixed(1)}%. Fokus pada produk
                    dengan margin tinggi untuk meningkatkan profitabilitas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function RevenuePage() {
  return (
    <AdminGuard>
      <RevenueContent />
    </AdminGuard>
  )
}
