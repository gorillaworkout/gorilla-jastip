"use client"

import { Plane, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OSAKA_TRIP, useCountdown, waLink } from "@/lib/osaka-trip"

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

export default function OsakaTripBanner() {
  const countdown = useCountdown(OSAKA_TRIP.departureTargetISO)

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
      <div className="rounded-2xl border border-blue-600/40 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wide text-blue-400">TRIP BERIKUTNYA</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">
            Jakarta ke Osaka, berangkat {OSAKA_TRIP.departureLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Pulang {OSAKA_TRIP.returnLabel} dari Osaka ke Jakarta. {OSAKA_TRIP.slotNote}.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Plane className="h-4 w-4 text-blue-400" /> Jakarta ke Osaka
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" /> {OSAKA_TRIP.departureLabel} sampai {OSAKA_TRIP.returnLabel}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          {countdown.passed ? (
            <p className="text-sm text-slate-300">Trip Osaka sudah berangkat. Tunggu jadwal berikutnya.</p>
          ) : (
            <div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Hitung mundur keberangkatan
              </p>
              <div className="mt-2 flex gap-2">
                {[
                  { value: countdown.days, label: "hari" },
                  { value: pad(countdown.hours), label: "jam" },
                  { value: pad(countdown.minutes), label: "menit" },
                  { value: pad(countdown.seconds), label: "detik" },
                ].map((part) => (
                  <div key={part.label} className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-center min-w-[64px]">
                    <div className="text-lg font-bold text-white">{part.value}</div>
                    <div className="text-[11px] text-slate-400">{part.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 w-full md:w-auto" asChild>
            <a
              href={waLink("Halo saya ingin tanya ketersediaan slot trip Osaka 30 November 2026")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tanya Slot via WA
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
