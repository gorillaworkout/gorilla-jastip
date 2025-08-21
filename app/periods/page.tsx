"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { PeriodsService } from "@/lib/periods-service"
import { Period, CreatePeriodData, PeriodItem } from "@/lib/types"
import { auth } from "@/lib/firebase"
import { EditItemModal } from "@/components/periods/edit-item-modal"
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
  const [editingCustomerName, setEditingCustomerName] = useState<string | null>(null)
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())
  
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
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <LoadingSpinner message="Memuat data periode..." size="lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            onCreatePeriod={() => setIsCreatePeriodOpen(true)}
            onRefreshStatistics={refreshStatistics}
            loading={loading}
          />

          {/* Periods List */}
          <div className="space-y-8">
            {periods.map((period) => (
              <PeriodCard
                key={period.id}
                period={period}
                expandedCustomers={expandedCustomers}
                onToggleActive={handleToggleActive}
                onAddCustomer={handleAddCustomer}
                onDeletePeriod={handleDeletePeriod}
                onEditCustomer={handleEditCustomer}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onToggleCustomerExpanded={toggleCustomerExpanded}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}

            {periods.length === 0 && (
              <EmptyState
                title="Belum ada periode"
                description="Buat periode pertama untuk mulai tracking bisnis jastip Anda"
                buttonText="Buat Periode Pertama"
                onAction={() => setIsCreatePeriodOpen(true)}
              />
            )}
          </div>

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
