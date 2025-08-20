"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Coins, User, Package, Calculator, Save, Loader2, X } from "lucide-react"
import { CreateCustomerData, CreateCustomerItemData } from "@/lib/types"
import { PeriodsService } from "@/lib/periods-service"

interface AddCustomerModalProps {
  periodId: string
  periodName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddCustomerModal({ periodId, periodName, isOpen, onClose, onSuccess }: AddCustomerModalProps) {
  const [formData, setFormData] = useState<CreateCustomerData>({
    customerName: "",
    items: [
      {
        itemName: "",
        itemPrice: "",
        exchangeRate: "",
        sellingPrice: "",
        notes: ""
      }
    ]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItemField = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemName: "",
          itemPrice: "",
          exchangeRate: "",
          sellingPrice: "",
          notes: ""
        }
      ]
    }))
  }

  const removeItemField = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }))
    }
  }

  const updateItemField = (index: number, field: keyof CreateCustomerItemData, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.customerName.trim()) {
      alert("Nama customer harus diisi")
      return
    }

    if (formData.items.some(item => !item.itemName.trim() || !item.itemPrice || !item.exchangeRate || !item.sellingPrice)) {
      alert("Semua field item harus diisi")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Use the new method to add customer with multiple items
      await PeriodsService.addCustomerWithItems(periodId, formData)
      
      onSuccess()
      onClose()
      resetForm()
    } catch (error) {
      console.error("Error adding customer:", error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      items: [
        {
          itemName: "",
          itemPrice: "",
          exchangeRate: "",
          sellingPrice: "",
          notes: ""
        }
      ]
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="!w-[95vw] !max-w-none !max-h-[95vh] overflow-y-auto p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Tambah Customer Baru</DialogTitle>
          <DialogDescription className="text-lg">
            Tambah customer dengan multiple items untuk periode: <span className="font-semibold text-primary">{periodName}</span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Customer Name Section */}
          <div className="bg-muted/30 p-4 sm:p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informasi Customer
            </h3>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-base">Nama Customer *</Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama customer"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                className="text-base h-12"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Items ({formData.items.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={addItemField}
                className="px-4 sm:px-6 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Item
              </Button>
            </div>

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 sm:p-6 border-2 rounded-xl bg-card hover:bg-accent/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <h4 className="text-lg font-semibold">Item #{index + 1}</h4>
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemField(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    )}
                  </div>

                  {/* Item Name and Notes Row */}
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="space-y-2">
                      <Label htmlFor={`itemName-${index}`} className="text-base font-medium">
                        Nama Barang *
                      </Label>
                      <Input
                        id={`itemName-${index}`}
                        placeholder="Contoh: iPhone 15 Pro, Nike Air Jordan, dll"
                        value={item.itemName}
                        onChange={(e) => updateItemField(index, 'itemName', e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${index}`} className="text-base font-medium">
                        Catatan (Opsional)
                      </Label>
                      <Textarea
                        id={`notes-${index}`}
                        placeholder="Catatan tambahan, spesifikasi, dll..."
                        value={item.notes}
                        onChange={(e) => updateItemField(index, 'notes', e.target.value)}
                        rows={2}
                        className="text-base resize-none"
                      />
                    </div>
                  </div>

                  {/* Price Details Row */}
                  <div className="space-y-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor={`itemPrice-${index}`} className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-blue-600" />
                          Harga Barang (YEN) *
                        </div>
                      </Label>
                      <Input
                        id={`itemPrice-${index}`}
                        type="number"
                        step="0.01"
                        placeholder="0"
                        value={item.itemPrice}
                        onChange={(e) => updateItemField(index, 'itemPrice', e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`exchangeRate-${index}`} className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-green-600" />
                          Kurs (YEN → IDR) *
                        </div>
                      </Label>
                      <Input
                        id={`exchangeRate-${index}`}
                        type="number"
                        placeholder="150"
                        value={item.exchangeRate}
                        onChange={(e) => updateItemField(index, 'exchangeRate', e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`sellingPrice-${index}`} className="text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-purple-600" />
                          Harga Jual (IDR) *
                        </div>
                      </Label>
                      <Input
                        id={`sellingPrice-${index}`}
                        type="number"
                        placeholder="0"
                        value={item.sellingPrice}
                        onChange={(e) => updateItemField(index, 'sellingPrice', e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  {/* Preview Calculation */}
                  {item.itemPrice && item.exchangeRate && item.sellingPrice && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Preview Perhitungan
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Harga Beli (IDR)</div>
                          <div className="font-bold text-base sm:text-lg text-blue-600">
                            Rp {(Number(item.itemPrice) * Number(item.exchangeRate)).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Number(item.itemPrice).toLocaleString('ja-JP')} YEN × {Number(item.exchangeRate).toLocaleString('id-ID')}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Keuntungan</div>
                          <div className={`font-bold text-base sm:text-lg ${(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate)) >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                            Rp {(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate))).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Number(item.sellingPrice).toLocaleString('id-ID')} - {(Number(item.itemPrice) * Number(item.exchangeRate)).toLocaleString('id-ID')}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Margin</div>
                          <div className={`font-bold text-base sm:text-lg ${(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate)) >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                            {((Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate))) / Number(item.sellingPrice) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Keuntungan ÷ Harga Jual
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2">
            <Button type="submit" className="flex-1 h-12 sm:h-14 text-base sm:text-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Menyimpan Customer & Items...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Simpan Customer & Items
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-12 sm:h-14 text-base sm:text-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
