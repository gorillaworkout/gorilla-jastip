"use client"

import { useEffect, useMemo, useState } from "react"
import { Jastiper } from "@/lib/types"
import { JastiperService } from "@/lib/jastiper-service"
import { whatsappHref } from "@/lib/jastiper-display"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, Phone, Facebook, Search, X } from "lucide-react"
import Image from "next/image"
import { PublicHeader } from "@/components/layout/public-header"

export default function JastipersDirectoryPage() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchJastipers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await JastiperService.getVerifiedJastipers()
        setJastipers(data.filter((jastiper) => jastiper.isVerified))
      } catch (err) {
        console.error("Error fetching jastipers:", err)
        try {
          const fallback = await JastiperService.getAllJastipers()
          setJastipers(fallback.filter((jastiper) => jastiper.isVerified))
        } catch (fallbackError) {
          console.error("Error fetching fallback jastipers:", fallbackError)
          setError("Gagal memuat data jastiper")
          setJastipers([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJastipers()
  }, [])

  const visibleJastipers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim()
    if (!query) return jastipers
    return jastipers.filter((jastiper) => {
      const haystack = [jastiper.name, jastiper.description]
        .map((value) => String(value || "").toLowerCase())
        .join(" ")
      return haystack.includes(query)
    })
  }, [jastipers, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <PublicHeader />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <PublicHeader />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2">Daftar Jastiper</h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base">
            Temukan dan hubungi jastiper terverifikasi kami untuk layanan titip terbaik
          </p>
        </div>

        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari jastiper berdasarkan nama atau layanan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Menampilkan {visibleJastipers.length} jastiper terverifikasi
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {visibleJastipers.length === 0 && !error ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada jastiper ditemukan</h3>
            <p className="text-slate-400">
              {searchTerm
                ? `Tidak ada jastiper yang cocok dengan pencarian "${searchTerm}"`
                : "Belum ada jastiper terverifikasi yang tersedia"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visibleJastipers.map((jastiper) => {
              const wa = whatsappHref(jastiper.phoneNumber)
              return (
                <Card
                  key={jastiper.id}
                  className="group border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/20 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-slate-600/50 shadow-lg flex-shrink-0 bg-slate-800">
                        <Image
                          src={jastiper.imageUrl || "/placeholder-user.jpg"}
                          alt={jastiper.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-white mb-1 truncate">{jastiper.name}</h3>
                        <p className="text-xs text-emerald-300">Jastiper terverifikasi</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4">
                    {jastiper.description && (
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                        {jastiper.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <Package className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-slate-300 font-medium">{jastiper.completedOrders || 0}</span>
                        <span className="text-slate-400 text-sm ml-2">trip selesai</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
                        >
                          <Phone className="h-4 w-4" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {jastiper.facebookLink && (
                        <a
                          href={jastiper.facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
                        >
                          <Facebook className="h-4 w-4" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {jastiper.instagramLink && (
                        <a
                          href={jastiper.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
                        >
                          <span aria-hidden>📷</span>
                          <span>Instagram</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
