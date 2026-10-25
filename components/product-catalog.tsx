import { Button } from "@/components/ui/button"
import { waLink } from "@/lib/osaka-trip"

const CATALOG_ITEMS = [
  { name: "On Cloud", category: "Sepatu" },
  { name: "Onitsuka Tiger", category: "Sepatu" },
  { name: "Smiski / Sonny Angel", category: "Figur" },
  { name: "Fuggler", category: "Boneka" },
  { name: "Barang Donki", category: "Serba-serbi Jepang" },
  { name: "TirTir", category: "Skincare" },
  { name: "PO Shein Japan", category: "Fashion" },
]

export default function ProductCatalog() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <h2 className="text-2xl font-bold text-white">Kategori yang pernah dititip</h2>
      <p className="mt-2 text-sm text-slate-400">
        Katalog lengkap mengikuti tren tiap trip. Kalau barang yang kamu cari tidak ada di daftar, tanya saja lewat
        WA.
      </p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATALOG_ITEMS.map((item) => (
          <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-sm text-slate-400">{item.category}</p>
          </div>
        ))}
      </div>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-6" asChild>
        <a
          href={waLink("Halo saya ingin tanya ketersediaan barang titipan")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Tanya Barang via WA
        </a>
      </Button>
    </section>
  )
}
