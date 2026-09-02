"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BrandedAuthLoading } from "./branded-auth-loading"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return <BrandedAuthLoading message="Memverifikasi akses..." />
  }

  if (!user) {
    return <BrandedAuthLoading message="Mengalihkan ke halaman login..." />
  }

  return <>{children}</>
}
