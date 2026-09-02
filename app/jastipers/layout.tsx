import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Daftar Jastiper",
  description: "Temukan jastiper terverifikasi JastipdiGW untuk titip barang Indonesia ⇄ Jepang.",
}

export default function JastipersLayout({ children }: { children: import("react").ReactNode }) {
  return children
}
