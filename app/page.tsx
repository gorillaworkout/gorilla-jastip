"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Clock, Sparkles, ArrowRight, LogIn } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { TripsService, type DepartureTrip } from "@/lib/trips-service"
 

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [brandsApi, setBrandsApi] = useState<CarouselApi | null>(null)
  const brandsTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [trips, setTrips] = useState<DepartureTrip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)

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

  // Autoplay for brands carousel
  useEffect(() => {
    if (!brandsApi) return
    brandsTimerRef.current && clearInterval(brandsTimerRef.current)
    brandsTimerRef.current = setInterval(() => {
      brandsApi.scrollNext()
    }, 2500)
    return () => {
      if (brandsTimerRef.current) clearInterval(brandsTimerRef.current)
    }
  }, [brandsApi])

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  // Load trips for home page
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setTripsLoading(true)
        const tripsData = await TripsService.getHomePageTrips()
        setTrips(tripsData)
      } catch (error) {
        console.error("Error loading trips:", error)
        // Don't show error on home page, just use empty array
      } finally {
        setTripsLoading(false)
      }
    }
    
    loadTrips()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    )
  }

  const galleryImages = [
    "/1.webp",
    "/3.webp",
    "/2.webp",
    "/4.jpeg",
    "/5.jpeg",
  ]

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold tracking-tight">
            <Image src="/jastipdigw.png" alt="JastipdiGW" width={64} height={64} className="rounded-sm" />
            <span className="text-xl md:text-2xl">JastipdiGW</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Login"
              onClick={() => router.push("/login")}
            >
              <LogIn className="h-5 w-5" />
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
            logo: 'https://jastipdigw.gorillaworkout.id/jastipdigw.png',
            image: 'https://jastipdigw.gorillaworkout.id/jastipdigw.png',
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

          {/* Brands we can buy */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-4">Brand yang bisa kami belikan</h2>
        <div
          className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
          onMouseEnter={() => {
            if (brandsTimerRef.current) clearInterval(brandsTimerRef.current)
          }}
          onMouseLeave={() => {
            if (brandsApi) {
              brandsTimerRef.current = setInterval(() => brandsApi.scrollNext(), 2500)
            }
          }}
        >
          <Carousel setApi={setBrandsApi} className="px-8" opts={{ loop: true, dragFree: true, align: "start" }}>
            <CarouselContent className="items-center">
              {[
                { name: "Nike", logo: "https://cdn.simpleicons.org/nike/111111" },
                { name: "Adidas", logo: "https://cdn.simpleicons.org/adidas/111111" },
                { name: "Coach", logo: "/coach.jpg" },
                { name: "Uniqlo", logo: "/uniqlo.jpg" },
                { name: "GU", logo: "/gu.jpg" },
                { name: "MUJI", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Muji_logo.svg" },
                { name: "ZARA", logo: "https://cdn.simpleicons.org/zara/111111" },
                { name: "Onitsuka Tiger", logo: "/onitsuka.jpg" },
                { name: "New Balance", logo: "https://cdn.simpleicons.org/newbalance/BE0027" },
                { name: "Converse Japan", logo: "/converse.jpg" },
                { name: "Porter Yoshida", logo: "/porter.jpg" },
                { name: "Sanrio", logo: "/sanrio.jpeg" },
                { name: "Shiseido", logo: "/shiseido.jpg" },
                { name: "Senka", logo: "/senka.jpg" },
                { name: "Hada Labo", logo: "/hadalabo.jpg" },
              
                { name: "Pokémon Center", logo: "/pokemon.jpg" },
                { name: "Nintendo", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" },
              ].map((b) => (
                <CarouselItem key={b.name} className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6">
                  <div className="h-16 md:h-20 flex items-center justify-center rounded-xl border border-slate-800 bg-white px-3">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="max-h-10 md:max-h-12 object-contain"
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const sibling = target.nextElementSibling as HTMLElement | null
                        if (sibling) sibling.classList.remove('hidden')
                      }}
                    />
                    <span className="hidden text-black text-sm font-semibold">{b.name}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex bg-slate-900/70 border-slate-700 hover:bg-slate-900" />
            <CarouselNext className="hidden sm:flex bg-slate-900/70 border-slate-700 hover:bg-slate-900" />
          </Carousel>
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

      {/* List Keberangkatanku */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">List Keberangkatan</h2>
          {/* <Button 
            variant="outline" 
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
            asChild
          >
            <a href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20jadwal%20keberangkatan" target="_blank" rel="noopener noreferrer">
              Tanya Jadwal
            </a>
          </Button> */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripsLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-600 rounded-full" />
                    <div className="h-4 w-20 bg-slate-600 rounded" />
                  </div>
                  <div className="h-4 w-24 bg-slate-600 rounded" />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-slate-600 rounded" />
                      <div className="h-4 w-24 bg-slate-600 rounded" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-slate-600 rounded" />
                      <div className="h-4 w-24 bg-slate-600 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-slate-600 rounded" />
                      <div className="h-4 w-24 bg-slate-600 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-slate-600 rounded" />
                      <div className="h-4 w-16 bg-slate-600 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : trips.length > 0 ? (
            trips.map((trip) => {
              const getStatusInfo = (status: string) => {
                switch (status) {
                  case 'upcoming':
                    return { label: 'Upcoming', color: 'text-green-400', bgColor: 'bg-green-400', pulse: true };
                  case 'planning':
                    return { label: 'Planning', color: 'text-yellow-400', bgColor: 'bg-yellow-400', pulse: false };
                  case 'completed':
                    return { label: 'Completed', color: 'text-slate-400', bgColor: 'bg-slate-400', pulse: false };
                  default:
                    return { label: status, color: 'text-slate-400', bgColor: 'bg-slate-400', pulse: false };
                }
              };

              const calculateDuration = (departureDate: string, returnDate: string) => {
                const start = new Date(departureDate);
                const end = new Date(returnDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
              };

              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
              };

              const statusInfo = getStatusInfo(trip.status);
              const duration = calculateDuration(trip.departureDate, trip.returnDate);
              const isUpcoming = trip.status === 'upcoming';
              const isCompleted = trip.status === 'completed';

              return (
                <div 
                  key={trip.id}
                  className={`rounded-xl border p-6 relative overflow-hidden ${
                    isUpcoming 
                      ? 'border-blue-600/30 bg-gradient-to-br from-blue-600/10 to-indigo-600/10' 
                      : isCompleted 
                        ? 'border-slate-700 bg-slate-900/50'
                        : 'border-slate-700 bg-slate-900/50'
                  }`}
                >
                  {isUpcoming && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 ${statusInfo.bgColor} rounded-full ${statusInfo.pulse ? 'animate-pulse' : ''}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isUpcoming 
                          ? 'text-blue-400 bg-blue-600/20' 
                          : 'text-slate-400 bg-slate-700'
                      }`}>
                        {new Date(trip.departureDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUpcoming ? 'bg-blue-600/20' : 'bg-slate-700'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            isUpcoming ? 'text-blue-400' : 'text-slate-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{trip.title}</h3>
                          <p className="text-sm text-slate-300">{trip.route}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Berangkat:</span>
                          <span className="text-white font-medium">{formatDate(trip.departureDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Pulang:</span>
                          <span className="text-white font-medium">{formatDate(trip.returnDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Durasi:</span>
                          <span className={`font-medium ${isUpcoming ? 'text-blue-400' : 'text-slate-400'}`}>
                            {duration} hari
                          </span>
                        </div>
                        {trip.orderDeadline && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Deadline Order:</span>
                            <span className="text-white font-medium">{formatDate(trip.orderDeadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {trip.description && (
                      <div className="mb-3 text-sm text-slate-300">
                        {trip.description}
                      </div>
                    )}
                    
                    {trip.notes && (
                      <div className="text-xs text-slate-400">
                        <span className="text-blue-400">📝</span> {trip.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Trip</h3>
              <p className="text-slate-400 text-sm">
                Saat ini belum ada jadwal keberangkatan yang tersedia.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-4">
            Ingin tahu jadwal keberangkatan terbaru atau ada pertanyaan tentang trip tertentu?
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
            <a href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20jadwal%20keberangkatan%20dan%20order%20jastip" target="_blank" rel="noopener noreferrer">
              Tanya Jadwal & Order Sekarang
            </a>
          </Button>
        </div>
      </section>

      {/* Proof Gallery */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
      
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
          <Carousel setApi={setCarouselApi} className="px-8" opts={{ loop: true, align: "center" }}>
            <CarouselContent>
              {galleryImages.map((src, idx) => (
                <CarouselItem key={`${src}-${idx}`} className="basis-full sm:basis-1/2 md:basis-1/3">
                  <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
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
                  <a href="https://chat.whatsapp.com/EgdUCttb8r68vylNdW5OX1?mode=ems_copy_c" target="_blank" rel="noopener noreferrer">
                    Masuk Group WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
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

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/jastipdigw.png" alt="JastipdiGW" width={48} height={48} className="rounded-lg" />
                <span className="text-xl font-bold">JastipdiGW</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Jasa titip barang dari Jepang ke Indonesia dan sebaliknya. 
                Aman, terpercaya, dan transparan dengan pengalaman bertahun-tahun.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/bayu.darmawan02/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src="https://cdn.simpleicons.org/facebook/ffffff"
                    alt="Facebook"
                    className="h-5 w-5 opacity-80 group-hover:opacity-100 transition"
                  />
                </a>
                <a
                  href="https://wa.me/6287700600208"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-green-600 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src="https://cdn.simpleicons.org/whatsapp/ffffff"
                    alt="WhatsApp"
                    className="h-5 w-5 opacity-80 group-hover:opacity-100 transition"
                  />
                </a>
                <a
                  href="https://www.instagram.com/jastipdigw/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-pink-600 transition-all duration-300 hover:scale-110"
                >
                  <img
                    src="https://cdn.simpleicons.org/instagram/ffffff"
                    alt="Instagram"
                    className="h-5 w-5 opacity-80 group-hover:opacity-100 transition"
                  />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Layanan</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a 
                    href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20layanan%20Jastip%20Jepang" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span>Jastip Jepang</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20layanan%20Checkout%20Marketplace%20Jepang" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span>Checkout Marketplace</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20layanan%20Pengiriman%20Indonesia%20%E2%87%84%20Jepang" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span>Pengiriman ID ⇄ JP</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20layanan%20Live%20Shopping" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span>Live Shopping</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a 
                    href="/jastipers"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <span>List Jastiper</span>
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-white mb-4">Kontak</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <a href="https://wa.me/6287700600208" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                    +62 877-0060-0208
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Bayu Darmawan</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Admin JastipdiGW</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-slate-400 text-sm">
                © {new Date().getFullYear()} JastipdiGW. All rights reserved.
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <a 
                  href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20Privacy%20Policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a 
                  href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20Terms%20of%20Service" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </a>
                <a 
                  href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20FAQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 transition-colors"
                >
                  FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
