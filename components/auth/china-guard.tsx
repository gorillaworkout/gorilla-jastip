"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { BrandedAuthLoading } from "./branded-auth-loading";
import { Button } from "@/components/ui/button";

interface ChinaGuardProps {
  children: React.ReactNode;
}

/** Pengaman workspace Jastip Cina: super admin (role admin) atau email
 *  yang terdaftar di tim Cina. Mirip AdminGuard, tapi untuk workspace tim. */
export function ChinaGuard({ children }: ChinaGuardProps) {
  const { user, loading, chinaAccess, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <BrandedAuthLoading message="Memverifikasi akses..." />;
  }

  if (!user) {
    return <BrandedAuthLoading message="Mengalihkan ke halaman login..." />;
  }

  if (user.role !== "admin" && !chinaAccess) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-lg font-semibold">Belum terdaftar di tim Jastip Cina</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Akun {user.email} belum didaftarkan ke workspace Cina. Minta Bayu
          (super admin) untuk menambahkan email ini di menu Pengaturan tim.
        </p>
        <Button className="mt-6" onClick={() => void logout()}>
          Keluar
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
