import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, User, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { Period, PeriodItem } from "@/lib/types"
// TODO: Pastikan file ItemRow ada dan path sudah benar
import { ItemRow } from "@/components/periods/item-row"
import { PeriodsService } from "@/lib/periods-service"

interface CustomerGroupProps {
  customerKey: string
  customerName: string
  items: PeriodItem[]
  period: Period
  isExpanded: boolean
  onToggleExpanded: (customerKey: string) => void
  onEditCustomer: (period: Period, customerName: string, items: PeriodItem[]) => void
  onEditItem: (item: PeriodItem) => void
  onDeleteItem: (itemId: string) => void
  formatCurrency: (amount: number) => string
  onRefresh: () => void
  onOptimisticPayment: (customerName: string, paid: boolean) => void
}

export function CustomerGroup({
  customerKey,
  customerName,
  items,
  period,
  isExpanded,
  onToggleExpanded,
  onEditCustomer,
  onEditItem,
  onDeleteItem,
  formatCurrency,
  onRefresh,
  onOptimisticPayment
}: CustomerGroupProps) {
  // Calculate totals including payment status
  const totalRevenue = items.reduce((sum, item) => sum + item.sellingPrice, 0)
  const totalProfit = items.reduce((sum, item) => sum + (item.isPaymentReceived ? item.profit : 0), 0)
  const totalItems = items.length
  
  // Payment status summary
  const paidItems = items.filter(item => item.isPaymentReceived)
  const unpaidItems = items.filter(item => !item.isPaymentReceived)
  const paidRevenue = paidItems.reduce((sum, item) => sum + item.sellingPrice, 0)
  const unpaidRevenue = unpaidItems.reduce((sum, item) => sum + item.sellingPrice, 0)
  const computedAllPaid = unpaidItems.length === 0 && items.length > 0

  const [allPaidState, setAllPaidState] = useState<boolean>(computedAllPaid)

  // Keep local checkbox in sync when items prop changes
  useEffect(() => {
    setAllPaidState(computedAllPaid)
  }, [computedAllPaid])

  const toggleAllPaid = async (paid: boolean) => {
    try {
      // optimistic: update local checkbox immediately
      setAllPaidState(paid)
      // optimistic: update in parent lists and totals without reload
      onOptimisticPayment(customerName, paid)
      await PeriodsService.setCustomerPaymentStatus(period.id, customerName, paid)
      // refresh persisted stats in background (fast path remains optimistic)
      onRefresh()
    } catch (e) {
      console.error("Gagal mengubah status pembayaran customer:", e)
      alert("Gagal mengubah status pembayaran customer")
      // revert local checkbox on error
      setAllPaidState(!paid)
    }
  }

  return (
    <Card className="border border-gray-200 overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 p-4"
        onClick={() => onToggleExpanded(customerKey)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold truncate">{customerName}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                <span>{totalItems} produk</span>
                <span className="truncate">Revenue: {formatCurrency(totalRevenue)}</span>
                <span className="truncate">Profit: {formatCurrency(totalProfit)}</span>
              </div>
              
              {/* Payment Status Summary */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Dibayar: {formatCurrency(paidRevenue)}</span>
                </div>
                {unpaidRevenue > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <XCircle className="w-3 h-3" />
                    <span>Belum dibayar: {formatCurrency(unpaidRevenue)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Header payment toggle */}
            <div
              className="inline-flex items-center gap-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={allPaidState}
                onChange={(e) => toggleAllPaid(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded"
                title="Tandai semua item customer ini sudah dibayar"
              />
              <span className="text-gray-600 select-none">Semua dibayar</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditCustomer(period, customerName, items)
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-0">
          <div className="border-t border-gray-200">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
