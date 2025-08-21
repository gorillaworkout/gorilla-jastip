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

const BASE = "https://jastipdigw.gorillaworkout.id"

export const metadata: Metadata = {
	metadataBase: new URL(BASE),
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
		type: "website",
		locale: "id_ID",
		url: BASE,
		siteName: "JastipdiGW",
		title: "JastipdiGW - Jasa Titip Barang dari Jepang ke Indonesia",
		description: "Jasa titip barang dari Jepang ke Indonesia dan sebaliknya. Aman, terpercaya, dan transparan. Titip barang sekarang!",
		images: [
			{
				url: "/jastipdigw.webp",
				width: 1200,
				height: 630,
				alt: "JastipdiGW Logo",
				type: "image/webp",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "JastipdiGW - Jasa Titip Barang dari Jepang ke Indonesia",
		description: "Jasa titip barang dari Jepang ke Indonesia dan sebaliknya. Aman, terpercaya, dan transparan. Titip barang sekarang!",
		images: ["/jastipdigw.webp"],
		creator: "@jastipdigw",
	},
	alternates: {
		canonical: `${BASE}/`,
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
