"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HANDCARRY_RATES, waLink } from "@/lib/osaka-trip"

type Direction = "JP_TO_ID" | "ID_TO_JP"

const DIRECTION_LABELS: Record<Direction, string> = {
  JP_TO_ID: "Jepang ke Indonesia",
  ID_TO_JP: "Indonesia ke Jepang",
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n)
}

export default function FeeCalculator() {
  const [direction, setDirection] = useState<Direction>("JP_TO_ID")
  const [weight, setWeight] = useState("")
  const [kurs, setKurs] = useState("")

  const rate = direction === "JP_TO_ID" ? HANDCARRY_RATES.JP_TO_ID : HANDCARRY_RATES.ID_TO_JP
  const weightNum = parseFloat(weight.replace(",", "."))
  const kursNum = parseFloat(kurs.replace(",", "."))
  const validWeight = !isNaN(weightNum) && weightNum > 0
  const feeYen = validWeight ? Math.round(weightNum * rate) : null
  const feeRp = feeYen !== null && !isNaN(kursNum) && kursNum > 0 ? Math.round(feeYen * kursNum) : null

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Kalkulator Fee Handcarry</h3>
      </div>
      <p className="mt-1 text-sm text-slate-400">
        Hitung fee handcarry per kg. Fee ini hanya fee handcarry, belum termasuk harga barang.
      </p>

      <div className="mt-4">
        <Label className="text-slate-300">Arah titipan</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["JP_TO_ID", "ID_TO_JP"] as Direction[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                (direction === d
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500")
              }
            >
              {DIRECTION_LABELS[d]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Tarif: {formatNumber(rate)} yen per kg untuk arah {DIRECTION_LABELS[direction]}.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fee-weight" className="text-slate-300">Berat (kg)</Label>
          <Input
            id="fee-weight"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="mis. 2,5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="mt-1 bg-slate-950 border-slate-700 text-white"
          />
        </div>
        <div>
          <Label htmlFor="fee-kurs" className="text-slate-300">Kurs yen ke rupiah (opsional)</Label>
          <Input
            id="fee-kurs"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="mis. 110, isi sendiri"
            value={kurs}
            onChange={(e) => setKurs(e.target.value)}
            className="mt-1 bg-slate-950 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-4 space-y-1">
        {feeYen === null ? (
          <p className="text-sm text-slate-400">Isi berat untuk melihat fee handcarry.</p>
        ) : (
          <>
            <p className="text-sm text-slate-400">Fee handcarry</p>
            <p className="text-xl font-bold text-white">{formatNumber(feeYen)} yen</p>
            {feeRp !== null ? (
              <p className="text-sm text-slate-300">Perkiraan: Rp {formatNumber(feeRp)} (pakai kurs yang kamu isi).</p>
            ) : (
              <p className="text-sm text-slate-400">Isi kurs di atas untuk melihat perkiraan rupiah.</p>
            )}
          </>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-4">
        <p className="text-sm text-slate-300">
          Butuh jasa checkout beli barang online? Fee-nya menyesuaikan kasus dan dibicarakan langsung, tidak ada
          angka pasti di sini.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-3" asChild>
          <a
            href={waLink("Halo saya ingin tanya fee jasa checkout online")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya Fee Checkout via WA
          </a>
        </Button>
      </div>
    </div>
  )
}
