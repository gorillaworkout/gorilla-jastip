"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, ShieldCheck, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { AdminGuard } from "@/components/auth/admin-guard"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileHeader } from "@/components/layout/mobile-header"

function SettingsContent() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-[100dvh] bg-muted/20">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-auto">
        <MobileHeader title="Pengaturan" />
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-4 sm:px-6 md:py-8">
          <header className="hidden md:block">
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
            <p className="mt-1 text-muted-foreground">Informasi akun dan akses.</p>
          </header>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Profil Pengguna
              </CardTitle>
              <CardDescription>Akun Google yang sedang aktif.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y rounded-lg border p-0">
              <div className="grid gap-1 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                <span className="text-sm text-muted-foreground">Nama</span>
                <span className="min-w-0 break-words font-medium">{user?.name || "—"}</span>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="min-w-0 break-all font-medium">{user?.email || "—"}</span>
              </div>
              <div className="grid gap-1 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                <span className="text-sm text-muted-foreground">Akses</span>
                <div><Badge variant="secondary" className="capitalize">{user?.role || "—"}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Sesi admin
              </CardTitle>
              <CardDescription>Keluar setelah selesai menggunakan perangkat bersama.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return <AdminGuard><SettingsContent /></AdminGuard>
}
