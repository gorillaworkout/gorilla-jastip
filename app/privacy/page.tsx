import type { Metadata } from "next"
import { PublicLegalPage } from "@/components/layout/public-legal-page"

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana JastipdiGW menangani informasi yang Anda kirimkan untuk layanan jasa titip.",
}

export default function PrivacyPage() {
  return (
    <PublicLegalPage title="Kebijakan Privasi">
      <p>
        Halaman ini menjelaskan secara ringkas bagaimana JastipdiGW menangani informasi yang Anda berikan
        saat memakai situs atau menghubungi kami untuk jasa titip barang Indonesia ⇄ Jepang.
      </p>
      <h2 className="text-white font-semibold pt-2">Data yang kami terima</h2>
      <p>
        Kami menerima data yang Anda kirim sendiri, misalnya nama, nomor WhatsApp, tautan produk,
        alamat pengiriman, dan bukti pembayaran. Kami tidak meminta kode OTP, kata sandi, atau data
        rahasia akun marketplace Anda.
      </p>
      <h2 className="text-white font-semibold pt-2">Penggunaan</h2>
      <p>
        Data dipakai hanya untuk memproses titipan, konfirmasi biaya, pengiriman, dan komunikasi layanan.
        Kami tidak menjual data pelanggan.
      </p>
      <h2 className="text-white font-semibold pt-2">Penyimpanan</h2>
      <p>
        Percakapan dan bukti transaksi dapat tersimpan di kanal komunikasi yang Anda pilih (misalnya WhatsApp)
        serta sistem internal yang dipakai admin untuk menjalankan order. Kami tidak dapat menjamin
        kebijakan privasi aplikasi pihak ketiga.
      </p>
      <h2 className="text-white font-semibold pt-2">Kontak</h2>
      <p>
        Pertanyaan soal data pribadi dapat dikirim ke WhatsApp resmi{" "}
        <a className="text-blue-400 hover:underline" href="https://wa.me/6287700600208">+62 877-0060-0208</a>.
      </p>
      <p className="text-xs text-slate-400">Pembaruan terakhir: September 2026. Ini bukan nasihat hukum.</p>
    </PublicLegalPage>
  )
}
