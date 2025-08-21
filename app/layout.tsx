import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ReduxProvider } from "@/contexts/redux-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://jastipdigw.com"),
  title: {
    default: "JastipdiGW – Jasa Titip Jepang & Indonesia",
    template: "%s | JastipdiGW",
  },
  description:
    "JastipdiGW melayani titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.",
  keywords: [
    "jastip",
    "jasa titip",
    "jastip jepang",
    "titip barang jepang",
    "checkout rakuten",
    "checkout amazon jp",
    "mercari",
    "indonesia jepang",
  ],
  authors: [{ name: "Bayu Darmawan" }],
  creator: "Bayu Darmawan",
  publisher: "JastipdiGW",
  openGraph: {
    title: "JastipdiGW – Jasa Titip Jepang & Indonesia",
    description:
      "Titip barang Indonesia ⇄ Jepang dan checkout marketplace Jepang. Cepat, aman, transparan.",
    url: "https://jastipdigw.com",
    siteName: "JastipdiGW",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "JastipdiGW",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://jastipdigw.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  generator: "Gorichan",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
