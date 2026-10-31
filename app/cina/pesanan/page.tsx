"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCinaOrders } from "@/lib/cina-service";
import {
  CINA_STATUS_FLOW,
  CINA_STATUS_META,
  formatRupiah,
  formatTanggal,
  type CinaOrder,
  type CinaStatus,
} from "@/lib/cina";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FILTERS: { value: "all" | CinaStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  ...CINA_STATUS_FLOW.map((s) => ({ value: s as "all" | CinaStatus, label: CINA_STATUS_META[s].label })),
  { value: "bermasalah", label: "Bermasalah" },
];

export default function CinaPesananPage() {
  const [orders, setOrders] = useState<CinaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CinaStatus>("all");

  useEffect(() => {
    let active = true;
    getCinaOrders()
      .then((rows) => {
        if (active) setOrders(rows);
      })
      .catch((err) => {
        console.error("cina pesanan load error", err);
        const code = (err as { code?: string } | null)?.code ?? "tidak diketahui";
        if (active)
          setError(`Gagal memuat pesanan. (kode: ${code}) Periksa koneksi lalu coba lagi.`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return [o.orderId, o.customerName, o.productName, o.customerWa]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [orders, query, statusFilter]);

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Memuat…</p>;
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari ID order, pelanggan, atau produk…"
        className="h-11"
      />
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold",
                statusFilter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} pesanan</p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border bg-card p-4 text-center text-sm text-muted-foreground">
          Tidak ada pesanan yang cocok.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const meta = CINA_STATUS_META[o.status];
            return (
              <Link
                key={o.id}
                href={`/cina/pesanan/${o.id}`}
                className="block rounded-xl border bg-card p-3 active:bg-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{o.orderId}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm">{o.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {o.customerName} &middot; {o.quantity}x &middot;{" "}
                  {formatRupiah(o.estimateIdr)} &middot; {formatTanggal(o.updatedAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
