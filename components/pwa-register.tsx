"use client"

import { useEffect } from "react"

// Mendaftarkan service worker (produksi saja, supaya development tidak
// terganggu cache). Saat versi baru mengambil alih, halaman dimuat ulang
// sekali agar pengguna selalu memakai versi terbaru.
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    if (process.env.NODE_ENV !== "production") return
    let reloading = false
    navigator.serviceWorker.register("/sw.js").catch(() => {})
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })
  }, [])
  return null
}
