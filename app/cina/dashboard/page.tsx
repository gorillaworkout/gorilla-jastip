"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCinaOrders } from "@/lib/cina-service";
import {
  CINA_STATUS_META,
  formatRupiah,
  formatTanggal,
  type CinaOrder,
  type CinaStatus,
} from "@/lib/cina";

const PERLU_TINDAKAN: CinaStatus[] = ["inquiry", "menunggu_pembayaran", "bermasalah"];

function StatusBadge({ status }: { status: CinaStatus }) {
  const meta = CINA_STATUS_META[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
      {meta.label}
    </span>
  );
}

function OrderRow({ order }: { order: CinaOrder }) {
  return (
    <Link
      href={`/cina/pesanan/${order.id}`}
      className="block rounded-xl border bg-card p-3 active:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold">{order.orderId}</span>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 truncate text-sm">{order.productName}</p>
      <p className="text-xs text-muted-foreground">
        {order.customerName} &middot; {order.quantity}x &middot;{" "}
        {formatRupiah(order.estimateIdr)} &middot; {formatTanggal(order.updatedAt)}
      </p>
    </Link>
  );
}

export default function CinaDashboardPage() {
  const [orders, setOrders] = useState<CinaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCinaOrders()
      .then((rows) => {
        if (active) setOrders(rows);
      })
      .catch(() => {
        if (active)
          setError(
            "Gagal memuat pesanan. Periksa koneksi dan pastikan rules Firestore terbaru sudah di-publish.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const count = (status: CinaStatus) => orders.filter((o) => o.status === status).length;
  const perluTindakan = orders
    .filter((o) => PERLU_TINDAKAN.includes(o.status))
    .slice(0, 5);
  const terbaru = orders.slice(0, 5);

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Memuat…</p>;
  }

  if (error) {
    return <p className="py-12 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Pesanan</p>
          <p className="mt-1 text-2xl font-black">{orders.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Menunggu Pembayaran</p>
          <p className="mt-1 text-2xl font-black">{count("menunggu_pembayaran")}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Bermasalah</p>
          <p className="mt-1 text-2xl font-black text-red-600">{count("bermasalah")}</p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <p className="text-xs text-muted-foreground">Selesai</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{count("selesai")}</p>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Perlu Tindakan</h2>
        {perluTindakan.length === 0 ? (
          <p className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
            Tidak ada pesanan yang perlu tindakan.
          </p>
        ) : (
          perluTindakan.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Terbaru</h2>
          <Link href="/cina/pesanan" className="text-xs font-semibold text-primary">
            Lihat semua &rarr;
          </Link>
        </div>
        {terbaru.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-center">
            <p className="text-sm text-muted-foreground">Belum ada pesanan.</p>
            <Link
              href="/cina/pesanan/baru"
              className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Buat pesanan pertama
            </Link>
          </div>
        ) : (
          terbaru.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </section>
    </div>
  );
}
