"use client"

import { useEffect, useState } from "react"
import { Jastiper } from "@/lib/types"
import { JastiperService } from "@/lib/jastiper-service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Phone, Facebook, Search, Filter, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function JastipersPage() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [filteredJastipers, setFilteredJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterVerified, setFilterVerified] = useState("all")

  useEffect(() => {
    const fetchJastipers = async () => {
      try {
        const data = await JastiperService.getAllJastipers()
        setJastipers(data)
        setFilteredJastipers(data)
      } catch (err) {
        setError("Gagal memuat data jastiper")
        console.error("Error fetching jastipers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchJastipers()
  }, [])

  useEffect(() => {
    let filtered = [...jastipers]

    // Filter by verification status
    if (filterVerified === "verified") {
      filtered = filtered.filter(j => j.isVerified)
    } else if (filterVerified === "unverified") {
      filtered = filtered.filter(j => !j.isVerified)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(j => 
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "orders":
          return (b.completedOrders || 0) - (a.completedOrders || 0)
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredJastipers(filtered)
  }, [jastipers, searchTerm, sortBy, filterVerified])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i}>
                  <div className="h-48 bg-slate-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 font-bold tracking-tight hover:opacity-80 transition-opacity">
              <Image src="/jastipdigw.png" alt="JastipdiGW" width={48} height={48} className="rounded-sm" />
              <span className="text-xl">JastipdiGW</span>
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kelola Jastiper</h1>
          <p className="text-slate-300">
            Temukan dan hubungi jastiper terverifikasi kami untuk layanan titip terbaik
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari jastiper berdasarkan nama atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Urutkan berdasarkan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="name">Nama (A-Z)</SelectItem>
                <SelectItem value="orders">Order Terbanyak</SelectItem>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterVerified} onValueChange={setFilterVerified}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-slate-700 text-white">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Filter className="h-4 w-4" />
            <span>Menampilkan {filteredJastipers.length} dari {jastipers.length} jastiper</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Jastiper Grid */}
        {filteredJastipers.length === 0 && !error ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada jastiper ditemukan</h3>
            <p className="text-slate-400">
              {searchTerm ? `Tidak ada jastiper yang cocok dengan pencarian "${searchTerm}"` : "Belum ada jastiper yang tersedia"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJastipers.map((jastiper) => (
              <Card key={jastiper.id} className="group border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/20 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-slate-600/50 group-hover:border-slate-500/70 transition-colors duration-300 shadow-lg">
                      <Image
                        src={jastiper.imageUrl || "/placeholder-user.jpg"}
                        alt={jastiper.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-white mb-2 truncate">{jastiper.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={jastiper.isVerified 
                            ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 px-3 py-1" 
                            : "bg-amber-600/20 text-amber-300 border-amber-500/40 px-3 py-1"
                          }
                        >
                          {jastiper.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terverifikasi
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Belum Terverifikasi
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {jastiper.description && (
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {jastiper.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <Package className="h-5 w-5 text-blue-400" />
                    <div className="flex-1">
                      <span className="text-slate-300 font-medium">{jastiper.completedOrders || 0}</span>
                      <span className="text-slate-400 text-sm ml-2">trip selesai</span>
                    </div>
                  </div>

                  {jastiper.verifiedByFacebookLink && (
                    <div className="text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                      <span className="font-medium text-slate-300">Verified by: </span>
                      <a 
                        href={jastiper.verifiedByFacebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 hover:underline ml-1 transition-colors"
                      >
                        Customer Facebook
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {jastiper.phoneNumber && (
                      <a
                        href={`https://wa.me/${jastiper.phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-600/25"
                      >
                        <Phone className="h-4 w-4" />
                        WhatsApp
                      </a>
                    )}
                    {jastiper.facebookLink && (
                      <a
                        href={jastiper.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/25"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
