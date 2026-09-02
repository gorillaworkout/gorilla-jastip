import type { Metadata } from "next"
import { PublicLegalPage } from "@/components/layout/public-legal-page"

export const metadata: Metadata = {
  title: "Syarat Layanan",
  description: "Ketentuan ringkas pemakaian layanan jasa titip JastipdiGW.",
}

export default function TermsPage() {
  return (
    <PublicLegalPage title="Syarat Layanan">
      <p>
        Dengan memakai situs ini atau memesan titipan, Anda setuju dengan ketentuan ringkas berikut.
        Ini adalah penjelasan operasional, bukan kontrak formal yang lengkap.
      </p>
      <h2 className="text-white font-semibold pt-2">Layanan</h2>
      <p>
        JastipdiGW membantu titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang sesuai
        ketersediaan stok, jadwal keberangkatan, dan konfirmasi biaya. Harga akhir dihitung setelah
        kami cek produk, ongkir, dan kurs.
      </p>
      <h2 className="text-white font-semibold pt-2">Pembayaran</h2>
      <p>
        Pembayaran hanya ke rekening atau kanal resmi yang kami konfirmasikan (a.n. Bayu Darmawan).
        Jangan transfer ke nama lain. Order diproses setelah pembayaran dikonfirmasi.
      </p>
      <h2 className="text-white font-semibold pt-2">Barang dan risiko</h2>
      <p>
        Ketersediaan, harga toko, dan waktu kirim dapat berubah. Barang preloved, limited, atau
        custom bisa berbeda dari foto. Kerusakan oleh kurir mengikuti proses klaim ekspedisi yang berlaku.
      </p>
      <h2 className="text-white font-semibold pt-2">Barang yang tidak kami terima</h2>
      <p>
        Kami dapat menolak titipan yang dilarang hukum, berbahaya, atau tidak bisa dikirim secara wajar
        (misalnya barang tanpa dokumen yang diperlukan).
      </p>
      <h2 className="text-white font-semibold pt-2">Kontak</h2>
      <p>
        Pertanyaan ketentuan layanan:{" "}
        <a className="text-blue-400 hover:underline" href="https://wa.me/6287700600208">+62 877-0060-0208</a>.
      </p>
      <p className="text-xs text-slate-400">Pembaruan terakhir: September 2026. Ini bukan nasihat hukum.</p>
    </PublicLegalPage>
  )
}
