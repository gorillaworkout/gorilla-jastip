"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { RoleError } from "./role-error"
import { BrandedAuthLoading } from "./branded-auth-loading"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
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

  // Check if user is admin
  if (user.role !== "admin") {
    return <RoleError />
  }

  return <>{children}</>
}
