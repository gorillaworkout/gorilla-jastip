"use client"

import { useEffect, useState } from "react"
import { Jastiper } from "@/lib/types"
import { JastiperService } from "@/lib/jastiper-service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Phone, Facebook, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function JastiperGrid() {
  const [jastipers, setJastipers] = useState<Jastiper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJastipers = async () => {
      try {
        const data = await JastiperService.getVerifiedJastipers()
        setJastipers(data)
      } catch (err) {
        setError("Gagal memuat data jastiper")
        console.error("Error fetching jastipers:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchJastipers()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-slate-800 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">{error}</p>
      </div>
    )
  }

  if (jastipers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Belum ada jastiper yang terverifikasi</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jastipers.slice(0, 6).map((jastiper) => (
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
                  <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-300 border-emerald-500/40 px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terverifikasi
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
                <span className="text-slate-400 text-sm ml-2">order selesai</span>
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
  )
}
