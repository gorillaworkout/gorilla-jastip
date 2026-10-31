"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

/** Header workspace Cina + navigasi bawah (mobile-first). */
export function CinaHeader() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-base font-bold leading-tight">Jastip Cina</p>
          <p className="text-xs text-muted-foreground">Tim &middot; Phase 1 Personal Checkout</p>
        </div>
        {isSuperAdmin && (
          <Link
            href="/dashboard"
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold"
          >
            &larr; Jepang
          </Link>
        )}
      </div>
    </header>
  );
}

export function CinaNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";
  const items = [
    { href: "/cina/dashboard", label: "Beranda", icon: LayoutDashboard, match: "/cina/dashboard" },
    { href: "/cina/pesanan", label: "Pesanan", icon: Package, match: "/cina/pesanan" },
    { href: "/cina/pesanan/baru", label: "Baru", icon: PlusCircle, match: "/cina/pesanan/baru" },
    ...(isSuperAdmin
      ? [{ href: "/cina/pengaturan", label: "Tim", icon: Settings, match: "/cina/pengaturan" }]
      : []),
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div
        className={cn(
          "mx-auto grid w-full max-w-2xl",
          isSuperAdmin ? "grid-cols-4" : "grid-cols-3",
        )}
      >
        {items.map((item) => {
          const active =
            pathname === item.match ||
            (item.match === "/cina/pesanan" && pathname.startsWith("/cina/pesanan/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
