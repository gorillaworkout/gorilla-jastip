import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kelola Jastiper",
  robots: { index: false, follow: false },
}

export default function ManageJastipersLayout({
  children,
}: {
  children: import("react").ReactNode
}) {
  return children
}
