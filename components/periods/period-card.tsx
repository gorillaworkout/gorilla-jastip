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
  formatDate
}: PeriodCardProps) {
  return (
    <Card className="mb-6 shadow-md">
      {/* Header */}
      <CardHeader className="bg-blue-50 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl font-bold truncate">{period.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    period.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {period.isActive ? "🟢 Aktif" : "⚪ Tidak Aktif"}
                  </span>
                  <span className="truncate">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={() => onToggleActive(period.id, !period.isActive)}
              className={`px-3 py-2 text-sm rounded-lg border w-full sm:w-auto ${
                period.isActive 
                  ? 'border-orange-300 text-orange-600 hover:bg-orange-50' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {period.isActive ? "⏸️ Nonaktifkan" : "▶️ Aktifkan"}
            </button>
            <button
              onClick={() => onAddCustomer(period)}
              className="px-3 py-2 text-sm rounded-lg border border-blue-300 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Tambah Customer
            </button>
            <button
              onClick={() => onDeletePeriod(period.id)}
              className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Hapus
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Statistics */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{period.totalProducts}</div>
            <div className="text-sm text-gray-600">Total Item</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(period.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(period.totalProfit)}</div>
            <div className="text-sm text-gray-600">Total Profit</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{period.averageMargin.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Rata-rata Margin</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {period.items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Data Customer</h3>
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
                  />
                )
              })
            })()}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Belum ada customer</h3>
            <p className="text-gray-500 mb-4">Tambahkan data customer pertama untuk periode ini</p>
            <button
              onClick={() => onAddCustomer(period)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Tambah Customer Pertama
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
