"use client"

import { Plane, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  OSAKA_TRIP,
  HANDCARRY_RATES,
  calculateDurationDays,
  useCountdown,
  waLink,
} from "@/lib/osaka-trip"

export default function OsakaTripCard({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const countdown = useCountdown(OSAKA_TRIP.departureTargetISO)
  const duration = calculateDurationDays(OSAKA_TRIP.departureDate, OSAKA_TRIP.returnDate)
  const dark = variant === "dark"

  return (
    <div
      className={
        "rounded-xl border p-6 relative overflow-hidden " +
        (dark
          ? "border-blue-600/30 bg-gradient-to-br from-blue-600/10 to-indigo-600/10"
          : "border-blue-200 bg-white")
      }
    >
      {dark && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-400">Upcoming</span>
          </div>
          <div className="text-xs px-2 py-1 rounded-full text-blue-400 bg-blue-600/20">November 2026</div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600/20">
              <Plane className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className={"font-semibold " + (dark ? "text-white" : "text-slate-900")}>{OSAKA_TRIP.title}</h3>
              <p className={"text-sm " + (dark ? "text-slate-300" : "text-slate-600")}>{OSAKA_TRIP.route}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className={dark ? "text-slate-400" : "text-slate-500"}>Berangkat:</span>
              <span className={"font-medium " + (dark ? "text-white" : "text-slate-900")}>{OSAKA_TRIP.departureLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={dark ? "text-slate-400" : "text-slate-500"}>Pulang:</span>
              <span className={"font-medium " + (dark ? "text-white" : "text-slate-900")}>{OSAKA_TRIP.returnLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={dark ? "text-slate-400" : "text-slate-500"}>Durasi:</span>
              <span className="font-medium text-blue-400">{duration} hari</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={dark ? "text-slate-400" : "text-slate-500"}>Hitung mundur:</span>
              <span className={"font-medium flex items-center gap-1 " + (dark ? "text-white" : "text-slate-900")}>
                <Clock className="h-4 w-4 text-blue-400" />
                {countdown.passed ? "Sudah berangkat" : countdown.days + " hari lagi"}
              </span>
            </div>
          </div>
        </div>

        <div className={"mb-3 text-sm " + (dark ? "text-slate-300" : "text-slate-600")}>
          Handcarry dua arah. Fee Jepang ke Indonesia {HANDCARRY_RATES.JP_TO_ID} yen per kg, Indonesia ke Jepang{" "}
          {HANDCARRY_RATES.ID_TO_JP} yen per kg.
        </div>
        <p className={"text-xs mb-4 " + (dark ? "text-slate-400" : "text-slate-500")}>{OSAKA_TRIP.slotNote}.</p>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full" asChild>
          <a
            href={waLink("Halo saya ingin tanya slot dan order trip Osaka 30 November 2026")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya Slot dan Order
          </a>
        </Button>
      </div>
    </div>
  )
}
