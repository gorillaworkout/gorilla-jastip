"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { Plus, TrendingUp, Package, DollarSign, Percent, AlertCircle, Calendar, Users, Shield, ShieldOff, Edit, Trash2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PeriodsService } from "@/lib/periods-service"
import { IncomesService } from "@/lib/incomes-service"
import { ExpensesService } from "@/lib/expenses-service"
import { JastiperService } from "@/lib/jastiper-service"
import { Period, Income, Expense, Jastiper, CreateJastiperData, UpdateJastiperData } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

function DashboardContent() {
  const { isConfigured } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [incomesByPeriod, setIncomesByPeriod] = useState<Record<string, Income[]>>({})
  const [expensesByPeriod, setExpensesByPeriod] = useState<Record<string, Expense[]>>({})
  
  // Jastiper management states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingJastiper, setEditingJastiper] = useState<Jastiper | null>(null)
  const [formData, setFormData] = useState<CreateJastiperData>({
    name: "",
    imageUrl: "",
    facebookLink: "",
    phoneNumber: "",
    description: "",
    completedOrders: 0,
    verifiedByFacebookLink: "",
  })
  const [jastiperError, setJastiperError] = useState<string | null>(null)

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
      
      // Load jastipers
      const jastipersData = await JastiperService.getAllJastipers()
      setJastipers(jastipersData)
      
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

  // Jastiper management functions
  const handleCreateJastiper = async () => {
    try {
      setJastiperError(null)
      await JastiperService.createJastiper(formData)
      setIsCreateModalOpen(false)
      setFormData({
        name: "",
        imageUrl: "",
        facebookLink: "",
        phoneNumber: "",
        description: "",
        completedOrders: 0,
        verifiedByFacebookLink: "",
      })
      await loadPeriods() // Reload to get updated jastipers
    } catch (err) {
      console.error("Error creating jastiper:", err)
      setJastiperError("Gagal membuat jastiper")
    }
  }

  const handleEditJastiper = async () => {
    if (!editingJastiper) return

    try {
      setJastiperError(null)
      const updateData: UpdateJastiperData = {
        name: formData.name,
        imageUrl: formData.imageUrl,
        facebookLink: formData.facebookLink,
        phoneNumber: formData.phoneNumber,
        description: formData.description,
        completedOrders: formData.completedOrders,
        verifiedByFacebookLink: formData.verifiedByFacebookLink,
      }
      
      await JastiperService.updateJastiper(editingJastiper.id, updateData)
      setIsEditModalOpen(false)
      setEditingJastiper(null)
      setFormData({
        name: "",
        imageUrl: "",
        facebookLink: "",
        phoneNumber: "",
        description: "",
        completedOrders: 0,
        verifiedByFacebookLink: "",
      })
      await loadPeriods() // Reload to get updated jastipers
    } catch (err) {
      console.error("Error updating jastiper:", err)
      setJastiperError("Gagal mengupdate jastiper")
    }
  }

  const handleVerifyToggle = async (jastiperId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await JastiperService.unverifyJastiper(jastiperId)
      } else {
        await JastiperService.verifyJastiper(jastiperId)
      }
      await loadPeriods() // Reload to get updated jastipers
    } catch (err) {
      console.error("Error toggling verification:", err)
      setJastiperError("Gagal mengubah status verifikasi")
    }
  }

  const handleDeleteJastiper = async (jastiperId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jastiper ini?")) {
      return
    }

    try {
      await JastiperService.deleteJastiper(jastiperId)
      await loadPeriods() // Reload to get updated jastipers
    } catch (err) {
      console.error("Error deleting jastiper:", err)
      setJastiperError("Gagal menghapus jastiper")
    }
  }

  const openEditModal = (jastiper: Jastiper) => {
    setEditingJastiper(jastiper)
    setFormData({
      name: jastiper.name,
      imageUrl: jastiper.imageUrl || "",
      facebookLink: jastiper.facebookLink || "",
      phoneNumber: jastiper.phoneNumber || "",
      description: jastiper.description || "",
      completedOrders: jastiper.completedOrders || 0,
      verifiedByFacebookLink: jastiper.verifiedByFacebookLink || "",
    })
    setIsEditModalOpen(true)
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

    // Jastiper stats
    const totalJastipers = jastipers.length
    const verifiedJastipers = jastipers.filter(j => j.isVerified).length
    const unverifiedJastipers = totalJastipers - verifiedJastipers

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
      totalJastipers,
      verifiedJastipers,
      unverifiedJastipers,
    }
  }, [periods, incomesByPeriod, expensesByPeriod, jastipers])

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
        {/* Mobile Header Spacing */}
        <MobileHeader />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
          {!isConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Demo Mode: Firebase belum dikonfigurasi. Data yang ditampilkan adalah contoh. Silakan tambahkan
                environment variables Firebase untuk menggunakan data real.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Ringkasan bisnis jastip Anda</p>
            </div>
            <Button onClick={() => window.location.href = '/periods'} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (Produk)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
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
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">
                  {periods.filter(p => p.isActive).length > 0 ? 'Produk terjual' : 'Belum ada data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jastiper</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalJastipers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.verifiedJastipers} terverifikasi, {stats.unverifiedJastipers} belum
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margin Profit</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.profitMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Rata-rata margin</p>
              </CardContent>
            </Card>
          </div>

          {/* Income/Expense summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan (Incomes)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(stats.totalIncomeAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(stats.totalExpenseAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net (Pendapatan - Pengeluaran)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(stats.netAll)}</div>
                <p className="text-xs text-muted-foreground">Akumulasi semua periode</p>
              </CardContent>
            </Card>
          </div>

          {/* Jastiper Management Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle>Kelola Jastiper</CardTitle>
                  <CardDescription>Statistik dan manajemen jastiper</CardDescription>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jastiper
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Jastiper Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nama Jastiper *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Masukkan nama jastiper"
                        />
                      </div>
                      <div>
                        <Label htmlFor="imageUrl">URL Gambar</Label>
                        <Input
                          id="imageUrl"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebookLink">Link Facebook</Label>
                        <Input
                          id="facebookLink"
                          value={formData.facebookLink}
                          onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="+6281234567890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Deskripsi singkat tentang jastiper"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="completedOrders">Jumlah Order Selesai</Label>
                        <Input
                          id="completedOrders"
                          type="number"
                          min="0"
                          value={formData.completedOrders}
                          onChange={(e) => setFormData({ ...formData, completedOrders: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="verifiedByFacebookLink">Link Facebook Customer Verifier</Label>
                        <Input
                          id="verifiedByFacebookLink"
                          value={formData.verifiedByFacebookLink}
                          onChange={(e) => setFormData({ ...formData, verifiedByFacebookLink: e.target.value })}
                          placeholder="https://facebook.com/customer-verifier"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Link Facebook customer yang memverifikasi jastiper ini
                        </p>
                      </div>
                      {jastiperError && (
                        <div className="text-red-600 text-sm">{jastiperError}</div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <Button onClick={handleCreateJastiper} className="flex-1">
                          Tambah Jastiper
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateModalOpen(false)}
                          className="flex-1"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 rounded-lg border bg-muted/30">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalJastipers}</div>
                  <div className="text-sm text-muted-foreground">Total Jastiper</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg border bg-green-50">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.verifiedJastipers}</div>
                  <div className="text-sm text-muted-foreground">Terverifikasi</div>
                </div>
                <div className="text-center p-3 sm:p-4 rounded-lg border bg-yellow-50">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.unverifiedJastipers}</div>
                  <div className="text-sm text-muted-foreground">Belum Terverifikasi</div>
                </div>
              </div>
              
              {jastiperError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {jastiperError}
                </div>
              )}
              
              {jastipers.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium">Daftar Jastiper</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jastipers.map((jastiper) => (
                      <div key={jastiper.id} className="p-3 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {jastiper.imageUrl ? (
                              <img 
                                src={jastiper.imageUrl} 
                                alt={jastiper.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-base sm:text-lg font-medium">
                                {jastiper.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-sm sm:text-base">{jastiper.name}</div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={jastiper.isVerified ? "default" : "secondary"}
                                className={jastiper.isVerified ? "bg-green-100 text-green-800 text-xs" : "text-xs"}
                              >
                                {jastiper.isVerified ? (
                                  <>
                                    <Shield className="w-3 h-3 mr-1" />
                                    Terverifikasi
                                  </>
                                ) : (
                                  <>
                                    <ShieldOff className="w-3 h-3 mr-1" />
                                    Belum Terverifikasi
                                  </>
                                )}
                              </Badge>
                              {jastiper.rating && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>⭐</span>
                                  <span>{jastiper.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {jastiper.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {jastiper.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{jastiper.totalOrders || 0} order selesai</span>
                        </div>

                        {/* New Fields Display */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">Order Selesai:</span>
                            <span>{jastiper.completedOrders || 0}</span>
                          </div>
                          {jastiper.verifiedByFacebookLink && (
                            <div className="text-sm">
                              <span className="font-medium text-muted-foreground">Verified by:</span>
                              <a 
                                href={jastiper.verifiedByFacebookLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-1"
                              >
                                Customer Facebook
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Admin Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(jastiper)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant={jastiper.isVerified ? "outline" : "secondary"}
                            size="sm"
                            onClick={() => handleVerifyToggle(jastiper.id, jastiper.isVerified)}
                            className={jastiper.isVerified 
                              ? "border-yellow-600 text-yellow-400 hover:bg-yellow-600/20" 
                              : "bg-green-600 hover:bg-green-700"
                            }
                          >
                            {jastiper.isVerified ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteJastiper(jastiper.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Belum ada jastiper terdaftar</p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jastiper Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Periode Aktif</CardTitle>
                <CardDescription>Periode yang sedang berjalan</CardDescription>
              </CardHeader>
              <CardContent>
                {periods.filter(p => p.isActive).length > 0 ? (
                  <div className="space-y-4">
                    {periods.filter(p => p.isActive).map((period) => (
                      <div key={period.id} className="p-3 sm:p-4 rounded-lg border bg-muted/30">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base">{period.name}</h3>
                          <Badge variant="default" className="w-fit">Aktif</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border">
                        <div className="min-w-0">
                          <div className="font-medium truncate text-sm sm:text-base">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.startDate.toLocaleDateString('id-ID')} - {p.endDate.toLocaleDateString('id-ID')}</div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-muted-foreground">Pendapatan</div>
                          <div className="font-semibold text-sm sm:text-base">{formatCurrency(totalIncome)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Pengeluaran</div>
                          <div className="font-semibold text-sm sm:text-base">{formatCurrency(totalExpense)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Net</div>
                          <div className="font-semibold text-sm sm:text-base">{formatCurrency(net)}</div>
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
                    <div key={name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border">
                      <div className="font-medium truncate text-sm sm:text-base">{name}</div>
                      <div className="font-semibold text-primary text-sm sm:text-base">{formatCurrency(amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Jastiper Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Jastiper</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nama Jastiper *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama jastiper"
              />
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">URL Gambar</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="edit-facebookLink">Link Facebook</Label>
              <Input
                id="edit-facebookLink"
                value={formData.facebookLink}
                onChange={(e) => setFormData({ ...formData, facebookLink: e.target.value })}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <Label htmlFor="edit-phoneNumber">Nomor Telepon</Label>
              <Input
                id="edit-phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+6281234567890"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Deskripsi</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang jastiper"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-completedOrders">Jumlah Order Selesai</Label>
              <Input
                id="edit-completedOrders"
                type="number"
                min="0"
                value={formData.completedOrders}
                onChange={(e) => setFormData({ ...formData, completedOrders: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="edit-verifiedByFacebookLink">Link Facebook Customer Verifier</Label>
              <Input
                id="edit-verifiedByFacebookLink"
                value={formData.verifiedByFacebookLink}
                onChange={(e) => setFormData({ ...formData, verifiedByFacebookLink: e.target.value })}
                placeholder="https://facebook.com/customer-verifier"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link Facebook customer yang memverifikasi jastiper ini
              </p>
            </div>
            {jastiperError && (
              <div className="text-red-600 text-sm">{jastiperError}</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button onClick={handleEditJastiper} className="flex-1">
                Update Jastiper
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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


