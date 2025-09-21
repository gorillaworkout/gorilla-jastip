import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">{item.itemName}</h4>
              {/* Payment Status Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${
                item.isPaymentReceived 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {item.isPaymentReceived ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Dibayar</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Belum Dibayar</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Customer: {item.customerName}</p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Price Cards - Mobile Stacked, Desktop Horizontal */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-2">
          <div className="text-center sm:text-right p-2 bg-green-50 rounded border border-green-200">
            <div className="text-xs text-green-600">Harga Jual</div>
            <div className="font-semibold text-green-700 text-xs sm:text-sm">{formatCurrency(item.sellingPrice)}</div>
          </div>
          
          <div className="text-center sm:text-right p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs text-blue-600">Harga Beli</div>
            <div className="font-semibold text-blue-700 text-xs sm:text-sm">{formatYen(item.itemPrice)}</div>
          </div>
          
          <div className={`text-center sm:text-right p-2 rounded border ${
            item.isPaymentReceived 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-xs ${item.isPaymentReceived ? 'text-purple-600' : 'text-gray-500'}`}>
              Profit
            </div>
            <div className={`font-semibold text-xs sm:text-sm ${
              item.isPaymentReceived 
                ? (item.profit >= 0 ? 'text-purple-700' : 'text-red-700')
                : 'text-gray-400'
            }`}>
              {item.isPaymentReceived ? formatCurrency(item.profit) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Mobile: Grid, Desktop: Flex */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center"
            title="Edit Item"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
            title="Delete Item"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
