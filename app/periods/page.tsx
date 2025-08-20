"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, ShoppingCart, Edit, Trash2, TrendingUp, Package, DollarSign, Percent, User, Coins, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { PeriodsService } from "@/lib/periods-service"
import { Period, CreatePeriodData, CreateItemData, PeriodItem } from "@/lib/types"
import { auth } from "@/lib/firebase"
import { EditItemModal } from "@/components/periods/edit-item-modal"
import { AddCustomerModal } from "@/components/periods/add-customer-modal"

function PeriodsContent() {
  const { user } = useAuth()
  const [periods, setPeriods] = useState<Period[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isCreatePeriodOpen, setIsCreatePeriodOpen] = useState(false)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
  const [editingItem, setEditingItem] = useState<PeriodItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const [createPeriodData, setCreatePeriodData] = useState<CreatePeriodData>({
    name: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      loadPeriods()
    }
  }, [mounted, user])

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

  const refreshStatistics = async () => {
    try {
      setLoading(true)
      console.log("Refreshing statistics for all periods...")
      
      // Refresh statistics for each period
      for (const period of periods) {
        await PeriodsService.refreshPeriodStatistics(period.id)
      }
      
      // Reload periods with fresh data
      await loadPeriods()
      console.log("Statistics refreshed successfully")
    } catch (error) {
      console.error("Error refreshing statistics:", error)
      alert("Gagal refresh statistics. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("🔐 Current user state:", user)
      console.log("🔐 Firebase auth state:", auth?.currentUser)
      console.log("Submitting period data:", createPeriodData)
      const periodId = await PeriodsService.createPeriod(createPeriodData)
      console.log("Period created with ID:", periodId)
      setIsCreatePeriodOpen(false)
      setCreatePeriodData({ name: "", startDate: "", endDate: "" })
      await loadPeriods()
    } catch (error) {
      console.error("Error creating period:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleToggleActive = async (periodId: string, isActive: boolean) => {
    try {
      await PeriodsService.togglePeriodActive(periodId, isActive)
      await loadPeriods()
    } catch (error) {
      console.error("Error toggling period active:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeletePeriod = async (periodId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus periode ini?")) {
      try {
        await PeriodsService.deletePeriod(periodId)
        await loadPeriods()
      } catch (error) {
        console.error("Error deleting period:", error)
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data customer ini?")) {
      try {
        await PeriodsService.deleteItem(itemId)
        await loadPeriods()
      } catch (error) {
        console.error("Error deleting item:", error)
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleEditItem = (item: PeriodItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    loadPeriods()
  }

  const handleAddCustomer = (period: Period) => {
    setSelectedPeriod(period)
    setIsAddCustomerOpen(true)
  }

  const handleAddCustomerSuccess = () => {
    loadPeriods()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatYen = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat data periode...</p>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">Periode Jastip</h1>
              <p className="text-muted-foreground">Kelola periode dan data customer jastip</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={refreshStatistics}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Statistics
              </Button>
              <Button onClick={() => setIsCreatePeriodOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Periode Baru
              </Button>
            </div>
          </div>

          {/* Periods List */}
          <div className="space-y-6">
            {periods.map((period) => (
              <Card key={period.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{period.name}</CardTitle>
                        <Badge variant={period.isActive ? "default" : "secondary"}>
                          {period.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </span>
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={period.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleActive(period.id, !period.isActive)}
                      >
                        {period.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCustomer(period)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Customer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePeriod(period.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Period Statistics */}
                <div className="p-6 bg-muted/30 border-b">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{period.totalProducts}</div>
                      <div className="text-sm text-muted-foreground">Total Customer</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(period.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(period.totalProfit)}</div>
                      <div className="text-sm text-muted-foreground">Total Profit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{period.averageMargin.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Rata-rata Margin</div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <CardContent className="p-6">
                  {period.items.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-4">Data Customer</h3>
                      <div className="grid gap-4">
                        {period.items.map((item) => (
                          <div key={item.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              {/* Customer Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-primary" />
                                  <h4 className="font-semibold text-lg">{item.customerName}</h4>
                                </div>
                                
                                {/* Item Name */}
                                {item.itemName && (
                                  <div className="mb-3">
                                    <span className="text-sm text-muted-foreground">Barang: </span>
                                    <span className="font-medium text-primary">{item.itemName}</span>
                                  </div>
                                )}
                                
                                {/* Price Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Harga Beli */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Coins className="w-4 h-4" />
                                      Harga Beli (YEN)
                                    </div>
                                    <div className="font-medium">{formatYen(item.itemPrice)}</div>
                                  </div>
                                  
                                  {/* Kurs */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Coins className="w-4 h-4" />
                                      Kurs (YEN → IDR)
                                    </div>
                                    <div className="font-medium">{item.exchangeRate.toLocaleString('id-ID')}</div>
                                  </div>
                                  
                                  {/* Harga Beli IDR */}
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <DollarSign className="w-4 h-4" />
                                      Harga Beli (IDR)
                                    </div>
                                    <div className="font-medium text-blue-600">{formatCurrency(item.costInIDR)}</div>
                                  </div>
                                </div>
                                
                                {/* Harga Jual & Profit */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                  <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Harga Jual (IDR)</div>
                                    <div className="font-semibold text-lg text-green-600">{formatCurrency(item.sellingPrice)}</div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Keuntungan</div>
                                    <div className={`font-semibold text-lg ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatCurrency(item.profit)}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="text-sm text-muted-foreground">Margin</div>
                                    <div className={`font-semibold text-lg ${item.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {item.margin.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Belum ada customer</h3>
                      <p className="text-muted-foreground mb-4">Tambahkan data customer pertama untuk periode ini</p>
                      <Button onClick={() => handleAddCustomer(period)}>
                        <Plus className="h-4 h-4 mr-2" />
                        Tambah Customer Pertama
                      </Button>
                    </Card>
                  )}
                </CardContent>
              </Card>
            ))}

            {periods.length === 0 && (
              <Card className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum ada periode</h3>
                <p className="text-muted-foreground mb-4">Buat periode pertama untuk mulai tracking bisnis jastip Anda</p>
                <Button onClick={() => setIsCreatePeriodOpen(true)}>
                  <Plus className="h-4 h-4 mr-2" />
                  Buat Periode Pertama
                </Button>
              </Card>
            )}
          </div>

          {/* Create Period Modal */}
          <Dialog open={isCreatePeriodOpen} onOpenChange={setIsCreatePeriodOpen}>
            <DialogContent className="w-[95vw] max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Buat Periode Baru</DialogTitle>
                <DialogDescription>
                  Buat periode baru untuk tracking bisnis jastip
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePeriod} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Periode</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Periode September 2024"
                    value={createPeriodData.name}
                    onChange={(e) => setCreatePeriodData({ ...createPeriodData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Tanggal Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={createPeriodData.startDate}
                      onChange={(e) => setCreatePeriodData({ ...createPeriodData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={createPeriodData.endDate}
                      onChange={(e) => setCreatePeriodData({ ...createPeriodData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">Buat Periode</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreatePeriodOpen(false)} 
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Customer Modal */}
          {selectedPeriod && (
            <AddCustomerModal
              periodId={selectedPeriod.id}
              periodName={selectedPeriod.name}
              isOpen={isAddCustomerOpen}
              onClose={() => {
                setIsAddCustomerOpen(false)
                setSelectedPeriod(null)
              }}
              onSuccess={handleAddCustomerSuccess}
            />
          )}

          {/* Edit Item Modal */}
          <EditItemModal
            item={editingItem}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false)
              setEditingItem(null)
            }}
            onSuccess={handleEditSuccess}
          />
        </div>
      </main>
    </div>
  )
}

export default function PeriodsPage() {
  return (
    <AdminGuard>
      <PeriodsContent />
    </AdminGuard>
  )
}
