"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Clock, Sparkles, ArrowRight } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="font-bold tracking-tight">JastipdiGW</div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/6287700600208"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white text-sm"
            >
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/jastipdigw/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white text-sm"
            >
              Instagram
            </a>
            <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      </header>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600 blur-3xl" />
          <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-28 lg:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Jastip Jepang Cepat, Aman, dan Transparan</h1>
            <p className="mt-4 text-slate-300 text-lg">Titip barang dari Indonesia ke Jepang dan sebaliknya, atau kami bantu checkout dari marketplace Jepang. Harga jujur, update real-time, pengiriman rapi.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <a href="https://wa.me/6287700600208" target="_blank" rel="noopener noreferrer">
                  Titip Barang Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <ShieldCheck className="h-6 w-6 text-blue-400" />
            <h3 className="mt-3 font-semibold">Aman & Terpercaya</h3>
            <p className="mt-2 text-slate-300 text-sm">Pembayaran aman, proses jelas, dan komunikasi transparan setiap langkah.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <Clock className="h-6 w-6 text-blue-400" />
            <h3 className="mt-3 font-semibold">Cepat & Tepat Waktu</h3>
            <p className="mt-2 text-slate-300 text-sm">Estimasi waktu yang realistis dan tracking status titipan yang akurat.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <h3 className="mt-3 font-semibold">Layanan Dua Arah (ID ⇄ JP)</h3>
            <p className="mt-2 text-slate-300 text-sm">Titip barang Indonesia → Jepang dan sebaliknya. Checkout marketplace Jepang tetap tersedia.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold">Cara Kerja</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/40">
            <span className="text-blue-400 font-semibold">01</span>
            <h3 className="mt-2 font-semibold">Kirim Detail</h3>
            <p className="text-slate-300 text-sm">Kirim link/produk yang diinginkan beserta spesifikasi dan kuantitas.</p>
          </div>
          <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/40">
            <span className="text-blue-400 font-semibold">02</span>
            <h3 className="mt-2 font-semibold">Konfirmasi & Checkout</h3>
            <p className="text-slate-300 text-sm">Kami hitungkan biaya, konfirmasi, lalu bantu checkout dari Jepang.</p>
          </div>
          <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/40">
            <span className="text-blue-400 font-semibold">03</span>
            <h3 className="mt-2 font-semibold">Kirim ke Indonesia</h3>
            <p className="text-slate-300 text-sm">Packing aman dan pengiriman rapi sampai tujuan Anda.</p>
          </div>
        </div>
      </section>

      {/* Learn & Join */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold">Belajar Jastip & Gabung Jadi Jastiper</h2>
              <p className="mt-3 text-slate-300">
                Ingin belajar cara menjalankan bisnis jastip dari nol, atau langsung bergabung
                menjadi jastiper di jaringan kami? Kami menyediakan panduan, template perhitungan,
                dan pendampingan supaya kamu cepat mulai dan aman beroperasi.
              </p>
              <ul className="mt-4 space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-blue-400 mt-0.5" /> Materi dasar sampai advanced (sourcing, pricing, workflow)</li>
                <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-blue-400 mt-0.5" /> Template profit, biaya kirim, dan manajemen periode</li>
                <li className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-blue-400 mt-0.5" /> Akses group & peluang order sebagai jastiper</li>
              </ul>
            </div>
            <div className="flex w-full md:items-end md:justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto" asChild>
                <a href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20gabung%20jadi%20jastiper" target="_blank" rel="noopener noreferrer">
                  Gabung Jadi Jastiper <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Siap titip barang dari Jepang?</h3>
              <p className="text-slate-300">Klik untuk mulai proses titipan atau login sebagai admin.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <a href="https://wa.me/6287700600208" target="_blank" rel="noopener noreferrer">
                  Mulai Titip Sekarang
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} Jastip Jepang. All rights reserved.
      </footer>
    </main>
  )
}
