"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Jastiper } from "@/lib/types"
import { JastiperService } from "@/lib/jastiper-service"
import { whatsappHref } from "@/lib/jastiper-display"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Phone, Facebook, Search, Filter, CheckCircle, XCircle, X } from "lucide-react"
import Image from "next/image"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"

function ManageJastipersContent() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filterVerified, setFilterVerified] = useState("all")

  useEffect(() => {
    const fetchJastipers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await JastiperService.getAllJastipers()
        setJastipers(data)
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

  const filteredJastipers = useMemo(() => {
    setFiltering(true)

    if (!Array.isArray(jastipers) || jastipers.length === 0) {
      setTimeout(() => setFiltering(false), 100)
      return []
    }

    let filtered = [...jastipers]

    if (filterVerified === "verified") {
      filtered = filtered.filter(j => j.isVerified === true)
    } else if (filterVerified === "unverified") {
      filtered = filtered.filter(j => j.isVerified === false)
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(j => {
        const name = String(j.name || "").toLowerCase()
        const description = String(j.description || "").toLowerCase()
        const phone = String(j.phoneNumber || "").toLowerCase()
        const facebook = String(j.facebookLink || "").toLowerCase()
        const instagram = String(j.instagramLink || "").toLowerCase()
        return name.includes(searchLower) || description.includes(searchLower) || phone.includes(searchLower) || facebook.includes(searchLower) || instagram.includes(searchLower)
      })
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""), "id", { sensitivity: "base" })
        case "orders":
          return (Number(b.completedOrders) || 0) - (Number(a.completedOrders) || 0)
        case "newest":
          return (a.createdAt ? new Date(a.createdAt).getTime() : 0) > (b.createdAt ? new Date(b.createdAt).getTime() : 0) ? -1 : 1
        case "oldest":
          return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0)
        case "rating":
          return (Number(b.rating) || 0) - (Number(a.rating) || 0)
        default:
          return 0
      }
    })

    setTimeout(() => setFiltering(false), 100)
    return filtered
  }, [jastipers, searchTerm, sortBy, filterVerified])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSortBy("name")
    setFilterVerified("all")
  }, [])

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <MobileHeader />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Jastiper</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lihat status verifikasi dan kontak jastiper. Halaman ini hanya untuk admin.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari jastiper berdasarkan nama, deskripsi, nomor telepon, Facebook, atau Instagram..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan berdasarkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nama (A-Z)</SelectItem>
                  <SelectItem value="orders">Order Terbanyak</SelectItem>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="oldest">Terlama</SelectItem>
                  <SelectItem value="rating">Rating Tertinggi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="unverified">Belum Terverifikasi</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={resetFilters} variant="outline">Reset Filter</Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Menampilkan {filteredJastipers.length} dari {jastipers.length} jastiper</span>
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {loading || filtering ? (
            <p className="text-muted-foreground">Memuat data jastiper...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJastipers.map((jastiper) => {
                const wa = whatsappHref(jastiper.phoneNumber)
                return (
                  <Card key={jastiper.id}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <Image src={jastiper.imageUrl || "/placeholder-user.jpg"} alt={jastiper.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{jastiper.name}</h3>
                          <Badge variant={jastiper.isVerified ? "default" : "secondary"} className="mt-1">
                            {jastiper.isVerified ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Terverifikasi</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Belum Terverifikasi</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {jastiper.description && <p className="text-sm text-muted-foreground line-clamp-2">{jastiper.description}</p>}
                      <div className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {jastiper.completedOrders || 0} trip selesai
                      </div>
                      {jastiper.verifiedByFacebookLink && (
                        <a href={jastiper.verifiedByFacebookLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Verified by Facebook
                        </a>
                      )}
                      <div className="flex flex-col gap-2">
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline flex items-center gap-2">
                            <Phone className="h-4 w-4" /> WhatsApp
                          </a>
                        )}
                        {jastiper.facebookLink && (
                          <a href={jastiper.facebookLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline flex items-center gap-2">
                            <Facebook className="h-4 w-4" /> Facebook
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
      </main>
    </div>
  )
}

export default function ManageJastipersPage() {
  return (
    <AdminGuard>
      <ManageJastipersContent />
    </AdminGuard>
  )
}
