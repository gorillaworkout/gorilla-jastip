import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plus, Edit, Trash2, User, Package } from "lucide-react"
import { Period, PeriodItem } from "@/lib/types"
import { CustomerGroup } from "./customer-group"

interface PeriodCardProps {
  period: Period
  expandedCustomers: Set<string>
  onToggleActive: (periodId: string, isActive: boolean) => void
  onAddCustomer: (period: Period) => void
  onDeletePeriod: (periodId: string) => void
  onEditCustomer: (period: Period, customerName: string, items: PeriodItem[]) => void
  onEditItem: (item: PeriodItem) => void
  onDeleteItem: (itemId: string) => void
  onToggleCustomerExpanded: (customerKey: string) => void
  formatCurrency: (amount: number) => string
  formatDate: (date: Date) => string
  onRefreshPeriods: () => void
  onOptimisticCustomerPayment: (periodId: string, customerName: string, isPaid: boolean) => void
}

export function PeriodCard({
  period,
  expandedCustomers,
  onToggleActive,
  onAddCustomer,
  onDeletePeriod,
  onEditCustomer,
  onEditItem,
  onDeleteItem,
  onToggleCustomerExpanded,
  formatCurrency,
  formatDate,
  onRefreshPeriods,
  onOptimisticCustomerPayment
}: PeriodCardProps) {
  return (
    <Card className="mb-6 shadow-md">
      {/* Header */}
      <CardHeader className="bg-blue-50 border-b p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg font-bold truncate">{period.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                  period.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {period.isActive ? "🟢 Aktif" : "⚪ Tidak Aktif"}
                </span>
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onToggleActive(period.id, !period.isActive)}
              className={`px-3 py-2 text-xs sm:text-sm rounded-lg border ${
                period.isActive 
                  ? 'border-orange-300 text-orange-600 hover:bg-orange-50' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {period.isActive ? "⏸️ Nonaktifkan" : "▶️ Aktifkan"}
            </button>
            <button
              onClick={() => onAddCustomer(period)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tambah Customer</span>
              <span className="sm:hidden">Tambah</span>
            </button>
            <button
              onClick={() => onDeletePeriod(period.id)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Hapus</span>
              <span className="sm:hidden">Hapus</span>
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Statistics */}
      <div className="p-3 bg-gray-50 border-b">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-sm sm:text-base font-bold text-blue-600">{period.totalProducts}</div>
            <div className="text-xs text-gray-600">Total Item</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-xs sm:text-sm font-bold text-green-600 break-words">{formatCurrency(period.totalRevenue)}</div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-xs sm:text-sm font-bold text-blue-600 break-words">{formatCurrency(period.totalProfit)}</div>
            <div className="text-xs text-gray-600">Profit</div>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border">
            <div className="text-xs sm:text-sm font-bold text-amber-600 break-words">{formatCurrency(period.totalUnpaid || 0)}</div>
            <div className="text-xs text-gray-600">Belum Dibayar</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4">
        {period.items.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold">Data Customer</h3>
            </div>
            
            {/* Group items by customer */}
            {(() => {
              const customerGroups = period.items.reduce((groups, item) => {
                if (!groups[item.customerName]) {
                  groups[item.customerName] = []
                }
                groups[item.customerName].push(item)
                return groups
              }, {} as Record<string, typeof period.items>)

              return Object.entries(customerGroups).map(([customerName, items]) => {
                const customerKey = `${period.id}-${customerName}`
                const isExpanded = expandedCustomers.has(customerKey)

                return (
                  <CustomerGroup
                    key={customerKey}
                    customerKey={customerKey}
                    customerName={customerName}
                    items={items}
                    period={period}
                    isExpanded={isExpanded}
                    onToggleExpanded={onToggleCustomerExpanded}
                    onEditCustomer={onEditCustomer}
                    onEditItem={onEditItem}
                    onDeleteItem={onDeleteItem}
                    formatCurrency={formatCurrency}
                    onRefresh={onRefreshPeriods}
                    onOptimisticPayment={(customerName, paid) => onOptimisticCustomerPayment(period.id, customerName, paid)}
                  />
                )
              })
            })()}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="p-3 sm:p-4 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-sm sm:text-base font-medium mb-2">Belum ada customer</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Tambahkan data customer pertama untuk periode ini</p>
            <button
              onClick={() => onAddCustomer(period)}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full sm:w-auto"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
              Tambah Customer Pertama
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
