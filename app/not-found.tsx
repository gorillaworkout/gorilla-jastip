import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Image src="/jastipdigw.png" alt="JastipdiGW" width={56} height={56} className="rounded-lg" />
          <span className="text-xl font-bold">JastipdiGW</span>
        </div>
        <p className="text-5xl font-extrabold tracking-tight text-blue-400">404</p>
        <h1 className="mt-3 text-2xl font-bold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-slate-300 text-sm">
          Alamat yang Anda buka tidak tersedia. Kembali ke beranda untuk mulai titip barang dari Jepang, atau hubungi kami via WhatsApp.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium"
          >
            Kembali ke Beranda
          </Link>
          <a
            href="https://wa.me/6287700600208"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Hubungi WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
