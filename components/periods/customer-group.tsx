import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, User, Edit, Trash2 } from "lucide-react"
import type { Period, PeriodItem } from "@/lib/types"
// TODO: Pastikan file ItemRow ada dan path sudah benar
import { ItemRow } from "@/components/periods/item-row"

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
  formatCurrency
}: CustomerGroupProps) {
  const totalRevenue = items.reduce((sum, item) => sum + item.sellingPrice, 0)
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0)
  const totalItems = items.length

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
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
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
