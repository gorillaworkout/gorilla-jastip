import { useEffect, useState } from "react"

export const WA_NUMBER = "6287700600208"
export const WA_BASE_URL = "https://wa.me/6287700600208"

export function waLink(message: string): string {
  return WA_BASE_URL + "?text=" + encodeURIComponent(message)
}

export const OSAKA_TRIP = {
  title: "Trip Osaka",
  route: "Jakarta ke Osaka",
  returnRoute: "Osaka ke Jakarta",
  departureDate: "2026-11-30",
  returnDate: "2026-12-13",
  departureLabel: "30 November 2026",
  returnLabel: "13 Desember 2026",
  departureTargetISO: "2026-11-30T00:00:00+07:00",
  slotNote: "Slot terbatas, tanya ketersediaan via WA",
}

export const HANDCARRY_RATES = {
  JP_TO_ID: 1400,
  ID_TO_JP: 1200,
}

export function formatDateId(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00+07:00")
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function calculateDurationDays(departureDate: string, returnDate: string): number {
  const start = new Date(departureDate + "T00:00:00+07:00")
  const end = new Date(returnDate + "T00:00:00+07:00")
  return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  passed: boolean
}

export function getCountdownParts(targetISO: string, now: Date): CountdownParts {
  const diff = new Date(targetISO).getTime() - now.getTime()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    passed: false,
  }
}

export function useCountdown(targetISO: string): CountdownParts {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return getCountdownParts(targetISO, now)
}
