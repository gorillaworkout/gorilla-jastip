"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"
import { PeriodsService } from "@/lib/periods-service"
import { Period, CreatePeriodData, PeriodItem } from "@/lib/types"
import { auth } from "@/lib/firebase"
import { EditItemModal } from "@/components/periods/edit-item-modal"
import { EditPeriodModal } from "@/components/periods/edit-period-modal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, Pencil } from "lucide-react"
import { PeriodBody } from "@/components/periods/period-body"
import { AddCustomerModal } from "@/components/periods/add-customer-modal"
import {
  PeriodCard,
  PageHeader,
  EmptyState,
  CreatePeriodModal,
  LoadingSpinner
} from "@/components/periods"


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
  const [isEditPeriodOpen, setIsEditPeriodOpen] = useState(false)
  const [editingCustomerName, setEditingCustomerName] = useState<string | null>(null)
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())
  const [accordionValue, setAccordionValue] = useState<string | undefined>(undefined)
  
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
      // Ensure statistics (including totalUnpaid/totalProfit) are up-to-date
      const periodsData = await PeriodsService.getPeriodsWithRefreshedStats()
      let periodsWithItems = await Promise.all(
        periodsData.map(async (period) => {
          const items = await PeriodsService.getPeriodItems(period.id)
          return { ...period, items }
        })
      )
      // Sort periods primarily by startDate ascending (earliest first).
      // Tie-breakers: active periods first, then endDate ascending.
      periodsWithItems = periodsWithItems.sort((a, b) => {
        const startDiff = a.startDate.getTime() - b.startDate.getTime()
        if (startDiff !== 0) return startDiff
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
        return a.endDate.getTime() - b.endDate.getTime()
      })
      setPeriods(periodsWithItems)
    } catch (error) {
      console.error("Error loading periods:", error)
    } finally {
      setLoading(false)
    }
  }

  // Optimistic local update to avoid full reloads when toggling payments
  const optimisticCustomerPayment = (periodId: string, customerName: string, isPaid: boolean) => {
    setPeriods(prev => prev.map(p => {
      if (p.id !== periodId) return p
      const updatedItems = p.items.map(it => it.customerName === customerName ? { ...it, isPaymentReceived: isPaid } : it)
      const totalUnpaid = updatedItems.reduce((sum, it) => sum + (!it.isPaymentReceived ? it.sellingPrice : 0), 0)
      const totalProfit = updatedItems.reduce((sum, it) => sum + (it.isPaymentReceived ? it.profit : 0), 0)
      return { ...p, items: updatedItems, totalUnpaid, totalProfit }
    }))
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

  const handleCreatePeriod = async (data: CreatePeriodData) => {
    try {
      console.log("🔐 Current user state:", user)
      console.log("🔐 Firebase auth state:", auth?.currentUser)
      console.log("Submitting period data:", data)
      const periodId = await PeriodsService.createPeriod(data)
      console.log("Period created with ID:", periodId)
      setIsCreatePeriodOpen(false)
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

  const handleOpenEditPeriod = (period: Period) => {
    setSelectedPeriod(period)
    setIsEditPeriodOpen(true)
  }

  const handleAddCustomer = (period: Period) => {
    setSelectedPeriod(period)
    setIsAddCustomerOpen(true)
  }

  const handleAddCustomerSuccess = () => {
    loadPeriods()
  }

  const handleEditCustomer = (period: Period, customerName: string, items: PeriodItem[]) => {
    setSelectedPeriod(period)
    setEditingCustomerName(customerName)
    setIsAddCustomerOpen(true)
  }

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

  const toggleCustomerExpanded = (customerKey: string) => {
    const newExpanded = new Set(expandedCustomers)
    if (newExpanded.has(customerKey)) {
      newExpanded.delete(customerKey)
    } else {
      newExpanded.add(customerKey)
    }
    setExpandedCustomers(newExpanded)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Loading..." size="lg" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] bg-gray-50">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">
          <LoadingSpinner message="Memuat data periode..." size="lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile header menu */}
        <MobileHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 space-y-8">
          {/* Header */}
          <PageHeader
            onCreatePeriod={() => setIsCreatePeriodOpen(true)}
            onRefreshStatistics={refreshStatistics}
            loading={loading}
          />

          {/* Periods List as Accordion */}
          {periods.length > 0 ? (
            <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
              {periods.map((period) => (
                <AccordionItem key={period.id} value={period.id} className="bg-white rounded-md border mb-4">
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{period.name}</span>
                        <span className="text-xs text-gray-600">{formatDate(period.startDate)} - {formatDate(period.endDate)}</span>
                      </div>
                      <span className={`ml-2 px-2 py-0.5 text-[10px] rounded-full ${period.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{period.isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(period.id, !period.isActive) }}
                        className={`px-3 py-1.5 text-xs rounded border cursor-pointer ${period.isActive ? 'border-orange-300 text-orange-600 hover:bg-orange-50' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        {period.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); handleOpenEditPeriod(period) }}
                        className="px-3 py-1.5 text-xs rounded border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
                        title="Ganti Periode"
                      >
                        <Pencil className="w-3 h-3" /> Ganti Periode
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); handleDeletePeriod(period.id) }}
                        className="px-3 py-1.5 text-xs rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                      >
                        Hapus
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <PeriodBody
                      period={period}
                      expandedCustomers={expandedCustomers}
                      onAddCustomer={handleAddCustomer}
                      onEditCustomer={handleEditCustomer}
                      onEditItem={handleEditItem}
                      onDeleteItem={handleDeleteItem}
                      onToggleCustomerExpanded={toggleCustomerExpanded}
                      formatCurrency={formatCurrency}
                      onRefreshPeriods={loadPeriods}
                      onOptimisticCustomerPayment={optimisticCustomerPayment}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <EmptyState
              title="Belum ada periode"
              description="Buat periode pertama untuk mulai tracking bisnis jastip Anda"
              buttonText="Buat Periode Pertama"
              onAction={() => setIsCreatePeriodOpen(true)}
            />
          )}

          {/* Create Period Modal */}
          <CreatePeriodModal
            isOpen={isCreatePeriodOpen}
            onClose={() => setIsCreatePeriodOpen(false)}
            onSubmit={handleCreatePeriod}
            loading={loading}
          />

          {/* Add Customer Modal */}
          {selectedPeriod && (
            <AddCustomerModal
              periodId={selectedPeriod.id}
              periodName={selectedPeriod.name}
              isOpen={isAddCustomerOpen}
              onClose={() => {
                setIsAddCustomerOpen(false)
                setSelectedPeriod(null)
                setEditingCustomerName(null)
              }}
              onSuccess={handleAddCustomerSuccess}
              editingCustomerName={editingCustomerName}
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

          {/* Edit Period Modal */}
          <EditPeriodModal
            period={selectedPeriod}
            isOpen={isEditPeriodOpen}
            onClose={() => {
              setIsEditPeriodOpen(false)
              setSelectedPeriod(null)
            }}
            onSuccess={loadPeriods}
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
