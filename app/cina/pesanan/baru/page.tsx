"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCinaOrder } from "@/lib/cina-service";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function CinaPesananBaruPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [specs, setSpecs] = useState("");
  const [estimateIdr, setEstimateIdr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !productName.trim()) {
      setError("Nama pelanggan dan nama produk wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createCinaOrder({
        customerName: customerName.trim(),
        customerWa: customerWa.trim(),
        productName: productName.trim(),
        productLink: productLink.trim(),
        quantity: Math.max(1, Number.parseInt(quantity, 10) || 1),
        specs: specs.trim(),
        estimateIdr: estimateIdr.trim() ? Number(estimateIdr.replace(/[^0-9]/g, "")) || null : null,
        notes: notes.trim(),
        createdBy: user?.id,
        createdByName: user?.name,
      });
      router.push(`/cina/pesanan/${created.id}`);
    } catch (cause) {
      console.error("Gagal membuat pesanan Cina", cause);
      setError("Gagal menyimpan pesanan. Periksa koneksi lalu coba lagi.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-base font-bold">Pesanan Baru</h1>
        <p className="text-xs text-muted-foreground">
          Order baru mulai dari status Inquiry, lalu lanjut ke Quotation.
        </p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <Field label="Nama pelanggan *">
        <Input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nama pelanggan"
          className="h-11"
        />
      </Field>
      <Field label="WhatsApp pelanggan">
        <Input
          value={customerWa}
          onChange={(e) => setCustomerWa(e.target.value)}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
          className="h-11"
        />
      </Field>
      <Field label="Nama produk *">
        <Input
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Nama produk dari website Cina"
          className="h-11"
        />
      </Field>
      <Field label="Link produk">
        <Input
          value={productLink}
          onChange={(e) => setProductLink(e.target.value)}
          placeholder="https://…"
          inputMode="url"
          className="h-11"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Jumlah">
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="numeric"
            className="h-11"
          />
        </Field>
        <Field label="Estimasi harga (Rp)">
          <Input
            value={estimateIdr}
            onChange={(e) => setEstimateIdr(e.target.value)}
            inputMode="numeric"
            placeholder="Opsional"
            className="h-11"
          />
        </Field>
      </div>
      <Field label="Spesifikasi">
        <Textarea
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Warna, ukuran, varian, dll."
          rows={3}
        />
      </Field>
      <Field label="Catatan">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan internal tim"
          rows={3}
        />
      </Field>

      <Button type="submit" disabled={saving} className="h-12 w-full text-base">
        {saving ? "Menyimpan…" : "Buat Pesanan"}
      </Button>
    </form>
  );
}
