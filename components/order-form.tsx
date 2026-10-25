"use client"

import { useState } from "react"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { waLink } from "@/lib/osaka-trip"

type Direction = "JP_TO_ID" | "ID_TO_JP"

const DIRECTION_LABELS: Record<Direction, string> = {
  JP_TO_ID: "Jepang ke Indonesia",
  ID_TO_JP: "Indonesia ke Jepang",
}

export default function OrderForm() {
  const [itemName, setItemName] = useState("")
  const [productLink, setProductLink] = useState("")
  const [weight, setWeight] = useState("")
  const [direction, setDirection] = useState<Direction>("JP_TO_ID")
  const [customerName, setCustomerName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim() || !customerName.trim()) {
      setError("Isi dulu nama barang dan nama pemesan ya.")
      return
    }
    setError("")
    const lines = [
      "Halo JastipdiGW, saya mau titip barang:",
      "- Nama barang: " + itemName.trim(),
      "- Link produk: " + (productLink.trim() || "-"),
      "- Berat estimasi: " + (weight.trim() ? weight.trim() + " kg" : "belum tahu, minta dihitungkan"),
      "- Arah: " + DIRECTION_LABELS[direction],
      "- Nama pemesan: " + customerName.trim(),
    ]
    window.open(waLink(lines.join("\n")), "_blank")
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Form Order ke WA</h3>
      </div>
      <p className="mt-1 text-sm text-slate-400">
        Isi form ini, pesan WhatsApp tersusun rapi dan langsung terbuka. Kamu tinggal tekan kirim.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="order-item" className="text-slate-300">Nama barang *</Label>
          <Input
            id="order-item"
            placeholder="mis. Onitsuka Tiger Mexico 66"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="mt-1 bg-slate-950 border-slate-700 text-white"
          />
        </div>
        <div>
          <Label htmlFor="order-link" className="text-slate-300">Link produk</Label>
          <Input
            id="order-link"
            placeholder="tempel link toko atau marketplace"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            className="mt-1 bg-slate-950 border-slate-700 text-white"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="order-weight" className="text-slate-300">Berat estimasi (kg)</Label>
            <Input
              id="order-weight"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="boleh dikosongkan"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 bg-slate-950 border-slate-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="order-direction" className="text-slate-300">Arah</Label>
            <select
              id="order-direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="JP_TO_ID">Jepang ke Indonesia</option>
              <option value="ID_TO_JP">Indonesia ke Jepang</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="order-name" className="text-slate-300">Nama pemesan *</Label>
          <Input
            id="order-name"
            placeholder="nama kamu"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 bg-slate-950 border-slate-700 text-white"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white mt-5 w-full">
        Kirim Order via WA
      </Button>
      <p className="mt-2 text-xs text-slate-500">
        Pesan hanya dibuka di WhatsApp, tidak disimpan di situs ini.
      </p>
    </form>
  )
}
