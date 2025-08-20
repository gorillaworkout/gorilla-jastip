"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PeriodItem, UpdateItemData } from "@/lib/types"
import { PeriodsService } from "@/lib/periods-service"
import { Coins, Calculator, Save, Loader2, X } from "lucide-react"

interface EditItemModalProps {
  item: PeriodItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditItemModal({ item, isOpen, onClose, onSuccess }: EditItemModalProps) {
  const [formData, setFormData] = useState<UpdateItemData>({
    customerName: "",
    itemName: "",
    itemPrice: "",
    exchangeRate: "",
    sellingPrice: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        customerName: item.customerName,
        itemName: item.itemName,
        itemPrice: item.itemPrice.toString(),
        exchangeRate: item.exchangeRate.toString(),
        sellingPrice: item.sellingPrice.toString(),
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    try {
      setIsSubmitting(true)
      await PeriodsService.updateItem(item.id, formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating item:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      customerName: "",
      itemName: "",
      itemPrice: "",
      exchangeRate: "",
      sellingPrice: "",
    })
    onClose()
  }

  // Calculate preview values
  const getPreviewValues = () => {
    const itemPrice = Number(formData.itemPrice) || 0
    const exchangeRate = Number(formData.exchangeRate) || 0
    const sellingPrice = Number(formData.sellingPrice) || 0

    if (itemPrice && exchangeRate && sellingPrice) {
      const costInIDR = itemPrice * exchangeRate
      const profit = sellingPrice - costInIDR
      const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

      return { costInIDR, profit, margin }
    }
    return null
  }

  const preview = getPreviewValues()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Data Customer</DialogTitle>
          <DialogDescription>
            Edit data customer: <span className="font-semibold text-primary">{item?.customerName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="editCustomerName" className="text-base font-medium">Nama Customer *</Label>
            <Input
              id="editCustomerName"
              placeholder="Masukkan nama customer"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="editItemName" className="text-base font-medium">Nama Barang *</Label>
            <Input
              id="editItemName"
              placeholder="Nama barang"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              required
              className="h-12 text-base"
            />
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editItemPrice" className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-blue-600" />
                  Harga Barang (YEN) *
                </div>
              </Label>
              <Input
                id="editItemPrice"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.itemPrice}
                onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editExchangeRate" className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-green-600" />
                  Kurs (YEN → IDR) *
                </div>
              </Label>
              <Input
                id="editExchangeRate"
                type="number"
                placeholder="150"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editSellingPrice" className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-purple-600" />
                  Harga Jual (IDR) *
                </div>
              </Label>
              <Input
                id="editSellingPrice"
                type="number"
                placeholder="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                required
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Preview Calculation */}
          {preview && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
              <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Preview Perhitungan
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-muted-foreground mb-1">Harga Beli (IDR)</div>
                  <div className="font-bold text-lg text-blue-600">
                    Rp {preview.costInIDR.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(formData.itemPrice).toLocaleString('ja-JP')} YEN × {Number(formData.exchangeRate).toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-muted-foreground mb-1">Keuntungan</div>
                  <div className={`font-bold text-lg ${preview.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {preview.profit.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(formData.sellingPrice).toLocaleString('id-ID')} - {preview.costInIDR.toLocaleString('id-ID')}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-muted-foreground mb-1">Margin</div>
                  <div className={`font-bold text-lg ${preview.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {preview.margin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Keuntungan ÷ Harga Jual
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <Button type="submit" className="flex-1 h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-12"
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
