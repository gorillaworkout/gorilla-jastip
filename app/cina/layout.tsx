import type React from "react";
import type { Metadata } from "next";
import { ChinaGuard } from "@/components/auth/china-guard";
import { CinaHeader, CinaNav } from "./cina-chrome";

export const metadata: Metadata = {
  title: "Jastip Cina | JastipdiGW",
  description: "Workspace tim Jastip Cina–Indonesia: tracking pesanan, pembelian, dan logistik.",
};

export default function CinaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChinaGuard>
      <div className="mx-auto min-h-screen w-full max-w-2xl bg-background pb-28">
        <CinaHeader />
        <main className="px-4 py-4">{children}</main>
        <CinaNav />
      </div>
    </ChinaGuard>
  );
}
