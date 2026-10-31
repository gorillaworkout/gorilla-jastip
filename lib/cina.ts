/** Workspace Jastip Cina (tim) — status, tipe, dan helper tampilan. */

export type CinaStatus =
  | "inquiry"
  | "quotation"
  | "menunggu_pembayaran"
  | "dibayar"
  | "dibeli"
  | "dikirim_cina"
  | "diterima_id"
  | "sortir_repack"
  | "dikirim_kurir"
  | "selesai"
  | "bermasalah";

export interface CinaOrder {
  id?: string;
  orderId: string;
  customerName: string;
  customerWa: string;
  productName: string;
  productLink: string;
  quantity: number;
  specs: string;
  estimateIdr: number | null;
  status: CinaStatus;
  chinaTracking: string;
  domesticTracking: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  createdBy?: string;
  createdByName?: string;
}

export interface CinaTeamMember {
  email: string;
  name: string;
  addedAt?: unknown;
}

/** Alur utama pesanan (bermasalah adalah status samping, bukan langkah alur). */
export const CINA_STATUS_FLOW: CinaStatus[] = [
  "inquiry",
  "quotation",
  "menunggu_pembayaran",
  "dibayar",
  "dibeli",
  "dikirim_cina",
  "diterima_id",
  "sortir_repack",
  "dikirim_kurir",
  "selesai",
];

export const CINA_STATUS_META: Record<
  CinaStatus,
  { label: string; badge: string; hint: string }
> = {
  inquiry: {
    label: "Inquiry",
    badge: "bg-slate-100 text-slate-700",
    hint: "Permintaan masuk, belum dibuat quotation.",
  },
  quotation: {
    label: "Quotation",
    badge: "bg-sky-100 text-sky-800",
    hint: "Quotation dikirim, menunggu keputusan pelanggan.",
  },
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    badge: "bg-amber-100 text-amber-800",
    hint: "Order dikonfirmasi, menunggu pelanggan bayar (prepayment).",
  },
  dibayar: {
    label: "Dibayar",
    badge: "bg-teal-100 text-teal-800",
    hint: "Pembayaran terverifikasi, siap dibeli.",
  },
  dibeli: {
    label: "Dibeli di Cina",
    badge: "bg-violet-100 text-violet-800",
    hint: "Sudah dibeli ke supplier Cina.",
  },
  dikirim_cina: {
    label: "Dikirim dari Cina",
    badge: "bg-indigo-100 text-indigo-800",
    hint: "Paket dalam perjalanan Cina–Indonesia.",
  },
  diterima_id: {
    label: "Diterima di Indonesia",
    badge: "bg-cyan-100 text-cyan-800",
    hint: "Paket konsolidasi tiba, menunggu verifikasi.",
  },
  sortir_repack: {
    label: "Sortir & Repack",
    badge: "bg-orange-100 text-orange-800",
    hint: "Dicek, disortir, dan di-repack per pelanggan.",
  },
  dikirim_kurir: {
    label: "Dikirim Kurir",
    badge: "bg-blue-100 text-blue-800",
    hint: "Paket diserahkan ke kurir domestik.",
  },
  selesai: {
    label: "Selesai",
    badge: "bg-emerald-100 text-emerald-800",
    hint: "Pesanan selesai.",
  },
  bermasalah: {
    label: "Bermasalah",
    badge: "bg-red-100 text-red-800",
    hint: "Hilang, rusak, salah barang, atau komplain — perlu tindak lanjut.",
  },
};

export function cinaStatusLabel(status: CinaStatus): string {
  return CINA_STATUS_META[status]?.label ?? status;
}

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/** "2026-10-31" -> "31 Okt 2026". Menerima Timestamp Firestore, Date, atau string ISO. */
export function formatTanggal(value: unknown): string {
  let date: Date | null = null;
  if (value && typeof value === "object" && "toDate" in (value as Record<string, unknown>)) {
    try {
      date = (value as { toDate: () => Date }).toDate();
    } catch {
      date = null;
    }
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) date = parsed;
  } else if (value && typeof value === "object" && "seconds" in (value as Record<string, unknown>)) {
    const seconds = (value as { seconds: unknown }).seconds;
    if (typeof seconds === "number") date = new Date(seconds * 1000);
  }
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** YYMM zona Asia/Jakarta, untuk nomor order (mis. 2610). */
export function jakartaYYMM(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(now);
  return `${parts.slice(2, 4)}${parts.slice(5, 7)}`;
}
