"use client"

import { useState, useEffect } from "react"
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
  editingCustomerName?: string | null // Untuk menambah barang ke customer yang sudah ada
}

export function AddCustomerModal({ periodId, periodName, isOpen, onClose, onSuccess, editingCustomerName }: AddCustomerModalProps) {
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

  // Helper function untuk format rupiah
  const formatRupiah = (value: string) => {
    // Hapus semua karakter non-digit
    const numericValue = value.replace(/\D/g, '')
    
    if (numericValue === '') return ''
    
    // Format ke rupiah
    const formatted = new Intl.NumberFormat('id-ID').format(Number(numericValue))
    return `Rp ${formatted}`
  }

  // Helper function untuk parse rupiah ke number
  const parseRupiah = (value: string) => {
    return value.replace(/\D/g, '')
  }

  // Set customer name when editing existing customer
  useEffect(() => {
    if (editingCustomerName) {
      setFormData(prev => ({
        ...prev,
        customerName: editingCustomerName
      }))
    }
  }, [editingCustomerName])

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
    if (!editingCustomerName && !formData.customerName.trim()) {
      alert("Nama customer harus diisi")
      return
    }

    if (formData.items.some(item => !item.itemName.trim() || !item.itemPrice || !item.exchangeRate || !item.sellingPrice)) {
      alert("Semua field item harus diisi")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Ensure customer name is set correctly
      const dataToSubmit = {
        ...formData,
        customerName: editingCustomerName || formData.customerName
      }
      
      // Use the new method to add customer with multiple items
      await PeriodsService.addCustomerWithItems(periodId, dataToSubmit)
      
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
      customerName: editingCustomerName || "",
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
        className="!w-[90vw] !max-w-4xl !max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {editingCustomerName ? 'Tambah Barang Baru' : 'Tambah Customer Baru'}
          </DialogTitle>
          <DialogDescription className="text-base sm:text-lg">
            {editingCustomerName ? (
              <>
                Tambah barang baru untuk customer: <span className="font-semibold text-primary">{editingCustomerName}</span>
                <br />
                Periode: <span className="font-semibold text-primary">{periodName}</span>
              </>
            ) : (
              <>
                Tambah customer dengan multiple items untuk periode: <span className="font-semibold text-primary">{periodName}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Customer Name Section */}
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg border">
            <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              {editingCustomerName ? 'Customer' : 'Informasi Customer'}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm sm:text-base">
                {editingCustomerName ? 'Nama Customer' : 'Nama Customer *'}
              </Label>
              <Input
                id="customerName"
                placeholder="Masukkan nama customer"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required={!editingCustomerName}
                disabled={!!editingCustomerName}
                className="text-sm sm:text-base h-10 sm:h-12"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Items ({formData.items.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItemField}
                className="px-3 sm:px-4 w-full sm:w-auto h-9 sm:h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={index} className="p-3 sm:p-4 border-2 rounded-lg bg-card hover:bg-accent/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold">Item #{index + 1}</h4>
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItemField(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto h-8 sm:h-9"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Hapus
                      </Button>
                    )}
                  </div>

                  {/* Item Name and Notes Row */}
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`itemName-${index}`} className="text-sm sm:text-base font-medium">
                        Nama Barang *
                      </Label>
                      <Input
                        id={`itemName-${index}`}
                        placeholder="Contoh: iPhone 15 Pro, Nike Air Jordan, dll"
                        value={item.itemName}
                        onChange={(e) => updateItemField(index, 'itemName', e.target.value)}
                        required
                        className="h-9 sm:h-10 text-sm sm:text-base"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${index}`} className="text-sm sm:text-base font-medium">
                        Catatan (Opsional)
                      </Label>
                      <Textarea
                        id={`notes-${index}`}
                        placeholder="Catatan tambahan, spesifikasi, dll..."
                        value={item.notes}
                        onChange={(e) => updateItemField(index, 'notes', e.target.value)}
                        rows={2}
                        className="text-sm sm:text-base resize-none"
                      />
                    </div>
                  </div>

                  {/* Price Details Row */}
                  <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`itemPrice-${index}`} className="text-sm sm:text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
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
                        className="h-9 sm:h-10 text-sm sm:text-base"
                      />
                      <div className="text-xs text-muted-foreground">
                        Harga barang dalam mata uang YEN (Jepang)
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`exchangeRate-${index}`} className="text-sm sm:text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
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
                        className="h-9 sm:h-10 text-sm sm:text-base"
                      />
                      <div className="text-xs text-muted-foreground">
                        Contoh: 150 (1 YEN = Rp 150)
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`sellingPrice-${index}`} className="text-sm sm:text-base font-medium">
                        <div className="flex items-center gap-2">
                          <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          Harga Jual (IDR) *
                        </div>
                      </Label>
                      <Input
                        id={`sellingPrice-${index}`}
                        type="text"
                        placeholder="Contoh: Rp 2.500.000"
                        value={item.sellingPrice ? formatRupiah(item.sellingPrice) : ''}
                        onChange={(e) => {
                          const rawValue = parseRupiah(e.target.value)
                          updateItemField(index, 'sellingPrice', rawValue)
                        }}
                        onBlur={(e) => {
                          // Pastikan format tetap rapi saat blur
                          const rawValue = parseRupiah(e.target.value)
                          if (rawValue) {
                            e.target.value = formatRupiah(rawValue)
                          }
                        }}
                        required
                        className="h-9 sm:h-10 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Preview Calculation */}
                  {item.itemPrice && item.exchangeRate && item.sellingPrice && (
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                        Preview Perhitungan
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Harga Beli (IDR)</div>
                          <div className="font-bold text-sm sm:text-base text-blue-600">
                            Rp {(Number(item.itemPrice) * Number(item.exchangeRate)).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Number(item.itemPrice).toLocaleString('ja-JP')} YEN × {Number(item.exchangeRate).toLocaleString('id-ID')}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Keuntungan</div>
                          <div className={`font-bold text-sm sm:text-base ${(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate)) >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                            Rp {(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate))).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {Number(item.sellingPrice).toLocaleString('id-ID')} - {(Number(item.itemPrice) * Number(item.exchangeRate)).toLocaleString('id-ID')}
                          </div>
                        </div>
                        
                        <div className="text-center p-2 sm:p-3 bg-white rounded-lg border">
                          <div className="text-muted-foreground mb-1">Margin</div>
                          <div className={`font-bold text-sm sm:text-base ${(Number(item.sellingPrice) - (Number(item.itemPrice) * Number(item.exchangeRate)) >= 0) ? 'text-green-600' : 'text-red-600'}`}>
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
          <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2">
            <Button type="submit" className="flex-1 h-10 sm:h-12 text-sm sm:text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                  {editingCustomerName ? 'Menambahkan Barang...' : 'Menyimpan Customer & Items...'}
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {editingCustomerName ? 'Tambah Barang' : 'Simpan Customer & Items'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
