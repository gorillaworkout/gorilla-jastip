import { Edit, Trash2 } from "lucide-react"
import { PeriodItem } from "@/lib/types"

interface ItemRowProps {
  item: PeriodItem
  onEdit: (item: PeriodItem) => void
  onDelete: (itemId: string) => void
  formatCurrency: (amount: number) => string
}

export function ItemRow({
  item,
  onEdit,
  onDelete,
  formatCurrency
}: ItemRowProps) {
  const formatYen = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate">{item.itemName}</h4>
            <p className="text-sm text-gray-500">Customer: {item.customerName}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Price Cards */}
        <div className="flex items-center gap-2">
          <div className="text-right p-2 bg-green-50 rounded border border-green-200 min-w-[80px]">
            <div className="text-xs text-green-600">Harga Jual</div>
            <div className="font-semibold text-green-700">{formatCurrency(item.sellingPrice)}</div>
          </div>
          
          <div className="text-right p-2 bg-blue-50 rounded border border-blue-200 min-w-[80px]">
            <div className="text-xs text-blue-600">Harga Beli</div>
            <div className="font-semibold text-blue-700">{formatYen(item.itemPrice)}</div>
          </div>
          
          <div className="text-right p-2 bg-purple-50 rounded border border-purple-200 min-w-[80px]">
            <div className="text-xs text-purple-600">Profit</div>
            <div className={`font-semibold ${item.profit >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
              {formatCurrency(item.profit)}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
