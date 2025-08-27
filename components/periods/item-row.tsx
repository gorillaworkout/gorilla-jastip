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
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{item.itemName}</h4>
              {/* Payment Status Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
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
          
          <div className={`text-right p-2 rounded border min-w-[80px] ${
            item.isPaymentReceived 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`text-xs ${item.isPaymentReceived ? 'text-purple-600' : 'text-gray-500'}`}>
              Profit
            </div>
            <div className={`font-semibold ${
              item.isPaymentReceived 
                ? (item.profit >= 0 ? 'text-purple-700' : 'text-red-700')
                : 'text-gray-400'
            }`}>
              {item.isPaymentReceived ? formatCurrency(item.profit) : 'N/A'}
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
