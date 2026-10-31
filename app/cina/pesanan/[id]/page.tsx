"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getCinaOrder, updateCinaOrder } from "@/lib/cina-service";
import {
  CINA_STATUS_FLOW,
  CINA_STATUS_META,
  formatRupiah,
  formatTanggal,
  type CinaOrder,
  type CinaStatus,
} from "@/lib/cina";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ALL_STATUSES: CinaStatus[] = [...CINA_STATUS_FLOW, "bermasalah"];

function waLink(wa: string): string | null {
  const digits = wa.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export default function CinaPesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<CinaOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<CinaStatus>("inquiry");
  const [chinaTracking, setChinaTracking] = useState("");
  const [domesticTracking, setDomesticTracking] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getCinaOrder(id)
      .then((row) => {
        if (!active) return;
        if (!row) {
          setNotFound(true);
        } else {
          setOrder(row);
          setStatus(row.status);
          setChinaTracking(row.chinaTracking);
          setDomesticTracking(row.domesticTracking);
          setNotes(row.notes);
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSave() {
    if (!order?.id) return;
    setSaving(true);
    setMessage("");
    try {
      await updateCinaOrder(order.id, {
        status,
        chinaTracking: chinaTracking.trim(),
        domesticTracking: domesticTracking.trim(),
        notes: notes.trim(),
      });
      const fresh = await getCinaOrder(order.id);
      if (fresh) setOrder(fresh);
      setMessage("Perubahan tersimpan.");
    } catch (cause) {
      console.error("Gagal menyimpan pesanan Cina", cause);
      setMessage("Gagal menyimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Memuat…</p>;
  }

  if (notFound || !order) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Pesanan tidak ditemukan.</p>
        <Link href="/cina/pesanan" className="mt-3 inline-block text-sm font-semibold text-primary">
          &larr; Kembali ke daftar
        </Link>
      </div>
    );
  }

  const meta = CINA_STATUS_META[order.status];
  const currentIdx = CINA_STATUS_FLOW.indexOf(order.status);
  const wa = waLink(order.customerWa);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-black">{order.orderId}</h1>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", meta.badge)}>
            {meta.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{meta.hint}</p>
      </div>

      <section className="space-y-1 rounded-xl border bg-card p-3 text-sm">
        <p className="font-semibold">{order.productName}</p>
        {order.productLink && (
          <a
            href={order.productLink}
            target="_blank"
            rel="noreferrer"
            className="break-all text-xs font-medium text-primary"
          >
            Lihat link produk &rarr;
          </a>
        )}
        <p className="text-muted-foreground">
          {order.customerName}
          {wa ? (
            <>
              {" "}&middot;{" "}
              <a href={wa} target="_blank" rel="noreferrer" className="font-medium text-primary">
                Chat WA
              </a>
            </>
          ) : order.customerWa ? (
            <> &middot; {order.customerWa}</>
          ) : null}
        </p>
        <p className="text-muted-foreground">
          {order.quantity}x &middot; Estimasi {formatRupiah(order.estimateIdr)}
        </p>
        {order.specs && <p className="text-muted-foreground">Spesifikasi: {order.specs}</p>}
        <p className="text-xs text-muted-foreground">
          Dibuat {formatTanggal(order.createdAt)}
          {order.createdByName ? ` oleh ${order.createdByName}` : ""} &middot; Diubah{" "}
          {formatTanggal(order.updatedAt)}
        </p>
      </section>

      <section className="rounded-xl border bg-card p-3">
        <h2 className="mb-2 text-sm font-bold">Alur Pesanan</h2>
        <ol className="space-y-1">
          {CINA_STATUS_FLOW.map((s, idx) => {
            const done = currentIdx >= 0 && idx < currentIdx;
            const current = idx === currentIdx;
            return (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    current
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <span className={current ? "font-semibold" : "text-muted-foreground"}>
                  {CINA_STATUS_META[s].label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-3">
        <h2 className="text-sm font-bold">Perbarui Pesanan</h2>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CinaStatus)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CINA_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Resi Cina / forwarder</Label>
          <Input
            value={chinaTracking}
            onChange={(e) => setChinaTracking(e.target.value)}
            placeholder="Nomor resi dari Cina"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Resi kurir domestik</Label>
          <Input
            value={domesticTracking}
            onChange={(e) => setDomesticTracking(e.target.value)}
            placeholder="Nomor resi kurir Indonesia"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Catatan tim</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Update untuk tim / pelanggan"
            rows={4}
          />
        </div>
        {message && (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>
        )}
        <Button onClick={handleSave} disabled={saving} className="h-12 w-full text-base">
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
        </Button>
      </section>

      <Link href="/cina/pesanan" className="block text-center text-sm font-semibold text-primary">
        &larr; Kembali ke daftar
      </Link>
    </div>
  );
}
