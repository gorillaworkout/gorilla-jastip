"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { getSafeNextPath } from "@/lib/admin-routes"
import { BrandedAuthLoading } from "./branded-auth-loading"

export function RoleRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === "admin") {
        router.replace(getSafeNextPath(searchParams.get("next")))
      } else {
        // Non-admin users stay on login page and will see role error
        // This is handled by the login form
      }
    }
  }, [user, loading, router, searchParams])

  if (loading) {
    return <BrandedAuthLoading message="Memverifikasi akses..." />
  }

  return null
}
