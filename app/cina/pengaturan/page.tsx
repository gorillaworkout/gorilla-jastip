"use client";

import { useEffect, useState } from "react";
import {
  addCinaTeamMember,
  getCinaTeam,
  removeCinaTeamMember,
} from "@/lib/cina-service";
import { formatTanggal, type CinaTeamMember } from "@/lib/cina";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CinaPengaturanPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin";
  const [team, setTeam] = useState<CinaTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setTeam(await getCinaTeam());
    } catch {
      setError("Gagal memuat tim. Periksa koneksi lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isSuperAdmin) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setMessage("Masukkan email Gmail yang valid.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await addCinaTeamMember(clean, name);
      setEmail("");
      setName("");
      setMessage(`${clean} ditambahkan ke tim Cina.`);
      await load();
    } catch (cause) {
      console.error("Gagal menambah tim Cina", cause);
      setMessage("Gagal menambahkan. Periksa koneksi lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(memberEmail: string) {
    if (!window.confirm(`Hapus ${memberEmail} dari tim Cina?`)) return;
    try {
      await removeCinaTeamMember(memberEmail);
      setMessage(`${memberEmail} dihapus dari tim Cina.`);
      await load();
    } catch {
      setMessage("Gagal menghapus. Periksa koneksi lalu coba lagi.");
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h1 className="text-base font-bold">Pengaturan Tim</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Halaman ini hanya untuk super admin (Bayu). Anggota tim tidak perlu
          mengubah daftar akses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-bold">Pengaturan Tim</h1>
        <p className="text-xs text-muted-foreground">
          Email yang didaftarkan bisa login dengan Google dan langsung masuk
          workspace Cina. Bayu (super admin) selalu bisa masuk Jepang dan Cina.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>
      )}
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleAdd} className="space-y-3 rounded-xl border bg-card p-3">
        <h2 className="text-sm font-bold">Tambah anggota tim</h2>
        <div className="space-y-1.5">
          <Label>Email Gmail</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@gmail.com"
            inputMode="email"
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Nama (opsional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama anggota tim"
            className="h-11"
          />
        </div>
        <Button type="submit" disabled={saving} className="h-11 w-full">
          {saving ? "Menyimpan…" : "Tambahkan ke Tim"}
        </Button>
      </form>

      <section className="space-y-2">
        <h2 className="text-sm font-bold">Anggota tim Cina ({team.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : team.length === 0 ? (
          <p className="rounded-xl border bg-card p-3 text-sm text-muted-foreground">
            Belum ada anggota tim. Tambahkan email Gmail tim di atas — mereka
            bisa langsung login begitu emailnya terdaftar.
          </p>
        ) : (
          team.map((m) => (
            <div
              key={m.email}
              className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{m.name || m.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.email}
                  {m.addedAt ? ` · sejak ${formatTanggal(m.addedAt)}` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-red-600"
                onClick={() => void handleRemove(m.email)}
              >
                Hapus
              </Button>
            </div>
          ))
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Catatan: akses tim berlaku setelah rules Firestore terbaru di-publish.
        Tanpa itu, anggota tim akan ditolak dengan pesan permission-denied.
      </p>
    </div>
  );
}
