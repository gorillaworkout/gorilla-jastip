"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Clock, Sparkles, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
 

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Simple autoplay for gallery
  useEffect(() => {
    if (!carouselApi) return
    autoTimerRef.current && clearInterval(autoTimerRef.current)
    autoTimerRef.current = setInterval(() => {
      carouselApi.scrollNext()
    }, 3000)
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [carouselApi])

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
              href="https://www.facebook.com/bayu.darmawan02/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white text-sm"
            >
              Facebook
            </a>
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
      {/* Hero with JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'JastipdiGW',
            url: 'https://jastipdigw.com',
            description:
              'Jasa titip Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.',
            areaServed: ['Indonesia', 'Japan'],
            sameAs: [
              'https://www.instagram.com/jastipdigw/',
              'https://wa.me/6287700600208',
              'https://www.facebook.com/bayu.darmawan02/',
            ],
          }),
        }}
      />
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

      {/* Proof Gallery */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Galeri Bukti Pengiriman</h2>
          <p className="text-slate-300 text-sm">Sebagian dokumentasi pengiriman kami</p>
        </div>
        <div
          className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
          onMouseEnter={() => {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current)
          }}
          onMouseLeave={() => {
            if (carouselApi) {
              autoTimerRef.current = setInterval(() => carouselApi.scrollNext(), 3000)
            }
          }}
        >
          <Carousel setApi={setCarouselApi} className="px-8">
            <CarouselContent>
              {[
                "/placeholder.jpg",
                "/placeholder-user.jpg",
                "/placeholder.jpg",
                "/placeholder-user.jpg",
                "/placeholder.jpg",
              ].map((src, idx) => (
                <CarouselItem key={idx}>
                  <div className="relative h-64 sm:h-80 md:h-[28rem] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                    <Image src={src} alt={`Bukti pengiriman ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex bg-slate-900/70 border-slate-700 hover:bg-slate-900" />
            <CarouselNext className="hidden sm:flex bg-slate-900/70 border-slate-700 hover:bg-slate-900" />
          </Carousel>
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

      {/* Trust & Safety */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-600/30 bg-green-600/10 px-3 py-1 text-xs text-green-400">
                <span className="inline-block size-1.5 rounded-full bg-green-400" />
                Bukan Penipuan • Transparan
              </div>
              <h2 className="mt-3 text-2xl font-bold">Keamanan & Transparansi</h2>
              <p className="mt-2 text-slate-300 text-sm">
                Kami beroperasi secara profesional dan transparan. Setiap transaksi memiliki bukti, dan status
                pesanan dapat dipantau. Kami tidak pernah meminta kode OTP atau data sensitif apa pun.
              </p>
              <ul className="mt-4 space-y-2 text-slate-300 text-sm">
                <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5" /> Bukti pembayaran & pengiriman disediakan</li>
                <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5" /> Komunikasi jelas, estimasi realistis</li>
                <li className="flex items-start gap-2"><ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5" /> Tidak meminta OTP / data rahasia</li>
              </ul>
              <div className="mt-5">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <a href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20konfirmasi%20pembayaran" target="_blank" rel="noopener noreferrer">
                    Tanya/Verifikasi via WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">
                <div className="text-xs text-slate-400">Pembayaran hanya ke rekening a.n.</div>
                <div className="mt-1 text-lg font-semibold">Bayu Darmawan</div>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                    <div className="text-slate-400">Metode Pembayaran</div>
                    <div className="mt-1 text-slate-200">Transfer Bank / E-Wallet</div>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                    <div className="text-slate-400">Konfirmasi</div>
                    <div className="mt-1 text-slate-200">Kirim bukti transfer via WhatsApp</div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">Catatan: Hindari pembayaran ke nama selain di atas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Group Live Shopping */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-600/15 to-blue-600/15 p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold">Join Grup Jastip (Live Shopping)</h2>
              <p className="mt-3 text-slate-300 text-sm">
                Ikuti live shopping pada periode berjalan, lihat update barang secara real-time,
                dan dapatkan prioritas penawaran. Hanya link resmi yang kami bagikan di sini.
              </p>
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 text-sm">
                <li className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">Notifikasi stok & diskon cepat</li>
                <li className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">Update foto/video live</li>
                <li className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">Q&A langsung dengan admin</li>
                <li className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">Info estimasi & pengiriman</li>
              </ul>
              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <a href="https://chat.whatsapp.com/your-group-invite-link" target="_blank" rel="noopener noreferrer">
                    Masuk Grup WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-400">Catatan: Link grup dapat berbeda tiap periode untuk menjaga keamanan.</p>
            </div>
            <div className="hidden md:block">
              <div className="relative h-56 md:h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.35),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.35),transparent_40%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-slate-400">Preview</div>
                    <div className="mt-1 text-xl font-semibold">Live Shopping Periode</div>
                    <div className="mt-2 text-slate-400 text-xs">Barang, harga, dan status diperbarui saat live berlangsung</div>
                  </div>
                </div>
              </div>
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
