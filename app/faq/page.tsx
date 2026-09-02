import type { Metadata } from "next"
import { PublicLegalPage } from "@/components/layout/public-legal-page"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan umum seputar jasa titip JastipdiGW.",
}

export default function FaqPage() {
  return (
    <PublicLegalPage title="FAQ">
      <h2 className="text-white font-semibold">Bagaimana cara mulai titip?</h2>
      <p>
        Kirim tautan atau foto barang, jumlah, dan tujuan pengiriman ke WhatsApp resmi. Kami hitung
        perkiraan biaya, lalu proses setelah Anda konfirmasi.
      </p>
      <h2 className="text-white font-semibold">Marketplace apa yang bisa di-checkout?</h2>
      <p>
        Umumnya marketplace Jepang seperti Mercari, Amazon JP, Yahoo, dan toko offline sesuai trip.
        Pastikan stok masih ada saat kami cek.
      </p>
      <h2 className="text-white font-semibold">Berapa lama pengiriman?</h2>
      <p>
        Tergantung jadwal keberangkatan dan jenis barang. Lihat List Keberangkatan di beranda atau
        tanya admin untuk estimasi periode berjalan.
      </p>
      <h2 className="text-white font-semibold">Apakah bisa titip dari Indonesia ke Jepang?</h2>
      <p>Ya. Layanan kami dua arah (ID ⇄ JP), mengikuti jadwal trip yang tersedia.</p>
      <h2 className="text-white font-semibold">Bagaimana saya tahu ini bukan penipuan?</h2>
      <p>
        Pembayaran hanya ke nama resmi yang kami cantumkan, komunikasi transparan, dan kami tidak
        pernah meminta OTP. Jika ragu, konfirmasi dulu ke nomor WhatsApp di situs ini.
      </p>
      <p>
        Masih ada pertanyaan?{" "}
        <a className="text-blue-400 hover:underline" href="https://wa.me/6287700600208">Chat WhatsApp</a>.
      </p>
    </PublicLegalPage>
  )
}
