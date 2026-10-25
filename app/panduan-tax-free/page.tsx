import Link from "next/link"

export const metadata = {
  title: "Panduan Tax-Free Shopping di Jepang | JastipdiGW",
  description:
    "Penjelasan umum tax-free shopping di Jepang untuk wisatawan: siapa yang bisa, cara klaim di toko, dan hal yang perlu diperhatikan.",
}

export default function TaxFreeGuidePage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link href="/" className="text-sm text-blue-400 hover:underline">
          Kembali ke beranda
        </Link>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
          Panduan Tax-Free Shopping di Jepang
        </h1>
        <p className="mt-3 text-slate-300">
          Panduan umum untuk wisatawan yang belanja di Jepang. Aturan bisa berubah, jadi selalu cek informasi terbaru
          di toko tempat kamu belanja.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Apa itu tax-free</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Jepang mengenakan pajak konsumsi untuk pembelian di dalam negeri. Wisatawan yang berkunjung dalam jangka
            pendek bisa membeli tanpa pajak di toko yang berlisensi tax-free, selama memenuhi syarat yang berlaku.
            Tanda toko tax-free biasanya dipajang di etalase atau di area kasir.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Siapa yang bisa memakai tax-free</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Fasilitas ini ditujukan untuk pengunjung dari luar Jepang dengan status tinggal jangka pendek. Paspor
            wajib dibawa saat belanja, karena toko akan mencatat data paspor untuk proses tax-free. Tanpa paspor,
            prosesnya tidak bisa dilakukan.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Cara klaim di toko</h2>
          <ol className="mt-2 list-decimal pl-5 space-y-2 text-sm leading-relaxed text-slate-300">
            <li>Pilih toko yang melayani tax-free, biasanya ada label khusus di pintu atau kasir.</li>
            <li>Saat membayar, sampaikan bahwa kamu ingin proses tax-free dan tunjukkan paspor.</li>
            <li>Ikuti arahan kasir atau konter tax-free di toko tersebut. Beberapa toko memproses langsung di kasir, beberapa di konter khusus.</li>
            <li>Simpan struk dan dokumen pembelian sampai kamu keluar dari Jepang.</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Barang habis pakai dan barang umum</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Barang habis pakai seperti makanan, minuman, dan kosmetik biasanya dibungkus tersegel dan sebaiknya tidak
            dibuka selama masih di Jepang. Barang umum seperti pakaian, tas, dan elektronik umumnya boleh dipakai
            selama perjalanan. Kalau ragu, tanyakan langsung ke staf toko sebelum membayar.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Tips singkat</h2>
          <ul className="mt-2 list-disc pl-5 space-y-2 text-sm leading-relaxed text-slate-300">
            <li>Bawa paspor setiap kali belanja, jangan ditinggal di hotel.</li>
            <li>Tanyakan batas minimum pembelian di tiap toko, karena ketentuannya bisa berbeda.</li>
            <li>Simpan semua struk dalam satu tempat supaya mudah ditunjukkan bila diminta.</li>
            <li>Kalau belanja lewat jastip, tanyakan ke admin apakah barang yang kamu incar bisa diproses tax-free.</li>
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="font-bold">Mau titip barang dari Jepang?</h2>
          <p className="mt-1 text-sm text-slate-300">
            Kirim detail barangnya, kami bantu proses dari Jepang.
          </p>
          <a
            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            href="https://wa.me/6287700600208?text=Halo%20saya%20ingin%20tanya%20tentang%20titip%20barang%20dari%20Jepang"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tanya via WA
          </a>
        </section>
      </div>
    </main>
  )
}
