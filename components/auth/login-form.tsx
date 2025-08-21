"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, AlertTriangle } from "lucide-react"
import { RoleError } from "./role-error"

export function LoginForm() {
  const { loginWithGoogle, loading, user } = useAuth()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check role and redirect if admin
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        // Admin redirect to dashboard
        router.push("/dashboard")
      }
      // Non-admin users will stay here and see role error
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true)
      await loginWithGoogle()
    } catch (error) {
      console.error("Login error:", error)
      alert(error instanceof Error ? error.message : "Gagal login")
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show role error if user is not admin
  if (user && user.role !== "admin") {
    return <RoleError />
  }

  // Show loading while checking role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Button
        onClick={handleGoogleLogin}
        disabled={isLoggingIn || loading}
        className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
        variant="default"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login dengan Google
          </>
        )}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-xs text-blue-300/60">
          Dengan login, Anda menyetujui syarat dan ketentuan penggunaan
        </p>
      </div>
    </div>
  )
}