import Image from "next/image"
import Link from "next/link"

export function PublicHeader({ backHref = "/", backLabel = "Kembali ke Beranda" }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight hover:opacity-80 transition-opacity">
          <Image src="/jastipdigw.png" alt="JastipdiGW" width={40} height={40} className="rounded-sm sm:w-12 sm:h-12" />
          <span className="text-lg sm:text-xl">JastipdiGW</span>
        </Link>
        <Link href={backHref} className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">
          ← {backLabel}
        </Link>
      </div>
    </header>
  )
}
