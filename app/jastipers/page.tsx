"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Jastiper } from "@/lib/types"
import { JastiperService } from "@/lib/jastiper-service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Phone, Facebook, Search, Filter, ArrowLeft, CheckCircle, XCircle, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { MobileHeader } from "@/components/layout/mobile-header"

export default function JastipersPage() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterVerified, setFilterVerified] = useState("all")

  // Fetch jastipers on component mount
  useEffect(() => {
    const fetchJastipers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await JastiperService.getAllJastipers()
        
        // Validate and clean the data
        const validatedData = data.map(jastiper => ({
          ...jastiper,
          name: String(jastiper.name || "").trim(),
          description: String(jastiper.description || "").trim(),
          phoneNumber: String(jastiper.phoneNumber || "").trim(),
          facebookLink: String(jastiper.facebookLink || "").trim(),
          isVerified: Boolean(jastiper.isVerified),
          rating: Number(jastiper.rating) || 0,
          totalOrders: Number(jastiper.totalOrders) || 0,
          completedOrders: Number(jastiper.completedOrders) || 0,
          createdAt: jastiper.createdAt || new Date(),
          updatedAt: jastiper.updatedAt || new Date(),
        }))
        
        setJastipers(validatedData)
      } catch (err) {
        setError("Gagal memuat data jastiper")
        console.error("Error fetching jastipers:", err)
        setJastipers([])
      } finally {
        setLoading(false)
      }
    }

    fetchJastipers()
  }, [])

  // Memoized filtered and sorted jastipers for better performance
  const filteredJastipers = useMemo(() => {
    setFiltering(true)
    
    // Ensure we have valid data to work with
    if (!Array.isArray(jastipers) || jastipers.length === 0) {
      setTimeout(() => setFiltering(false), 100)
      return []
    }

    let filtered = [...jastipers]

    // Filter by verification status
    if (filterVerified === "verified") {
      filtered = filtered.filter(j => j.isVerified === true)
    } else if (filterVerified === "unverified") {
      filtered = filtered.filter(j => j.isVerified === false)
    }

    // Enhanced search filter - search in multiple fields
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(j => {
        // Ensure all fields are strings before filtering
        const name = String(j.name || "").toLowerCase()
        const description = String(j.description || "").toLowerCase()
        const phone = String(j.phoneNumber || "").toLowerCase()
        const facebook = String(j.facebookLink || "").toLowerCase()
        
        const nameMatch = name.includes(searchLower)
        const descriptionMatch = description.includes(searchLower)
        const phoneMatch = phone.includes(searchLower)
        const facebookMatch = facebook.includes(searchLower)
        
        return nameMatch || descriptionMatch || phoneMatch || facebookMatch
      })
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          const nameA = String(a.name || "").toLowerCase()
          const nameB = String(b.name || "").toLowerCase()
          return nameA.localeCompare(nameB, 'id', { sensitivity: 'base' })
        case "orders":
          const aOrders = Number(a.completedOrders) || 0
          const bOrders = Number(b.completedOrders) || 0
          return bOrders - aOrders
        case "newest":
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bDate - aDate
        case "oldest":
          const aDateOld = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bDateOld = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return aDateOld - bDateOld
        case "rating":
          const aRating = Number(a.rating) || 0
          const bRating = Number(b.rating) || 0
          return bRating - aRating
        default:
          return 0
      }
    })
    
    // Use setTimeout to simulate filtering delay and provide better UX
    setTimeout(() => setFiltering(false), 100)
    
    return filtered
  }, [jastipers, searchTerm, sortBy, filterVerified])

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  // Reset all filters function
  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSortBy("name")
    setFilterVerified("all")
  }, [])

  // Loading state
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 font-bold tracking-tight hover:opacity-80 transition-opacity">
              <Image src="/jastipdigw.png" alt="JastipdiGW" width={40} height={40} className="rounded-sm sm:w-12 sm:h-12" />
              <span className="text-lg sm:text-xl">JastipdiGW</span>
            </Link>
          </div>
          <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Mobile Header Spacing */}
        <MobileHeader />
        
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Kelola Jastiper</h1>
          <p className="text-slate-300 text-sm sm:text-base">
            Temukan dan hubungi jastiper terverifikasi kami untuk layanan titip terbaik
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col gap-4">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari jastiper berdasarkan nama, deskripsi, nomor telepon, atau Facebook..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-300">
                  <SelectValue placeholder="Urutkan berdasarkan" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="name">Nama (A-Z)</SelectItem>
                  <SelectItem value="orders">Order Terbanyak</SelectItem>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="w-full bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-300">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Reset Filters Button */}
              <Button
                onClick={resetFilters}
                variant="outline"
                className="w-full bg-slate-900/50 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Reset Filter
              </Button>
            </div>
          </div>
          
          {/* Filter Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Filter className="h-4 w-4" />
              <span>
                Menampilkan {filteredJastipers.length} dari {jastipers.length} jastiper
                {searchTerm && ` (hasil pencarian: "${searchTerm}")`}
                {filtering && " (memproses filter...)"}
              </span>
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || filterVerified !== "all") && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Filter aktif:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/40">
                    Pencarian: {searchTerm}
                  </Badge>
                )}
                {filterVerified !== "all" && (
                  <Badge variant="secondary" className="bg-green-600/20 text-green-300 border-green-500/40">
                    {filterVerified === "verified" ? "Terverifikasi" : "Belum Terverifikasi"}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Jastiper Grid */}
        {filtering ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Memproses filter...</p>
          </div>
        ) : filteredJastipers.length === 0 && !error ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada jastiper ditemukan</h3>
            <p className="text-slate-400">
              {searchTerm ? `Tidak ada jastiper yang cocok dengan pencarian "${searchTerm}"` : "Belum ada jastiper yang tersedia"}
            </p>
            {(searchTerm || filterVerified !== "all") && (
              <Button onClick={resetFilters} variant="outline" className="mt-4">
                Reset Semua Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredJastipers.map((jastiper) => (
              <Card key={jastiper.id} className="group border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 hover:from-slate-800/90 hover:to-slate-700/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-900/20 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-slate-600/50 group-hover:border-slate-500/70 transition-colors duration-300 shadow-lg flex-shrink-0">
                      <Image
                        src={jastiper.imageUrl || "/placeholder-user.jpg"}
                        alt={jastiper.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl text-white mb-2 truncate">{jastiper.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={jastiper.isVerified 
                            ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 px-2 sm:px-3 py-1 text-xs" 
                            : "bg-amber-600/20 text-amber-300 border-amber-500/40 px-2 sm:px-3 py-1 text-xs"
                          }
                        >
                          {jastiper.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Terverifikasi</span>
                              <span className="sm:hidden">✓</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              <span className="hidden sm:inline">Belum Terverifikasi</span>
                              <span className="sm:hidden">✗</span>
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4">
                  {jastiper.description && (
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
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

                  {/* {jastiper.rating && jastiper.rating > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < jastiper.rating! ? 'text-yellow-400' : 'text-slate-600'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-300 text-sm">({jastiper.rating}/5)</span>
                    </div>
                  )} */}

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

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    {jastiper.phoneNumber && (
                      <a
                        href={`https://wa.me/${jastiper.phoneNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-600/25"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">WA</span>
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
                        <span className="hidden sm:inline">Facebook</span>
                        <span className="sm:hidden">FB</span>
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
