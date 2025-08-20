"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { Plus, TrendingUp, Package, DollarSign, Percent, AlertCircle, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PeriodsService } from "@/lib/periods-service"
import { Period } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

function DashboardContent() {
  const { isConfigured } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)

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
    } catch (error) {
      console.error("Error loading periods:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals from periods data
  const calculateTotals = () => {
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

    return {
      totalRevenue,
      totalItems,
      averageProfit,
      profitMargin
    }
  }

  const stats = calculateTotals()

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
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
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
                <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
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
                            <p className="text-muted-foreground">Total Customer</p>
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
                <CardTitle>Ringkasan Semua Periode</CardTitle>
                <CardDescription>Total dari semua periode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Periode</span>
                    <span className="font-medium">{periods.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Periode Aktif</span>
                    <span className="font-medium">{periods.filter(p => p.isActive).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Customer</span>
                    <span className="font-medium">{periods.reduce((sum, p) => sum + p.totalProducts, 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Revenue</span>
                    <span className="font-medium text-primary">{formatCurrency(periods.reduce((sum, p) => sum + p.totalRevenue, 0))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Profit</span>
                    <span className="font-medium text-primary">{formatCurrency(periods.reduce((sum, p) => sum + p.totalProfit, 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
